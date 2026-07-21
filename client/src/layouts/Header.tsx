import { useState, useEffect } from 'react';
import { Bell, ChevronRight, LogOut, Trash2, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { SearchBar } from '../components/ui/SearchBar';
import { Dropdown } from '../components/ui/Dropdown';
import { NotificationBadge } from '../components/ui/NotificationBadge';
import { Avatar } from '../components/ui/Avatar';
import { Drawer } from '../components/ui/Drawer';
import { User } from '../lib/types';
import { notificationEngine, NotificationItem } from '../lib/notificationEngine';

interface HeaderProps {
  user: User;
  activeTab: string;
  onOpenCommandPalette: () => void;
  onLogout: () => void;
  onChangeTab?: (tabId: any) => void;
}

export function Header({ user, activeTab, onOpenCommandPalette, onLogout, onChangeTab }: HeaderProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    notificationEngine.getNotifications(user.id, user.currency, user.monthlyAllowance)
  );

  useEffect(() => {
    const handleNotifUpdate = () => {
      setNotifications(notificationEngine.getNotifications(user.id, user.currency, user.monthlyAllowance));
    };
    window.addEventListener('notifications-updated', handleNotifUpdate);
    return () => window.removeEventListener('notifications-updated', handleNotifUpdate);
  }, [user.id, user.currency, user.monthlyAllowance]);

  // ── Tab name map — BUG FIX: 'aibro' was incorrectly keyed as 'chat' ──────
  const tabNames: Record<string, string> = {
    dashboard:    'Overview',
    transactions: 'Transactions',
    aibro:        'AI Bro',
    chill:        'Chill Zone',
    goals:        'Saving Goals',
    profile:      'User Profile',
    settings:     'Settings',
  };

  const currentTabName = tabNames[activeTab] || 'Overview';

  const userMenuItems = [
    {
      label: 'View Profile',
      icon: <UserIcon size={14} />,
      onClick: () => onChangeTab?.('profile'),
    },
    {
      label: 'Settings',
      icon: <SettingsIcon size={14} />,
      onClick: () => onChangeTab?.('settings'),
    },
    {
      label: 'Log Out',
      icon: <LogOut size={14} className="text-bb-coral" />,
      onClick: onLogout,
      danger: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    notificationEngine.markAsRead(user.id, id);
  };

  const handleDismiss = (id: number) => {
    notificationEngine.dismissNotification(user.id, id);
  };

  const handleMarkAllRead = () => {
    notificationEngine.markAllAsRead(user.id);
  };

  return (
    // Flat surface, hard bottom border — no blur, no translucency
    <header className="sticky top-0 z-30 bg-bb-surface border-b-[3px] border-black px-4 md:px-8 py-3.5 flex items-center justify-between">

      {/* ── Breadcrumb (single line, no duplication) ─────────────────── */}
      {/*
       * Previously stacked two identical labels:
       *   BREADBUDDY > OVERVIEW   (10px mono, muted)
       *   Overview                (14px extrabold, white)
       * Collapsed to one line: "BREADBUDDY / Current Tab" where the
       * tab name is bb-lime — gives the "inside BreadBuddy" orientation
       * affordance on mobile without the duplication.
       */}
      <div className="flex items-center gap-2 select-none" aria-label="Breadcrumb">
        <span className="font-mono text-[10px] font-bold text-bb-text-muted uppercase tracking-[0.12em]">
          BreadBuddy
        </span>
        <ChevronRight size={10} className="text-bb-text-muted" />
        <span className="font-mono text-[10px] font-bold text-bb-violet uppercase tracking-[0.12em]">
          {currentTabName}
        </span>
      </div>

      {/* ── Right: Search + Bell + Avatar ────────────────────────────── */}
      <div className="flex items-center gap-3">
        <SearchBar onClick={onOpenCommandPalette} className="hidden sm:flex" />

        {/*
         * Bell button — icon-only.
         * NOTE FLAGGED: Phase 1 Button has no icon-only variant (no square
         * padding adjustment). Using raw bb.* classes here rather than adding
         * an ad-hoc variant to Button.tsx. Flag for Phase 3 if a generic
         * icon-button primitive is needed elsewhere.
         */}
        <button
          onClick={() => setIsNotifOpen(true)}
          aria-label="Open notifications"
          className={[
            'relative flex items-center justify-center',
            'w-9 h-9',
            'bg-bb-surface border-2 border-bb-border rounded-bb-sm',
            'text-bb-text-muted',
            'hover:bg-bb-bg hover:border-black hover:text-bb-text-primary',
            'transition-colors duration-100 outline-none',
            'focus-visible:ring-2 focus-visible:ring-bb-violet/50',
          ].join(' ')}
        >
          <Bell size={16} />
          <NotificationBadge count={unreadCount} />
        </button>

        {/* User Menu Dropdown */}
        <Dropdown
          align="right"
          items={userMenuItems}
          trigger={
            <button className="flex items-center gap-2 p-1 rounded-bb-sm hover:bg-bb-bg transition-colors duration-100 outline-none">
              <Avatar name={user.name || 'bestie'} userId={user.id} size="sm" />
            </button>
          }
        />
      </div>

      {/* ── Notification Drawer ────────────────────────────────────────── */}
      <Drawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        title={<span className="text-bb-violet">Notifications</span>}
      >
        <div className="flex flex-col gap-4">
          {/* Header row: inbox label + mark-all-read */}
          {notifications.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-bb-text-muted uppercase tracking-[0.12em] font-mono">
                Inbox
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-bb-coral hover:text-bb-text-primary transition-colors font-mono uppercase tracking-wider"
                >
                  Mark all read
                </button>
              )}
            </div>
          )}

          {/* Empty state */}
          {notifications.length === 0 ? (
            <div className="py-20 text-center space-y-3 select-none">
              <span className="text-4xl block">📭</span>
              <h4 className="text-sm font-bold text-bb-text-primary">
                No new notifications
              </h4>
              <p className="text-xs text-bb-text-secondary max-w-[200px] mx-auto">
                We'll alert you here when there's an update.
              </p>
            </div>
          ) : (
            /* Notification cards — flat surfaces, no gradients, no inline <style> */
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={[
                    'p-4 rounded-bb-sm flex gap-3 cursor-pointer relative',
                    'border-2 transition-colors duration-100',
                    notif.read
                      // Read: bg-bb-bg, muted border, dimmed
                      ? 'bg-bb-bg border-bb-border opacity-60 hover:opacity-90 hover:bg-bb-surface'
                      // Unread: bg-bb-surface, border-bb-border, coral accent on hover
                      : 'bg-bb-surface border-bb-border hover:border-bb-coral',
                  ].join(' ')}
                >
                  <div className="flex-1 space-y-1 min-w-0">
                    <h4 className="text-xs font-mono uppercase tracking-wider font-extrabold flex items-center justify-between gap-2">
                      <span className="truncate text-bb-lime">{notif.title}</span>
                      {/* Unread dot — solid coral, no pulse */}
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-bb-coral flex-shrink-0" />
                      )}
                    </h4>
                    <p className="text-[11px] leading-normal font-sans font-bold text-bb-violet">
                      {notif.message}
                    </p>
                    <span className="text-[9px] font-mono block pt-1 text-white">
                      {notif.time}
                    </span>
                  </div>
                  {/* Dismiss button */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(notif.id);
                      }}
                      aria-label="Dismiss notification"
                      className="p-1 rounded-bb-xs text-bb-text-muted hover:text-bb-coral hover:bg-bb-bg transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>
    </header>
  );
}
