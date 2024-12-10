import React, { useState, useRef, useEffect } from "react";
import Navbar from '../components/Navbar'; 
import Sidebar from '../components/Menue'; 
import Heading from '../components/Heading'; 
import axios from 'axios';

const AttendanceSystem = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [recognizedFName, setRecognizedFName] = useState(null);  // Store the recognized name
  const [recognizedLName, setRecognizedLName] = useState(null);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Toggle camera state
  const toggleCamera = async () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      console.log("Camera stream:", stream);

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack.readyState === 'live') {
        console.log("Video track is live.");
      } else {
        console.error("Video track is not live.");
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, attempting to play...");
          videoRef.current.play().catch((err) => {
            console.error("Error starting video playback:", err);
          });
        };
      }
      

      streamRef.current = stream;
      setIsCameraOn(true);

      // Start recognition when the camera is on
      await toggleRecognition();
    } catch (err) {
      console.error("Error accessing the camera:", err);
      alert("Unable to access the camera. Please check permissions or hardware.");
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraOn(false);

    // Stop recognition when the camera is off
    // stopRecognition();
  };

  // Start recognition using the backend API
  const toggleRecognition = async () => {
    try {
      const response = await axios.post("http://localhost:8081/start-recognition");
      if (response.status === 200) {
        console.log("Recognition process started.", response.data.details);
        setRecognizedFName(response.data.details.f_name);
        setRecognizedLName(response.data.details.l_name);
      } else {
        console.error("Error starting recognition.");
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
    }
  };

  // Clean up when the component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
    <Navbar />
    <div className="flex flex-grow">
      <Sidebar />
      <div className="flex-1 p-20"> {/* Reduced padding */}
        <Heading text="Mark Attendance" />
        <div className="flex flex-col items-center justify-center mt-4"> {/* Added margin for fine spacing */}
          <div className="relative w-full max-w-2xl bg-black aspect-video">
            {isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                style={{
                  width: "640px", // Fixed width
                  height: "380px", // Fixed height
                  
                }}
                onError={(e) => console.error("Video error:", e.nativeEvent.error)}
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
            onClick={toggleCamera}
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