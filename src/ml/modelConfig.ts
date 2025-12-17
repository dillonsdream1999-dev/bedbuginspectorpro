/**
 * YOLO Model Configuration
 */

// Feature flag - set via app config or environment
export const ML_CONFIG = {
  // Enable/disable YOLO assistance
  ENABLE_YOLO_ASSIST: false, // Set to true when model file is available
  
  // Model input configuration (YOLOv8n defaults)
  INPUT_SIZE: 640,
  INPUT_NAME: 'images',
  OUTPUT_NAME: 'output0',
  
  // Detection thresholds
  CONFIDENCE_THRESHOLD: 0.45,
  IOU_THRESHOLD: 0.5,
  
  // Model file path (relative to assets)
  MODEL_PATH: 'models/yolov8n-coco.onnx',
  
  // Classes relevant for bed bug inspection (COCO class IDs)
  RELEVANT_CLASSES: {
    59: 'bed',
    57: 'couch', 
    56: 'chair',
    60: 'dining table', // can be nightstand
    58: 'potted plant', // near curtains
  },
  
  // Pin density limits per step type
  PIN_LIMITS: {
    DEFAULT_MIN: 2,
    DEFAULT_MAX: 4,
    BED_MATTRESS_MAX: 6,
    SINGLE_CORNER_STEPS: ['MATTRESS_SEAMS'], // Show 1 pin + instruction
  },
};

// Check if YOLO is enabled
export function isYoloEnabled(): boolean {
  return ML_CONFIG.ENABLE_YOLO_ASSIST;
}

