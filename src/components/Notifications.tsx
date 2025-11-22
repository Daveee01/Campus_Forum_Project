import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribeNotifications, markNotificationAsRead, markAllNotificationsAsRead, getCurrentUser } from '../lib/firebase';

export interface Notification {
  id: string;
  userId: string;
  type: 'comment' | 'reply' | 'upvote';
  postId: string;
  postTitle: string;
  actorName: string;
  actorAvatar?: string;
  content?: string;
  isRead: boolean;
  createdAt: string;
}

type NotificationsProps = {
  onClose: () => void;
};

export default function Notifications({ onClose }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = subscribeNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.uid);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationText = (notif: Notification) => {
    switch (notif.type) {
      case 'comment':
        return `mengomentari postingan "${notif.postTitle}"`;
      case 'reply':
        return `membalas komentar Anda di "${notif.postTitle}"`;
      case 'upvote':
        return `menyukai postingan "${notif.postTitle}"`;
      default:
        return 'berinteraksi dengan postingan Anda';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-96 max-h-[32rem] bg-slate-800/98 backdrop-blur-sm border border-slate-700 rounded-lg shadow-2xl shadow-slate-950/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Notifikasi</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Tandai semua dibaca
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-[28rem]">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-gray-400 mb-2">Belum ada notifikasi</div>
            <div className="text-gray-500 text-xs">Notifikasi akan muncul ketika ada aktivitas di postingan Anda</div>
          </div>
        ) : (
          <div>
            {notifications.map((notif) => (
              <Link
                key={notif.id}
                to={`/post/${notif.postId}`}
                onClick={() => {
                  handleMarkAsRead(notif.id);
                  onClose();
                }}
                className={`block px-4 py-3 border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                  !notif.isRead ? 'bg-blue-600/10' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {notif.actorAvatar ? (
                      <img
                        src={notif.actorAvatar}
                        alt={notif.actorName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {notif.actorName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-white">{notif.actorName}</span>{' '}
                      {getNotificationText(notif)}
                    </p>
                    {notif.content && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        "{notif.content}"
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
