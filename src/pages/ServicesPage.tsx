import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Wrench, Clock3, IndianRupee, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { FIELD_SERVICES, SERVICE_CATEGORIES, ServiceCategory } from "@/data/servicesCatalog";
import { serviceBookingService, ServiceBooking } from "@/services/serviceBookingService";
import { getTranslation } from "@/lib/translations";

function statusUi(status: ServiceBooking["status"]) {
  if (status === "in-progress") return { color: "bg-green-500", text: "Team on the way" };
  if (status === "confirmed") return { color: "bg-yellow-500", text: "Scheduled" };
  if (status === "completed") return { color: "bg-blue-500", text: "Report ready" };
  return { color: "bg-zinc-400", text: "Pending" };
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const { language } = useApp();
  const t = getTranslation("services", language) as any;

  const [category, setCategory] = useState<ServiceCategory>("all");
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);

  useEffect(() => {
    serviceBookingService.listBookings().then(setBookings).catch(console.error);
  }, []);

  const activeBooking = useMemo(
    () => bookings.find((b) => b.status !== "completed") || bookings[0],
    [bookings]
  );

  const visibleServices = useMemo(
    () => FIELD_SERVICES.filter((s) => category === "all" || s.category === category),
    [category]
  );

  const village = localStorage.getItem("agro_farm_location") || "Village not set";

  return (
    <div className="min-h-screen px-4 pb-28 pt-4 animate-in fade-in duration-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">{t.ourServices || "Our Services"}</h1>
          <p className="text-[14px] text-muted-foreground">{t.weCome || "We come to your farm"}</p>
          <p className="text-[14px] font-medium text-foreground flex items-center gap-1 mt-1">
            <MapPin size={14} className="text-primary" />
            {village}
          </p>
        </div>
        <button
          onClick={() => navigate("/services/bookings")}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center"
          aria-label="My bookings"
        >
          <UserCircle2 size={20} className="text-primary" />
        </button>
      </div>

      {activeBooking && (
        <button
          onClick={() => navigate(`/services/confirmed/${activeBooking.id}`)}
          className="w-full mb-4 rounded-2xl border border-border bg-card p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className={cn("w-2.5 h-2.5 rounded-full", statusUi(activeBooking.status).color)} />
            <div className="text-left">
              <p className="text-[14px] font-bold">{activeBooking.serviceName}</p>
              <p className="text-[13px] text-muted-foreground">{statusUi(activeBooking.status).text}</p>
            </div>
          </div>
          <span className="text-[13px] text-primary font-semibold">{t.view || "View"}</span>
        </button>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {SERVICE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap border",
              category === c.id ? "bg-primary text-white border-primary" : "bg-card text-foreground border-border"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visibleServices.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.id} className="rounded-2xl border border-border bg-card p-3 flex flex-col">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", service.iconBg)}>
                <Icon size={20} />
              </div>
              <h3 className="text-[14px] font-black leading-tight">{service.name}</h3>
              <p className="text-[13px] text-muted-foreground line-clamp-1 mt-1">{service.shortDescription}</p>
              <div className="mt-2 text-[13px] font-semibold flex items-center gap-1">
                <IndianRupee size={12} />
                {service.priceMin} - {service.priceMax}
              </div>
              <div className="text-[13px] text-muted-foreground flex items-center gap-1 mt-1">
                <Clock3 size={12} />
                {service.duration}
              </div>
              <button
                onClick={() => navigate(`/services/service/${service.id}`)}
                className="mt-auto h-9 rounded-xl bg-primary text-white text-[13px] font-semibold flex items-center justify-center gap-1.5"
              >
                <Wrench size={14} />
                {t.bookNow || "Book Now"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
