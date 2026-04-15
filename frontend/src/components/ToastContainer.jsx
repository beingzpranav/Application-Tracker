import { useNotifications } from '../context/NotificationContext';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications();

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type] || Info;
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <Icon size={18} />
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
