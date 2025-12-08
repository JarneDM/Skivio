import React, { useState } from "react";

function Error({ message }) {
  const [visible, setVisible] = useState("flex");

  const handleClose = () => {
    setVisible("hidden");
  };
  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-200 border border-red-400 text-red-800 px-4 py-3 rounded shadow-lg z-50 ${visible} flex flex-col items-center`}
    >
      {message}
      <button
        className="bg-red-500 text-white py-1.5 px-2 rounded-md cursor-pointer hover:bg-red-700 transition-colors"
        onClick={() => handleClose()}
      >
        Close
      </button>
    </div>
  );
}

export default Error;
