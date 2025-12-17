/**
 * Photo Scan Store - Zustand state management with Supabase persistence
 */

import { create } from 'zustand';
import { PhotoScanSession, RoomType, PinStatus, StepStatus, SessionSummary } from './models';
import { getStepsForRoomType, getCommonMisses } from './stepDefinitions';
import uuid from 'react-native-uuid';
import {
  createScanSession,
  saveStepWithPhoto,
  completeScanSession,
} from '../../services/scanService';

interface PhotoScanState {
  session: PhotoScanSession | null;

  // Actions
  startSession: (roomType: RoomType) => void;
  setStepPhoto: (stepId: string, photoUri: string, width?: number, height?: number) => void;
  updatePinStatus: (stepId: string, pinId: string, status: PinStatus) => void;
  markStepReviewed: (stepId: string) => void;
  nextStep: () => boolean; // returns true if moved, false if at end
  previousStep: () => void;
  goToStep: (index: number) => void;
  completeSession: () => SessionSummary;
  resetSession: () => void;

  // Selectors
  getCurrentStep: () => PhotoScanSession['steps'][0] | null;
  getProgress: () => { current: number; total: number; percent: number };
}

export const usePhotoScanStore = create<PhotoScanState>((set, get) => ({
  session: null,

  startSession: (roomType: RoomType) => {
    const steps = getStepsForRoomType(roomType);
    const session: PhotoScanSession = {
      id: uuid.v4() as string,
      roomType,
      startedAt: new Date(),
      currentStepIndex: 0,
      steps,
    };
    set({ session });

    // Persist to Supabase (async, non-blocking)
    createScanSession(session).then((result) => {
      if (!result.success) {
        console.warn('Failed to save session to database:', result.error);
      }
    });
  },

  setStepPhoto: (stepId: string, photoUri: string, width?: number, height?: number) => {
    set((state) => {
      if (!state.session) return state;

      const updatedSteps = state.session.steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              photoUri,
              photoWidth: width,
              photoHeight: height,
              status: 'captured' as StepStatus,
            }
          : step
      );

      return {
        session: { ...state.session, steps: updatedSteps },
      };
    });
  },

  updatePinStatus: (stepId: string, pinId: string, status: PinStatus) => {
    set((state) => {
      if (!state.session) return state;

      const updatedSteps = state.session.steps.map((step) => {
        if (step.id !== stepId) return step;

        const updatedPins = step.pins.map((pin) =>
          pin.id === pinId ? { ...pin, status } : pin
        );

        return { ...step, pins: updatedPins };
      });

      return {
        session: { ...state.session, steps: updatedSteps },
      };
    });
  },

  markStepReviewed: (stepId: string) => {
    const { session } = get();
    
    set((state) => {
      if (!state.session) return state;

      const updatedSteps = state.session.steps.map((step) =>
        step.id === stepId ? { ...step, status: 'reviewed' as StepStatus } : step
      );

      return {
        session: { ...state.session, steps: updatedSteps },
      };
    });

    // Persist step to Supabase (async, non-blocking)
    if (session) {
      const step = session.steps.find((s) => s.id === stepId);
      if (step) {
        const reviewedStep = { ...step, status: 'reviewed' as StepStatus };
        saveStepWithPhoto(session.id, reviewedStep).then((result) => {
          if (!result.success) {
            console.warn('Failed to save step to database:', result.error);
          }
        });
      }
    }
  },

  nextStep: () => {
    const { session } = get();
    if (!session) return false;

    if (session.currentStepIndex < session.steps.length - 1) {
      set({
        session: {
          ...session,
          currentStepIndex: session.currentStepIndex + 1,
        },
      });
      return true;
    }
    return false;
  },

  previousStep: () => {
    const { session } = get();
    if (!session) return;

    if (session.currentStepIndex > 0) {
      set({
        session: {
          ...session,
          currentStepIndex: session.currentStepIndex - 1,
        },
      });
    }
  },

  goToStep: (index: number) => {
    const { session } = get();
    if (!session) return;

    if (index >= 0 && index < session.steps.length) {
      set({
        session: { ...session, currentStepIndex: index },
      });
    }
  },

  completeSession: () => {
    const { session } = get();
    if (!session) {
      return { totalSteps: 0, completedSteps: 0, concernedPins: 0, photosCount: 0, commonMisses: [] };
    }

    const completedSteps = session.steps.filter((s) => s.status === 'reviewed').length;
    const photosCount = session.steps.filter((s) => s.photoUri).length;

    let concernedPins = 0;
    session.steps.forEach((step) => {
      step.pins.forEach((pin) => {
        if (pin.status === 'concerned') concernedPins++;
      });
    });

    set({
      session: { ...session, endedAt: new Date() },
    });

    const summary = {
      totalSteps: session.steps.length,
      completedSteps,
      concernedPins,
      photosCount,
      commonMisses: getCommonMisses(session.roomType),
    };

    // Persist completion to Supabase (async, non-blocking)
    completeScanSession(session.id, {
      totalSteps: summary.totalSteps,
      completedSteps: summary.completedSteps,
      concernedPins: summary.concernedPins,
      photosCount: summary.photosCount,
    }).then((result) => {
      if (!result.success) {
        console.warn('Failed to complete session in database:', result.error);
      }
    });

    return summary;
  },

  resetSession: () => {
    set({ session: null });
  },

  getCurrentStep: () => {
    const { session } = get();
    if (!session) return null;
    return session.steps[session.currentStepIndex] || null;
  },

  getProgress: () => {
    const { session } = get();
    if (!session) return { current: 0, total: 0, percent: 0 };

    const total = session.steps.length;
    const current = session.currentStepIndex + 1;
    const percent = (current / total) * 100;

    return { current, total, percent };
  },
}));

