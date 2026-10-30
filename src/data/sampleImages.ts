import { DomainProfile, InspectionDomain } from "../types/vision.ts";

export interface SampleImage {
  id: string;
  title: string;
  domain: InspectionDomain;
  url: string;
  description: string;
  recommendedStrictness: "low" | "medium" | "high";
  suggestedPrompt: string;
}

export const DOMAIN_PROFILES: DomainProfile[] = [
  {
    id: "Manufacturing & Industrial",
    title: "Manufacturing & Industrial",
    shortDesc: "PCB trace bridging, weld seams, micro-cracks, SMD placement & IPC compliance.",
    iconName: "Cpu",
    targetFocus: [
      "Solder bridge & void detection",
      "SMD component alignment & rotation",
      "Trace oxidation & copper delamination",
      "IPC-A-610 Class 2/3 conformance",
    ],
    defaultNotes: "Focus on fine-pitch IC pins (pins 10-24) and inspect for microscopic solder balling.",
    accentColor: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
  },
  {
    id: "Retail & Inventory",
    title: "Retail & Inventory",
    shortDesc: "Planogram compliance, facing counts, out-of-stock voids, and shelf tag audit.",
    iconName: "ShoppingBag",
    targetFocus: [
      "Out-of-stock void detection",
      "SKU facing count & density",
      "Misplaced product detection",
      "Price tag & shelf lip alignment",
    ],
    defaultNotes: "Audit center shelf for SKU replenishment priority and shelf gap measurements.",
    accentColor: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
  },
  {
    id: "Medical / Bio-Imaging",
    title: "Medical / Bio-Imaging (Auxiliary)",
    shortDesc: "Auxiliary screening, radiograph contours, cellular structure density & symmetry.",
    iconName: "Activity",
    targetFocus: [
      "Costophrenic angle & contour clarity",
      "Cardiac silhouette diameter measurement",
      "Bilateral aeration symmetry screening",
      "Auxiliary research & QA review only",
    ],
    defaultNotes: "Auxiliary research assessment: screen bilateral lung fields for focal opacity or effusion.",
    accentColor: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
  },
  {
    id: "General Scene Understanding",
    title: "General Scene Understanding",
    shortDesc: "Object classification, spatial localization, text OCR, and depth segmentation.",
    iconName: "Eye",
    targetFocus: [
      "Multi-class dynamic object detection",
      "Spatial bounding coordinate mapping",
      "Signage text and OCR extraction",
      "Environmental scene composition",
    ],
    defaultNotes: "Detect pedestrian crossings, motor vehicles, traffic signal state, and lane markings.",
    accentColor: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400",
  },
];

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: "pcb-sample",
    title: "High-Density SMD PCB Assembly",
    domain: "Manufacturing & Industrial",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    description: "Multi-layer circuit board with high-density microcontroller pin traces.",
    recommendedStrictness: "high",
    suggestedPrompt: "Inspect solder joints on QFP IC package for conductive bridging or dry solder voids.",
  },
  {
    id: "retail-sample",
    title: "Supermarket Cereal Grocery Shelf",
    domain: "Retail & Inventory",
    url: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80",
    description: "Multi-tier packaged food inventory display with potential stockout gaps.",
    recommendedStrictness: "medium",
    suggestedPrompt: "Count product facings on tier 2 and locate empty shelf voids requiring immediate restocking.",
  },
  {
    id: "medical-sample",
    title: "Diagnostic Chest Radiograph (Simulated)",
    domain: "Medical / Bio-Imaging",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
    description: "Posteroanterior projection radiograph for auxiliary anatomical screening.",
    recommendedStrictness: "medium",
    suggestedPrompt: "Screen cardiac silhouette ratio and check sharpness of lateral costophrenic angles.",
  },
  {
    id: "scene-sample",
    title: "Urban Traffic & Pedestrian Intersection",
    domain: "General Scene Understanding",
    url: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80",
    description: "Complex city avenue with vehicles, pedestrians, signal infrastructure, and lane markings.",
    recommendedStrictness: "low",
    suggestedPrompt: "Identify moving vehicles, pedestrians on walkways, and traffic light status.",
  },
];
