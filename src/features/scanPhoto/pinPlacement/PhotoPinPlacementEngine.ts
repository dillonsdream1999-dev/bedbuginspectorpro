/**
 * Photo Pin Placement Engine
 * Rule-based pin templates with normalized coordinates (0-1)
 * Optionally enhanced by YOLO object detection
 */

import { Pin } from '../models';
import { PinPlacementEngine, ObjectDetection } from './PinPlacementEngine';
import { PHOTO_SCAN_COPY } from '../copy';
import uuid from 'react-native-uuid';

const { PIN_WHY, PIN_LOOK } = PHOTO_SCAN_COPY;

// Pin density limits
const PIN_LIMITS = {
  DEFAULT_MIN: 2,
  DEFAULT_MAX: 4,
  BED_STEPS_MAX: 6,
  SINGLE_CORNER_STEPS: ['MATTRESS_SEAMS'],
};

function createPin(
  x: number,
  y: number,
  label: string,
  description: string,
  whatToLook: string
): Pin {
  return {
    id: uuid.v4() as string,
    x,
    y,
    label,
    description,
    whatToLook,
    status: 'unchecked',
  };
}

// Pin templates for each step type
const PIN_TEMPLATES: Record<string, () => Pin[]> = {
  // Bed Overview - general zones (improved positioning)
  BED_OVERVIEW: () => [
    createPin(0.3, 0.18, 'Headboard Left', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
    createPin(0.7, 0.18, 'Headboard Right', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
    createPin(0.5, 0.25, 'Headboard Center Gap', PIN_WHY.EDGE, PIN_LOOK.SKINS),
    createPin(0.2, 0.5, 'Left Edge Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
    createPin(0.8, 0.5, 'Right Edge Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
    createPin(0.5, 0.82, 'Foot Zone', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
  ],

  // Mattress Seams - corner seams + tag
  MATTRESS_SEAMS: () => [
    createPin(0.15, 0.2, 'Top Left Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.85, 0.2, 'Top Right Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.15, 0.8, 'Bottom Left Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
    createPin(0.85, 0.8, 'Bottom Right Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
    createPin(0.5, 0.6, 'Tag/Label Area', PIN_WHY.TAG, PIN_LOOK.EGGS),
  ],

  // Bed Skirt - lower pleats, corners, staple zones
  BED_SKIRT: () => [
    createPin(0.15, 0.75, 'Left Pleat', PIN_WHY.PLEAT, PIN_LOOK.SPOTS),
    createPin(0.5, 0.8, 'Center Edge', PIN_WHY.EDGE, PIN_LOOK.SKINS),
    createPin(0.85, 0.75, 'Right Pleat', PIN_WHY.PLEAT, PIN_LOOK.SPOTS),
    createPin(0.3, 0.9, 'Floor Junction Left', PIN_WHY.EDGE, PIN_LOOK.LIVE),
    createPin(0.7, 0.9, 'Floor Junction Right', PIN_WHY.EDGE, PIN_LOOK.LIVE),
  ],

  // Box Spring / Bed Frame (improved positioning)
  BOX_SPRING: () => [
    createPin(0.18, 0.25, 'Top Left Corner', PIN_WHY.JOINT, PIN_LOOK.SPOTS),
    createPin(0.82, 0.25, 'Top Right Corner', PIN_WHY.JOINT, PIN_LOOK.SPOTS),
    createPin(0.18, 0.75, 'Bottom Left Corner', PIN_WHY.JOINT, PIN_LOOK.SKINS),
    createPin(0.82, 0.75, 'Bottom Right Corner', PIN_WHY.JOINT, PIN_LOOK.SKINS),
    createPin(0.5, 0.35, 'Top Edge Staple Zone', PIN_WHY.EDGE, PIN_LOOK.EGGS),
    createPin(0.5, 0.65, 'Bottom Edge Staple Zone', PIN_WHY.EDGE, PIN_LOOK.EGGS),
  ],

  // Headboard
  HEADBOARD: () => [
    createPin(0.3, 0.4, 'Left Mount Area', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
    createPin(0.7, 0.4, 'Right Mount Area', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
    createPin(0.5, 0.7, 'Wall Gap Zone', PIN_WHY.EDGE, PIN_LOOK.SKINS),
    createPin(0.5, 0.2, 'Top Edge', PIN_WHY.JOINT, PIN_LOOK.LIVE),
  ],

  // Nightstand (improved positioning)
  NIGHTSTAND: () => [
    createPin(0.25, 0.32, 'Drawer Rail Left', PIN_WHY.RAIL, PIN_LOOK.SPOTS),
    createPin(0.75, 0.32, 'Drawer Rail Right', PIN_WHY.RAIL, PIN_LOOK.SPOTS),
    createPin(0.5, 0.5, 'Top Surface Edge', PIN_WHY.EDGE, PIN_LOOK.SPOTS),
    createPin(0.5, 0.65, 'Back Panel Edge', PIN_WHY.JOINT, PIN_LOOK.SKINS),
    createPin(0.5, 0.88, 'Base Junction', PIN_WHY.EDGE, PIN_LOOK.LIVE),
  ],

  // Baseboards
  BASEBOARDS: () => [
    createPin(0.2, 0.85, 'Left Section', PIN_WHY.BASEBOARD, PIN_LOOK.SPOTS),
    createPin(0.5, 0.85, 'Center Section', PIN_WHY.BASEBOARD, PIN_LOOK.SPOTS),
    createPin(0.8, 0.85, 'Right Section', PIN_WHY.BASEBOARD, PIN_LOOK.SPOTS),
    createPin(0.35, 0.92, 'Carpet Edge Left', PIN_WHY.EDGE, PIN_LOOK.SKINS),
    createPin(0.65, 0.92, 'Carpet Edge Right', PIN_WHY.EDGE, PIN_LOOK.SKINS),
  ],

  // Curtains
  CURTAINS: () => [
    createPin(0.3, 0.15, 'Left Rod Area', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
    createPin(0.7, 0.15, 'Right Rod Area', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
    createPin(0.25, 0.5, 'Left Pleat Zone', PIN_WHY.PLEAT, PIN_LOOK.SKINS),
    createPin(0.75, 0.5, 'Right Pleat Zone', PIN_WHY.PLEAT, PIN_LOOK.SKINS),
    createPin(0.5, 0.9, 'Hem/Floor Area', PIN_WHY.EDGE, PIN_LOOK.LIVE),
  ],

  // Upholstered furniture (improved positioning)
  UPHOLSTERED: () => [
    createPin(0.18, 0.28, 'Left Arm Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.82, 0.28, 'Right Arm Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.35, 0.5, 'Left Cushion Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
    createPin(0.65, 0.5, 'Right Cushion Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
    createPin(0.5, 0.7, 'Back Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
    createPin(0.5, 0.88, 'Lower Edge/Skirt', PIN_WHY.EDGE, PIN_LOOK.LIVE),
  ],

  // Luggage Rack
  LUGGAGE_RACK: () => [
    createPin(0.2, 0.4, 'Left Strap Attach', PIN_WHY.STRAP, PIN_LOOK.SPOTS),
    createPin(0.8, 0.4, 'Right Strap Attach', PIN_WHY.STRAP, PIN_LOOK.SPOTS),
    createPin(0.3, 0.7, 'Left Joint', PIN_WHY.JOINT, PIN_LOOK.SKINS),
    createPin(0.7, 0.7, 'Right Joint', PIN_WHY.JOINT, PIN_LOOK.SKINS),
    createPin(0.5, 0.85, 'Underside Edge', PIN_WHY.EDGE, PIN_LOOK.LIVE),
  ],

  // Closet
  CLOSET: () => [
    createPin(0.15, 0.25, 'Top Left Corner', PIN_WHY.JOINT, PIN_LOOK.SPOTS),
    createPin(0.85, 0.25, 'Top Right Corner', PIN_WHY.JOINT, PIN_LOOK.SPOTS),
    createPin(0.15, 0.85, 'Bottom Left Corner', PIN_WHY.BASEBOARD, PIN_LOOK.SKINS),
    createPin(0.85, 0.85, 'Bottom Right Corner', PIN_WHY.BASEBOARD, PIN_LOOK.SKINS),
  ],

  // Couch Overview
  COUCH_OVERVIEW: () => [
    createPin(0.15, 0.4, 'Left Arm', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.85, 0.4, 'Right Arm', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.5, 0.5, 'Seat Area', PIN_WHY.SEAM, PIN_LOOK.SKINS),
    createPin(0.5, 0.85, 'Lower Edge', PIN_WHY.EDGE, PIN_LOOK.LIVE),
  ],

  // Couch Seams (improved positioning)
  COUCH_SEAMS: () => [
    createPin(0.2, 0.32, 'Left Arm Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.35, 0.32, 'Left Cushion Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.5, 0.32, 'Center Cushion Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.65, 0.32, 'Right Cushion Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.8, 0.32, 'Right Arm Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.5, 0.6, 'Back Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
  ],

  // Couch Underside
  COUCH_UNDERSIDE: () => [
    createPin(0.2, 0.5, 'Left Skirt Edge', PIN_WHY.EDGE, PIN_LOOK.SPOTS),
    createPin(0.5, 0.5, 'Center Underside', PIN_WHY.JOINT, PIN_LOOK.SKINS),
    createPin(0.8, 0.5, 'Right Skirt Edge', PIN_WHY.EDGE, PIN_LOOK.SPOTS),
    createPin(0.5, 0.8, 'Floor Junction', PIN_WHY.EDGE, PIN_LOOK.LIVE),
  ],

  // Chair Seams
  CHAIR_SEAMS: () => [
    createPin(0.3, 0.35, 'Seat Seam Left', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.7, 0.35, 'Seat Seam Right', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.5, 0.6, 'Back Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
  ],

  // Rug Edge
  RUG_EDGE: () => [
    createPin(0.2, 0.7, 'Left Edge', PIN_WHY.EDGE, PIN_LOOK.SPOTS),
    createPin(0.5, 0.7, 'Center Edge', PIN_WHY.EDGE, PIN_LOOK.SKINS),
    createPin(0.8, 0.7, 'Right Edge', PIN_WHY.EDGE, PIN_LOOK.SPOTS),
  ],

  // Outlet Area (with safety consideration)
  OUTLET_AREA: () => [
    createPin(0.5, 0.4, 'Plate Edge Top', PIN_WHY.EDGE, PIN_LOOK.SPOTS),
    createPin(0.5, 0.6, 'Plate Edge Bottom', PIN_WHY.EDGE, PIN_LOOK.SPOTS),
    createPin(0.3, 0.8, 'Nearby Baseboard', PIN_WHY.BASEBOARD, PIN_LOOK.SKINS),
    createPin(0.7, 0.8, 'Nearby Baseboard', PIN_WHY.BASEBOARD, PIN_LOOK.SKINS),
  ],
};

export class PhotoPinPlacementEngine implements PinPlacementEngine {
  /**
   * Generate pins for a step, optionally using YOLO detections
   */
  generatePins(stepKey: string, detections?: ObjectDetection[]): Pin[] {
    // If we have relevant detections, generate detection-based pins
    if (detections && detections.length > 0) {
      const detectionPins = this.generatePinsFromDetections(stepKey, detections);
      if (detectionPins.length > 0) {
        return this.enforcePinLimits(stepKey, detectionPins);
      }
    }

    // Fall back to rule-based templates
    const template = PIN_TEMPLATES[stepKey];
    if (template) {
      return this.enforcePinLimits(stepKey, template());
    }
    
    // Default fallback - corner pins
    return [
      createPin(0.2, 0.2, 'Top Left Area', PIN_WHY.EDGE, PIN_LOOK.SPOTS),
      createPin(0.8, 0.2, 'Top Right Area', PIN_WHY.EDGE, PIN_LOOK.SPOTS),
      createPin(0.2, 0.8, 'Bottom Left Area', PIN_WHY.EDGE, PIN_LOOK.SKINS),
      createPin(0.8, 0.8, 'Bottom Right Area', PIN_WHY.EDGE, PIN_LOOK.SKINS),
    ];
  }

  /**
   * Generate pins based on YOLO detections
   */
  private generatePinsFromDetections(stepKey: string, detections: ObjectDetection[]): Pin[] {
    const pins: Pin[] = [];

    for (const det of detections) {
      const objPins = this.createPinsForObject(det, stepKey);
      pins.push(...objPins);
    }

    return pins;
  }

  /**
   * Create inspection pins around a detected object
   * Improved placement based on furniture geometry and bed bug hiding spots
   */
  private createPinsForObject(detection: ObjectDetection, stepKey: string): Pin[] {
    const { className, x, y, width, height } = detection;
    const pins: Pin[] = [];

    // Calculate object bounds with padding
    const left = Math.max(0.05, x - width / 2);
    const right = Math.min(0.95, x + width / 2);
    const top = Math.max(0.05, y - height / 2);
    const bottom = Math.min(0.95, y + height / 2);
    
    // Calculate furniture dimensions for smarter placement
    const objWidth = right - left;
    const objHeight = bottom - top;
    const aspectRatio = objWidth / objHeight;
    
    // Determine if furniture is viewed from side, front, or angle
    const isSideView = aspectRatio < 0.6; // Tall and narrow
    const isFrontView = aspectRatio > 1.5; // Wide and short
    const isAngledView = !isSideView && !isFrontView;

    switch (className) {
      case 'bed':
        // Bed: smarter placement based on view angle and step type
        if (stepKey === 'BED_OVERVIEW' || stepKey === 'HEADBOARD') {
          // Headboard area - top of bed
          pins.push(
            createPin(left + objWidth * 0.2, top + objHeight * 0.15, 'Headboard Left', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
            createPin(right - objWidth * 0.2, top + objHeight * 0.15, 'Headboard Right', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
            createPin(x, top + objHeight * 0.1, 'Top Center Gap', PIN_WHY.EDGE, PIN_LOOK.SKINS)
          );
        }
        if (stepKey === 'MATTRESS_SEAMS') {
          // Mattress seams - corners and edges
          pins.push(
            createPin(left + objWidth * 0.12, top + objHeight * 0.2, 'Top Left Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
            createPin(right - objWidth * 0.12, top + objHeight * 0.2, 'Top Right Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
            createPin(left + objWidth * 0.12, bottom - objHeight * 0.2, 'Bottom Left Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
            createPin(right - objWidth * 0.12, bottom - objHeight * 0.2, 'Bottom Right Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
            createPin(x, y, 'Tag/Label Area', PIN_WHY.TAG, PIN_LOOK.EGGS)
          );
        } else {
          // Side edges for other bed steps
          pins.push(
            createPin(left + objWidth * 0.08, y, 'Left Edge Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
            createPin(right - objWidth * 0.08, y, 'Right Edge Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
            createPin(x, bottom - objHeight * 0.15, 'Foot Zone', PIN_WHY.EDGE, PIN_LOOK.SPOTS)
          );
        }
        break;

      case 'couch':
        // Couch: pins at seams and cushion areas
        if (stepKey === 'COUCH_SEAMS') {
          // Detailed seam inspection
          pins.push(
            createPin(left + objWidth * 0.15, y - objHeight * 0.15, 'Left Arm Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
            createPin(right - objWidth * 0.15, y - objHeight * 0.15, 'Right Arm Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
            createPin(x - objWidth * 0.15, y, 'Left Cushion Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
            createPin(x + objWidth * 0.15, y, 'Right Cushion Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
            createPin(x, y + objHeight * 0.2, 'Back Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS)
          );
        } else {
          // General couch overview
          pins.push(
            createPin(left + objWidth * 0.12, y - objHeight * 0.1, 'Left Arm Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
            createPin(right - objWidth * 0.12, y - objHeight * 0.1, 'Right Arm Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
            createPin(x, y, 'Cushion Junction', PIN_WHY.SEAM, PIN_LOOK.SKINS),
            createPin(x, bottom - objHeight * 0.12, 'Lower Skirt Edge', PIN_WHY.EDGE, PIN_LOOK.LIVE)
          );
        }
        break;

      case 'chair':
        // Chair: pins at seat seams and joints
        pins.push(
          createPin(x - objWidth * 0.25, y, 'Left Seat Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
          createPin(x + objWidth * 0.25, y, 'Right Seat Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
          createPin(x, top + objHeight * 0.2, 'Back Joint', PIN_WHY.JOINT, PIN_LOOK.SKINS),
          createPin(x, bottom - objHeight * 0.1, 'Base Junction', PIN_WHY.EDGE, PIN_LOOK.LIVE)
        );
        break;

      case 'dining table':
        // Could be nightstand or table - pins at edges and joints
        if (stepKey === 'NIGHTSTAND') {
          pins.push(
            createPin(left + objWidth * 0.15, top + objHeight * 0.3, 'Drawer Rail Left', PIN_WHY.RAIL, PIN_LOOK.SPOTS),
            createPin(right - objWidth * 0.15, top + objHeight * 0.3, 'Drawer Rail Right', PIN_WHY.RAIL, PIN_LOOK.SPOTS),
            createPin(x, bottom - objHeight * 0.2, 'Back Panel Edge', PIN_WHY.JOINT, PIN_LOOK.SKINS),
            createPin(x, bottom - objHeight * 0.05, 'Base Junction', PIN_WHY.EDGE, PIN_LOOK.LIVE)
          );
        } else {
          pins.push(
            createPin(x, top + objHeight * 0.15, 'Top Surface Edge', PIN_WHY.EDGE, PIN_LOOK.SPOTS),
            createPin(x, y, 'Drawer/Shelf Area', PIN_WHY.RAIL, PIN_LOOK.SKINS),
            createPin(x, bottom - objHeight * 0.1, 'Base Joint', PIN_WHY.JOINT, PIN_LOOK.SPOTS)
          );
        }
        break;

      case 'suitcase':
        // Luggage rack area
        pins.push(
          createPin(x - objWidth * 0.25, y, 'Left Handle/Strap', PIN_WHY.STRAP, PIN_LOOK.SPOTS),
          createPin(x + objWidth * 0.25, y, 'Right Handle/Strap', PIN_WHY.STRAP, PIN_LOOK.SPOTS),
          createPin(left + objWidth * 0.2, bottom - objHeight * 0.15, 'Left Joint', PIN_WHY.JOINT, PIN_LOOK.SKINS),
          createPin(right - objWidth * 0.2, bottom - objHeight * 0.15, 'Right Joint', PIN_WHY.JOINT, PIN_LOOK.SKINS),
          createPin(x, bottom - objHeight * 0.05, 'Bottom Edge', PIN_WHY.EDGE, PIN_LOOK.LIVE)
        );
        break;

      default:
        // Generic object - place strategic edge pins
        pins.push(
          createPin(left + objWidth * 0.1, top + objHeight * 0.2, 'Top Left Corner', PIN_WHY.JOINT, PIN_LOOK.SPOTS),
          createPin(right - objWidth * 0.1, top + objHeight * 0.2, 'Top Right Corner', PIN_WHY.JOINT, PIN_LOOK.SPOTS),
          createPin(left + objWidth * 0.1, bottom - objHeight * 0.2, 'Bottom Left Corner', PIN_WHY.JOINT, PIN_LOOK.SKINS),
          createPin(right - objWidth * 0.1, bottom - objHeight * 0.2, 'Bottom Right Corner', PIN_WHY.JOINT, PIN_LOOK.SKINS)
        );
    }

    return pins;
  }

  /**
   * Enforce pin density limits based on step type
   */
  private enforcePinLimits(stepKey: string, pins: Pin[]): Pin[] {
    // For mattress seams step, show only 1 corner + instruction
    if (PIN_LIMITS.SINGLE_CORNER_STEPS.includes(stepKey)) {
      if (pins.length > 1) {
        // Keep first pin and add instruction note
        const firstPin = pins[0];
        return [
          {
            ...firstPin,
            label: firstPin.label + ' (repeat on other corners)',
          },
        ];
      }
    }

    // Determine max pins for this step
    const isBedStep = stepKey.includes('BED') || stepKey.includes('MATTRESS');
    const maxPins = isBedStep ? PIN_LIMITS.BED_STEPS_MAX : PIN_LIMITS.DEFAULT_MAX;

    // Limit pins
    if (pins.length > maxPins) {
      return pins.slice(0, maxPins);
    }

    return pins;
  }
}

export const pinEngine = new PhotoPinPlacementEngine();

