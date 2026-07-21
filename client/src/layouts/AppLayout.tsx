import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { CommandPalette } from '../components/ui/CommandPalette';
import { User } from '../lib/types';

interface AppLayoutProps {
  user: User;
  activeTab: 'dashboard' | 'transactions' | 'aibro' | 'chill' | 'goals' | 'profile' | 'settings';
  onChangeTab: (tabId: 'dashboard' | 'transactions' | 'aibro' | 'chill' | 'goals' | 'profile' | 'settings') => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppLayout({ user, activeTab, onChangeTab, onLogout, children }: AppLayoutProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Bind global shortcut: Ctrl/Cmd + K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-bb-bg text-white overflow-hidden">
      {/* Permanent Sidebar (Desktop/Tablet) */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        onChangeTab={onChangeTab}
        onLogout={onLogout}
      />

      {/* Main Section */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Header */}
        <Header
          user={user}
          activeTab={activeTab}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onLogout={onLogout}
          onChangeTab={onChangeTab}
        />

        {/* Dynamic Content Panel — ONLY this scrolls */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Sticky Bottom Nav (Mobile) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={onChangeTab}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={onChangeTab}
        onLogout={onLogout}
      />
    </div>
  );
}
