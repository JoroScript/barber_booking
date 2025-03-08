import React, { useEffect } from 'react';

const UnavailableSlotModal = ({ isOpen, onClose, message }) => {
  // Add a separate blur overlay instead of blurring the body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;
  
  return (
    <>
      {/* Separate blur overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 animate-fadeIn"></div>
      
      {/* Modal content - no blur applied */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="max-w-md w-11/12 shadow-2xl overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black border border-red-800 animate-slideIn pointer-events-auto">
          <div className="bg-gradient-to-r from-red-900 to-red-700 px-5 py-4 border-b border-red-800">
            <h3 className="text-lg font-medium text-white">Booking Unavailable</h3>
          </div>
          <div className="px-5 py-6 text-gray-200">
            <p>
              {message || "This time slot is no longer available. Please select another date and time."}
            </p>
          </div>
          <div className="px-5 py-4 bg-gradient-to-r from-gray-900 to-black border-t border-red-800 flex justify-end">
            <button 
              className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-medium py-2 px-4 rounded transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Add required CSS animations
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-slideIn {
  animation: slideIn 0.4s ease-out;
}
`;

// Inject animation styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default UnavailableSlotModal;