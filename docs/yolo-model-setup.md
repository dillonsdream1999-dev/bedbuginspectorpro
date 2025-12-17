# YOLO Model Setup for HarborCheck

This document explains how to set up on-device YOLOv8 object detection to enhance pin placement in the photo scan workflow.

## Overview

HarborCheck can optionally use YOLOv8 object detection to identify furniture (bed, couch, chair, etc.) in photos and automatically place inspection pins around detected objects. This is **completely optional** - the app works perfectly with rule-based pins when no model is available.

## Requirements

- **Model file**: YOLOv8n trained on COCO dataset, exported to ONNX format
- **File location**: `assets/models/yolov8n-coco.onnx`
- **Recommended model**: YOLOv8n (nano) for best mobile performance

## COCO Classes Used

The COCO dataset includes classes relevant for bed bug inspection:

| Class ID | Name | Usage |
|----------|------|-------|
| 59 | bed | Bed corner/edge pins |
| 57 | couch | Arm seam and cushion pins |
| 56 | chair | Seat and back joint pins |
| 60 | dining table | Can represent nightstand |
| 28 | suitcase | Luggage rack area pins |

**Note**: Bed skirt, nightstand, and baseboards are NOT in COCO. These are handled by step-based rule templates.

## How to Export YOLOv8 to ONNX

### Prerequisites

```bash
pip install ultralytics onnx onnxruntime
```

### Export Command

```python
from ultralytics import YOLO

# Load pretrained YOLOv8n
model = YOLO('yolov8n.pt')

# Export to ONNX
model.export(
    format='onnx',
    imgsz=640,
    simplify=True,
    opset=12,  # Compatible with ONNX Runtime Mobile
    dynamic=False,  # Fixed input size for mobile
)
```

This creates `yolov8n.onnx` (~13MB).

### Alternative: Download Pre-exported

You can download pre-exported ONNX models from:
- Ultralytics GitHub releases
- ONNX Model Zoo

Rename the file to `yolov8n-coco.onnx`.

## Installation Steps

1. **Obtain the model file** (export or download)

2. **Place in the app**:
   ```
   HarborCheckExpo/
   └── assets/
       └── models/
           └── yolov8n-coco.onnx   ← Place here
   ```

3. **Enable the feature flag** in `src/ml/modelConfig.ts`:
   ```typescript
   export const ML_CONFIG = {
     ENABLE_YOLO_ASSIST: true,  // Change to true
     // ...
   };
   ```

4. **Update metro.config.js** to bundle .onnx files:
   ```javascript
   const { getDefaultConfig } = require('expo/metro-config');
   
   const config = getDefaultConfig(__dirname);
   config.resolver.assetExts.push('onnx');
   
   module.exports = config;
   ```

5. **Rebuild the app**:
   ```bash
   npx expo start --clear
   ```

## How It Works

### Detection Flow

```
Photo Captured
     ↓
[YOLO Enabled?] ─No→ Use Rule-Based Pins
     ↓ Yes
[Model Loaded?] ─No→ Use Rule-Based Pins
     ↓ Yes
Run ONNX Inference
     ↓
Parse Detections (NMS)
     ↓
Filter Relevant Classes (bed/couch/chair)
     ↓
Generate Pins Around Detected Objects
     ↓
Enforce Pin Limits (2-6 per step)
```

### Fallback Behavior

- If `ENABLE_YOLO_ASSIST` is `false`: Skip model load entirely
- If model file not found: Log warning, use rule-based pins
- If inference fails: Catch error, use rule-based pins
- If no relevant objects detected: Use rule-based pins

**The app never crashes due to missing ML support.**

## Pin Placement Heuristics

When objects are detected, pins are placed using these rules:

### Bed Detection
- 2 pins at headboard corners (top left/right of bbox)
- 2 pins at side edges (middle left/right)

### Couch Detection
- 2 pins at arm seams (left/right upper)
- 1 pin at cushion junction (center)
- 1 pin at lower skirt edge (bottom center)

### Chair Detection
- 2 pins at seat seams (left/right)
- 1 pin at back joint (top center)

### Pin Density Limits

| Step Type | Max Pins |
|-----------|----------|
| Default | 4 |
| Bed/Mattress steps | 6 |
| Mattress Seams | 1 + instruction |

## Troubleshooting

### Model not loading

Check the console for `[YOLO]` log messages:

```
[YOLO] Feature disabled, skipping model load
[YOLO] Model file not found at assets/models/yolov8n-coco.onnx
[YOLO] Loading model from: file:///...
[YOLO] Model loaded successfully
```

### Inference too slow

- Use YOLOv8n (nano) not larger variants
- Reduce input size in `modelConfig.ts` (e.g., 320 instead of 640)
- Consider running inference after photo capture, not in real-time

### Build errors

Ensure ONNX Runtime is installed:
```bash
npm install onnxruntime-react-native
```

For iOS, you may need to add to Podfile:
```ruby
pod 'onnxruntime-react-native', :path => '../node_modules/onnxruntime-react-native'
```

## Performance Expectations

| Device | YOLOv8n @ 640px | Notes |
|--------|-----------------|-------|
| iPhone 12+ | ~50-100ms | Excellent |
| iPhone 8-11 | ~100-200ms | Good |
| Android (Snapdragon 8) | ~80-150ms | Good |
| Android (mid-range) | ~200-400ms | Acceptable |

## Development Tips

1. **Test without model first**: Set `ENABLE_YOLO_ASSIST: false` and verify rule-based pins work correctly.

2. **Add model gradually**: Enable YOLO and test with various photos to tune thresholds.

3. **Adjust thresholds**: In `modelConfig.ts`:
   ```typescript
   CONFIDENCE_THRESHOLD: 0.45,  // Lower = more detections
   IOU_THRESHOLD: 0.5,          // Lower = fewer overlapping boxes
   ```

4. **Debug detections**: Add logging in `PhotoPinPlacementEngine.ts` to see what's detected.

## License Notes

- YOLOv8 models are available under AGPL-3.0 license
- COCO dataset is free for research and commercial use
- ONNX Runtime is MIT licensed

For commercial use, consider training on your own dataset or using a commercially-licensed model.

