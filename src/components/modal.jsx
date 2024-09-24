import React, { useEffect, useState } from 'react';
import '../styles/Modal.css'; // Pastikan Anda membuat file CSS ini

export default function Modal({ analysisResult, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex items-center justify-center z-50">
      {/* Hapus Modal background overlay */}
      {/* Modal content */}
      <div className={`bg-white rounded-lg shadow-lg p-6 max-w-lg z-10 modal-slide ${isVisible ? 'slide-up' : ''}`}>
        <h2 className="text-2xl font-semibold mb-4">Analysis Result</h2>
        <p className="mb-6">{analysisResult}</p>
        <button 
          onClick={onClose} 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
