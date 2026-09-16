import React from "react";
import toast from "react-hot-toast";
import type { Toast } from "react-hot-toast";
import "./toastStyles.css";

export type ToastActionType = "create" | "edit" | "delete" | "info" | "error";

interface ToastCardProps {
  t: Toast;
  type: ToastActionType;
  badgeText: string;
  actionText: string;
  title: string;
  message: string;
  duration?: number;
}

export const ToastCard: React.FC<ToastCardProps> = ({
  t,
  type,
  badgeText,
  actionText,
  title,
  message,
  duration = 3800,
}) => {
  const renderIcon = () => {
    switch (type) {
      case "create":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Box with plus */}
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
            <circle cx="17" cy="17" r="4" fill="#ecfdf5" stroke="#059669" strokeWidth="2" />
            <line x1="17" y1="15" x2="17" y2="19" stroke="#059669" strokeWidth="2" />
            <line x1="15" y1="17" x2="19" y2="17" stroke="#059669" strokeWidth="2" />
          </svg>
        );
      case "edit":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Pencil edit */}
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        );
      case "delete":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Trash can */}
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        );
      case "info":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Check / Eye / Sparkle */}
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
      case "error":
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Alert circle */}
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`custom-toast-wrapper custom-toast-theme-${type} ${
        t.visible ? "custom-toast-enter" : "custom-toast-leave"
      }`}
    >
      <div className="custom-toast-content">
        <div className="custom-toast-icon-box">{renderIcon()}</div>

        <div className="custom-toast-body">
          <div className="custom-toast-header">
            <span className="custom-toast-badge">
              {badgeText} • {actionText}
            </span>
          </div>
          <h4 className="custom-toast-title">
            <span className="custom-toast-item-highlight">{title}</span>
          </h4>
          {message && <p className="custom-toast-message">{message}</p>}
        </div>

        <button
          className="custom-toast-close"
          onClick={() => toast.dismiss(t.id)}
          aria-label="Cerrar notificación"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Barra de progreso inferior */}
      <div className="custom-toast-progress-track">
        <div
          className="custom-toast-progress-bar"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
};
