import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import axios from 'axios';
import Navbar from '../components/Navbar'; 
import Sidebar from '../components/Menue'; 
import Heading from '../components/Heading'; 

const AttendanceSystem = () => {
  const webcamRef = useRef(null);
  const recognitionIntervalRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [recognizedFName, setRecognizedFName] = useState(null);
  const [recognizedLName, setRecognizedLName] = useState(null);

  // Camera constraints
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  // Start recognition using the backend API
  const startRecognition = async () => {
    try {
      // Capture image if camera is on
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        
        // Send image to backend for recognition
        const response = await axios.post("http://localhost:8081/start-recognition", {
          image: imageSrc
        });

        if (response.status === 200) {
          console.log("Recognition process started.", response.data.details);
          setRecognizedFName(response.data.details.f_name);
          setRecognizedLName(response.data.details.l_name);
        } else {
          console.error("Error starting recognition.");
        }
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
    }
  };

  // Toggle camera and start recognition
  const toggleCameraAndRecognition = useCallback(async () => {
    if (isCameraOn) {
      // Turning camera off - stop recognition
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current);
        recognitionIntervalRef.current = null;
      }
      
      // Turn off camera
      setIsCameraOn(false);
    } else {
      // Turning camera on
      setIsCameraOn(true);

      // Start continuous recognition
      recognitionIntervalRef.current = setInterval(() => {
        startRecognition(); // Send frame every 100ms (or adjust as needed)
      }, 100); // Every 100ms (10 frames per second)
    }
  }, [isCameraOn]);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Mark Attendance" />
          <div className="flex flex-col items-center justify-center mt-4">
            <div className="relative w-full max-w-2xl bg-black aspect-video">
              {isCameraOn ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-white bg-gray-800">
                  Camera is off
                </div>
              )}
            </div>

            <div className="mt-4 text-black flex flex-col items-center justify-center">
              {recognizedFName && recognizedLName ? (
                <div className="text-center mt-10">
                  <h2 className="text-2xl font-bold">{recognizedFName} {recognizedLName}</h2>
                  <p className="text-sm">Your Attendance Is Marked</p>
                </div>
              ) : (
                <p>Waiting for recognition...</p>
              )}
            </div>

            <button
              onClick={toggleCameraAndRecognition}
              className="mt-6 px-6 py-2 rounded-lg text-white bg-[#00a8ce] hover:bg-[#75d9ef]"
            >
              {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSystem;
