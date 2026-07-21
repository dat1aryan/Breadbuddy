import { profileEngine } from '../../lib/profileEngine';

interface AvatarProps {
  name: string;
  userId?: number;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, userId, src, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  const emoji = userId ? profileEngine.getAvatar(userId) : null;

  // Square sizes — bb-sm radius (4px) keeps neo-brutal language
  const sizeClasses = {
    sm: 'w-7 h-7 text-[14px]',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-2xl',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden select-none font-bold uppercase tracking-wider bg-bb-violet text-bb-violet-fg border-2 border-black rounded-bb-sm ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : emoji ? (
        <span className="leading-none">{emoji}</span>
      ) : (
        <span className="font-mono">{initials}</span>
      )}
    </div>
  );
}
