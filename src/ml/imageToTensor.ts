/**
 * Image to Tensor Conversion
 * Prepares images for YOLO inference
 */

import { ML_CONFIG } from './modelConfig';

export interface ImageData {
  width: number;
  height: number;
  data: Uint8Array; // RGBA pixel data
}

/**
 * Convert image data to normalized tensor for YOLOv8
 * Input: RGBA image data
 * Output: Float32Array in NCHW format, normalized to [0, 1]
 */
export function imageToTensor(
  imageData: ImageData,
  targetSize: number = ML_CONFIG.INPUT_SIZE
): { tensor: Float32Array; scale: { x: number; y: number }; padding: { x: number; y: number } } {
  const { width, height, data } = imageData;
  
  // Calculate letterbox scaling (preserve aspect ratio)
  const scale = Math.min(targetSize / width, targetSize / height);
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);
  
  // Padding to center image
  const padX = Math.floor((targetSize - newWidth) / 2);
  const padY = Math.floor((targetSize - newHeight) / 2);
  
  // Create output tensor (NCHW format: 1 x 3 x 640 x 640)
  const tensorSize = 3 * targetSize * targetSize;
  const tensor = new Float32Array(tensorSize);
  
  // Fill with gray (0.5) for padding
  tensor.fill(0.5);
  
  // Bilinear interpolation and normalization
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      // Source coordinates
      const srcX = x / scale;
      const srcY = y / scale;
      
      // Nearest neighbor for simplicity (can upgrade to bilinear)
      const sx = Math.min(Math.floor(srcX), width - 1);
      const sy = Math.min(Math.floor(srcY), height - 1);
      
      // Source pixel index (RGBA)
      const srcIdx = (sy * width + sx) * 4;
      
      // Destination coordinates with padding
      const dx = x + padX;
      const dy = y + padY;
      
      // Normalize to [0, 1] and place in CHW format
      const r = data[srcIdx] / 255.0;
      const g = data[srcIdx + 1] / 255.0;
      const b = data[srcIdx + 2] / 255.0;
      
      // CHW layout: C=0 (R), C=1 (G), C=2 (B)
      tensor[0 * targetSize * targetSize + dy * targetSize + dx] = r;
      tensor[1 * targetSize * targetSize + dy * targetSize + dx] = g;
      tensor[2 * targetSize * targetSize + dy * targetSize + dx] = b;
    }
  }
  
  return {
    tensor,
    scale: { x: scale, y: scale },
    padding: { x: padX, y: padY },
  };
}

/**
 * Convert bounding box from model output to original image coordinates
 */
export function boxToOriginalCoords(
  box: { x: number; y: number; width: number; height: number },
  scale: { x: number; y: number },
  padding: { x: number; y: number },
  targetSize: number = ML_CONFIG.INPUT_SIZE
): { x: number; y: number; width: number; height: number } {
  // Remove padding
  const x = box.x - padding.x;
  const y = box.y - padding.y;
  
  // Scale back to original
  return {
    x: x / scale.x,
    y: y / scale.y,
    width: box.width / scale.x,
    height: box.height / scale.y,
  };
}

/**
 * Convert box to normalized coordinates (0-1)
 */
export function boxToNormalized(
  box: { x: number; y: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: box.x / imageWidth,
    y: box.y / imageHeight,
    width: box.width / imageWidth,
    height: box.height / imageHeight,
  };
}

