'use client';

import Image from 'next/image';
import { Crown, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

type Membership = 'MEMBER' | 'MEMBER PREMIUM';

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

export default function ProfileCard() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [membership, setMembership] = useState<Membership>('MEMBER');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.fullname || 'Pengguna');
          setEmail(data.email || user.email || '');
          setImageUrl(data.photoURL || user.photoURL || '');
          setMembership(data.role === 'premium' ? 'MEMBER PREMIUM' : 'MEMBER');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const config = MEMBERSHIP_CONFIG[membership];

  if (loading) {
    return (
      <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-neutral-200 animate-pulse">
        <div className="h-14 w-14 rounded-full bg-neutral-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-neutral-200" />
          <div className="h-3 w-48 rounded bg-neutral-200" />
          <div className="h-5 w-20 rounded-full bg-neutral-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-neutral-200">

      {/* Avatar */}
      <div className="relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-neutral-200 flex items-center justify-center">
            <span className="text-xl font-semibold text-neutral-600">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-neutral-900">{name}</h3>
        <p className="text-sm text-neutral-500">{email}</p>
        <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.className}`}>
          {config.icon}
          {config.label}
        </span>
      </div>
    </div>
  );
}