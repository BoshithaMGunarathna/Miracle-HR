import React from "react";
import MiracleLogo from "../assets/images/Miracle.png";

const AuthCard = ({ children, linkText, linkHref, fullWidth }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#6E2878] to-[#034E7C]">
      <div className={`bg-white shadow-lg rounded-lg p-8 ${fullWidth ? 'w-1/3 max-w-lg ' : 'w-1/2 max-w-2xl'}`}>
        {/* Logo Section */}
        <div className="flex justify-center mb-4">
          <img
            src={MiracleLogo}
            alt="Logo"
            className="w-70 h-20"
          />
        </div>

        {/* Form Section */}
        {children}

        {/* Button */}
        <div className="mt-10">
          {/* <button
            type="submit"
            style={{ backgroundColor: '#00A8CE' }} // Inline style for background color
            className="w-full text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-bold"
          >
            {buttonLabel}
          </button> */}
        </div>

        {/* Link Section */}
        <div className="mt-10 text-center">
          <a href={linkHref} className="text-sm text-blue-600 hover:underline">
            {linkText}
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
