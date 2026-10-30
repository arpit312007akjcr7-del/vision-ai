export type InspectionDomain =
  | "Manufacturing & Industrial"
  | "Retail & Inventory"
  | "Medical / Bio-Imaging"
  | "General Scene Understanding";

export type StrictnessLevel = "low" | "medium" | "high";
export type InspectionVerdict = "PASS" | "WARN" | "FAIL" | "FLAGGED" | "INCONCLUSIVE";
export type DefectSeverity = "normal" | "low" | "medium" | "high" | "critical";

export interface DetectedObject {
  id?: number;
  label: string;
  confidence: number;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  details: string;
  severity?: DefectSeverity;
  category?: string;
}

export interface AIAnalysisResult {
  summary: string;
  overallConfidence: number;
  anomaliesDetected?: boolean;
  inspectionVerdict?: InspectionVerdict;
  domainInsights?: string[];
  detectedObjects: DetectedObject[];
}

export interface Inspection {
  id: number;
  user_id: number;
  image_url: string;
  domain: string;
  status: string;
  summary: string;
  raw_ai_response: AIAnalysisResult;
  confidence_score: number;
  created_at: string;
  detected_objects?: Array<{
    id: number;
    inspection_id: number;
    label: string;
    confidence: number;
    box_2d_ymin: number;
    box_2d_xmin: number;
    box_2d_ymax: number;
    box_2d_xmax: number;
    details: string;
  }>;
}

export interface AnalyticsSummary {
  totalInspections: number;
  averageConfidence: number;
  domainBreakdown: Array<{
    domain: string;
    count: number;
    avgConfidence: number;
  }>;
  topDetections: Array<{
    label: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: number;
    domain: string;
    status: string;
    confidence_score: number;
    created_at: string;
    summary: string;
  }>;
  engineStatus: string;
}

export interface DomainProfile {
  id: InspectionDomain;
  title: string;
  shortDesc: string;
  iconName: string;
  targetFocus: string[];
  defaultNotes: string;
  accentColor: string;
}
