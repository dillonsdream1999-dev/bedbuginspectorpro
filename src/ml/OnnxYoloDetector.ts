/**
 * ONNX YOLO Detector
 * On-device object detection using ONNX Runtime
 */

import { ML_CONFIG, isYoloEnabled } from './modelConfig';
import { imageToTensor, ImageData } from './imageToTensor';
import { parseYoloOutput, Detection } from './yoloPostprocess';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// ONNX Runtime types (will be imported when available)
let InferenceSession: any = null;
let Tensor: any = null;

// Singleton instance
let detectorInstance: OnnxYoloDetector | null = null;

export class OnnxYoloDetector {
  private session: any = null;
  private isLoaded: boolean = false;
  private loadError: string | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): OnnxYoloDetector {
    if (!detectorInstance) {
      detectorInstance = new OnnxYoloDetector();
    }
    return detectorInstance;
  }

  /**
   * Check if detector is ready
   */
  isReady(): boolean {
    return this.isLoaded && this.session !== null;
  }

  /**
   * Get load error if any
   */
  getError(): string | null {
    return this.loadError;
  }

  /**
   * Initialize the detector by loading the ONNX model
   */
  async initialize(): Promise<boolean> {
    // Check feature flag
    if (!isYoloEnabled()) {
      console.log('[YOLO] Feature disabled, skipping model load');
      return false;
    }

    // Already loaded
    if (this.isLoaded) {
      return this.session !== null;
    }

    try {
      // Dynamically import ONNX Runtime
      const onnx = await import('onnxruntime-react-native');
      InferenceSession = onnx.InferenceSession;
      Tensor = onnx.Tensor;

      // Load model file
      const modelPath = await this.getModelPath();
      
      if (!modelPath) {
        this.loadError = 'Model file not found';
        console.warn('[YOLO] Model file not found at assets/models/yolov8n-coco.onnx');
        this.isLoaded = true;
        return false;
      }

      console.log('[YOLO] Loading model from:', modelPath);
      
      // Create inference session
      this.session = await InferenceSession.create(modelPath);
      
      console.log('[YOLO] Model loaded successfully');
      console.log('[YOLO] Input names:', this.session.inputNames);
      console.log('[YOLO] Output names:', this.session.outputNames);
      
      this.isLoaded = true;
      this.loadError = null;
      return true;
      
    } catch (error) {
      this.loadError = String(error);
      console.warn('[YOLO] Failed to load model:', error);
      this.isLoaded = true;
      return false;
    }
  }

  /**
   * Get the model file path
   */
  private async getModelPath(): Promise<string | null> {
    try {
      // Try to load from assets
      const asset = Asset.fromModule(require('../../assets/models/yolov8n-coco.onnx'));
      await asset.downloadAsync();
      
      if (asset.localUri) {
        return asset.localUri;
      }
      
      return null;
    } catch (error) {
      // Model file doesn't exist
      console.log('[YOLO] Model asset not found:', error);
      return null;
    }
  }

  /**
   * Run detection on an image
   */
  async detect(imageData: ImageData): Promise<Detection[]> {
    // Check if ready
    if (!this.isReady()) {
      console.log('[YOLO] Detector not ready, returning empty detections');
      return [];
    }

    try {
      // Convert image to tensor
      const { tensor, scale, padding } = imageToTensor(imageData);
      
      // Create input tensor
      const inputTensor = new Tensor('float32', tensor, [1, 3, ML_CONFIG.INPUT_SIZE, ML_CONFIG.INPUT_SIZE]);
      
      // Run inference
      const feeds: Record<string, any> = {};
      feeds[ML_CONFIG.INPUT_NAME] = inputTensor;
      
      const results = await this.session.run(feeds);
      
      // Get output tensor
      const output = results[ML_CONFIG.OUTPUT_NAME];
      
      if (!output || !output.data) {
        console.warn('[YOLO] No output from model');
        return [];
      }
      
      // Parse output
      const detections = parseYoloOutput(
        output.data as Float32Array,
        imageData.width,
        imageData.height,
        scale,
        padding,
        ML_CONFIG.CONFIDENCE_THRESHOLD,
        ML_CONFIG.IOU_THRESHOLD,
        true // filter to relevant classes only
      );
      
      console.log(`[YOLO] Detected ${detections.length} relevant objects`);
      
      return detections;
      
    } catch (error) {
      console.error('[YOLO] Detection failed:', error);
      return [];
    }
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    if (this.session) {
      // ONNX Runtime sessions don't need explicit disposal in JS
      this.session = null;
    }
    this.isLoaded = false;
  }
}

/**
 * Convenience function to run detection
 */
export async function detectObjects(imageData: ImageData): Promise<Detection[]> {
  const detector = OnnxYoloDetector.getInstance();
  
  // Initialize if needed
  if (!detector.isReady()) {
    await detector.initialize();
  }
  
  return detector.detect(imageData);
}

/**
 * Check if YOLO detection is available
 */
export function isYoloAvailable(): boolean {
  if (!isYoloEnabled()) return false;
  
  const detector = OnnxYoloDetector.getInstance();
  return detector.isReady();
}

