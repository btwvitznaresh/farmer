import { Beaker, Droplets, Bug, Wrench, Sprout, Cpu, Warehouse, FileCheck2, LucideIcon } from "lucide-react";

export type ServiceCategory = "all" | "soil-water" | "crop-health" | "drone-tech" | "infrastructure" | "advisory";

export interface FieldService {
  id: string;
  name: string;
  category: ServiceCategory;
  shortDescription: string;
  description: string;
  includes: string[];
  priceMin: number;
  priceMax: number;
  duration: string;
  icon: LucideIcon;
  iconBg: string;
  teamMember: {
    name: string;
    role: string;
  };
  rating: number;
  reviews: { author: string; comment: string }[];
}

export const SERVICE_CATEGORIES: { id: ServiceCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "soil-water", label: "Soil & Water" },
  { id: "crop-health", label: "Crop Health" },
  { id: "drone-tech", label: "Drone & Tech" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "advisory", label: "Advisory" },
];

export const FIELD_SERVICES: FieldService[] = [
  {
    id: "soil-health-test",
    name: "Soil Health Test",
    category: "soil-water",
    shortDescription: "NPK, pH, moisture analysis",
    description: "Comprehensive soil panel to understand nutrient levels and make fertilization plans.",
    includes: ["NPK balance", "Soil pH report", "Moisture retention check", "Action plan by crop"],
    priceMin: 499,
    priceMax: 999,
    duration: "2-3 hrs",
    icon: Beaker,
    iconBg: "bg-emerald-100 text-emerald-700",
    teamMember: { name: "Ravi Kumar", role: "Soil Specialist" },
    rating: 4.8,
    reviews: [
      { author: "M. Selvam", comment: "Report was clear and helped cut fertilizer cost." },
      { author: "K. Ramesh", comment: "Team explained each reading in simple terms." },
    ],
  },
  {
    id: "drone-survey",
    name: "Drone Survey",
    category: "drone-tech",
    shortDescription: "Crop health aerial mapping",
    description: "Aerial multispectral scan to detect stress zones and optimize interventions.",
    includes: ["Aerial map", "Stress hotspot detection", "Per-plot insight", "Summary PDF"],
    priceMin: 899,
    priceMax: 1999,
    duration: "2 hrs",
    icon: Cpu,
    iconBg: "bg-blue-100 text-blue-700",
    teamMember: { name: "Anita Das", role: "Drone Ops Lead" },
    rating: 4.7,
    reviews: [
      { author: "S. Prakash", comment: "Found weak zones early and saved the crop." },
      { author: "P. Kavya", comment: "Great visuals and easy follow-up actions." },
    ],
  },
  {
    id: "water-quality-test",
    name: "Water Quality Test",
    category: "soil-water",
    shortDescription: "Borewell/pond water check",
    description: "Field sampling and water suitability test for irrigation and fertigation.",
    includes: ["TDS check", "pH and hardness", "Salinity risk", "Irrigation suitability note"],
    priceMin: 399,
    priceMax: 799,
    duration: "1-2 hrs",
    icon: Droplets,
    iconBg: "bg-cyan-100 text-cyan-700",
    teamMember: { name: "Saira Khan", role: "Water Analyst" },
    rating: 4.6,
    reviews: [
      { author: "A. Naresh", comment: "Helped us choose the right filtration setup." },
      { author: "J. Mohan", comment: "Fast service and practical recommendations." },
    ],
  },
  {
    id: "pest-disease-scan",
    name: "Pest & Disease Scan",
    category: "crop-health",
    shortDescription: "Expert field inspection",
    description: "On-site expert diagnosis of pest and disease outbreaks with treatment plan.",
    includes: ["Field walk-through", "Symptom diagnosis", "Treatment protocol", "Follow-up notes"],
    priceMin: 699,
    priceMax: 1299,
    duration: "2-3 hrs",
    icon: Bug,
    iconBg: "bg-amber-100 text-amber-700",
    teamMember: { name: "Dr. Lakshmi", role: "Plant Pathologist" },
    rating: 4.9,
    reviews: [
      { author: "R. Mani", comment: "Very accurate diagnosis and quick action plan." },
      { author: "D. Venkatesh", comment: "Saved us from a major pest spread." },
    ],
  },
  {
    id: "cold-chain-setup",
    name: "Cold Chain Setup",
    category: "infrastructure",
    shortDescription: "Produce storage guidance",
    description: "Post-harvest storage setup planning to reduce losses and improve quality.",
    includes: ["Storage assessment", "Temperature plan", "Handling SOP", "Cost estimate"],
    priceMin: 999,
    priceMax: 2499,
    duration: "3-4 hrs",
    icon: Warehouse,
    iconBg: "bg-slate-100 text-slate-700",
    teamMember: { name: "Rahul Singh", role: "Post-Harvest Consultant" },
    rating: 4.6,
    reviews: [
      { author: "V. Ganesh", comment: "Reduced spoilage in just one season." },
      { author: "M. Priya", comment: "Useful plan for our storage and packing flow." },
    ],
  },
  {
    id: "irrigation-planning",
    name: "Irrigation Planning",
    category: "infrastructure",
    shortDescription: "Water usage optimisation",
    description: "Farm-specific irrigation planning for efficient water use and uniform coverage.",
    includes: ["Field water audit", "Zone planning", "Schedule by crop stage", "Savings estimate"],
    priceMin: 799,
    priceMax: 1499,
    duration: "2-3 hrs",
    icon: Wrench,
    iconBg: "bg-indigo-100 text-indigo-700",
    teamMember: { name: "Nithin R", role: "Irrigation Engineer" },
    rating: 4.7,
    reviews: [
      { author: "B. Kumar", comment: "Water use dropped noticeably after implementation." },
      { author: "T. Devi", comment: "Clear and simple scheduling advice." },
    ],
  },
  {
    id: "yield-prediction",
    name: "Yield Prediction",
    category: "drone-tech",
    shortDescription: "AI-based harvest forecast",
    description: "Data-assisted yield estimate using field observations, crop stage, and weather.",
    includes: ["Yield forecast", "Risk flags", "Harvest window suggestion", "Decision summary"],
    priceMin: 599,
    priceMax: 1199,
    duration: "1-2 hrs",
    icon: Sprout,
    iconBg: "bg-lime-100 text-lime-700",
    teamMember: { name: "Megha Rao", role: "Agri Data Analyst" },
    rating: 4.5,
    reviews: [
      { author: "S. Babu", comment: "Helped plan labor and transport better." },
      { author: "R. Asha", comment: "Forecast was close to actual harvest." },
    ],
  },
  {
    id: "gov-scheme-assistance",
    name: "Gov Scheme Assistance",
    category: "advisory",
    shortDescription: "Subsidy paperwork help",
    description: "Guided assistance for identifying and applying to relevant government schemes.",
    includes: ["Eligibility check", "Document checklist", "Application support", "Submission guidance"],
    priceMin: 499,
    priceMax: 999,
    duration: "1-2 hrs",
    icon: FileCheck2,
    iconBg: "bg-green-100 text-green-700",
    teamMember: { name: "Kiran Patel", role: "Scheme Advisor" },
    rating: 4.8,
    reviews: [
      { author: "H. Shankar", comment: "Finally got clarity on scheme documents." },
      { author: "L. Rekha", comment: "Very helpful support from start to submission." },
    ],
  },
];
