'use client';

import Image from 'next/image';
import { Crown, User } from 'lucide-react';

type ProfileCardProps = {
  name: string;
  email: string;
  imageUrl: string;
  membership: 'MEMBER' | 'MEMBER PREMIUM';
};

const MEMBERSHIP_CONFIG = {
  MEMBER: {
    label: 'Member',
    className: 'bg-neutral-100 text-neutral-600',
    icon: <User className="h-3 w-3" />,
  },
  'MEMBER PREMIUM': {
    label: 'Premium',
    className: 'bg-amber-100 text-amber-700',
    icon: <Crown className="h-3 w-3" />,
  },
};

export default function ProfileCard({
  name,
  email,
  imageUrl,
  membership,
}: ProfileCardProps) {
  const config = MEMBERSHIP_CONFIG[membership];

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-neutral-200">
      
      {/* Avatar */}
      <div className="relative">
        <Image
          src={imageUrl}
          alt={name}
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover"
        />

        {/* Online status */}
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-neutral-900">{name}</h3>
        <p className="text-sm text-neutral-500">{email}</p>

        {/* Membership badge */}
        <span
          className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
        >
          {config.icon}
          {config.label}
        </span>
      </div>
    </div>
  );
}