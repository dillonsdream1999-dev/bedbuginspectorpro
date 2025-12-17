/**
 * Step Definitions by Room Type
 */

import { RoomType, ScanStep } from './models';
import { PHOTO_SCAN_COPY } from './copy';
import { pinEngine } from './pinPlacement/PhotoPinPlacementEngine';
import uuid from 'react-native-uuid';

const { STEPS, INSTRUCTIONS, OUTLET_WARNING } = PHOTO_SCAN_COPY;

interface StepDef {
  key: string;
  title: string;
  instruction: string;
  tips: string[];
  warning?: string;
}

const BEDROOM_STEPS: StepDef[] = [
  {
    key: 'BED_OVERVIEW',
    title: STEPS.BED_OVERVIEW,
    instruction: INSTRUCTIONS.BED_OVERVIEW,
    tips: ['Include full bed in frame', 'Good lighting helps'],
  },
  {
    key: 'MATTRESS_SEAMS',
    title: STEPS.MATTRESS_SEAMS,
    instruction: INSTRUCTIONS.MATTRESS_SEAMS,
    tips: ['Lift sheets to expose seams', 'Check all corners', 'Include any tags'],
  },
  {
    key: 'BED_SKIRT',
    title: STEPS.BED_SKIRT,
    instruction: INSTRUCTIONS.BED_SKIRT,
    tips: ['Check all pleats and folds', 'Examine where skirt meets floor', 'Look at staple points'],
  },
  {
    key: 'BOX_SPRING',
    title: STEPS.BOX_SPRING,
    instruction: INSTRUCTIONS.BOX_SPRING,
    tips: ['Check all corner joints', 'Examine staple zones', 'Look at fabric folds'],
  },
  {
    key: 'HEADBOARD',
    title: STEPS.HEADBOARD,
    instruction: INSTRUCTIONS.HEADBOARD,
    tips: ['Pull headboard away from wall if safe', 'Check mounting hardware', 'Examine crevices'],
  },
  {
    key: 'NIGHTSTAND',
    title: STEPS.NIGHTSTAND,
    instruction: INSTRUCTIONS.NIGHTSTAND,
    tips: ['Open all drawers', 'Check rail joints', 'Examine back panel'],
  },
  {
    key: 'BASEBOARDS',
    title: STEPS.BASEBOARDS,
    instruction: INSTRUCTIONS.BASEBOARDS,
    tips: ['Focus on areas near bed', 'Check carpet edge junction', 'Look for gaps'],
  },
  {
    key: 'CURTAINS',
    title: STEPS.CURTAINS,
    instruction: INSTRUCTIONS.CURTAINS,
    tips: ['Check all pleats', 'Examine hem and bottom edge', 'Look at rod attachments'],
  },
  {
    key: 'UPHOLSTERED',
    title: STEPS.UPHOLSTERED,
    instruction: INSTRUCTIONS.UPHOLSTERED,
    tips: ['Check all seams', 'Examine cushion edges', 'Look at fabric folds'],
  },
];

const HOTEL_STEPS: StepDef[] = [
  {
    key: 'BED_OVERVIEW',
    title: STEPS.BED_OVERVIEW,
    instruction: INSTRUCTIONS.BED_OVERVIEW,
    tips: ['Include full bed in frame', 'Good lighting helps'],
  },
  {
    key: 'MATTRESS_SEAMS',
    title: STEPS.MATTRESS_SEAMS,
    instruction: INSTRUCTIONS.MATTRESS_SEAMS,
    tips: ['Lift sheets to expose seams', 'Check all corners', 'Include any tags'],
  },
  {
    key: 'BED_SKIRT',
    title: STEPS.BED_SKIRT,
    instruction: INSTRUCTIONS.BED_SKIRT,
    tips: ['IMPORTANT: Check all pleats and folds', 'Examine where skirt meets floor', 'Look at staple points'],
  },
  {
    key: 'HEADBOARD',
    title: STEPS.HEADBOARD,
    instruction: INSTRUCTIONS.HEADBOARD,
    tips: ['Hotels often have wall-mounted headboards', 'Check gap between headboard and wall'],
  },
  {
    key: 'NIGHTSTAND',
    title: STEPS.NIGHTSTAND,
    instruction: INSTRUCTIONS.NIGHTSTAND,
    tips: ['Open all drawers', 'Check rail joints', 'Examine back panel'],
  },
  {
    key: 'BASEBOARDS',
    title: STEPS.BASEBOARDS,
    instruction: INSTRUCTIONS.BASEBOARDS,
    tips: ['Focus on areas near bed', 'Check corners carefully'],
  },
  {
    key: 'CURTAINS',
    title: STEPS.CURTAINS,
    instruction: INSTRUCTIONS.CURTAINS,
    tips: ['Check all pleats', 'Examine hem and bottom edge'],
  },
  {
    key: 'LUGGAGE_RACK',
    title: STEPS.LUGGAGE_RACK,
    instruction: INSTRUCTIONS.LUGGAGE_RACK,
    tips: ['Check strap attachments', 'Examine joints', 'Look at underside'],
  },
  {
    key: 'UPHOLSTERED',
    title: STEPS.UPHOLSTERED,
    instruction: INSTRUCTIONS.UPHOLSTERED,
    tips: ['Check desk chair and any lounge furniture', 'Examine all seams'],
  },
  {
    key: 'CLOSET',
    title: STEPS.CLOSET,
    instruction: INSTRUCTIONS.CLOSET,
    tips: ['Check all corners', 'Examine shelf edges', 'Look at baseboard areas'],
  },
];

const LIVING_ROOM_STEPS: StepDef[] = [
  {
    key: 'COUCH_OVERVIEW',
    title: STEPS.COUCH_OVERVIEW,
    instruction: INSTRUCTIONS.COUCH_OVERVIEW,
    tips: ['Include full couch in frame', 'Good lighting helps'],
  },
  {
    key: 'COUCH_SEAMS',
    title: STEPS.COUCH_SEAMS,
    instruction: INSTRUCTIONS.COUCH_SEAMS,
    tips: ['Remove cushions if possible', 'Check all piping seams', 'Examine fabric joints'],
  },
  {
    key: 'COUCH_UNDERSIDE',
    title: STEPS.COUCH_UNDERSIDE,
    instruction: INSTRUCTIONS.COUCH_UNDERSIDE,
    tips: ['Check lower edge and skirt', 'Examine underside if accessible', 'Look at floor junction'],
  },
  {
    key: 'CHAIR_SEAMS',
    title: STEPS.CHAIR_SEAMS,
    instruction: INSTRUCTIONS.CHAIR_SEAMS,
    tips: ['Check all upholstered chairs', 'Examine seams and joints'],
  },
  {
    key: 'BASEBOARDS',
    title: STEPS.BASEBOARDS,
    instruction: INSTRUCTIONS.BASEBOARDS,
    tips: ['Check corners carefully', 'Examine carpet edge junction'],
  },
  {
    key: 'CURTAINS',
    title: STEPS.CURTAINS,
    instruction: INSTRUCTIONS.CURTAINS,
    tips: ['Check all pleats', 'Examine hem and bottom edge'],
  },
  {
    key: 'RUG_EDGE',
    title: STEPS.RUG_EDGE,
    instruction: INSTRUCTIONS.RUG_EDGE,
    tips: ['Lift rug edge if possible', 'Check nearby baseboards'],
  },
  {
    key: 'OUTLET_AREA',
    title: STEPS.OUTLET_AREA,
    instruction: INSTRUCTIONS.OUTLET_AREA,
    tips: ['Photograph area around outlets', 'Check nearby baseboards'],
    warning: OUTLET_WARNING,
  },
];

export function getStepsForRoomType(roomType: RoomType): ScanStep[] {
  let stepDefs: StepDef[];

  switch (roomType) {
    case 'bedroom':
      stepDefs = BEDROOM_STEPS;
      break;
    case 'hotel':
      stepDefs = HOTEL_STEPS;
      break;
    case 'living_room':
      stepDefs = LIVING_ROOM_STEPS;
      break;
    default:
      stepDefs = BEDROOM_STEPS;
  }

  return stepDefs.map((def) => ({
    id: uuid.v4() as string,
    key: def.key,
    title: def.title,
    instruction: def.instruction,
    tips: def.tips,
    warning: def.warning,
    status: 'pending',
    pins: pinEngine.generatePins(def.key),
  }));
}

export function getCommonMisses(roomType: RoomType): string[] {
  switch (roomType) {
    case 'bedroom':
    case 'hotel':
      return [
        'Bed skirt pleats and floor junction',
        'Behind headboard wall gap',
        'Nightstand drawer rails',
        'Mattress tag/label pockets',
        'Curtain rod mounting areas',
      ];
    case 'living_room':
      return [
        'Couch cushion seam piping',
        'Chair seat underside',
        'Baseboard corners',
        'Area rug edges',
        'Behind outlet plates (leave plates in place)',
      ];
    default:
      return [];
  }
}

