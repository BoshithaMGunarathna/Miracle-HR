import React from "react";

const DynamicTable = ({
  columns,
  data,
  onApprove,
  onReject,
  Text1,
  Text2,
  Color1,
  Color2,
  showApproveButton,
  showRejectButton,
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="max-h-[20rem] overflow-y-auto border border-gray-300 rounded-lg">
        <table className="min-w-full bg-white">
          {/* Table Head */}
          <thead className="bg-gray-100 top-0 z-10">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-gray-700 font-semibold border-b"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="even:bg-gray-50">
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 border-b text-sm align-middle"
                    >
                      {col.key === "action" ? (
                        <div className="flex space-x-2">
                          {showApproveButton && (
                            <button
                              style={{ backgroundColor: Color1 }}
                              className="mt-1 text-white py-2 px-4 rounded-md hover:bg-opacity-80 hover:shadow-xl transition-all duration-300 focus:outline-none w-full"
                              onClick={() => onApprove(row)}
                            >
                              {Text1}
                            </button>
                          )}
                          {showRejectButton && (
                            <button
                              style={{ backgroundColor: Color2 }}
                              className="mt-1 text-white py-2 px-4 rounded-md hover:bg-opacity-80 hover:shadow-xl transition-all duration-300 focus:outline-none w-full"
                              onClick={() => onReject(row)}
                            >
                              {Text2}
                            </button>
                          )}
                        </div>
                      ) : (
                        row[col.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-4 text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicTable;
