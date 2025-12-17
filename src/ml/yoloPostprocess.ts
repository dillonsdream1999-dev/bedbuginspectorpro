/**
 * YOLO Postprocessing
 * Parses model output and applies Non-Maximum Suppression (NMS)
 */

import { ML_CONFIG } from './modelConfig';
import { getClassName, isRelevantForInspection } from './cocoLabels';
import { boxToOriginalCoords, boxToNormalized } from './imageToTensor';

export interface Detection {
  classId: number;
  className: string;
  confidence: number;
  // Bounding box in normalized coordinates (0-1)
  x: number;      // center x
  y: number;      // center y
  width: number;
  height: number;
  // Corner coordinates for convenience
  x1: number;     // left
  y1: number;     // top
  x2: number;     // right
  y2: number;     // bottom
}

/**
 * Parse YOLOv8 output tensor and apply NMS
 * YOLOv8 output shape: [1, 84, 8400] where 84 = 4 (box) + 80 (classes)
 */
export function parseYoloOutput(
  output: Float32Array,
  imageWidth: number,
  imageHeight: number,
  scale: { x: number; y: number },
  padding: { x: number; y: number },
  confidenceThreshold: number = ML_CONFIG.CONFIDENCE_THRESHOLD,
  iouThreshold: number = ML_CONFIG.IOU_THRESHOLD,
  filterRelevant: boolean = true
): Detection[] {
  const numClasses = 80;
  const numBoxes = 8400;
  
  const candidates: Detection[] = [];
  
  // Parse each detection
  for (let i = 0; i < numBoxes; i++) {
    // YOLOv8 output is transposed: [1, 84, 8400]
    // Access: output[feature * numBoxes + boxIndex]
    
    // Box coordinates (cx, cy, w, h)
    const cx = output[0 * numBoxes + i];
    const cy = output[1 * numBoxes + i];
    const w = output[2 * numBoxes + i];
    const h = output[3 * numBoxes + i];
    
    // Find best class
    let bestClassId = 0;
    let bestConfidence = 0;
    
    for (let c = 0; c < numClasses; c++) {
      const confidence = output[(4 + c) * numBoxes + i];
      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestClassId = c;
      }
    }
    
    // Apply confidence threshold
    if (bestConfidence < confidenceThreshold) {
      continue;
    }
    
    // Filter to relevant classes if requested
    if (filterRelevant && !isRelevantForInspection(bestClassId)) {
      continue;
    }
    
    // Convert box to original image coordinates
    const modelBox = {
      x: cx - w / 2,
      y: cy - h / 2,
      width: w,
      height: h,
    };
    
    const originalBox = boxToOriginalCoords(modelBox, scale, padding);
    const normalizedBox = boxToNormalized(originalBox, imageWidth, imageHeight);
    
    // Clamp to valid range
    const x1 = Math.max(0, Math.min(1, normalizedBox.x));
    const y1 = Math.max(0, Math.min(1, normalizedBox.y));
    const x2 = Math.max(0, Math.min(1, normalizedBox.x + normalizedBox.width));
    const y2 = Math.max(0, Math.min(1, normalizedBox.y + normalizedBox.height));
    
    candidates.push({
      classId: bestClassId,
      className: getClassName(bestClassId),
      confidence: bestConfidence,
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2,
      width: x2 - x1,
      height: y2 - y1,
      x1,
      y1,
      x2,
      y2,
    });
  }
  
  // Apply NMS
  return applyNMS(candidates, iouThreshold);
}

/**
 * Calculate Intersection over Union (IoU) between two boxes
 */
function calculateIoU(a: Detection, b: Detection): number {
  const intersectX1 = Math.max(a.x1, b.x1);
  const intersectY1 = Math.max(a.y1, b.y1);
  const intersectX2 = Math.min(a.x2, b.x2);
  const intersectY2 = Math.min(a.y2, b.y2);
  
  const intersectWidth = Math.max(0, intersectX2 - intersectX1);
  const intersectHeight = Math.max(0, intersectY2 - intersectY1);
  const intersectArea = intersectWidth * intersectHeight;
  
  const areaA = a.width * a.height;
  const areaB = b.width * b.height;
  const unionArea = areaA + areaB - intersectArea;
  
  return unionArea > 0 ? intersectArea / unionArea : 0;
}

/**
 * Apply Non-Maximum Suppression
 */
function applyNMS(detections: Detection[], iouThreshold: number): Detection[] {
  if (detections.length === 0) return [];
  
  // Sort by confidence (descending)
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  
  const kept: Detection[] = [];
  const suppressed = new Set<number>();
  
  for (let i = 0; i < sorted.length; i++) {
    if (suppressed.has(i)) continue;
    
    kept.push(sorted[i]);
    
    // Suppress overlapping boxes of same class
    for (let j = i + 1; j < sorted.length; j++) {
      if (suppressed.has(j)) continue;
      if (sorted[i].classId !== sorted[j].classId) continue;
      
      const iou = calculateIoU(sorted[i], sorted[j]);
      if (iou > iouThreshold) {
        suppressed.add(j);
      }
    }
  }
  
  return kept;
}

