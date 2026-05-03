import React from 'react';
import { Booking } from '@/types/services';
import { ChevronRight, CalendarClock, CheckCircle, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ActiveBookingStripProps {
  booking: Booking | undefined;
}

export function ActiveBookingStrip({ booking }: ActiveBookingStripProps) {
  const navigate = useNavigate();

  if (!booking) return null;

  const getStatusConfig = (status: Booking['status']) => {
    switch (status) {
      case 'in-progress': return { color: 'bg-yellow-500 text-white', icon: <Truck size={18} /> };
      case 'confirmed': return { color: 'bg-blue-500 text-white', icon: <CheckCircle size={18} /> };
      case 'pending': return { color: 'bg-slate-500 text-white', icon: <CalendarClock size={18} /> };
      default: return null;
    }
  };

  const config = getStatusConfig(booking.status);
  if (!config) return null; // Don't show for 'completed' or unknown

  return (
    <button 
      onClick={() => navigate('/bookings')}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl mb-4 shadow-sm active:scale-95 transition-all",
        config.color
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-1 bg-white/20 rounded-full">
          {config.icon}
        </div>
        <div className="text-left">
          <p className="text-xs font-bold opacity-90 uppercase tracking-wider">{booking.status}</p>
          <p className="text-sm font-semibold">{booking.serviceName} · {booking.timeSlot}</p>
        </div>
      </div>
      <ChevronRight size={20} className="opacity-80" />
    </button>
  );
}
