
export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface FieldDefinition {
  id: string;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
}

export interface FieldValue {
  fieldId: string;
  label: string; // Store label in case definition changes later
  value: string;
}

// New types for Scope Management
export interface ScopeDefinition {
  id: string;
  category: string; // e.g., "Analiz", "Test"
  item: string;     // e.g., "İş Analizi", "Birim Test"
}

export interface ScopeSelection {
  definitionId: string;
  category: string;
  item: string;
  isInScope: boolean;
}

// New type for Technical Component Definition
export interface TechnicalComponent {
  id: string;
  name: string; // Bileşen Adı
  description: string; // Bileşen Tanımı
  usage: string; // Bileşen Kullanımı
  complexityCriteria: string; // Bileşen Karmaşıklığını Belirleyen Kriterler
}

export type ComponentType = 'Yeni' | 'Güncelleme';
export type ComponentComplexityLevel = 'Çok Düşük' | 'Düşük' | 'Orta' | 'Yüksek';

// This is now used within a Project
export interface ProjectEffortRecord {
  id: string;
  componentId: string;
  componentName: string; // Denormalized for display
  type: ComponentType;
  complexity: ComponentComplexityLevel;
  
  // Efforts (Man/Days)
  developmentDays: number; // Base effort in Days
  
  // Ratios (%)
  analysisRatio: number;
  designRatio: number;
  testRatio: number;
  deployRatio: number;
}

export enum ProjectComplexity {
  SIMPLE = 'Basit',
  MEDIUM = 'Orta',
  COMPLEX = 'Karmaşık',
  ENTERPRISE = 'Kurumsal'
}

export interface TaskBreakdown {
  title: string;
  hours: number;
  description: string;
  role: string;
}

export interface EstimateResult {
  totalHours: number;
  totalCost: number;
  currency: string;
  timelineWeeks: number;
  recommendedStack: string[];
  risks: string[];
  tasks: TaskBreakdown[];
  summary: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  complexity: ProjectComplexity;
  customFields: FieldValue[];
  scopeSelections: ScopeSelection[]; 
  efforts?: ProjectEffortRecord[]; // New: Stores the manual effort planning
  createdAt: string; 
  estimate: EstimateResult | null; // Kept for backward compatibility or future hybrid use
}
