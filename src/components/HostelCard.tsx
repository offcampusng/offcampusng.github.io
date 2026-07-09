import { Hostel } from '@/types';
import { MapPin, BadgeCheck, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HostelCardProps {
  hostel: Hostel;
  onClick?: () => void;
}

export function HostelCard({ hostel, onClick }: HostelCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const typeLabels = {
    'self-contained': 'Self-Con',
    'single-room': 'Single Room',
    'shared': 'Shared Room',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-card rounded-xl border overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:border-primary/20 cursor-pointer",
        "animate-fade-in"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {hostel.images && hostel.images.length > 0 ? (
          <img
            src={hostel.images[0]}
            alt={hostel.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Home className="h-12 w-12 opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent z-10 pointer-events-none" />
        
        {/* Verified Badge */}
        {hostel.isVerified && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
            <BadgeCheck className="h-3 w-3" />
            Verified
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 right-3 z-20 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
          {typeLabels[hostel.type]}
        </div>
        
        {/* Available Rooms */}
        <div className="absolute bottom-3 right-3 z-20 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
          {hostel.availableRooms} available
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
          {hostel.name}
        </h3>
        
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span>{hostel.location}</span>
          <span className="text-border">•</span>
          <span>{hostel.area}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              {formatPrice(hostel.priceMin)}
            </span>
            {hostel.priceMax > hostel.priceMin && (
              <span className="text-muted-foreground text-sm">
                {' '}- {formatPrice(hostel.priceMax)}
              </span>
            )}
            <span className="text-muted-foreground text-sm">/year</span>
          </div>
          
          {hostel.rating && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-warning">★</span>
              <span className="font-medium">{hostel.rating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
