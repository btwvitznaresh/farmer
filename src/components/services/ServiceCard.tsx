import React from 'react';
import { cn } from '@/lib/utils';
import { Service } from '@/types/services';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: Service;
  language: string;
}

export function ServiceCard({ service, language }: ServiceCardProps) {
  const navigate = useNavigate();

  // Get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'soil': return 'bg-[#92400E]/10 text-[#92400E] border-[#92400E]/20';
      case 'crop': return 'bg-green-600/10 text-green-700 border-green-600/20';
      case 'drone': return 'bg-blue-600/10 text-blue-700 border-blue-600/20';
      case 'infrastructure': return 'bg-orange-600/10 text-orange-700 border-orange-600/20';
      case 'advisory': return 'bg-purple-600/10 text-purple-700 border-purple-600/20';
      case 'government': return 'bg-teal-600/10 text-teal-700 border-teal-600/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const name = service.nameLocale[language] || service.name;
  const desc = service.descLocale[language] || service.description;

  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col h-full">
      <div className="flex items-start gap-3 mb-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border", getCategoryColor(service.category))}>
          {service.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[15px] leading-tight line-clamp-2">{name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{desc}</p>
        </div>
      </div>
      
      <div className="mt-auto pt-3 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-foreground">₹{service.priceMin} - ₹{service.priceMax}</span>
          <span className="bg-muted px-2 py-1 rounded-md text-muted-foreground">{service.duration}</span>
        </div>
        
        <button 
          onClick={() => navigate(`/services/${service.id}`)}
          className="w-full mt-2 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-sm active:scale-95 transition-all"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
