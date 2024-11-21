import React from "react";


const Card = ({ children, cardLabel, cardText }) => {
  return (
    <div className={`bg-white shadow-lg mt-10 rounded-lg p-3 w-full max-w-lg min-h-[150px]`}>
      {children}
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-900 text-center">{cardLabel}</h2>
        <h2 className="text-xl font-bold text-gray-500 text-center mt-6">{cardText}</h2>
      </div>
    </div>
  );
};


export default Card;
