import type { BaseDocument } from '../../base/types';
import { Timestamp } from 'firebase-admin/firestore';

export interface QualityObjective extends BaseDocument {
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'active' | 'completed' | 'cancelled';
  startDate: Timestamp;
  endDate: Timestamp;
  owner: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
  deletedAt: Timestamp | null;
}

export interface QualityIndicator extends BaseDocument {
  name: string;
  description: string;
  objectiveId: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastMeasurement?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
  deletedAt: Timestamp | null;
}

export interface Measurement extends BaseDocument {
  indicatorId: string;
  value: number;
  date: Timestamp;
  notes?: string;
  recordedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
  deletedAt: Timestamp | null;
}

export interface CreateQualityObjectiveInput {
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  startDate: Date | string;
  endDate: Date | string;
  owner: string;
}

export interface CreateQualityIndicatorInput {
  name: string;
  description: string;
  objectiveId: string;
  targetValue: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface CreateMeasurementInput {
  indicatorId: string;
  value: number;
  date: Date | string;
  notes?: string;
}

export interface QualityStats {
  totalObjectives: number;
  activeObjectives: number;
  completedObjectives: number;
  totalIndicators: number;
  totalMeasurements: number;
  averageCompliancePercentage: number;
}
