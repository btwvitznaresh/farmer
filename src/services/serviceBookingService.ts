import { dbService } from "@/services/db";
import { FieldService } from "@/data/servicesCatalog";
import { getTextAdvice } from "@/lib/apiClient";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, orderBy, query } from "firebase/firestore";

export type BookingStatus = "pending" | "confirmed" | "in-progress" | "completed";
export type TimeSlot = "morning" | "afternoon" | "evening";

export interface ServiceBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  farmerName: string;
  farmLocation: string;
  village: string;
  specialInstructions: string;
  scheduleDate: string;
  timeSlot: TimeSlot;
  status: BookingStatus;
  assignedMember: string;
  priceMin: number;
  priceMax: number;
  reportSummary?: string;
  reportPhotos?: string[];
  reportRecommendations?: string[];
  createdAt: number;
  updatedAt: number;
}

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function canUseFirestore() {
  return Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
}

async function notifyUser(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      return;
    }
  }
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/logo.svg" });
  }
}

function getDb() {
  const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  return getFirestore(app);
}

async function sendBookingContextToAI(booking: ServiceBooking, language: string) {
  const context = `Farmer has booked ${booking.serviceName}. Prepare helpful tips and what to expect before the team arrives.`;
  try {
    await getTextAdvice(context, language, undefined, [], false);
  } catch (error) {
    console.warn("AI context pre-send failed:", error);
  }
}

export const serviceBookingService = {
  async listBookings(): Promise<ServiceBooking[]> {
    if (canUseFirestore()) {
      const db = getDb();
      const q = query(collection(db, "service_bookings"), orderBy("updatedAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as ServiceBooking);
    }
    const all = await dbService.getAll("service_bookings");
    return (all as ServiceBooking[]).sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async getBooking(id: string): Promise<ServiceBooking | null> {
    const all = await this.listBookings();
    return all.find((b) => b.id === id) || null;
  },

  async createBooking(service: FieldService, payload: {
    farmerName: string;
    farmLocation: string;
    village: string;
    specialInstructions: string;
    scheduleDate: string;
    timeSlot: TimeSlot;
    language: string;
  }): Promise<ServiceBooking> {
    const now = Date.now();
    const booking: ServiceBooking = {
      id: `svc_${now}`,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      farmerName: payload.farmerName || "Farmer",
      farmLocation: payload.farmLocation,
      village: payload.village,
      specialInstructions: payload.specialInstructions,
      scheduleDate: payload.scheduleDate,
      timeSlot: payload.timeSlot,
      status: "pending",
      assignedMember: service.teamMember.name,
      priceMin: service.priceMin,
      priceMax: service.priceMax,
      createdAt: now,
      updatedAt: now,
    };

    if (canUseFirestore()) {
      const db = getDb();
      await setDoc(doc(db, "service_bookings", booking.id), booking);
    } else {
      await dbService.put("service_bookings", booking as any);
    }

    await sendBookingContextToAI(booking, payload.language);
    localStorage.setItem("agro_prefill_chat", `Farmer has booked ${service.name}. Prepare helpful tips and what to expect before the team arrives.`);
    await notifyUser("Booking submitted", `${booking.serviceName} request received.`);
    return booking;
  },

  async updateStatus(id: string, status: BookingStatus) {
    const booking = await this.getBooking(id);
    if (!booking) return;
    const next = { ...booking, status, updatedAt: Date.now() };
    if (canUseFirestore()) {
      const db = getDb();
      await updateDoc(doc(db, "service_bookings", id), { status: next.status, updatedAt: next.updatedAt });
    } else {
      await dbService.put("service_bookings", next as any);
    }
    if (status === "confirmed") await notifyUser("Team assigned", `${next.assignedMember} has been assigned.`);
    if (status === "completed") await notifyUser("Report ready", `${next.serviceName} report is now available.`);
  },
};
