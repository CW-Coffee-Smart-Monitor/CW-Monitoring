'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Radio,
  MoreVertical,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Pencil,
  X,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────── */
type AssetStatus = 'In Use' | 'In Stock' | 'Missing' | 'Waiting for Tap';
type SessionStatus = 'UPSELL_READY' | 'GHOST' | null;

interface RfidCard {
  id: string;
  uid: string;
  pairingStatus: string;
  assetStatus: AssetStatus;
}

interface ActiveSession {
  id: number;
  cardId: string;
  tableId: number;
  tableName: string;
  memberType: string;
  zone: string;
  duration: string;
  sessionStatus: SessionStatus;
}

/* ─── Mock Data ──────────────────────────────────────────── */
const INITIAL_CARDS: RfidCard[] = [
  { id: '05', uid: 'A4:B2:C9:01', pairingStatus: 'Paired (Table 12)',  assetStatus: 'In Use'    },
  { id: '06', uid: 'D8:F1:E2:44', pairingStatus: 'Not Paired',         assetStatus: 'In Stock'  },
  { id: '07', uid: '--:--:--:--', pairingStatus: 'Unknown',             assetStatus: 'Missing'   },
  { id: '08', uid: 'C1:A3:F2:90', pairingStatus: 'Not Paired',         assetStatus: 'In Stock'  },
  { id: '09', uid: 'B5:D2:E1:33', pairingStatus: 'Paired (Table 07)',  assetStatus: 'In Use'    },
  { id: '10', uid: '9F:3C:A1:22', pairingStatus: 'Not Paired',         assetStatus: 'In Stock'  },
  { id: '11', uid: 'F2:88:C3:DD', pairingStatus: 'Paired (Table 15)',  assetStatus: 'In Use'    },
  { id: '12', uid: '--:--:--:--', pairingStatus: 'Unknown',             assetStatus: 'Missing'   },
  { id: '15', uid: 'E3:F1:A2:55', pairingStatus: 'Paired (Table 22)',  assetStatus: 'In Use'    },
];

const INITIAL_SESSIONS: ActiveSession[] = [
  { id: 1, cardId: '05', tableId: 12, tableName: 'Table 12', memberType: 'Premium Member', zone: 'Walk-in',      duration: '2h 15m', sessionStatus: 'UPSELL_READY' },
  { id: 2, cardId: '09', tableId: 7,  tableName: 'Table 07', memberType: 'Guest',          zone: 'Espresso Bar', duration: '0h 45m', sessionStatus: null           },
  { id: 3, cardId: '11', tableId: 15, tableName: 'Table 15', memberType: 'Guest',          zone: 'Window Seat',  duration: '1h 20m', sessionStatus: 'GHOST'        },
  { id: 4, cardId: '15', tableId: 22, tableName: 'Table 22', memberType: 'Premium Member', zone: 'AC Section',   duration: '3h 02m', sessionStatus: 'UPSELL_READY' },
];

/* ─── Badge Components ───────────────────────────────────── */
function AssetBadge({ status }: { readonly status: AssetStatus }) {
  const styles: Record<AssetStatus, string> = {
    'In Use':          'bg-teal-100 text-teal-700',
    'In Stock':        'bg-neutral-100 text-neutral-600',
    'Missing':         'bg-red-100 text-red-600',
    'Waiting for Tap': 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function SessionBadge({ status }: { readonly status: SessionStatus }) {
  if (!status) return null;
  if (status === 'UPSELL_READY') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5E9C8] text-[#7D5A1B] whitespace-nowrap border border-[#E8D49A]">
        UPSELL READY
      </span>
    );
  }
  if (status === 'GHOST') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-400 text-yellow-900 whitespace-nowrap">
        GHOST
      </span>
    );
  }
  return null;
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function RfidPage() {
  const [cards, setCards]               = useState<RfidCard[]>(INITIAL_CARDS);
  const [sessions, setSessions]         = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [openMenu, setOpenMenu]         = useState<number | null>(null);
  const [searchCard, setSearchCard]     = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'All'>('All');
  const [editCard, setEditCard]         = useState<RfidCard | null>(null);
  const [editUid, setEditUid]           = useState('');
  const [toast, setToast]               = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  /* ── Session actions ── */
  function forceCheckout(sessionId: number, cardId: string) {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, assetStatus: 'In Stock', pairingStatus: 'Not Paired' } : c
    ));
    setOpenMenu(null);
    showToast(`Sesi Card #${cardId} telah di-checkout paksa.`);
  }

  function markTableFaulty(sessionId: number, tableName: string) {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setOpenMenu(null);
    showToast(`${tableName} ditandai Faulty — status diubah ke Maintenance.`);
  }

  function verifyPresence(sessionId: number) {
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, sessionStatus: null } : s)
    );
    setOpenMenu(null);
    showToast('Kehadiran pelanggan terverifikasi — ghost alert dibersihkan.');
  }

  function rebootDevice(sessionId: number) {
    const session = sessions.find(s => s.id === sessionId);
    setOpenMenu(null);
    showToast(`Perintah reboot dikirim ke ${session?.tableName ?? 'perangkat'}.`);
  }

  function handleSaveUid() {
    if (!editCard) return;
    setCards(prev => prev.map(c =>
      c.id === editCard.id
        ? { ...c, uid: editUid, pairingStatus: editUid === '--:--:--:--' ? 'Unknown' : c.pairingStatus }
        : c
    ));
    showToast(`UID Card #${editCard.id} berhasil diperbarui.`);
    setEditCard(null);
  }

  /* ── Derived ── */
  const filteredCards = cards.filter(c => {
    const q = searchCard.toLowerCase();
    const matchSearch = c.id.toLowerCase().includes(q) || c.uid.toLowerCase().includes(q);
    const matchFilter = statusFilter === 'All' || c.assetStatus === statusFilter;
    return matchSearch && matchFilter;
  });

  const visibleSessions = sessions.slice(0, 3);
  const inUseCards  = cards.filter(c => c.assetStatus === 'In Use');
  const totalActive = inUseCards.length;
  const totalMissing = cards.filter(c => c.assetStatus === 'Missing').length;
  const totalInStock = cards.filter(c => c.assetStatus === 'In Stock').length;

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">RFID &amp; Membership Hub</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage physical cards, active sessions, and inventory</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-neutral-400 block" aria-hidden="true"></span>
          <span>Waiting for Tap...</span>
        </div>
      </div>

      {/* ── Top Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Active Session Monitor */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-neutral-200 overflow-visible">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-800">Active Session Monitor</h2>
            <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-500 text-xs font-medium tracking-wide">
              LIVE FEED
            </span>
          </div>

          <div className="p-4 space-y-3" ref={menuContainerRef}>
            {visibleSessions.length === 0 ? (
              <div className="py-10 text-center text-neutral-400 text-sm">
                Tidak ada sesi kartu yang aktif.
              </div>
            ) : (
              visibleSessions.map(session => (
                <div
                  key={session.id}
                  className="relative bg-neutral-50 rounded-xl border border-neutral-200 px-4 py-3.5 flex items-center gap-3"
                >
                  {/* Left accent for notable sessions */}
                  {session.sessionStatus && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#4B135F] rounded-full" />
                  )}

                  {/* Card Icon */}
                  <div className="w-9 h-9 rounded-lg bg-[#EDE9F5] flex items-center justify-center shrink-0 ml-1">
                    <Radio className="w-4 h-4 text-[#4B135F]" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">
                      Card #{session.cardId}{' '}
                      <span className="text-neutral-400 font-normal">→</span>{' '}
                      {session.tableName}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {session.memberType} · {session.zone}
                    </p>
                  </div>

                  {/* Badge */}
                  <div className="shrink-0">
                    <SessionBadge status={session.sessionStatus} />
                  </div>

                  {/* Duration */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#4B135F]">{session.duration}</p>
                    <p className="text-xs text-neutral-400">Duration</p>
                  </div>

                  {/* 3-dot menu */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setOpenMenu(openMenu === session.id ? null : session.id)}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenu === session.id && (
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-30 py-1 overflow-hidden">
                        <button
                          onClick={() => forceCheckout(session.id, session.cardId)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4 shrink-0" />
                          Force Check-out
                        </button>
                        <button
                          onClick={() => markTableFaulty(session.id, session.tableName)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                          Mark Table as Faulty
                        </button>
                        <button
                          onClick={() => verifyPresence(session.id)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
                          Verify Presence
                        </button>
                        <button
                          onClick={() => rebootDevice(session.id)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4 shrink-0 text-blue-500" />
                          Reboot Device
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-5 pb-5 pt-2">
            <button
              type="button"
              onClick={() => router.push('/admin/rfid/active-sessions')}
              className="w-full py-2.5 bg-[#4B135F] text-white text-sm font-medium rounded-lg hover:bg-[#3a0f49] transition-colors"
            >
              See all active monitor
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">

          {/* Emergency Override */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-2.5 border-b border-neutral-100">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <h2 className="font-semibold text-neutral-800">Emergency Override</h2>
            </div>

            <div className="p-4">
              {/* Manual Unpairing — navigates to detail page */}
              <button
                onClick={() => router.push('/admin/rfid/unpairing')}
                className="w-full text-left rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4 hover:bg-[#F4F0FA] hover:border-[#C8B4DC] transition-colors group"
              >
                <p className="text-sm font-semibold text-neutral-800 group-hover:text-[#4B135F] transition-colors">
                  Manual Unpairing
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">Force disconnect a card from a table</p>
              </button>
            </div>
          </div>

          {/* Total Active Cards Stat */}
          <div className="bg-[#4B135F] rounded-xl p-13 text-white relative overflow-hidden">
            <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Total Active Cards</p>
            <p className="text-7xl font-bold mt-2">{totalActive}</p>
            <div className="flex items-center gap-40 mt-4 text-sm text-white/70">
              <span>Missing: {totalMissing}</span>
              <span>In Stock: {totalInStock}</span>
            </div>
            {/* decorative */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/5" />
            <div className="absolute -right-2 -bottom-8 w-16 h-16 rounded-full bg-white/5" />
          </div>
        </div>
      </div>

      {/* ── RFID Inventory Registry ── */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 gap-3 flex-wrap">
          <h2 className="font-semibold text-neutral-800">RFID Inventory Registry</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Card ID or UID..."
                value={searchCard}
                onChange={e => setSearchCard(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 w-52"
              />
            </div>
            {/* Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as AssetStatus | 'All')}
                className="pl-3 pr-8 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 appearance-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="In Use">In Use</option>
                <option value="In Stock">In Stock</option>
                <option value="Missing">Missing</option>
                <option value="Waiting for Tap">Waiting for Tap</option>
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">Card ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">UID Mapping</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">Asset Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-neutral-400 text-sm">
                    Tidak ada kartu yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredCards.map(card => (
                  <tr key={card.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-neutral-800 text-sm">#{card.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-mono text-neutral-700 tracking-wider">{card.uid}</p>
                      <p className="text-xs text-[#4B135F] mt-0.5">{card.pairingStatus}</p>
                    </td>
                    <td className="px-5 py-4">
                      <AssetBadge status={card.assetStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => { setEditCard(card); setEditUid(card.uid); }}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-[#4B135F]"
                        title="Edit UID"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit UID Modal ── */}
      {editCard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h3 className="font-semibold text-neutral-800">Edit UID — Card #{editCard.id}</h3>
              <button
                onClick={() => setEditCard(null)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label htmlFor="edit-uid" className="text-xs text-neutral-500 font-medium block mb-1">
                  UID (Format: XX:XX:XX:XX)
                </label>
                <input
                  id="edit-uid"
                  type="text"
                  value={editUid}
                  onChange={e => setEditUid(e.target.value)}
                  placeholder="A4:B2:C9:01"
                  className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 tracking-wider"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditCard(null)}
                  className="flex-1 py-2 text-sm border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveUid}
                  className="flex-1 py-2 text-sm bg-[#4B135F] text-white rounded-lg hover:bg-[#3a0f49] transition-colors font-medium"
                >
                  Simpan UID
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-neutral-800 text-white text-sm px-4 py-3 rounded-xl shadow-2xl z-50 max-w-sm animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}
