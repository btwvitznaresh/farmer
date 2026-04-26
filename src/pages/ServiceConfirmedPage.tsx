import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, MapPinned, MessageCircle } from "lucide-react";
import { serviceBookingService, ServiceBooking } from "@/services/serviceBookingService";

export default function ServiceConfirmedPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<ServiceBooking | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    serviceBookingService.getBooking(bookingId).then(setBooking).catch(console.error);
  }, [bookingId]);

  if (!booking) return <div className="p-4">Loading booking...</div>;

  return (
    <div className="min-h-screen px-4 pb-24 pt-6 flex flex-col">
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={56} />
        <h1 className="text-2xl font-black mt-2">Booking Confirmed</h1>
        <p className="text-[14px] text-muted-foreground mt-1">Booking ID: {booking.id}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 mt-4 space-y-2">
        <p className="text-[14px]"><span className="font-semibold">Service:</span> {booking.serviceName}</p>
        <p className="text-[14px]"><span className="font-semibold">Assigned:</span> {booking.assignedMember}</p>
        <p className="text-[14px]"><span className="font-semibold">When:</span> {booking.scheduleDate} ({booking.timeSlot})</p>
      </div>

      <button className="w-full mt-4 h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2">
        <MapPinned size={16} />
        Track on Map
      </button>

      <button
        onClick={() => {
          localStorage.setItem("agro_prefill_chat", `Farmer has booked ${booking.serviceName}. Prepare helpful tips and what to expect before the team arrives.`);
          navigate("/");
        }}
        className="w-full mt-3 h-11 rounded-xl border border-border bg-card font-semibold flex items-center justify-center gap-2"
      >
        <MessageCircle size={16} />
        Ask AI about this service
      </button>

      {booking.status === "completed" && (
        <button
          onClick={() => navigate(`/services/report/${booking.id}`)}
          className="w-full mt-3 h-11 rounded-xl border border-border bg-card font-semibold"
        >
          View Report
        </button>
      )}
    </div>
  );
}
