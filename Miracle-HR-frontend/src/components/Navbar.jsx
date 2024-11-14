import React from 'react';
import MiracleLogo from "../assets/images/Miracle.png";


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
          className="w-40 h-15 mr-2" // Adjust size as needed
        />
        <span className="text-white text-lg font-semibold">MyApp</span>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        style={{ backgroundColor: '#00A8CE' }} // Inline style for background color
          className="text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-bold mr-5"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
