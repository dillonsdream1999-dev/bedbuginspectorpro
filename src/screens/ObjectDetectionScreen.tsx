/**
 * Object Detection Screen
 * Uses TensorFlow.js + COCO-SSD for on-device furniture detection
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Button } from '../components/Button';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { RootStackParamList } from '../types';
import { COPY } from '../constants/copy';

type Props = NativeStackScreenProps<RootStackParamList, 'ObjectDetection'>;

// Map COCO-SSD classes to our inspection zones
const FURNITURE_MAPPING: Record<string, { zone: string; tips: string[] }> = {
  bed: {
    zone: 'Bed Area',
    tips: ['Check mattress seams', 'Inspect bed frame joints', 'Look behind headboard'],
  },
  couch: {
    zone: 'Couch/Sofa',
    tips: ['Check cushion seams', 'Inspect under cushions', 'Examine frame joints'],
  },
  sofa: {
    zone: 'Couch/Sofa',
    tips: ['Check cushion seams', 'Inspect under cushions', 'Examine frame joints'],
  },
  chair: {
    zone: 'Chair',
    tips: ['Check fabric seams', 'Inspect legs and joints', 'Look under seat'],
  },
  dining_table: {
    zone: 'Table Area',
    tips: ['Check nearby baseboards', 'Inspect table legs'],
  },
  potted_plant: {
    zone: 'Plant Area',
    tips: ['Check nearby baseboards', 'Inspect wall behind'],
  },
  tv: {
    zone: 'Entertainment Area',
    tips: ['Check behind TV', 'Inspect nearby outlets', 'Examine baseboards'],
  },
  laptop: {
    zone: 'Work Area',
    tips: ['Check nearby outlets', 'Inspect desk drawers'],
  },
  book: {
    zone: 'Bookshelf Area',
    tips: ['Check behind books', 'Inspect shelf joints'],
  },
  clock: {
    zone: 'Wall Area',
    tips: ['Check behind wall items', 'Inspect nearby outlets'],
  },
  vase: {
    zone: 'Decorative Area',
    tips: ['Check nearby surfaces', 'Inspect baseboards'],
  },
  curtain: {
    zone: 'Curtain/Window',
    tips: ['Check curtain folds', 'Inspect rod mounts', 'Examine window frame'],
  },
};

interface DetectedObject {
  id: string;
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  zone: string;
  tips: string[];
  inspected: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ObjectDetectionScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);

  // Load TensorFlow.js and COCO-SSD model
  useEffect(() => {
    loadModel();
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  const loadModel = async () => {
    try {
      setLoadingStatus('Loading TensorFlow.js...');
      await tf.ready();
      
      setLoadingStatus('Loading object detection model...');
      const loadedModel = await cocoSsd.load({
        base: 'lite_mobilenet_v2', // Lighter model for faster inference
      });
      
      setModel(loadedModel);
      setLoadingStatus('Model ready!');
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load model:', error);
      setLoadingStatus('Failed to load model');
    }
  };

  // Start camera and detection for web
  const startWebDetection = useCallback(async () => {
    if (!model || Platform.OS !== 'web') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        setIsDetecting(true);
        
        // Run detection every 500ms
        detectionInterval.current = setInterval(async () => {
          if (videoRef.current && model && videoRef.current.readyState === 4) {
            const predictions = await model.detect(videoRef.current);
            processDetections(predictions);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  }, [model]);

  const processDetections = (predictions: cocoSsd.DetectedObject[]) => {
    const furnitureDetections: DetectedObject[] = [];
    
    predictions.forEach((pred, index) => {
      const className = pred.class.toLowerCase();
      const mapping = FURNITURE_MAPPING[className];
      
      // Only include furniture-related objects or add generic zones
      if (mapping || pred.score > 0.5) {
        const existingIndex = furnitureDetections.findIndex(
          (d) => d.class === className
        );
        
        if (existingIndex === -1) {
          furnitureDetections.push({
            id: `${className}-${index}`,
            class: className,
            score: pred.score,
            bbox: pred.bbox as [number, number, number, number],
            zone: mapping?.zone || `${className.charAt(0).toUpperCase() + className.slice(1)} Area`,
            tips: mapping?.tips || ['Inspect this area for signs of activity'],
            inspected: false,
          });
        }
      }
    });

    setDetectedObjects((prev) => {
      // Merge with existing detections, keeping inspected state
      const merged = [...prev];
      furnitureDetections.forEach((newDet) => {
        const existingIndex = merged.findIndex((d) => d.class === newDet.class);
        if (existingIndex === -1) {
          merged.push(newDet);
        } else {
          // Update bbox but keep inspected state
          merged[existingIndex] = {
            ...newDet,
            inspected: merged[existingIndex].inspected,
          };
        }
      });
      return merged;
    });
  };

  const handleObjectTap = (obj: DetectedObject) => {
    setSelectedObject(obj);
  };

  const handleMarkInspected = () => {
    if (selectedObject) {
      setDetectedObjects((prev) =>
        prev.map((obj) =>
          obj.id === selectedObject.id ? { ...obj, inspected: true } : obj
        )
      );
      setSelectedObject(null);
    }
  };

  const handleComplete = () => {
    setScanComplete(true);
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
  };

  const handleContactExpert = () => {
    navigation.navigate('LeadFlow', {});
  };

  // Permission check
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={48} color={colors.textMuted} />
        <Text style={styles.permissionText}>
          Camera permission is required for object detection.
        </Text>
        <Button
          title="Grant Permission"
          onPress={requestPermission}
          variant="primary"
          size="medium"
        />
      </SafeAreaView>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>{loadingStatus}</Text>
        <Text style={styles.loadingSubtext}>
          This may take a moment on first load...
        </Text>
      </SafeAreaView>
    );
  }

  // Scan complete
  if (scanComplete) {
    const inspectedCount = detectedObjects.filter((o) => o.inspected).length;
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <View style={styles.completeIcon}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={styles.completeTitle}>Scan Complete</Text>
          <Text style={styles.completeText}>
            Detected {detectedObjects.length} areas • Inspected {inspectedCount}
          </Text>
          
          <View style={styles.detectedList}>
            {detectedObjects.map((obj) => (
              <View key={obj.id} style={styles.detectedItem}>
                <Ionicons
                  name={obj.inspected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={obj.inspected ? colors.success : colors.textMuted}
                />
                <Text style={styles.detectedItemText}>{obj.zone}</Text>
              </View>
            ))}
          </View>

          <View style={styles.ctaContainer}>
            <Text style={styles.ctaSupporting}>{COPY.CTA_SUPPORTING}</Text>
            <Button
              title={COPY.CTA_BUTTON}
              onPress={handleContactExpert}
              variant="primary"
              size="large"
            />
            <Text style={styles.disclaimer}>{COPY.CTA_DISCLAIMER}</Text>
          </View>

          <Button
            title="New Scan"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="medium"
            style={{ marginTop: spacing.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Web camera view
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cameraContainer}>
          {/* Video element for web */}
          <video
            ref={videoRef as any}
            style={styles.webVideo as any}
            autoPlay
            playsInline
            muted
          />
          
          {/* Detection overlay */}
          <View style={styles.overlay}>
            {/* Bounding boxes */}
            {detectedObjects.map((obj) => (
              <TouchableOpacity
                key={obj.id}
                style={[
                  styles.boundingBox,
                  {
                    left: obj.bbox[0],
                    top: obj.bbox[1],
                    width: obj.bbox[2],
                    height: obj.bbox[3],
                    borderColor: obj.inspected ? colors.success : colors.accent,
                  },
                ]}
                onPress={() => handleObjectTap(obj)}
              >
                <View
                  style={[
                    styles.labelContainer,
                    { backgroundColor: obj.inspected ? colors.success : colors.accent },
                  ]}
                >
                  <Text style={styles.labelText}>
                    {obj.zone} {obj.inspected && '✓'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Top controls */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: isDetecting ? colors.success : colors.warning }]} />
              <Text style={styles.statusText}>
                {isDetecting ? `${detectedObjects.length} objects detected` : 'Starting...'}
              </Text>
            </View>
          </View>

          {/* Start button */}
          {!isDetecting && (
            <View style={styles.startContainer}>
              <Button
                title="Start AI Detection"
                onPress={startWebDetection}
                variant="primary"
                size="large"
                icon={<Ionicons name="scan" size={20} color={colors.textDark} />}
              />
              <Text style={styles.startHint}>
                Point camera at furniture to detect hiding spots
              </Text>
            </View>
          )}

          {/* Bottom controls */}
          {isDetecting && (
            <View style={styles.bottomBar}>
              <Text style={styles.instructionText}>
                Tap highlighted areas to see inspection tips
              </Text>
              <Button
                title={`Complete Scan (${detectedObjects.filter((o) => o.inspected).length}/${detectedObjects.length})`}
                onPress={handleComplete}
                variant="primary"
                size="large"
              />
            </View>
          )}
        </View>

        {/* Object detail modal */}
        {selectedObject && (
          <View style={styles.detailOverlay}>
            <TouchableOpacity
              style={styles.detailBackdrop}
              onPress={() => setSelectedObject(null)}
            />
            <View style={styles.detailSheet}>
              <View style={styles.detailHandle} />
              <Text style={styles.detailTitle}>{selectedObject.zone}</Text>
              <Text style={styles.detailConfidence}>
                Confidence: {Math.round(selectedObject.score * 100)}%
              </Text>
              
              <Text style={styles.tipsHeader}>Where to Check:</Text>
              {selectedObject.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons name="search" size={16} color={colors.accent} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}

              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={20} color={colors.warning} />
                <Text style={styles.warningText}>{COPY.OUTLET_WARNING}</Text>
              </View>

              <Button
                title={selectedObject.inspected ? '✓ Inspected' : 'Mark as Inspected'}
                onPress={handleMarkInspected}
                variant={selectedObject.inspected ? 'secondary' : 'primary'}
                size="large"
                disabled={selectedObject.inspected}
              />

              <View style={styles.detailCTA}>
                <Button
                  title={COPY.CTA_BUTTON}
                  onPress={handleContactExpert}
                  variant="outline"
                  size="medium"
                />
                <Text style={styles.disclaimer}>{COPY.CTA_DISCLAIMER}</Text>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Mobile camera (fallback to checklist for now)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mobileContainer}>
        <Ionicons name="phone-portrait-outline" size={48} color={colors.textMuted} />
        <Text style={styles.mobileText}>
          AI object detection works best in web browser.
        </Text>
        <Text style={styles.mobileSubtext}>
          Use the guided checklist for mobile devices.
        </Text>
        <Button
          title="Use Guided Checklist"
          onPress={() => navigation.goBack()}
          variant="primary"
          size="large"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  permissionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  loadingSubtext: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  webVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: borderRadius.sm,
  },
  labelContainer: {
    position: 'absolute',
    top: -24,
    left: -2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  labelText: {
    ...typography.small,
    color: colors.textDark,
    fontWeight: '600',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.overlay,
    paddingTop: Platform.OS === 'web' ? spacing.lg : 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  startContainer: {
    position: 'absolute',
    top: '50%',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    transform: [{ translateY: -50 }],
  },
  startHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 40,
    gap: spacing.md,
  },
  instructionText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  detailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  detailBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlayLight,
  },
  detailSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: 40,
  },
  detailHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  detailTitle: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  detailConfidence: {
    ...typography.caption,
    color: colors.success,
    marginBottom: spacing.lg,
  },
  tipsHeader: {
    ...typography.bodyBold,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  warningText: {
    ...typography.caption,
    color: colors.warning,
    flex: 1,
  },
  detailCTA: {
    marginTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  disclaimer: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  completeContainer: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  completeTitle: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  completeText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  detectedList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.xl,
  },
  detectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  detectedItemText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  ctaContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  ctaSupporting: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mobileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  mobileText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  mobileSubtext: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

