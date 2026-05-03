import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, FileText, ChevronRight } from 'lucide-react';
import { getBookings } from '@/services/db';
import { Booking } from '@/types/services';
import { cn } from '@/lib/utils';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    const data = await getBookings();
    // Sort by created date descending
    setBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setIsLoading(false);
  };

  const upcomingBookings = bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status));
  const pastBookings = bookings.filter(b => ['completed'].includes(b.status));

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-24 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-primary px-4 pt-6 pb-6 text-white flex items-center gap-4 shadow-md">
        <button onClick={() => navigate(-1)} className="p-2 bg-black/20 rounded-full backdrop-blur-md active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black">My Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-4 pb-2 gap-4 border-b border-border/50 sticky top-0 bg-slate-50 z-10">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={cn("pb-3 font-bold text-sm transition-all border-b-2 px-2", activeTab === 'upcoming' ? "border-primary text-primary" : "border-transparent text-muted-foreground")}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={cn("pb-3 font-bold text-sm transition-all border-b-2 px-2", activeTab === 'past' ? "border-primary text-primary" : "border-transparent text-muted-foreground")}
        >
          Past ({pastBookings.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <Calendar size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold">No {activeTab} bookings</h3>
            <p className="text-sm text-muted-foreground mt-1">Book an expert service to see it here.</p>
            {activeTab === 'upcoming' && (
              <button 
                onClick={() => navigate('/services')}
                className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-bold"
              >
                Browse Services
              </button>
            )}
          </div>
        ) : (
          displayBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl p-4 border border-border shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-base leading-tight">{booking.serviceName}</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{booking.id}</p>
                </div>
                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border", getStatusColor(booking.status))}>
                  {booking.status}
                </span>
              </div>
              
              <div className="space-y-2 mt-2 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-muted-foreground" />
                  <span className="font-medium">{new Date(booking.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="text-muted-foreground mx-1">•</span>
                  <span className="capitalize">{booking.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-muted-foreground" />
                  <span className="truncate">{booking.farmLocation}</span>
                </div>
              </div>

              {activeTab === 'past' && booking.status === 'completed' && (
                <button 
                  onClick={() => navigate(`/bookings/${booking.id}/report`)}
                  className="mt-4 w-full py-3 bg-green-50 text-green-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-green-200 active:scale-95 transition-all"
                >
                  <FileText size={16} /> View Service Report
                </button>
              )}

              {activeTab === 'upcoming' && (
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Assigned: {booking.teamMember || 'Pending'}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
