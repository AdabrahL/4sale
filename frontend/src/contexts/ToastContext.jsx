import { motion, AnimatePresence } from "framer-motion";
import { useState, createContext, useContext } from "react";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message, duration) => addToast(message, "success", duration);
  const error = (message, duration) => addToast(message, "error", duration);
  const info = (message, duration) => addToast(message, "info", duration);
  const warning = (message, duration) => addToast(message, "warning", duration);

  return (
    <ToastContext.Provider value={{ addToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠"
  };

  const colors = {
    success: "#0c5904",
    error: "#dc3545",
    info: "#0dcaf0",
    warning: "#ffc107"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`toast toast-${toast.type}`}
      style={{
        borderLeft: `4px solid ${colors[toast.type]}`
      }}
    >
      <div className="toast-icon" style={{ color: colors[toast.type] }}>
        {icons[toast.type]}
      </div>
      <div className="toast-message">{toast.message}</div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="toast-close"
        onClick={onClose}
      >
        ×
      </motion.button>
    </motion.div>
  );
};
