import { Search } from 'lucide-react';
import { Badge } from './Badge';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  onClick?: () => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search features, expenses, stats...',
  value,
  onChange,
  onClick,
  className = '',
}: SearchBarProps) {
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center w-full max-w-sm bg-bb-surface border-2 border-bb-border rounded-bb-sm px-3.5 py-2 cursor-pointer transition-colors duration-100 hover:bg-bb-bg hover:border-black group ${className}`}
    >
      <Search size={14} className="text-bb-text-muted group-hover:text-bb-text-secondary transition-colors mr-2.5 flex-shrink-0" />

      {onChange ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none text-xs text-bb-text-primary placeholder-bb-text-muted outline-none font-sans"
        />
      ) : (
        <span className="text-xs text-bb-text-muted select-none mr-auto font-sans">
          {placeholder}
        </span>
      )}

      {/* Keyboard shortcut — Phase 1 Badge (neutral) as the chip */}
      {!onChange && (
        <Badge variant="neutral" size="sm" className="ml-auto flex-shrink-0">
          {isMac ? '⌘' : 'Ctrl'}K
        </Badge>
      )}
    </div>
  );
}
