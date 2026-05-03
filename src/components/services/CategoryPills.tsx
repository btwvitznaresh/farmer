import React from 'react';
import { cn } from '@/lib/utils';
import { ServiceCategory } from '@/types/services';

interface CategoryPillsProps {
  categories: { id: ServiceCategory | 'all'; label: string }[];
  activeCategory: string;
  onSelect: (id: ServiceCategory | 'all') => void;
}

export function CategoryPills({ categories, activeCategory, onSelect }: CategoryPillsProps) {
  return (
    <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border shrink-0",
              isActive 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
