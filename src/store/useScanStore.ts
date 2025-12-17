/**
 * Scan State Management with Zustand
 */

import { create } from 'zustand';
import { ChecklistItem, RoomType, ScanSession, ChecklistItemStatus } from '../types';
import uuid from 'react-native-uuid';
import { COPY } from '../constants/copy';

interface ScanState {
  currentSession: ScanSession | null;
  
  // Actions
  startSession: (roomType: RoomType) => void;
  updateItemStatus: (itemId: string, status: ChecklistItemStatus) => void;
  setItemPhoto: (itemId: string, photoUri: string) => void;
  completeSession: () => void;
  resetSession: () => void;
}

function generateChecklist(roomType: RoomType): ChecklistItem[] {
  const baseItems: ChecklistItem[] = [
    {
      id: uuid.v4() as string,
      key: 'baseboard_1',
      title: 'Baseboard - Section 1',
      description: 'Check where baseboard meets floor. Look for dark spots or eggs.',
      status: 'unchecked',
    },
    {
      id: uuid.v4() as string,
      key: 'baseboard_2',
      title: 'Baseboard - Section 2',
      description: 'Continue along baseboard. Check for gaps or cracks.',
      status: 'unchecked',
    },
    {
      id: uuid.v4() as string,
      key: 'outlet',
      title: 'Electrical Outlets',
      description: 'Look around outlet plates for signs of activity.',
      warning: COPY.OUTLET_WARNING,
      status: 'unchecked',
    },
  ];

  const bedroomItems: ChecklistItem[] = [
    {
      id: uuid.v4() as string,
      key: 'bed_frame_1',
      title: 'Bed Frame - Corner 1',
      description: COPY.PIN_DETAILS.BED_FRAME.signs,
      status: 'unchecked',
    },
    {
      id: uuid.v4() as string,
      key: 'bed_frame_2',
      title: 'Bed Frame - Corner 2',
      description: 'Check second corner. Look for fecal spots or shed skins.',
      status: 'unchecked',
    },
    {
      id: uuid.v4() as string,
      key: 'bed_frame_3',
      title: 'Bed Frame - Corner 3',
      description: 'Check third corner thoroughly.',
      status: 'unchecked',
    },
    {
      id: uuid.v4() as string,
      key: 'bed_frame_4',
      title: 'Bed Frame - Corner 4',
      description: 'Complete bed frame inspection at fourth corner.',
      status: 'unchecked',
    },
    {
      id: uuid.v4() as string,
      key: 'headboard',
      title: 'Headboard',
      description: COPY.PIN_DETAILS.HEADBOARD.signs,
      status: 'unchecked',
    },
    {
      id: uuid.v4() as string,
      key: 'nightstand',
      title: 'Nightstand',
      description: COPY.PIN_DETAILS.NIGHTSTAND.signs,
      status: 'unchecked',
    },
    {
      id: uuid.v4() as string,
      key: 'mattress',
      title: 'Mattress Seams',
      description: 'Check seams, tufts, and folds of the mattress.',
      status: 'unchecked',
    },
  ];

  const livingRoomItems: ChecklistItem[] = [
    {
      id: uuid.v4() as string,
      key: 'couch_cushions',
      title: 'Couch Cushions',
      description: 'Remove cushions. Check seams and underneath.',
      status: 'unchecked',
    },
    {
      id: uuid.v4() as string,
      key: 'couch_frame',
      title: 'Couch Frame',
      description: COPY.PIN_DETAILS.COUCH.signs,
      status: 'unchecked',
    },
    {
      id: uuid.v4() as string,
      key: 'curtains',
      title: 'Curtains',
      description: COPY.PIN_DETAILS.CURTAIN.signs,
      status: 'unchecked',
    },
  ];

  switch (roomType) {
    case 'bedroom':
    case 'hotel':
      return [...bedroomItems, ...baseItems];
    case 'living_room':
      return [...livingRoomItems, ...baseItems];
    default:
      return baseItems;
  }
}

export const useScanStore = create<ScanState>((set, get) => ({
  currentSession: null,

  startSession: (roomType: RoomType) => {
    const session: ScanSession = {
      id: uuid.v4() as string,
      roomType,
      startedAt: new Date(),
      items: generateChecklist(roomType),
    };
    set({ currentSession: session });
  },

  updateItemStatus: (itemId: string, status: ChecklistItemStatus) => {
    set((state) => {
      if (!state.currentSession) return state;
      
      const updatedItems = state.currentSession.items.map((item) =>
        item.id === itemId ? { ...item, status } : item
      );
      
      return {
        currentSession: {
          ...state.currentSession,
          items: updatedItems,
        },
      };
    });
  },

  setItemPhoto: (itemId: string, photoUri: string) => {
    set((state) => {
      if (!state.currentSession) return state;
      
      const updatedItems = state.currentSession.items.map((item) =>
        item.id === itemId ? { ...item, photoUri } : item
      );
      
      return {
        currentSession: {
          ...state.currentSession,
          items: updatedItems,
        },
      };
    });
  },

  completeSession: () => {
    set((state) => {
      if (!state.currentSession) return state;
      
      return {
        currentSession: {
          ...state.currentSession,
          endedAt: new Date(),
        },
      };
    });
  },

  resetSession: () => {
    set({ currentSession: null });
  },
}));

