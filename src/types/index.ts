/**
 * HarborCheck Types
 */

export type RoomType = 'bedroom' | 'living_room' | 'hotel';
export type ContactPreference = 'call_now' | 'text_now' | 'callback';
export type ChecklistItemStatus = 'unchecked' | 'checked' | 'flagged';

export interface ChecklistItem {
  id: string;
  key: string;
  title: string;
  description: string;
  warning?: string;
  status: ChecklistItemStatus;
  photoUri?: string;
}

export interface ScanSession {
  id: string;
  roomType: RoomType;
  startedAt: Date;
  endedAt?: Date;
  items: ChecklistItem[];
}

export interface Lead {
  id: string;
  zip: string;
  roomType: RoomType;
  contactPreference: ContactPreference;
  sessionId?: string;
  createdAt: Date;
}

export type RootStackParamList = {
  Home: undefined;
  SelectRoom: undefined;
  BedBugEducation: undefined;
  Terms: undefined;
  Privacy: undefined;
  Scan: { roomType: RoomType };
  ObjectDetection: undefined;
  PhotoCapture: { itemId: string };
  Summary: { sessionId: string };
  LeadFlow: { roomType?: RoomType };
  // Photo Scan Flow (new)
  PhotoScanFlow: { roomType: RoomType };
  PhotoScanCapture: { stepId: string };
  PhotoAnnotate: { stepId: string };
  PhotoScanSummary: { sessionId: string };
};

