import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import api from '../../lib/api.js';

dayjs.extend(relativeTime);

const actionIcons = {
  DOCUMENT_CREATED: '📄',
  DOCUMENT_UPDATED: '✏️',
  DOCUMENT_DELETED: '🗑️',
  BULK_UPLOAD: '📦',
  CSV_IMPORT: '📊',
  USER_REGISTERED: '👤',
  USER_VERIFIED: '✅',
  USER_LOGGED_IN: '🔑',
  PASSWORD_CHANGED: '🔒',
  USER_UPDATED: '👥',
  USER_DEACTIVATED: '🚫',
  USER_REACTIVATED: '✨'
};

const actionColors = {
  DOCUMENT_CREATED: 'text-emerald-400',
  DOCUMENT_UPDATED: 'text-blue-400',
  DOCUMENT_DELETED: 'text-red-400',
  BULK_UPLOAD: 'text-purple-400',
  CSV_IMPORT: 'text-amber-400',
  USER_REGISTERED: 'text-cyan-400',
  USER_LOGGED_IN: 'text-slate-400'
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await api.get('/documents/activity');
        setActivities(data || []);
      } catch (error) {
        console.error('Activity feed error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/5 bg-[#15161b] p-4 sm:p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Activity</p>
          <h3 className="font-heading text-lg text-white">Recent actions</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-white/5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-white/5" />
                <div className="h-2.5 w-1/2 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/5 bg-[#15161b] p-4 sm:p-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Activity</p>
        <h3 className="font-heading text-lg text-white sm:text-xl">Recent actions</h3>
      </div>

      {activities.length === 0 ? (
        <p className="py-4 text-sm text-slate-500">No recent activity.</p>
      ) : (
        <div className="space-y-1">
          {activities.slice(0, 10).map((activity) => (
            <div key={activity.id} className="group flex items-start gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.03]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm">
                {actionIcons[activity.action] || '📋'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-300 sm:text-sm">
                  <span className={`font-semibold ${actionColors[activity.action] || 'text-white'}`}>
                    {activity.action?.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                  </span>
                </p>
                <p className="truncate text-[0.65rem] text-slate-500 sm:text-xs">{activity.description}</p>
              </div>
              <span className="shrink-0 text-[0.6rem] text-slate-600 sm:text-xs">{dayjs(activity.createdAt).fromNow()}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ActivityFeed;
