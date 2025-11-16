import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage as RadixAvatarImage } from '@radix-ui/react-avatar';
import { generateAvatarUrl } from '@/lib/utils';

interface AvatarImageProps {
  src?: string;
  alt?: string;
  address?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackText?: string;
}

export function AvatarImage({
  src,
  alt = 'Avatar',
  address,
  size = 'md',
  className = '',
  fallbackText,
}: AvatarImageProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const fallbackSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-xl',
  };

  // Generate fallback avatar from address or use provided src
  const avatarSrc = imageError || !src ?
    (address ? generateAvatarUrl(address) : undefined) :
    src;

  const fallback = fallbackText || (alt ? alt.charAt(0).toUpperCase() : '?');

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {avatarSrc && (
        <RadixAvatarImage
          src={avatarSrc}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
      <AvatarFallback
        className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 font-semibold text-white ${fallbackSizeClasses[size]}`}
      >
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
