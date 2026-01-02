/**
 * Step Definitions by Room Type
 */

import { RoomType, ScanStep, ChecklistItem } from './models';
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
  checklistItems: string[];
}

// Helper to generate checklist items
function createChecklistItems(items: string[]): ChecklistItem[] {
  return items.map((text) => ({
    id: uuid.v4() as string,
    text,
    checked: false,
  }));
}

const BEDROOM_STEPS: StepDef[] = [
  {
    key: 'BED_OVERVIEW',
    title: STEPS.BED_OVERVIEW,
    instruction: INSTRUCTIONS.BED_OVERVIEW,
    tips: ['Include full bed in frame', 'Good lighting helps'],
    checklistItems: [
      'Check mattress top surface',
      'Examine pillow areas',
      'Look at bed linens for stains',
      'Check headboard area',
      'Inspect bed frame corners',
    ],
  },
  {
    key: 'MATTRESS_SEAMS',
    title: STEPS.MATTRESS_SEAMS,
    instruction: INSTRUCTIONS.MATTRESS_SEAMS,
    tips: ['Lift sheets to expose seams', 'Check all corners', 'Include any tags'],
    checklistItems: [
      'Check all 4 corner seams',
      'Examine top seam around edges',
      'Inspect manufacturer tags/labels',
      'Look at piping edges',
      'Check tufted areas if present',
      'Examine mattress sides/edges',
    ],
  },
  {
    key: 'BED_SKIRT',
    title: STEPS.BED_SKIRT,
    instruction: INSTRUCTIONS.BED_SKIRT,
    tips: ['Check all pleats and folds', 'Examine where skirt meets floor', 'Look at staple points'],
    checklistItems: [
      'Check all pleats and folds',
      'Examine where skirt meets floor',
      'Look at staple/attachment points',
      'Inspect hem edge',
      'Check corners of bed skirt',
    ],
  },
  {
    key: 'BOX_SPRING',
    title: STEPS.BOX_SPRING,
    instruction: INSTRUCTIONS.BOX_SPRING,
    tips: ['Check all corner joints', 'Examine staple zones', 'Look at fabric folds'],
    checklistItems: [
      'Check all 4 corner joints',
      'Examine staple zones',
      'Look at fabric folds and edges',
      'Inspect underside if accessible',
      'Check where box spring meets bed frame',
    ],
  },
  {
    key: 'HEADBOARD',
    title: STEPS.HEADBOARD,
    instruction: INSTRUCTIONS.HEADBOARD,
    tips: ['Pull headboard away from wall if safe', 'Check mounting hardware', 'Examine crevices'],
    checklistItems: [
      'Check gap between headboard and wall',
      'Examine mounting hardware',
      'Look at top edge of headboard',
      'Check crevices and joints',
      'Inspect upholstered areas if present',
    ],
  },
  {
    key: 'NIGHTSTAND',
    title: STEPS.NIGHTSTAND,
    instruction: INSTRUCTIONS.NIGHTSTAND,
    tips: ['Open all drawers', 'Check rail joints', 'Examine back panel'],
    checklistItems: [
      'Open all drawers and check inside',
      'Check drawer rail joints',
      'Examine back panel',
      'Check top surface and edges',
      'Look at where nightstand meets wall',
      'Inspect underneath if accessible',
    ],
  },
  {
    key: 'BASEBOARDS',
    title: STEPS.BASEBOARDS,
    instruction: INSTRUCTIONS.BASEBOARDS,
    tips: ['Focus on areas near bed', 'Check carpet edge junction', 'Look for gaps'],
    checklistItems: [
      'Check baseboards near bed (all 4 sides)',
      'Examine where baseboard meets carpet/floor',
      'Look for gaps between baseboard and wall',
      'Check corners carefully',
      'Inspect outlet areas (don\'t remove covers)',
    ],
  },
  {
    key: 'CURTAINS',
    title: STEPS.CURTAINS,
    instruction: INSTRUCTIONS.CURTAINS,
    tips: ['Check all pleats', 'Examine hem and bottom edge', 'Look at rod attachments'],
    checklistItems: [
      'Check all pleats and folds',
      'Examine hem and bottom edge',
      'Look at rod/mounting attachments',
      'Check where curtains touch floor',
      'Inspect curtain tie-backs if present',
    ],
  },
  {
    key: 'UPHOLSTERED',
    title: STEPS.UPHOLSTERED,
    instruction: INSTRUCTIONS.UPHOLSTERED,
    tips: ['Check all seams', 'Examine cushion edges', 'Look at fabric folds'],
    checklistItems: [
      'Check all seams and piping',
      'Examine cushion edges',
      'Look at fabric folds',
      'Check underneath if accessible',
      'Inspect armrests and back areas',
    ],
  },
];

const HOTEL_STEPS: StepDef[] = [
  {
    key: 'BED_OVERVIEW',
    title: STEPS.BED_OVERVIEW,
    instruction: INSTRUCTIONS.BED_OVERVIEW,
    tips: ['Include full bed in frame', 'Good lighting helps'],
    checklistItems: [
      'Check mattress top surface',
      'Examine pillow areas',
      'Look at bed linens for stains',
      'Check headboard area',
      'Inspect bed frame corners',
    ],
  },
  {
    key: 'MATTRESS_SEAMS',
    title: STEPS.MATTRESS_SEAMS,
    instruction: INSTRUCTIONS.MATTRESS_SEAMS,
    tips: ['Lift sheets to expose seams', 'Check all corners', 'Include any tags'],
    checklistItems: [
      'Check all 4 corner seams',
      'Examine top seam around edges',
      'Inspect manufacturer tags/labels',
      'Look at piping edges',
      'Check tufted areas if present',
      'Examine mattress sides/edges',
    ],
  },
  {
    key: 'BED_SKIRT',
    title: STEPS.BED_SKIRT,
    instruction: INSTRUCTIONS.BED_SKIRT,
    tips: ['IMPORTANT: Check all pleats and folds', 'Examine where skirt meets floor', 'Look at staple points'],
    checklistItems: [
      'Check all pleats and folds (IMPORTANT)',
      'Examine where skirt meets floor',
      'Look at staple/attachment points',
      'Inspect hem edge',
      'Check corners of bed skirt',
    ],
  },
  {
    key: 'HEADBOARD',
    title: STEPS.HEADBOARD,
    instruction: INSTRUCTIONS.HEADBOARD,
    tips: ['Hotels often have wall-mounted headboards', 'Check gap between headboard and wall'],
    checklistItems: [
      'Check gap between headboard and wall',
      'Examine wall-mounted hardware',
      'Look at top edge of headboard',
      'Check crevices and joints',
      'Inspect upholstered areas if present',
    ],
  },
  {
    key: 'NIGHTSTAND',
    title: STEPS.NIGHTSTAND,
    instruction: INSTRUCTIONS.NIGHTSTAND,
    tips: ['Open all drawers', 'Check rail joints', 'Examine back panel'],
    checklistItems: [
      'Open all drawers and check inside',
      'Check drawer rail joints',
      'Examine back panel',
      'Check top surface and edges',
      'Look at where nightstand meets wall',
    ],
  },
  {
    key: 'BASEBOARDS',
    title: STEPS.BASEBOARDS,
    instruction: INSTRUCTIONS.BASEBOARDS,
    tips: ['Focus on areas near bed', 'Check corners carefully'],
    checklistItems: [
      'Check baseboards near bed (all 4 sides)',
      'Examine where baseboard meets carpet/floor',
      'Look for gaps between baseboard and wall',
      'Check corners carefully',
    ],
  },
  {
    key: 'CURTAINS',
    title: STEPS.CURTAINS,
    instruction: INSTRUCTIONS.CURTAINS,
    tips: ['Check all pleats', 'Examine hem and bottom edge'],
    checklistItems: [
      'Check all pleats and folds',
      'Examine hem and bottom edge',
      'Look at rod/mounting attachments',
      'Check where curtains touch floor',
    ],
  },
  {
    key: 'LUGGAGE_RACK',
    title: STEPS.LUGGAGE_RACK,
    instruction: INSTRUCTIONS.LUGGAGE_RACK,
    tips: ['Check strap attachments', 'Examine joints', 'Look at underside'],
    checklistItems: [
      'Check strap attachments',
      'Examine joints and connections',
      'Look at underside',
      'Check folding mechanism',
      'Inspect where rack meets floor',
    ],
  },
  {
    key: 'UPHOLSTERED',
    title: STEPS.UPHOLSTERED,
    instruction: INSTRUCTIONS.UPHOLSTERED,
    tips: ['Check desk chair and any lounge furniture', 'Examine all seams'],
    checklistItems: [
      'Check desk chair seams',
      'Examine any lounge furniture',
      'Look at all seams and piping',
      'Check cushion edges',
      'Inspect underneath if accessible',
    ],
  },
  {
    key: 'CLOSET',
    title: STEPS.CLOSET,
    instruction: INSTRUCTIONS.CLOSET,
    tips: ['Check all corners', 'Examine shelf edges', 'Look at baseboard areas'],
    checklistItems: [
      'Check all 4 corners',
      'Examine shelf edges',
      'Look at baseboard areas',
      'Check door frame and hinges',
      'Inspect hanging rod area',
    ],
  },
];

const LIVING_ROOM_STEPS: StepDef[] = [
  {
    key: 'COUCH_OVERVIEW',
    title: STEPS.COUCH_OVERVIEW,
    instruction: INSTRUCTIONS.COUCH_OVERVIEW,
    tips: ['Include full couch in frame', 'Good lighting helps'],
    checklistItems: [
      'Check top surface and cushions',
      'Examine armrests',
      'Look at back cushions',
      'Check fabric overall appearance',
      'Inspect corners',
    ],
  },
  {
    key: 'COUCH_SEAMS',
    title: STEPS.COUCH_SEAMS,
    instruction: INSTRUCTIONS.COUCH_SEAMS,
    tips: ['Remove cushions if possible', 'Check all piping seams', 'Examine fabric joints'],
    checklistItems: [
      'Remove all cushions and check underneath',
      'Check all piping seams',
      'Examine fabric joints',
      'Look at back panel seams',
      'Check armrest seams',
      'Inspect side panels',
    ],
  },
  {
    key: 'COUCH_UNDERSIDE',
    title: STEPS.COUCH_UNDERSIDE,
    instruction: INSTRUCTIONS.COUCH_UNDERSIDE,
    tips: ['Check lower edge and skirt', 'Examine underside if accessible', 'Look at floor junction'],
    checklistItems: [
      'Check lower edge and skirt',
      'Examine underside if accessible',
      'Look at floor junction',
      'Check where couch meets wall',
      'Inspect corner areas',
    ],
  },
  {
    key: 'CHAIR_SEAMS',
    title: STEPS.CHAIR_SEAMS,
    instruction: INSTRUCTIONS.CHAIR_SEAMS,
    tips: ['Check all upholstered chairs', 'Examine seams and joints'],
    checklistItems: [
      'Check all upholstered chairs',
      'Examine seat seams',
      'Check back seams',
      'Look at armrest seams',
      'Inspect underneath if possible',
    ],
  },
  {
    key: 'BASEBOARDS',
    title: STEPS.BASEBOARDS,
    instruction: INSTRUCTIONS.BASEBOARDS,
    tips: ['Check corners carefully', 'Examine carpet edge junction'],
    checklistItems: [
      'Check all corners carefully',
      'Examine carpet edge junction',
      'Look for gaps between baseboard and wall',
      'Check areas near furniture',
      'Inspect outlet areas (don\'t remove covers)',
    ],
  },
  {
    key: 'CURTAINS',
    title: STEPS.CURTAINS,
    instruction: INSTRUCTIONS.CURTAINS,
    tips: ['Check all pleats', 'Examine hem and bottom edge'],
    checklistItems: [
      'Check all pleats and folds',
      'Examine hem and bottom edge',
      'Look at rod/mounting attachments',
      'Check where curtains touch floor',
      'Inspect curtain tie-backs if present',
    ],
  },
  {
    key: 'RUG_EDGE',
    title: STEPS.RUG_EDGE,
    instruction: INSTRUCTIONS.RUG_EDGE,
    tips: ['Lift rug edge if possible', 'Check nearby baseboards'],
    checklistItems: [
      'Lift rug edge if possible',
      'Check nearby baseboards',
      'Examine rug corners',
      'Look at rug backing',
      'Check where rug meets carpet/floor',
    ],
  },
  {
    key: 'OUTLET_AREA',
    title: STEPS.OUTLET_AREA,
    instruction: INSTRUCTIONS.OUTLET_AREA,
    tips: ['Photograph area around outlets', 'Check nearby baseboards'],
    warning: OUTLET_WARNING,
    checklistItems: [
      'Check area around outlets (don\'t remove covers)',
      'Examine nearby baseboards',
      'Look at switch plates',
      'Check wall gaps near outlets',
      'Inspect corners near electrical',
    ],
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
    checklistItems: createChecklistItems(def.checklistItems),
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

