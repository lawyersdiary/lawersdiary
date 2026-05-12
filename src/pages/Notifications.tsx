import React from 'react';
import { Bell, Swords, MessageSquare, Trophy, Star, AlertCircle, CheckCheck } from 'lucide-react';
import { Card, Button, EmptyState } from '@/components/ui';
import { useNotificationStore } from '@/store/useDataStores';

const notifIcons: Record<string, React.ReactNode> = {
  duel_invite: <Swords className="w-5 h-5 text-red-400" />,
  room_invite: <MessageSquare className="w-5 h-5 text-green-400" />,
  mention: <Bell className="w-5 h-5 text-blue-400" />,
  test_published: <Star className="w-5 h-5 text-amber-400" />,
  rank_change: <Trophy className="w-5 h-5 text-purple-400" />,
  achievement: <Trophy className="w-5 h-5 text-emerald-400" />,
  system: <AlertCircle className="w-5 h-5 text-slate-400" />,
};

const Notifications: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Уведомления</h1>
          <p className="text-slate-400 text-sm">{unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Нет новых уведомлений'}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" icon={<CheckCheck className="w-4 h-4" />} onClick={markAllAsRead}>
            Прочитать все
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-16 h-16" />}
          title="Нет уведомлений"
          description="Здесь будут отображаться вызовы на дуэль, упоминания и другие уведомления"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} hover padding="sm" className={n.is_read ? 'opacity-60' : 'border-l-2 border-l-indigo-500'}>
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">{notifIcons[n.type] || notifIcons.system}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{new Date(n.created_at).toLocaleString('ru-RU')}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
