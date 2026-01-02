/**
 * Photo Scan Models
 */

export type RoomType = 'bedroom' | 'living_room' | 'hotel';
export type PinStatus = 'unchecked' | 'checked' | 'concerned';
export type StepStatus = 'pending' | 'captured' | 'reviewed';

export interface Pin {
  id: string;
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  label: string;
  description: string;
  whatToLook: string;
  status: PinStatus;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ScanStep {
  id: string;
  key: string;
  title: string;
  instruction: string;
  tips: string[];
  warning?: string;
  status: StepStatus;
  photoUri?: string;
  photoWidth?: number;
  photoHeight?: number;
  pins: Pin[];
  checklistItems: ChecklistItem[];
  // Store if pins have been manually adjusted
  pinsManuallyAdjusted?: boolean;
}

export interface PhotoScanSession {
  id: string;
  roomType: RoomType;
  startedAt: Date;
  endedAt?: Date;
  currentStepIndex: number;
  steps: ScanStep[];
}

export interface SessionSummary {
  totalSteps: number;
  completedSteps: number;
  concernedPins: number;
  photosCount: number;
  commonMisses: string[];
}

