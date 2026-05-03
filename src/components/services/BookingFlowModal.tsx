import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar as CalendarIcon, MapPin, Clock, FileText, CheckCircle, Navigation2, MessageSquare } from 'lucide-react';
import { Service, Booking } from '@/types/services';
import { saveBooking } from '@/services/db';
import { useApp } from '@/contexts/AppContext';

interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
}

export function BookingFlowModal({ isOpen, onClose, service }: BookingFlowModalProps) {
  const navigate = useNavigate();
  const { setChatMessages, setIsChatMode, language } = useApp();
  
  const [step, setStep] = useState<2 | 3>(2);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [location, setLocation] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(2);
      setLocation(localStorage.getItem('agro_farmer_location') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate next 7 days
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    // Create new booking record
    const newBooking: Booking = {
      id: `BKG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      serviceId: service.id,
      serviceName: service.nameLocale[language] || service.name,
      farmerName: 'AgroTalk Farmer', // Would come from auth
      farmLocation: location || 'Farm Location',
      scheduledDate: selectedDate.toISOString().split('T')[0],
      timeSlot,
      status: 'confirmed',
      urgency: 'normal',
      specialInstructions: instructions,
      createdAt: new Date().toISOString(),
      teamMember: 'Ramesh K. (Field Expert)'
    };

    await saveBooking(newBooking);
    setConfirmedBooking(newBooking);
    setIsSubmitting(false);
    setStep(3);
  };

  const handleAskAI = () => {
    // Inject context into chat
    const serviceName = service.nameLocale[language] || service.name;
    setChatMessages(prev => [...prev, {
      id: `bkg_ctx_${Date.now()}`,
      role: 'user',
      content: `I just booked the "${serviceName}" service. Please prepare helpful tips and tell me what I should expect or prepare before the team arrives at my farm.`,
      timestamp: new Date()
    }]);
    
    setIsChatMode(true);
    onClose();
    navigate('/');
  };

  const formatShortDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-background w-full sm:w-[480px] h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-slate-50/50">
          <h2 className="font-bold text-lg">
            {step === 2 ? 'Schedule & Location' : 'Booking Confirmed'}
          </h2>
          {step === 2 && (
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 active:scale-95 transition-all">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {step === 2 ? (
            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                  <CalendarIcon size={16} /> Select Date
                </label>
                <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 custom-scrollbar">
                  {next7Days.map((date, i) => {
                    const isSelected = selectedDate.toDateString() === date.toDateString();
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border-2 transition-all ${
                          isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-xl font-black">{date.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                  <Clock size={16} /> Select Time
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['morning', 'afternoon', 'evening'] as const).map(slot => (
                    <button
                      key={slot}
                      onClick={() => setTimeSlot(slot)}
                      className={`py-3 rounded-xl border-2 font-bold text-sm capitalize transition-all ${
                        timeSlot === slot ? 'border-primary bg-primary text-white' : 'border-border bg-white text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                  <MapPin size={16} /> Farm Location
                </label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter village or exact farm location"
                  className="w-full bg-white border-2 border-border rounded-xl px-4 py-3.5 focus:border-primary focus:ring-0 outline-none transition-all font-medium"
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                  <FileText size={16} /> Special Instructions
                </label>
                <textarea 
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Any details the team should know before arriving? (e.g., landmark, specific crop issue)"
                  className="w-full bg-white border-2 border-border rounded-xl px-4 py-3.5 focus:border-primary focus:ring-0 outline-none transition-all font-medium resize-none min-h-[100px]"
                />
              </div>
            </div>
          ) : (
            /* STEP 3: SUCCESS SCREEN */
            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="text-green-600 w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black mb-1 text-center">Booking Confirmed!</h3>
              <p className="text-muted-foreground text-center mb-8">Our team is scheduled to visit your farm.</p>

              <div className="w-full bg-slate-50 border border-border rounded-2xl p-5 mb-8 space-y-4">
                <div className="flex justify-between items-center border-b border-border/50 pb-4">
                  <span className="text-muted-foreground text-sm font-medium">Booking ID</span>
                  <span className="font-bold font-mono">{confirmedBooking?.id}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-4">
                  <span className="text-muted-foreground text-sm font-medium">Scheduled</span>
                  <span className="font-bold text-right">
                    {confirmedBooking && formatShortDate(new Date(confirmedBooking.scheduledDate))} • <span className="capitalize">{confirmedBooking?.timeSlot}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm font-medium">Expert Assigned</span>
                  <span className="font-bold text-primary">{confirmedBooking?.teamMember}</span>
                </div>
              </div>

              <div className="w-full space-y-3">
                <button 
                  onClick={() => { onClose(); navigate('/bookings'); }}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-800 py-3.5 rounded-xl font-bold active:scale-95 transition-all border border-slate-200"
                >
                  <Navigation2 size={18} /> Track on Map / View Status
                </button>
                <button 
                  onClick={handleAskAI}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  <MessageSquare size={18} /> Ask AI About This Service
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions for Step 2 */}
        {step === 2 && (
          <div className="p-4 bg-white border-t border-border">
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || !location.trim()}
              className="w-full bg-primary text-white py-4 rounded-xl font-black text-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
