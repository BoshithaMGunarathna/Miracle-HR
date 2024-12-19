import React, { useEffect, useState } from 'react';

const LeaveCount = ({ label, count }) => {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayCount((prev) => {
        if (prev < count) {
          return Math.min(prev + 1, count); // Increment and ensure it does not exceed count
        }
        clearInterval(interval);
        return count; // Ensure it reaches the target count
      });
    }, 50); // Adjust the interval time as needed

    return () => clearInterval(interval); // Cleanup on unmount
  }, [count]);

  return (
    <div className="flex flex-col items-center justify-center bg-[#ffffff] p-6 rounded-lg shadow-md w-100">    {/* #a193e3 */}
      <h6 style={{ color: '#00a8ce' }} className="text-m font-bold mb-10">{label}</h6>
      <h2 style={{ color: '#00a8ce' }} className="text-2xl font-semibold mb-5 ">{displayCount}</h2>
    </div>
  );
};

export default LeaveCount;
