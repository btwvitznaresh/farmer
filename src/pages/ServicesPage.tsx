import React, { useState, useEffect } from 'react';
import { MapPin, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { servicesData } from '@/data/services';
import { ServiceCategory } from '@/types/services';
import { ServiceCard } from '@/components/services/ServiceCard';
import { CategoryPills } from '@/components/services/CategoryPills';
import { ActiveBookingStrip } from '@/components/services/ActiveBookingStrip';
import { Farm3D, FarmVisualization } from '@/components/ui/Farm3D';
import { getBookings } from '@/services/db';
import { Booking } from '@/types/services';
import { useApp } from '@/contexts/AppContext';

export function ServicesPage() {
  const navigate = useNavigate();
  const { language } = useApp();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');
  const [activeBooking, setActiveBooking] = useState<Booking | undefined>();
  const farmerLocation = localStorage.getItem('agro_farmer_location') || 'Your Location';

  useEffect(() => {
    const fetchBookings = async () => {
      const bookings = await getBookings();
      const active = bookings.find(b => ['pending', 'confirmed', 'in-progress'].includes(b.status));
      setActiveBooking(active);
    };
    fetchBookings();
  }, []);

  const categories: { id: ServiceCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Services' },
    { id: 'soil', label: 'Soil Health' },
    { id: 'crop', label: 'Crop Care' },
    { id: 'drone', label: 'Drone Surveys' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'advisory', label: 'Advisory' },
    { id: 'government', label: 'Govt Schemes' }
  ];

  const filteredServices = servicesData.filter(
    s => activeCategory === 'all' || s.category === activeCategory
  );

  return (
    <div className="flex flex-col flex-1 pb-32 animate-in fade-in duration-500 relative">
      <Farm3D />
      {/* Header */}
      <div className="bg-primary px-5 pt-6 pb-8 text-primary-foreground relative rounded-b-[32px] shadow-sm">
        <div className="absolute inset-0 overflow-hidden rounded-b-[32px]">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        </div>
        <div className="relative z-10 max-w-lg mx-auto">
          <h1 className="text-2xl font-black tracking-tight mb-1">Our Services</h1>
          <p className="text-primary-foreground/80 font-medium text-sm">We come to your farm</p>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 bg-black/20 w-fit px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
              <MapPin size={14} className="text-white" />
              <span>{farmerLocation}</span>
            </div>
            <button 
              onClick={() => navigate('/bookings')}
              className="flex items-center gap-2 bg-white text-primary px-3 py-1.5 rounded-full text-xs font-black shadow-lg hover:bg-slate-100 transition-all active:scale-95"
            >
              <CalendarDays size={14} />
              My Bookings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto w-full px-4 -mt-4 relative z-20">
        <ActiveBookingStrip booking={activeBooking} />

        {/* 3D Farm Visualization */}
        <div
          className="rounded-2xl mb-5 overflow-hidden"
          style={{ background: '#060e00', border: '1px solid rgba(68,255,136,0.15)' }}
        >
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-base font-black" style={{ color: '#44ff88' }}>3D Farm Visualization</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(68,255,136,0.45)' }}>Interactive model · drag to rotate · scroll to zoom</p>
          </div>
          <div className="px-3 pb-3">
            <FarmVisualization />
          </div>
        </div>

        <div className="bg-background rounded-2xl shadow-sm border border-border p-3 mb-6">
          <CategoryPills
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredServices.map(service => (
            <ServiceCard key={service.id} service={service} language={language} />
          ))}
        </div>
        
        {filteredServices.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No services found for this category.
          </div>
        )}
      </div>
    </div>
  );
}
