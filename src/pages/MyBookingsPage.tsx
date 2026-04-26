import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { serviceBookingService, ServiceBooking } from "@/services/serviceBookingService";
import { cn } from "@/lib/utils";

function badge(status: ServiceBooking["status"]) {
  if (status === "in-progress") return "bg-green-100 text-green-700";
  if (status === "confirmed") return "bg-yellow-100 text-yellow-700";
  if (status === "completed") return "bg-blue-100 text-blue-700";
  return "bg-zinc-100 text-zinc-700";
}

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);

  useEffect(() => {
    serviceBookingService.listBookings().then(setBookings).catch(console.error);
  }, []);

  const shown = useMemo(
    () => bookings.filter((b) => (tab === "upcoming" ? b.status !== "completed" : b.status === "completed")),
    [bookings, tab]
  );

  return (
    <div className="min-h-screen px-4 pb-24 pt-4">
      <button onClick={() => navigate(-1)} className="text-[14px] text-primary font-semibold mb-3">Back</button>
      <h1 className="text-2xl font-black">My Bookings</h1>

      <div className="mt-3 p-1 rounded-full bg-muted/40 flex">
        <button onClick={() => setTab("upcoming")} className={cn("flex-1 h-9 rounded-full text-[13px]", tab === "upcoming" && "bg-primary text-white")}>Upcoming</button>
        <button onClick={() => setTab("past")} className={cn("flex-1 h-9 rounded-full text-[13px]", tab === "past" && "bg-primary text-white")}>Past</button>
      </div>

      <div className="space-y-3 mt-4">
        {shown.map((b) => (
          <div key={b.id} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[14px] font-black">{b.serviceName}</p>
                <p className="text-[13px] text-muted-foreground">{b.scheduleDate} - {b.timeSlot}</p>
              </div>
              <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold", badge(b.status))}>{b.status}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => navigate(`/services/confirmed/${b.id}`)} className="h-9 px-3 rounded-lg border border-border text-[13px]">Details</button>
              {b.status === "completed" && (
                <button onClick={() => navigate(`/services/report/${b.id}`)} className="h-9 px-3 rounded-lg bg-primary text-white text-[13px]">View Report</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
