import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Star, Clock, User, ShieldCheck } from 'lucide-react';
import { servicesData } from '@/data/services';
import { useApp } from '@/contexts/AppContext';
import { BookingFlowModal } from '@/components/services/BookingFlowModal';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useApp();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const service = servicesData.find(s => s.id === id);

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Service not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Go Back</button>
      </div>
    );
  }

  const name = service.nameLocale[language] || service.name;
  const description = service.descLocale[language] || service.description;

  return (
    <div className="flex flex-col flex-1 pb-24 bg-slate-50 min-h-screen">
      {/* Header Image Area */}
      <div className="relative bg-primary px-4 pt-6 pb-12 rounded-b-[40px] text-white">
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-black/20 rounded-full backdrop-blur-md">
          <ArrowLeft size={20} />
        </button>
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-4xl border border-white/20 backdrop-blur-lg mb-4 shadow-xl">
            {service.icon}
          </div>
          <h1 className="text-2xl font-black">{name}</h1>
          <div className="flex items-center gap-4 mt-3 text-sm font-medium bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-md">
            <span className="flex items-center gap-1.5"><Clock size={16} /> {service.duration}</span>
            <div className="w-1 h-1 bg-white/50 rounded-full" />
            <span className="flex items-center gap-1"><Star size={16} className="fill-yellow-400 text-yellow-400" /> 4.8</span>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 space-y-5">
        
        {/* Price Card */}
        <div className="bg-background rounded-3xl p-5 shadow-sm border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Estimated Cost</p>
            <p className="text-2xl font-black text-foreground">₹{service.priceMin} <span className="text-base font-semibold text-muted-foreground">to ₹{service.priceMax}</span></p>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="text-green-600" size={24} />
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-bold mb-2">About this service</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
        </div>

        {/* What's Included */}
        <div>
          <h3 className="text-lg font-bold mb-3">What's included</h3>
          <ul className="space-y-3">
            {service.includes.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-border shadow-sm">
                <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={20} />
                <span className="text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Team Member Placeholder */}
        <div>
          <h3 className="text-lg font-bold mb-3">Expert Assigned</h3>
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <User className="text-blue-600" size={28} />
            </div>
            <div>
              <p className="font-bold text-base">Verified Field Expert</p>
              <p className="text-xs text-muted-foreground">Certified Agronomist with 5+ yrs experience</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h3 className="text-lg font-bold mb-3">Farmer Reviews</h3>
          <div className="space-y-3">
            {[
              { name: 'Ramesh K.', rating: 5, text: 'Very professional team. They identified the exact pest issue in my tomato field.' },
              { name: 'Suresh Patil', rating: 4, text: 'Quick and reliable service. The report was easy to understand.' }
            ].map((review, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm">{review.name}</span>
                  <div className="flex">
                    {[...Array(review.rating)].map((_, j) => <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Floating Book Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-40 max-w-[1600px] mx-auto lg:pl-64">
        <button 
          onClick={() => setIsBookingModalOpen(true)}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          Book This Service
        </button>
      </div>

      <BookingFlowModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        service={service} 
      />
    </div>
  );
}
