import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FIELD_SERVICES } from "@/data/servicesCatalog";
import { serviceBookingService } from "@/services/serviceBookingService";

const slots = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
] as const;

function nextDays() {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export default function ServiceSchedulePage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = useMemo(() => FIELD_SERVICES.find((s) => s.id === serviceId), [serviceId]);

  const dates = useMemo(nextDays, []);
  const [date, setDate] = useState(dates[0]);
  const [slot, setSlot] = useState<(typeof slots)[number]["id"]>("morning");
  const [location, setLocation] = useState(localStorage.getItem("agro_farm_location") || "");
  const [name, setName] = useState(localStorage.getItem("agro_farmer_name") || "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!service) return <div className="p-4">Service not found.</div>;

  const confirm = async () => {
    setLoading(true);
    const booking = await serviceBookingService.createBooking(service, {
      farmerName: name || "Farmer",
      farmLocation: location,
      village: location,
      specialInstructions: notes,
      scheduleDate: date,
      timeSlot: slot,
      language: localStorage.getItem("agro_language") || "en",
    });
    navigate(`/services/confirmed/${booking.id}`);
  };

  return (
    <div className="min-h-screen px-4 pb-24 pt-4">
      <button onClick={() => navigate(-1)} className="text-[14px] text-primary font-semibold mb-3">Back</button>
      <h1 className="text-xl font-black mb-3">Schedule & Location</h1>

      <div className="flex gap-2 overflow-x-auto mb-4">
        {dates.map((d) => (
          <button
            key={d}
            onClick={() => setDate(d)}
            className={`px-3 py-2 rounded-full text-[13px] border whitespace-nowrap ${date === d ? "bg-primary text-white border-primary" : "bg-card border-border"}`}
          >
            {new Date(d).toLocaleDateString()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {slots.map((s) => (
          <button
            key={s.id}
            onClick={() => setSlot(s.id)}
            className={`h-10 rounded-xl text-[13px] border ${slot === s.id ? "bg-primary text-white border-primary" : "bg-card border-border"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Farmer name" className="w-full h-11 px-3 rounded-xl border border-border bg-card text-[14px]" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Farm location / village" className="w-full h-11 px-3 rounded-xl border border-border bg-card text-[14px]" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions" className="w-full min-h-24 p-3 rounded-xl border border-border bg-card text-[14px]" />
      </div>

      <button disabled={loading} onClick={confirm} className="w-full mt-4 h-11 rounded-xl bg-primary text-white font-semibold disabled:opacity-60">
        {loading ? "Confirming..." : "Confirm Booking"}
      </button>
    </div>
  );
}
