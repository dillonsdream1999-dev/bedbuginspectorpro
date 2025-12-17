/**
 * Pin Placement Engine Interface
 */

import { Pin } from '../models';

/**
 * Detection from YOLO or other object detector
 */
export interface ObjectDetection {
  classId: number;
  className: string;
  confidence: number;
  x: number;      // center x (normalized 0-1)
  y: number;      // center y (normalized 0-1)
  width: number;  // normalized
  height: number; // normalized
}

export interface PinPlacementEngine {
  /**
   * Generate pins for a specific step type
   * @param stepKey - The step identifier
   * @param detections - Optional object detections from ML model
   * @returns Array of pins with normalized coordinates (0-1)
   */
  generatePins(stepKey: string, detections?: ObjectDetection[]): Pin[];
}

