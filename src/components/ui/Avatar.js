import { getInitials, getAvatarColor, cn } from '@/lib/utils';

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  return (
    <div className={cn('avatar', sizeMap[size], getAvatarColor(name), className)}>
      {getInitials(name)}
    </div>
  );
}
