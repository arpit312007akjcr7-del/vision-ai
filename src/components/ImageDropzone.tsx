import React, { useRef, useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Camera,
  X,
  FileCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { SAMPLE_IMAGES, SampleImage } from "../data/sampleImages.ts";
import { InspectionDomain } from "../types/vision.ts";

interface ImageDropzoneProps {
  onImageSelected: (base64OrUrl: string, fileInfo?: { name: string; size: number; mime: string }) => void;
  selectedImageUrl: string | null;
  onClear: () => void;
  selectedDomain: InspectionDomain;
  onSelectSampleImage?: (sample: SampleImage) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageSelected,
  selectedImageUrl,
  onClear,
  selectedDomain,
  onSelectSampleImage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string; dimensions?: string } | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    setErrorMessage(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage(`Unsupported format: ${file.type}. Please upload PNG, JPEG, or WEBP.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const mbSize = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`File exceeds 10MB limit (${mbSize} MB). Please choose a smaller visual asset.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setFileDetails({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
        });
        onImageSelected(result, {
          name: file.name,
          size: file.size,
          mime: file.type,
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Live Camera Frame Capture
  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setIsWebcamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setErrorMessage("Camera access denied or unavailable: " + err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

    setFileDetails({
      name: `live_frame_${Date.now()}.jpg`,
      size: "Live Frame Grab",
      dimensions: `${canvas.width} × ${canvas.height} px`,
    });

    stopCamera();
    onImageSelected(dataUrl, {
      name: `live_frame_${Date.now()}.jpg`,
      size: dataUrl.length,
      mime: "image/jpeg",
    });
  };

  const handleSelectSample = (sample: SampleImage) => {
    setErrorMessage(null);
    setFileDetails({
      name: `${sample.title} (Enterprise Preset)`,
      size: "Cloud Asset",
      dimensions: "1200 × 800 px (Normalized)",
    });
    if (onSelectSampleImage) {
      onSelectSampleImage(sample);
    } else {
      onImageSelected(sample.url, {
        name: sample.title,
        size: 0,
        mime: "image/jpeg",
      });
    }
  };

  const handleClearImage = () => {
    stopCamera();
    setFileDetails(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClear();
  };

  return (
    <div className="space-y-4">
      {/* Upload Box / Preview */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all ${
          isDragging
            ? "border-cyan-400 bg-cyan-950/20"
            : selectedImageUrl
            ? "border-slate-700 bg-slate-900/60"
            : "border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileInput}
        />

        {isWebcamActive ? (
          <div className="relative p-4 flex flex-col items-center">
            <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-lg bg-black border border-slate-700 shadow-xl">
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && streamRef.current && !el.srcObject) {
                    el.srcObject = streamRef.current;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded bg-rose-500/80 px-2 py-0.5 text-[11px] font-mono text-white">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                LIVE FEED
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={captureFrame}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500"
              >
                <Camera className="h-4 w-4" />
                Capture Frame
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : selectedImageUrl ? (
          <div className="relative group p-4">
            <div className="relative max-h-64 w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
              <img
                src={selectedImageUrl}
                alt="Selected inspection asset"
                className="max-h-64 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
              <button
                type="button"
                onClick={handleClearImage}
                title="Remove image"
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-slate-300 hover:text-white hover:bg-rose-600 transition-colors border border-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {fileDetails && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300 truncate max-w-xs">
                  <FileCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{fileDetails.name}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  {fileDetails.dimensions && <span>{fileDetails.dimensions}</span>}
                  <span>{fileDetails.size}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3 shadow-inner">
              <Upload className="h-7 w-7 animate-pulse" />
            </div>

            <p className="text-sm font-medium text-slate-200">
              Drag & drop visual asset here, or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-cyan-400 underline decoration-cyan-500/40 underline-offset-2 hover:text-cyan-300"
              >
                browse files
              </button>
            </p>
            <p className="mt-1 text-xs text-slate-500 font-mono">
              Supports PNG, JPEG, WEBP up to 10MB • Auto-normalized coordinates
            </p>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              >
                <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                Select File
              </button>
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              >
                <Camera className="h-3.5 w-3.5 text-cyan-400" />
                Camera Snap
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1-Click Enterprise Test Assets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            1-Click Benchmark Test Assets
          </span>
          <span className="text-[11px] text-slate-500">Instant evaluation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_IMAGES.map((sample) => {
            const isDomainMatch = sample.domain === selectedDomain;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`group relative overflow-hidden rounded-lg border p-1.5 text-left transition-all hover:border-cyan-500/60 ${
                  isDomainMatch
                    ? "border-indigo-500/40 bg-indigo-950/20"
                    : "border-slate-800 bg-slate-900/40"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded bg-slate-950">
                  <img
                    src={sample.url}
                    alt={sample.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {isDomainMatch && (
                    <span className="absolute top-1 right-1 rounded bg-indigo-600/90 px-1 py-0.5 text-[9px] font-mono text-white">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="mt-1.5">
                  <div className="truncate text-[11px] font-medium text-slate-200 group-hover:text-cyan-300">
                    {sample.title}
                  </div>
                  <div className="truncate text-[10px] text-slate-500 font-mono">
                    {sample.domain.split(" ")[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
