import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, Share2 } from "lucide-react";
import { ServiceBooking, serviceBookingService } from "@/services/serviceBookingService";

export default function ServiceReportPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<ServiceBooking | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    serviceBookingService.getBooking(bookingId).then((b) => {
      if (!b) return;
      if (!b.reportSummary) {
        b.reportSummary = "Field visit completed. Soil moisture low in north patch and minor pest stress observed.";
        b.reportRecommendations = [
          "Increase irrigation frequency by 10-15% for the next week.",
          "Use recommended pest control protocol in affected rows.",
          "Recheck soil pH in 30 days.",
        ];
        b.reportPhotos = [
          "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop",
        ];
      }
      setBooking(b);
    }).catch(console.error);
  }, [bookingId]);

  if (!booking) return <div className="p-4">Loading report...</div>;

  return (
    <div className="min-h-screen px-4 pb-24 pt-4">
      <button onClick={() => navigate(-1)} className="text-[14px] text-primary font-semibold mb-3">Back</button>
      <h1 className="text-2xl font-black mb-3">Service Report</h1>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-[14px] font-semibold">{booking.serviceName}</p>
        <p className="text-[13px] text-muted-foreground mt-1">{booking.reportSummary}</p>
      </div>

      <div className="mt-4">
        <h2 className="text-[14px] font-black mb-2">Photo Evidence</h2>
        <div className="grid grid-cols-2 gap-2">
          {(booking.reportPhotos || []).map((p) => (
            <img key={p} src={p} alt="report evidence" className="w-full h-28 object-cover rounded-xl border border-border" />
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-[14px] font-black mb-2">AI Recommendations</h2>
        <ul className="list-disc pl-4 space-y-1">
          {(booking.reportRecommendations || []).map((r) => (
            <li key={r} className="text-[13px] text-muted-foreground">{r}</li>
          ))}
        </ul>
      </div>

      <button className="w-full mt-4 h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2">
        <Download size={16} />
        Download PDF report
      </button>
      <button className="w-full mt-3 h-11 rounded-xl border border-border bg-card font-semibold flex items-center justify-center gap-2">
        <Share2 size={16} />
        Share via WhatsApp
      </button>
    </div>
  );
}
