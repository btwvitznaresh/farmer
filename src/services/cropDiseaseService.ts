/**
 * CropDiseaseService — TensorFlow.js on-device inference
 *
 * Uses a MobileNetV2 model converted to TF.js format.
 * Falls back to the backend vision API when model is not available.
 */
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { DISEASE_LABELS, type DiseaseLabel } from '@/data/diseaseLabels';

const MODEL_URL = '/models/plant_disease/model.json';
const INPUT_SIZE = 224;

export interface ScanResult {
  label: DiseaseLabel;
  confidence: number;        // 0–1
  allPredictions: Array<{ label: DiseaseLabel; confidence: number }>;
  isOffline: boolean;        // true = inferred on-device
}

let cachedModel: tf.GraphModel | null = null;
let modelLoadAttempted = false;

/** Load model once, cache it. Returns null if not available. */
export async function loadDiseaseModel(): Promise<tf.GraphModel | null> {
  if (cachedModel) return cachedModel;
  if (modelLoadAttempted) return null;
  modelLoadAttempted = true;

  try {
    await tf.ready();
    await tf.setBackend('webgl');
    console.log('[CropDisease] Loading model from', MODEL_URL);
    cachedModel = await tf.loadGraphModel(MODEL_URL);
    console.log('[CropDisease] Model loaded ✅');
    return cachedModel;
  } catch (e) {
    console.warn('[CropDisease] Model not available, will use backend API:', e);
    return null;
  }
}

/** Preprocess an HTMLImageElement or HTMLCanvasElement to a tensor */
function preprocessImage(source: HTMLImageElement | HTMLCanvasElement): tf.Tensor4D {
  return tf.tidy(() => {
    const img = tf.browser.fromPixels(source);
    const resized = tf.image.resizeBilinear(img, [INPUT_SIZE, INPUT_SIZE]);
    const normalized = resized.div(255.0);
    return normalized.expandDims(0) as tf.Tensor4D;
  });
}

/** Run on-device inference */
export async function classifyImage(
  source: HTMLImageElement | HTMLCanvasElement
): Promise<ScanResult | null> {
  const model = await loadDiseaseModel();

  if (model) {
    return runLocalInference(model, source);
  }
  return null; // caller should try backend
}

async function runLocalInference(
  model: tf.GraphModel,
  source: HTMLImageElement | HTMLCanvasElement
): Promise<ScanResult> {
  const tensor = preprocessImage(source);

  const start = performance.now();
  const rawOutput = model.predict(tensor) as tf.Tensor;
  const probabilities = await rawOutput.data();
  const elapsed = performance.now() - start;
  console.log(`[CropDisease] Inference: ${elapsed.toFixed(0)}ms`);

  tensor.dispose();
  rawOutput.dispose();

  const allPredictions = DISEASE_LABELS.map((label, i) => ({
    label,
    confidence: probabilities[i] ?? 0,
  })).sort((a, b) => b.confidence - a.confidence);

  const top = allPredictions[0];
  return {
    label: top.label,
    confidence: top.confidence,
    allPredictions: allPredictions.slice(0, 5),
    isOffline: true,
  };
}

/** Scan history — stored in localStorage, last 20 scans */
export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  cropName: string;
  diseaseName: string;
  severity: string;
  confidence: number;
  isHealthy: boolean;
  imageDataUrl?: string;   // thumbnail
  language: string;
}

const HISTORY_KEY = 'agro_scan_history';

export function saveScanToHistory(item: ScanHistoryItem): void {
  try {
    const existing = getScanHistory();
    const updated = [item, ...existing].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch { /* storage full — ignore */ }
}

export function getScanHistory(): ScanHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

export function clearScanHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

/** Capture a canvas snapshot from a video element */
export function captureVideoFrame(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || INPUT_SIZE;
  canvas.height = video.videoHeight || INPUT_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}
