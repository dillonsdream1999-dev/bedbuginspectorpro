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
  // Bed Overview - general zones
  BED_OVERVIEW: () => [
    createPin(0.5, 0.2, 'Headboard Zone', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
    createPin(0.2, 0.5, 'Left Edge', PIN_WHY.EDGE, PIN_LOOK.SKINS),
    createPin(0.8, 0.5, 'Right Edge', PIN_WHY.EDGE, PIN_LOOK.SKINS),
    createPin(0.5, 0.85, 'Foot Zone', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
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

  // Box Spring / Bed Frame
  BOX_SPRING: () => [
    createPin(0.2, 0.3, 'Corner Joint 1', PIN_WHY.JOINT, PIN_LOOK.SPOTS),
    createPin(0.8, 0.3, 'Corner Joint 2', PIN_WHY.JOINT, PIN_LOOK.SPOTS),
    createPin(0.2, 0.7, 'Corner Joint 3', PIN_WHY.JOINT, PIN_LOOK.SKINS),
    createPin(0.8, 0.7, 'Corner Joint 4', PIN_WHY.JOINT, PIN_LOOK.SKINS),
    createPin(0.5, 0.5, 'Staple/Tack Zone', PIN_WHY.EDGE, PIN_LOOK.EGGS),
  ],

  // Headboard
  HEADBOARD: () => [
    createPin(0.3, 0.4, 'Left Mount Area', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
    createPin(0.7, 0.4, 'Right Mount Area', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
    createPin(0.5, 0.7, 'Wall Gap Zone', PIN_WHY.EDGE, PIN_LOOK.SKINS),
    createPin(0.5, 0.2, 'Top Edge', PIN_WHY.JOINT, PIN_LOOK.LIVE),
  ],

  // Nightstand
  NIGHTSTAND: () => [
    createPin(0.3, 0.35, 'Drawer Rail Left', PIN_WHY.RAIL, PIN_LOOK.SPOTS),
    createPin(0.7, 0.35, 'Drawer Rail Right', PIN_WHY.RAIL, PIN_LOOK.SPOTS),
    createPin(0.5, 0.6, 'Back Panel Edge', PIN_WHY.JOINT, PIN_LOOK.SKINS),
    createPin(0.5, 0.85, 'Base Junction', PIN_WHY.EDGE, PIN_LOOK.LIVE),
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

  // Upholstered furniture
  UPHOLSTERED: () => [
    createPin(0.2, 0.3, 'Left Arm Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.8, 0.3, 'Right Arm Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.5, 0.5, 'Cushion Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
    createPin(0.5, 0.85, 'Lower Edge', PIN_WHY.EDGE, PIN_LOOK.LIVE),
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

  // Couch Seams
  COUCH_SEAMS: () => [
    createPin(0.25, 0.35, 'Cushion Seam 1', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.5, 0.35, 'Cushion Seam 2', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.75, 0.35, 'Cushion Seam 3', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
    createPin(0.5, 0.65, 'Back Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
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
   */
  private createPinsForObject(detection: ObjectDetection, stepKey: string): Pin[] {
    const { className, x, y, width, height } = detection;
    const pins: Pin[] = [];

    // Calculate object bounds
    const left = Math.max(0, x - width / 2);
    const right = Math.min(1, x + width / 2);
    const top = Math.max(0, y - height / 2);
    const bottom = Math.min(1, y + height / 2);

    switch (className) {
      case 'bed':
        // Bed: pins at corners and edges
        pins.push(
          createPin(left + 0.05, top + 0.1, 'Headboard Area', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
          createPin(right - 0.05, top + 0.1, 'Headboard Right', PIN_WHY.MOUNT, PIN_LOOK.SPOTS),
          createPin(left + 0.05, y, 'Left Edge Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS),
          createPin(right - 0.05, y, 'Right Edge Seam', PIN_WHY.SEAM, PIN_LOOK.SKINS)
        );
        break;

      case 'couch':
        // Couch: pins at arm seams and cushion edges
        pins.push(
          createPin(left + 0.08, y - 0.1, 'Left Arm Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
          createPin(right - 0.08, y - 0.1, 'Right Arm Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
          createPin(x, y, 'Cushion Junction', PIN_WHY.SEAM, PIN_LOOK.SKINS),
          createPin(x, bottom - 0.05, 'Lower Skirt Edge', PIN_WHY.EDGE, PIN_LOOK.LIVE)
        );
        break;

      case 'chair':
        // Chair: pins at seat seams and joints
        pins.push(
          createPin(x - 0.1, y, 'Left Seat Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
          createPin(x + 0.1, y, 'Right Seat Seam', PIN_WHY.SEAM, PIN_LOOK.SPOTS),
          createPin(x, top + 0.15, 'Back Joint', PIN_WHY.JOINT, PIN_LOOK.SKINS)
        );
        break;

      case 'dining table':
        // Could be nightstand - pins at drawer/joint areas
        pins.push(
          createPin(x, y - 0.1, 'Top Surface Edge', PIN_WHY.EDGE, PIN_LOOK.SPOTS),
          createPin(x, y + 0.1, 'Drawer/Shelf Area', PIN_WHY.RAIL, PIN_LOOK.SKINS)
        );
        break;

      case 'suitcase':
        // Luggage rack area
        pins.push(
          createPin(x - 0.1, y, 'Left Handle/Strap', PIN_WHY.STRAP, PIN_LOOK.SPOTS),
          createPin(x + 0.1, y, 'Right Handle/Strap', PIN_WHY.STRAP, PIN_LOOK.SPOTS),
          createPin(x, bottom - 0.05, 'Bottom Edge', PIN_WHY.EDGE, PIN_LOOK.SKINS)
        );
        break;

      default:
        // Generic object - place edge pins
        pins.push(
          createPin(left + 0.05, y, 'Left Edge', PIN_WHY.EDGE, PIN_LOOK.SPOTS),
          createPin(right - 0.05, y, 'Right Edge', PIN_WHY.EDGE, PIN_LOOK.SPOTS)
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

