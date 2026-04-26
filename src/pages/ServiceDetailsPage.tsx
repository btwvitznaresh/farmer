import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, CheckCircle2 } from "lucide-react";
import { FIELD_SERVICES } from "@/data/servicesCatalog";

export default function ServiceDetailsPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = useMemo(() => FIELD_SERVICES.find((s) => s.id === serviceId), [serviceId]);

  if (!service) return <div className="p-4">Service not found.</div>;
  const Icon = service.icon;

  return (
    <div className="min-h-screen px-4 pb-24 pt-4">
      <button onClick={() => navigate(-1)} className="text-[14px] text-primary font-semibold mb-3">Back</button>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${service.iconBg}`}>
            <Icon size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black">{service.name}</h1>
            <p className="text-[14px] text-muted-foreground">{service.description}</p>
          </div>
        </div>

        <h2 className="text-[14px] font-black mt-4 mb-2">What's included</h2>
        <ul className="space-y-2">
          {service.includes.map((item) => (
            <li key={item} className="text-[14px] flex items-start gap-2">
              <CheckCircle2 size={16} className="text-primary mt-0.5" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border">
          <p className="text-[13px] text-muted-foreground">Visiting Team Member</p>
          <p className="text-[14px] font-semibold">{service.teamMember.name} - {service.teamMember.role}</p>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-1 text-[14px] font-semibold mb-2">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            {service.rating} / 5
          </div>
          {service.reviews.map((r) => (
            <div key={r.author} className="text-[13px] mb-2">
              <span className="font-semibold">{r.author}: </span>
              <span className="text-muted-foreground">{r.comment}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-primary/10 border border-primary/20 p-3">
          <p className="text-[13px] text-muted-foreground">Price breakdown</p>
          <p className="text-[16px] font-black">₹{service.priceMin} - ₹{service.priceMax}</p>
        </div>
      </div>

      <button
        onClick={() => navigate(`/services/book/${service.id}`)}
        className="w-full mt-4 h-11 rounded-xl bg-primary text-white font-semibold"
      >
        Book This Service
      </button>
    </div>
  );
}
