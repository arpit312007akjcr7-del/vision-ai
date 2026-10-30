import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Eye,
  EyeOff,
  Crosshair,
  Grid,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { DetectedObject, DefectSeverity } from "../types/vision.ts";

interface AnalysisCanvasProps {
  imageUrl: string;
  detectedObjects: DetectedObject[];
  selectedObjectId?: number | string | null;
  onSelectObject?: (index: number | null) => void;
  hoveredIndex?: number | null;
  onHoverIndex?: (index: number | null) => void;
  isAnalyzing?: boolean;
}

export const AnalysisCanvas: React.FC<AnalysisCanvasProps> = ({
  imageUrl,
  detectedObjects = [],
  selectedObjectId,
  onSelectObject,
  hoveredIndex,
  onHoverIndex,
  isAnalyzing = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Canvas Viewport State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showFill, setShowFill] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number; normX: number; normY: number } | null>(null);
  const [internalHover, setInternalHover] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const activeHover = hoveredIndex !== undefined ? hoveredIndex : internalHover;

  // Preload Image
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageElementRef.current = img;
      setImageLoaded(true);
    };
  }, [imageUrl]);

  // Color generator based on severity/category
  const getColorForObject = (obj: DetectedObject, isHovered: boolean, isSelected: boolean) => {
    const sev = obj.severity || "normal";
    const labelLower = obj.label.toLowerCase();
    const isDefect =
      sev === "critical" ||
      sev === "high" ||
      labelLower.includes("defect") ||
      labelLower.includes("anomaly") ||
      labelLower.includes("bridge") ||
      labelLower.includes("gap") ||
      labelLower.includes("void") ||
      labelLower.includes("out-of-stock") ||
      labelLower.includes("crack") ||
      labelLower.includes("oxid");

    if (isDefect) {
      return {
        border: isSelected || isHovered ? "#ff2a5f" : "#f43f5e",
        fill: isSelected || isHovered ? "rgba(244, 63, 94, 0.35)" : "rgba(244, 63, 94, 0.16)",
        badge: "#e11d48",
        glow: "rgba(244, 63, 94, 0.8)",
      };
    }

    if (sev === "medium" || labelLower.includes("warn") || labelLower.includes("misplaced")) {
      return {
        border: isSelected || isHovered ? "#fbbf24" : "#f59e0b",
        fill: isSelected || isHovered ? "rgba(245, 158, 11, 0.35)" : "rgba(245, 158, 11, 0.16)",
        badge: "#d97706",
        glow: "rgba(245, 158, 11, 0.8)",
      };
    }

    // Default normal / component / feature
    return {
      border: isSelected || isHovered ? "#38bdf8" : "#0ea5e9",
      fill: isSelected || isHovered ? "rgba(14, 165, 233, 0.35)" : "rgba(14, 165, 233, 0.14)",
      badge: "#0284c7",
      glow: "rgba(14, 165, 233, 0.8)",
    };
  };

  // Render on Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageElementRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set internal resolution to image natural dimensions
    const width = img.naturalWidth || 800;
    const height = img.naturalHeight || 600;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // 1. Draw base image
    ctx.drawImage(img, 0, 0, width, height);

    // 2. Draw Inspection Reticle Grid if toggled
    if (showGrid) {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
      ctx.lineWidth = 1;
      const step = Math.min(width, height) / 10;
      for (let x = 0; x <= width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // 3. Draw Bounding Boxes & Tags
    if (showBoxes && detectedObjects.length > 0) {
      detectedObjects.forEach((obj, index) => {
        const [yminNorm, xminNorm, ymaxNorm, xmaxNorm] = obj.box_2d;

        // Convert normalized (0-1000) coordinates to canvas pixel space
        const x = (xminNorm / 1000) * width;
        const y = (yminNorm / 1000) * height;
        const boxW = ((xmaxNorm - xminNorm) / 1000) * width;
        const boxH = ((ymaxNorm - yminNorm) / 1000) * height;

        const isHovered = activeHover === index;
        const isSelected = selectedObjectId === index || selectedObjectId === obj.label;
        const colors = getColorForObject(obj, isHovered, isSelected);

        // Fill
        if (showFill) {
          ctx.fillStyle = colors.fill;
          ctx.fillRect(x, y, boxW, boxH);
        }

        // Stroke
        ctx.save();
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = isSelected || isHovered ? Math.max(3, width * 0.0035) : Math.max(2, width * 0.002);

        if (isSelected || isHovered) {
          ctx.shadowColor = colors.glow;
          ctx.shadowBlur = 12;
        }

        ctx.strokeRect(x, y, boxW, boxH);

        // Draw corner brackets for high-tech aesthetic
        const cornerLen = Math.min(boxW, boxH, 20);
        ctx.lineWidth = ctx.lineWidth * 1.5;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x, y + cornerLen);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerLen, y);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + boxW - cornerLen, y + boxH);
        ctx.lineTo(x + boxW, y + boxH);
        ctx.lineTo(x + boxW, y + boxH - cornerLen);
        ctx.stroke();

        ctx.restore();

        // 4. Label Pill & Confidence Tag
        if (showLabels) {
          ctx.save();
          const labelText = `${obj.label} ${(obj.confidence || 0).toFixed(1)}%`;
          const fontSize = Math.max(12, Math.min(22, Math.round(width * 0.016)));
          ctx.font = `600 ${fontSize}px 'JetBrains Mono', monospace`;

          const textMetrics = ctx.measureText(labelText);
          const padding = fontSize * 0.4;
          const badgeW = textMetrics.width + padding * 2;
          const badgeH = fontSize + padding * 1.2;

          // Position badge above box if space permits, else inside
          let badgeX = x;
          let badgeY = y - badgeH;
          if (badgeY < 0) {
            badgeY = y;
          }

          // Background pill
          ctx.fillStyle = isHovered || isSelected ? colors.badge : "rgba(15, 23, 42, 0.9)";
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
          ctx.fill();
          ctx.stroke();

          // Text
          ctx.fillStyle = "#ffffff";
          ctx.textBaseline = "middle";
          ctx.fillText(labelText, badgeX + padding, badgeY + badgeH / 2);

          ctx.restore();
        }
      });
    }

    // 4. Scanning radar line if currently analyzing
    if (isAnalyzing) {
      const time = Date.now() / 1000;
      const scanY = ((Math.sin(time * 3) + 1) / 2) * height;

      ctx.save();
      const gradient = ctx.createLinearGradient(0, scanY - 30, 0, scanY);
      gradient.addColorStop(0, "rgba(6, 182, 212, 0)");
      gradient.addColorStop(1, "rgba(6, 182, 212, 0.4)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 30, width, 30);

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();
      ctx.restore();
    }
  }, [
    imageLoaded,
    showBoxes,
    showLabels,
    showFill,
    showGrid,
    detectedObjects,
    activeHover,
    selectedObjectId,
    isAnalyzing,
  ]);

  // Redraw when properties change
  useEffect(() => {
    let animId: number;
    if (isAnalyzing) {
      const loop = () => {
        drawCanvas();
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animId);
    } else {
      drawCanvas();
    }
  }, [drawCanvas, isAnalyzing]);

  // Handle canvas mouse move for interactive bounding box hit testing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const img = imageElementRef.current;
    if (!canvas || !img) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const pixelX = Math.round(clientX * scaleX);
    const pixelY = Math.round(clientY * scaleY);

    const normX = Math.min(1000, Math.max(0, Math.round((pixelX / canvas.width) * 1000)));
    const normY = Math.min(1000, Math.max(0, Math.round((pixelY / canvas.height) * 1000)));

    setMouseCoord({ x: pixelX, y: pixelY, normX, normY });

    // Check hit test across objects (reverse order to pick top-most)
    let foundIndex: number | null = null;
    for (let i = detectedObjects.length - 1; i >= 0; i--) {
      const [ymin, xmin, ymax, xmax] = detectedObjects[i].box_2d;
      if (normX >= xmin && normX <= xmax && normY >= ymin && normY <= ymax) {
        foundIndex = i;
        break;
      }
    }

    setInternalHover(foundIndex);
    if (onHoverIndex) {
      onHoverIndex(foundIndex);
    }
  };

  const handleMouseLeave = () => {
    setMouseCoord(null);
    setInternalHover(null);
    if (onHoverIndex) onHoverIndex(null);
  };

  const handleClick = () => {
    if (internalHover !== null) {
      if (onSelectObject) onSelectObject(internalHover);
    }
  };

  // Export composite annotated image
  const handleExportAnnotatedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `visionai_annotated_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const resetZoom = () => setZoomLevel(1);
  const zoomIn = () => setZoomLevel((z) => Math.min(3, z + 0.25));
  const zoomOut = () => setZoomLevel((z) => Math.max(0.5, z - 0.25));

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl overflow-hidden">
      {/* Top Canvas Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/80 px-4 py-2.5 text-xs">
        {/* Visibility Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBoxes(!showBoxes)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
              showBoxes
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle bounding boxes overlay"
          >
            {showBoxes ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>Boxes</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
              showLabels
                ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/30"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle label tags"
          >
            <span>Labels</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFill(!showFill)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
              showFill
                ? "bg-slate-800 text-slate-200 border border-slate-700"
                : "bg-slate-800/40 text-slate-500 hover:text-slate-300"
            }`}
            title="Toggle bounding fill shade"
          >
            <span>Fill</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
              showGrid
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-slate-800/40 text-slate-500 hover:text-slate-300"
            }`}
            title="Toggle inspection reticle grid"
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Grid</span>
          </button>
        </div>

        {/* Viewport Zoom & Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={zoomOut}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              title="Fit to Screen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportAnnotatedImage}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
            title="Download annotated image with bounding overlays"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative flex min-h-[420px] max-h-[580px] w-full items-center justify-center overflow-auto bg-slate-950 p-4"
      >
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out",
          }}
          className="relative inline-block max-w-full shadow-2xl rounded-lg overflow-hidden border border-slate-800"
        >
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            className="max-h-[520px] w-auto cursor-crosshair object-contain block"
          />

          {/* Hover object badge tooltip overlay */}
          {activeHover !== null && detectedObjects[activeHover] && (
            <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-lg bg-slate-950/90 border border-slate-700/80 px-3 py-1.5 shadow-xl backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-white">
                {detectedObjects[activeHover].label}
              </span>
              <span className="font-mono text-xs text-cyan-400">
                {(detectedObjects[activeHover].confidence || 0).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                [{detectedObjects[activeHover].box_2d.join(", ")}]
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Metadata & Coordinate Bar */}
      <div className="flex flex-wrap items-center justify-between border-t border-slate-800 bg-slate-950/90 px-4 py-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Crosshair className="h-3.5 w-3.5 text-slate-500" />
            <span>
              Cursor:{" "}
              {mouseCoord ? (
                <span className="text-cyan-400">
                  X:{mouseCoord.x} Y:{mouseCoord.y} (Norm: [{mouseCoord.normY}, {mouseCoord.normX}])
                </span>
              ) : (
                <span className="text-slate-600">Resting outside viewport</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span>
            Detections:{" "}
            <strong className="text-white font-mono">{detectedObjects.length}</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Scale: 0-1000 Normalized</span>
        </div>
      </div>
    </div>
  );
};
