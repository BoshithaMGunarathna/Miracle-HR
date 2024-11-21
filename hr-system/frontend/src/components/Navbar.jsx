import React from 'react';
import MiracleLogo from "../assets/images/Miracle.png";
import { Link } from 'react-router-dom';

const Navbar = () => {
  const handleLogout = () => {
    // Add your logout logic here
    console.log("User logged out");
  };

  return (
    <nav className="bg-white p-4 flex justify-between items-center shadow">
      {/* Logo Section */}
      <div className="flex items-center">
        <img 
          src={MiracleLogo} // Adjust the path as needed
          alt="Logo"
          className="w-40 h-auto" // Adjust size as needed
        />
      </div>

      {/* Navigation Section */}
      <div className="flex items-center ml-auto">
        {/* Home Link */}
        <Link 
          to="/profile/:emp_id" 
          className="text-gray-700 font-semibold mr-10"
          style={{ 
            transition: "color 0.3s", // Smooth transition for hover effect
          }}
          onMouseEnter={(e) => (e.target.style.color = "#00A8CE")} // Custom hover color
          onMouseLeave={(e) => (e.target.style.color = "#5A2D8A")} // Revert to original color
        >
          Home
        </Link>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          style={{ backgroundColor: '#00A8CE' }} // Inline style for background color
          className="text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-bold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
