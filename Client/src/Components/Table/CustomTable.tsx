import React from "react";

const CustomTable = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded-lg shadow-sm overflow-hidden border-separate border-spacing-y-3">
        <thead>
          <tr className="text-gray-800 text-left">
            {columns.map((col, i) => (
              <th
                key={col.key || i}
                className={`px-6 py-6 font-medium text-base text-theme-primary-text border-theme-sidebar-accent border-b border-t bg-gray-100 ${
                  i === 0 ? "rounded-tl-[10px] rounded-bl-[10px] border-l" : ""
                } ${
                  i === columns.length - 1
                    ? "rounded-tr-[10px] rounded-br-[10px] border-r"
                    : ""
                } `}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border bg-white hover:bg-gray-50">
              {columns.map((col, colIndex) => (
                <td
                  key={col.key || colIndex}
                  className={`px-6 py-4 font-medium text-base text-theme-secondary-text bg-white-100 border-b border-t ${
                    colIndex === 0
                      ? "rounded-tl-[10px] rounded-bl-[10px] border-l"
                      : ""
                  } ${
                    colIndex === columns.length - 1
                      ? "rounded-tr-[10px] rounded-br-[10px] border-r "
                      : ""
                  }`}
                >
                  {col.render ? col.render(row, rowIndex) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTable;
