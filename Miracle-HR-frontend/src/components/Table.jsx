import React from 'react';

const DynamicTable = ({ columns, data, onApprove, onReject, Text1, Text2, Color1, Color2 }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-6 py-3 text-left text-gray-700 font-semibold border-b">
                {col.label} {/* Use label for display */}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 border-b">
                    {col.key === 'action' ? ( // Check if the column is action
                      <div className="flex space-x-2">
                        <button
                          style={{ backgroundColor: Color1 }} // Apply color as inline style
                          className="mt-1 text-white py-2 px-4 rounded-md hover:bg-opacity-80 hover:shadow-xl transition-all duration-300 focus:outline-none w-full"
                          onClick={() => onApprove(row)} // Pass the row data for approval
                        >
                          {Text1}
                        </button>
                        <button
                          style={{ backgroundColor: Color2 }} // Apply color as inline style
                          className="mt-1 text-white py-2 px-4 rounded-md hover:bg-opacity-80 hover:shadow-xl transition-all duration-300 focus:outline-none w-full"
                          onClick={() => onReject(row)} // Pass the row data for rejection
                        >
                          {Text2}
                        </button>
                      </div>
                    ) : (
                      row[col.key] // Display the data for other columns
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-4 ">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;
