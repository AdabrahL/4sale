import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/notifications.css";

export default function Notifications() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const res = await API.get(`/notifications?page=${page}`);
      setNotifications(res.data.data);
      setPagination({
        current: res.data.current_page,
        total: res.data.last_page,
        perPage: res.data.per_page,
        totalItems: res.data.total,
      });
    } catch (err) {
      error("Failed to load notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.post("/notifications/mark-all-read");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      success("All notifications marked as read");
    } catch (err) {
      error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      success("Notification deleted");
    } catch (err) {
      error("Failed to delete notification");
    }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm("Delete all notifications? This cannot be undone.")) return;
    
    try {
      await API.delete("/notifications");
      setNotifications([]);
      success("All notifications deleted");
    } catch (err) {
      error("Failed to delete notifications");
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      property_approved: "fa-check-circle",
      property_rejected: "fa-times-circle",
      new_favorite: "fa-heart",
      new_message: "fa-envelope",
      new_review: "fa-star",
      new_comment: "fa-comment",
      properties_boosted: "fa-rocket",
      new_property_submission: "fa-home",
    };
    return icons[type] || "fa-bell";
  };

  const getNotificationLink = (notification) => {
    const data = notification.data || {};
    
    switch (notification.type) {
      case "property_approved":
      case "property_rejected":
      case "new_favorite":
      case "new_review":
        return data.property_id ? `/properties/${data.property_id}` : "#";
      case "new_message":
        return "/messenger";
      case "properties_boosted":
        return "/profile";
      case "new_property_submission":
        return data.property_id ? `/admin/pending` : "#";
      default:
        return "#";
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read_at;
    if (filter === "read") return n.read_at;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ minHeight: "60vh", paddingTop: "100px" }}>
          <div className="text-center">
            <i className="fa fa-lock" style={{ fontSize: "48px", color: "#ccc" }}></i>
            <h3 className="mt-3">Please log in to view notifications</h3>
            <Link to="/login" className="btn btn-primary mt-3">
              Log In
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="notifications-page">
        <div className="container">
          <div className="notifications-header">
            <h1>
              <i className="fa fa-bell"></i> Notifications
            </h1>
            <div className="notifications-actions">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="btn-mark-read">
                  <i className="fa fa-check-double"></i> Mark All as Read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={deleteAllNotifications} className="btn-delete-all">
                  <i className="fa fa-trash"></i> Delete All
                </button>
              )}
            </div>
          </div>

          <div className="notifications-filters">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              className={filter === "unread" ? "active" : ""}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={filter === "read" ? "active" : ""}
              onClick={() => setFilter("read")}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>

          {loading ? (
            <div className="notifications-loading">
              <i className="fa fa-spinner fa-spin"></i> Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <i className="fa fa-bell-slash"></i>
              <h3>No {filter === "all" ? "" : filter} notifications</h3>
              <p>
                {filter === "all"
                  ? "You're all caught up! Check back later."
                  : `You have no ${filter} notifications.`}
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read_at ? "unread" : ""}`}
                >
                  <Link
                    to={getNotificationLink(notification)}
                    className="notification-link"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      <i className={`fa ${getNotificationIcon(notification.type)}`}></i>
                    </div>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    {!notification.read_at && <div className="notification-badge"></div>}
                  </Link>
                  <button
                    className="notification-delete"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteNotification(notification.id);
                    }}
                    title="Delete"
                  >
                    <i className="fa fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {pagination && pagination.total > 1 && (
            <div className="notifications-pagination">
              {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={page === pagination.current ? "active" : ""}
                  onClick={() => fetchNotifications(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
