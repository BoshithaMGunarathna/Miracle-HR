import React from 'react';
import Navbar from '../components/Navbar'; // Adjust the import path according to your file structure
import Sidebar from '../components/Menue'; // Adjust the import path according to your file structure
import Heading from '../components/Heading'; // Import the Heading component
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import person from "../assets/images/person.jpg";

const Profile = () => {
  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Profile" />

          {/* Card Wrapper */}
          <div className="flex justify-center items-center h-[60vh] mt-10">
            <div className="max-w-sm max-h-m bg-white rounded-lg shadow-md overflow-hidden">
              {/* Top Part with Gradient */}
              <div className="bg-gradient-to-r from-[#6E2878] to-[#034E7C] h-32 relative">
                {/* User Image (Centered on the Border) */}
                <div className="absolute inset-x-0 top-full transform -translate-y-1/2 flex justify-center">
                  <img
                    className="w-36 h-36 rounded-full border-4 border-white" // Increased size here
                    src={person}
                    alt="User Profile Picture"
                  />
                </div>
              </div>

              {/* Bottom Part with White Background */}
              <div className="p-6 mt-12 text-center">
                <h2 className="text-lg font-semibold text-gray-900 mt-6">John Doe</h2>
                <p className="text-gray-800">Software Engineer</p>
                <p className="text-gray-800">1234</p>
                <p className="mt-4 text-gray-600 mb-5">
                  Passionate about building user-friendly applications and exploring new technologies in web development.
                </p>

                <div className="flex items-center p-2 justify-center">
                  <FaPhoneAlt size={20} className='mr-5 text-gray-800' /> 0711234567
                </div>
                <div className="flex items-center p-2 justify-center">
                  <MdEmail size={20} className='mr-5 text-gray-800' /> john@gmail.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
