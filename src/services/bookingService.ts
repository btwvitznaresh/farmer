/**
 * Booking Service — IndexedDB only (no Firebase)
 * All bookings stored locally; syncs to backend API when online.
 */
import { dbService } from '@/services/db';
import { Service } from '@/data/services';
import type { Booking, BookingStatus, TimeSlot, Urgency } from '@/types/services';

export type { Booking, BookingStatus, TimeSlot, Urgency };

const BACKEND = 'http://localhost:3001';
const URGENCY_SURCHARGE = 200;

// ── Notification helper ────────────────────────────────────────
async function notify(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch { return; }
  }
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/logo.svg' });
  }
}

// ── Generate booking ID ────────────────────────────────────────
function genId() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AGT-${datePart}-${rand}`;
}

// ── Sync a booking to backend (best-effort) ───────────────────
async function syncToBackend(booking: Booking) {
  if (!navigator.onLine) return;
  try {
    await fetch(`${BACKEND}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // silently ignore — offline or backend down
  }
}

// ── Public API ─────────────────────────────────────────────────
export const bookingService = {
  async listBookings(): Promise<Booking[]> {
    const all = await dbService.getAll('service_bookings');
    return (all as unknown as Booking[]).sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async getBooking(id: string): Promise<Booking | null> {
    const all = await this.listBookings();
    return all.find(b => b.id === id) ?? null;
  },

  async createBooking(
    service: Service,
    payload: {
      farmerName: string;
      farmLocation: string;
      village: string;
      specialInstructions: string;
      scheduleDate: string;
      timeSlot: TimeSlot;
      urgency: Urgency;
      language: string;
      attachedScanDisease?: string;
      attachedScanSeverity?: string;
    }
  ): Promise<Booking> {
    const now = Date.now();
    const urgencySurcharge = payload.urgency === 'urgent' ? URGENCY_SURCHARGE : 0;

    const booking: Booking = {
      id: genId(),
      serviceId: service.id,
      serviceName: service.name,
      serviceEmoji: service.iconEmoji,
      category: service.category,
      farmerName: payload.farmerName || 'Farmer',
      farmLocation: payload.farmLocation,
      village: payload.village || payload.farmLocation,
      specialInstructions: payload.specialInstructions,
      scheduleDate: payload.scheduleDate,
      timeSlot: payload.timeSlot,
      urgency: payload.urgency,
      status: 'pending',
      assignedMember: service.teamMember.name,
      priceMin: service.priceMin,
      priceMax: service.priceMax,
      urgencySurcharge,
      attachedScanDisease: payload.attachedScanDisease,
      attachedScanSeverity: payload.attachedScanSeverity,
      createdAt: now,
      updatedAt: now,
    };

    await dbService.put('service_bookings', booking as any);

    // Pre-fill Arjun context
    const arjunMsg = `I have booked ${service.name} scheduled for ${payload.scheduleDate} at ${payload.timeSlot} time. Please tell me: 1. How should I prepare my farm before the team arrives? 2. What information should I keep ready? 3. What should I expect during the visit? Reply in ${payload.language}.`;
    localStorage.setItem('agro_prefill_chat', arjunMsg);
    sessionStorage.setItem('arjun_prefill', arjunMsg);

    await notify('Booking Submitted ✅', `${service.name} request received. ID: ${booking.id}`);
    syncToBackend(booking); // fire-and-forget
    return booking;
  },

  async updateStatus(id: string, status: BookingStatus) {
    const booking = await this.getBooking(id);
    if (!booking) return;
    const updated: Booking = { ...booking, status, updatedAt: Date.now() };
    await dbService.put('service_bookings', updated as any);

    const msgs: Record<BookingStatus, [string, string]> = {
      pending:     ['Booking Pending', 'Awaiting confirmation.'],
      confirmed:   ['Team Assigned ✅', `${updated.assignedMember} will visit on ${updated.scheduleDate}.`],
      'in-progress': ['Team on the Way 🚗', `Your ${updated.serviceName} visit is in progress.`],
      completed:   ['Report Ready 📋', `Your ${updated.serviceName} report is now available.`],
    };
    const [title, body] = msgs[status];
    await notify(title, body);

    // Sync status change to backend
    if (navigator.onLine) {
      fetch(`${BACKEND}/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        signal: AbortSignal.timeout(5000),
      }).catch(() => {});
    }
  },

  async cancelBooking(id: string) {
    const booking = await this.getBooking(id);
    if (!booking) return;
    if (booking.status !== 'pending') return; // can only cancel pending
    await dbService.delete('service_bookings', id);
    if (navigator.onLine) {
      fetch(`${BACKEND}/api/bookings/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(5000),
      }).catch(() => {});
    }
  },
};
