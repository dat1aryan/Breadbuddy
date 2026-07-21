import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Home, Receipt, MessageSquare, Gamepad2, Target, LogOut } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: 'dashboard' | 'transactions' | 'aibro' | 'chill' | 'goals') => void;
  onLogout: () => void;
}

export function CommandPalette({ isOpen, onClose, onNavigateTab, onLogout }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const commands: CommandItem[] = [
    {
      id: 'tab-overview',
      label: 'Go to Overview',
      category: 'Navigation',
      icon: <Home size={16} />,
      action: () => onNavigateTab('dashboard'),
    },
    {
      id: 'tab-ledger',
      label: 'Go to Transactions',
      category: 'Navigation',
      icon: <Receipt size={16} />,
      action: () => onNavigateTab('transactions'),
    },
    {
      id: 'tab-aibro',
      label: 'Go to AI Bro',
      category: 'Navigation',
      icon: <MessageSquare size={16} />,
      action: () => onNavigateTab('aibro'),
    },
    {
      id: 'tab-chill',
      label: 'Go to Chill Zone',
      category: 'Navigation',
      icon: <Gamepad2 size={16} />,
      action: () => onNavigateTab('chill'),
    },
    {
      id: 'tab-goals',
      label: 'Go to Saving Goals',
      category: 'Navigation',
      icon: <Target size={16} />,
      action: () => onNavigateTab('goals'),
    },
    {
      id: 'auth-logout',
      label: 'Log Out of BreadBuddy',
      category: 'System',
      icon: <LogOut size={16} className="text-neon-coral" />,
      action: () => onLogout(),
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 bg-neutral-950/75 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            ref={containerRef}
            className="w-full max-w-lg rounded-2xl glass bg-surface-card border-white/10 dark:border-white/10 light:border-black/10 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-white/5">
              <Search size={18} className="text-white/40 dark:text-white/40 light:text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search..."
                className="w-full bg-transparent border-none text-sm text-white placeholder-white/30 outline-none font-mono"
              />
              <span className="text-[10px] font-mono text-white/30 px-1.5 py-0.5 rounded border border-white/10">ESC</span>
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-0.5">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-[11px] font-mono font-bold uppercase tracking-wider transition-colors ${
                        isSelected
                          ? 'bg-lavender/10 text-lavender'
                          : 'text-white/70 dark:text-white/70 light:text-gray-700 hover:bg-white/[0.02] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isSelected ? 'text-lavender' : 'text-white/40'}>{cmd.icon}</span>
                        <span>{cmd.label}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-white/30">No results found for "{search}"</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
