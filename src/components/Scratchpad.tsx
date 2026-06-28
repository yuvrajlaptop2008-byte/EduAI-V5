import React, { useRef, useState, useEffect, useCallback } from"react";
import { motion, useDragControls, AnimatePresence } from"framer-motion";
import {
  Pen,
  Eraser,
  Undo,
  Redo,
  Trash2,
  X,
  Maximize2,
  Minimize2,
  GripHorizontal,
  Palette,
  Type,
  Download,
  Grid3X3,
  Minus,
  Square,
} from"lucide-react";

interface ScratchpadProps {
  onClose: () => void;
  inline?: boolean;
}

type Point = { x: number; y: number };
type Stroke = {
  points: Point[];
  color: string;
  width: number;
  isEraser: boolean;
  isHighlighter?: boolean;
  opacity?: number;
  type?:"pen" |"line" |"rectangle";
};

const COLORS = ["#3B82F6","#EF4444","#10B981","#F59E0B","#8B5CF6","#FFFFFF",
];
const SIZES = [2, 4, 6, 8];
const OPACITIES = [0.2, 0.4, 0.6, 0.8];

const Scratchpad: React.FC<ScratchpadProps> = ({ onClose, inline = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentPathRef = useRef<Stroke | null>(null);
  const [mode, setMode] = useState<"pen" |"eraser" |"highlighter" |"line" |"rectangle"
  >("pen");
  const [color, setColor] = useState("#3B82F6");
  const [lineWidth, setLineWidth] = useState(2);
  const [highlighterOpacity, setHighlighterOpacity] = useState(0.4);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const dragControls = useDragControls();

  const [paths, setPaths] = useState<Stroke[]>(() => {
    const saved = localStorage.getItem("scratchpad_paths");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [redoPaths, setRedoPaths] = useState<Stroke[]>(() => {
    const saved = localStorage.getItem("scratchpad_redo_paths");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("scratchpad_paths", JSON.stringify(paths));
  }, [paths]);

  useEffect(() => {
    localStorage.setItem("scratchpad_redo_paths", JSON.stringify(redoPaths));
  }, [redoPaths]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { width, height } = container.getBoundingClientRect();

    if (canvas.width === width && canvas.height === height) return;

    // Save current image data
    const ctx = canvas.getContext("2d");
    let imageData: ImageData | null = null;
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    canvas.width = width;
    canvas.height = height;

    // Restore image data
    if (ctx && imageData) {
      ctx.putImageData(imageData, 0, 0);
    } else {
      redrawCanvas(paths);
    }
  }, [paths]);

  useEffect(() => {
    resizeCanvas();
    let observer: ResizeObserver | null = null;
    if (containerRef.current) {
      observer = new ResizeObserver(() => {
        resizeCanvas();
      });
      observer.observe(containerRef.current);
    }
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (observer) observer.disconnect();
    };
  }, [resizeCanvas, isExpanded]);

  const redrawCanvas = (strokes: Stroke[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap ="round";
    ctx.lineJoin ="round";

    strokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;

      ctx.beginPath();

      if (stroke.type ==="line" && stroke.points.length > 1) {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        ctx.lineTo(
          stroke.points[stroke.points.length - 1].x,
          stroke.points[stroke.points.length - 1].y,
        );
      } else if (stroke.type ==="rectangle" && stroke.points.length > 1) {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        if (stroke.points.length === 1) {
          ctx.lineTo(stroke.points[0].x, stroke.points[0].y);
        } else {
          for (let i = 1; i < stroke.points.length - 1; i++) {
            const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
            const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
            ctx.quadraticCurveTo(
              stroke.points[i].x,
              stroke.points[i].y,
              xc,
              yc,
            );
          }
          ctx.lineTo(
            stroke.points[stroke.points.length - 1].x,
            stroke.points[stroke.points.length - 1].y,
          );
        }
      }

      if (stroke.isEraser) {
        ctx.globalCompositeOperation ="destination-out";
        ctx.lineWidth = stroke.width * 5; // Eraser is thicker
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation ="source-over";
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.globalAlpha = stroke.isHighlighter ? stroke.opacity || 0.4 : 1;
      }

      ctx.stroke();
    });

    // Reset composite operation and alpha
    ctx.globalCompositeOperation ="source-over";
    ctx.globalAlpha = 1;
  };

  useEffect(() => {
    redrawCanvas(paths);
  }, [paths]);

  const getCoordinates = (
    e: React.PointerEvent | PointerEvent,
  ): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setPointerCapture(e.pointerId);
    }
    const coords = getCoordinates(e);
    if (!coords) return;

    currentPathRef.current = {
      points: [coords],
      color,
      width: mode ==="highlighter" ? 20 : lineWidth,
      isEraser: mode ==="eraser",
      isHighlighter: mode ==="highlighter",
      opacity: mode ==="highlighter" ? highlighterOpacity : undefined,
      type:
        mode ==="line" ?"line" : mode ==="rectangle" ?"rectangle" :"pen",
    };
    setRedoPaths([]); // Clear redo stack on new action
  };

  const rafRef = useRef<number | null>(null);

  const draw = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!currentPathRef.current) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    currentPathRef.current.points.push(coords);

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      if (currentPathRef.current) {
        redrawCanvas([...paths, currentPathRef.current]);
      }
      rafRef.current = null;
    });
  };

  const stopDrawing = (e: React.PointerEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    if (!currentPathRef.current) return;
    setPaths([...paths, currentPathRef.current]);
    currentPathRef.current = null;
  };

  const handleUndo = () => {
    if (paths.length === 0) return;
    const newPaths = [...paths];
    const lastPath = newPaths.pop();
    if (lastPath) {
      setPaths(newPaths);
      setRedoPaths([...redoPaths, lastPath]);
    }
  };

  const handleRedo = () => {
    if (redoPaths.length === 0) return;
    const newRedoPaths = [...redoPaths];
    const pathToRestore = newRedoPaths.pop();
    if (pathToRestore) {
      setRedoPaths(newRedoPaths);
      setPaths([...paths, pathToRestore]);
    }
  };

  const handleClear = () => {
    setPaths([]);
    setRedoPaths([]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    // Fill with dark background
    ctx.fillStyle ="#0F172A";
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the grid if visible
    if (showGrid) {
      ctx.strokeStyle ="rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x < tempCanvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, tempCanvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < tempCanvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(tempCanvas.width, y);
        ctx.stroke();
      }
    }

    // Draw the actual canvas content
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement("a");
    link.download = `scratchpad-${new Date().getTime()}.png`;
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  };

  return (
    <motion.div
      drag={!isExpanded && !inline}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, y: inline ? 20 : 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: inline ? 20 : 0 }}
      style={
        !isExpanded && !inline
          ? {
              top: 20,
              left: 20,
              resize:"both",
              overflow:"hidden",
              minWidth:"300px",
              minHeight:"300px",
            }
          : {}
      }
      className={`${inline ?"relative w-full min-h-[400px] mt-6 flex-1" :"fixed z-[100] shadow-2xl"} bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-900/10 dark:border-white/10 rounded-2xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] ${
        !inline && isExpanded
          ?"inset-4 md:inset-10"
          : !inline
            ?"w-[350px] h-[450px] md:w-[450px] md:h-[600px]"
            :""
      }`}
    >
      {/* Header / Toolbar */}
      <div
        className={`flex items-center justify-between px-3 py-2 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md border-b border-slate-900/10 dark:border-white/10 touch-none ${!isExpanded && !inline ?"cursor-move" :""}`}
        onPointerDown={(e) => {
          if (!isExpanded && !inline) {
            dragControls.start(e);
          }
        }}
      >
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {!isExpanded && !inline && (
            <GripHorizontal
              size={16}
              className="text-slate-500 dark:text-slate-400 mr-1 shrink-0 pointer-events-none"
            />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setMode("pen");
            }}
            className={`p-2 rounded-xl transition-all shrink-0 ${mode ==="pen" ?"bg-gradient-to-br from-brand to-blue-600 text-white shadow-lg shadow-brand/20" :"text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
            title="Pen"
          >
            <Pen size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setMode("line");
            }}
            className={`p-2 rounded-xl transition-all shrink-0 ${mode ==="line" ?"bg-gradient-to-br from-brand to-blue-600 text-white shadow-lg shadow-brand/20" :"text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
            title="Line"
          >
            <Minus size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setMode("rectangle");
            }}
            className={`p-2 rounded-xl transition-all shrink-0 ${mode ==="rectangle" ?"bg-gradient-to-br from-brand to-blue-600 text-white shadow-lg shadow-brand/20" :"text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
            title="Rectangle"
          >
            <Square size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setMode("highlighter");
            }}
            className={`p-2 rounded-xl transition-all shrink-0 ${mode ==="highlighter" ?"bg-gradient-to-br from-brand to-blue-600 text-white shadow-lg shadow-brand/20" :"text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
            title="Highlighter"
          >
            <Palette size={16} />
          </button>

          {/* Inline Colors */}
          <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 border border-slate-900/5 dark:border-white/5 px-2 py-1.5 rounded-xl shrink-0 mx-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={(e) => {
                  e.stopPropagation();
                  setColor(c);
                  if (mode ==="eraser") setMode("pen");
                }}
                className={`w-5 h-5 rounded-full transition-transform ${color === c && mode !=="eraser" ?"ring-2 ring-white scale-110 shadow-sm" :"hover:scale-110 opacity-70 hover:opacity-100 border border-slate-900/20 dark:border-white/20"}`}
                style={{ backgroundColor: c }}
                title={`Color: ${c}`}
              />
            ))}
          </div>

          {/* Inline Sizes */}
          <div className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-900/60 border border-slate-900/5 dark:border-white/5 px-2 py-1.5 rounded-xl shrink-0 mx-1">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  setLineWidth(s);
                }}
                className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${lineWidth === s ?"bg-white/20 dark:bg-slate-900/20" :"hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                title={`Size: ${s}`}
              >
                <div
                  className="bg-white dark:bg-slate-900 rounded-full shadow-sm"
                  style={{ width: s, height: s }}
                />
              </button>
            ))}
          </div>

          {mode ==="highlighter" && (
            <>
              <div className="w-px h-6 bg-white/10 dark:bg-slate-900/10 mx-1 shrink-0" />
              <div className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-900/60 border border-slate-900/5 dark:border-white/5 px-2 py-1.5 rounded-xl shrink-0 mx-1">
                {OPACITIES.map((o) => (
                  <button
                    key={o}
                    onClick={(e) => {
                      e.stopPropagation();
                      setHighlighterOpacity(o);
                    }}
                    className={`flex items-center justify-center px-1.5 h-7 rounded-lg transition-colors text-[10px] font-bold ${highlighterOpacity === o ?"bg-brand/30 text-brand" :"text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                    title={`Opacity: ${o * 100}%`}
                  >
                    {o * 100}%
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="w-px h-6 bg-white/10 dark:bg-slate-900/10 mx-1 shrink-0" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setMode("eraser");
            }}
            className={`p-2 rounded-xl transition-all shrink-0 ${mode ==="eraser" ?"bg-white/20 dark:bg-slate-900/20 text-slate-900 dark:text-white shadow-inner" :"text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
            title="Eraser"
          >
            <Eraser size={16} />
          </button>

          <div className="w-px h-6 bg-white/10 dark:bg-slate-900/10 mx-1 shrink-0" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowGrid(!showGrid);
            }}
            className={`p-2 rounded-xl transition-all shrink-0 ${showGrid ?"bg-brand/20 text-brand border border-brand/30" :"text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent"}`}
            title="Toggle Grid"
          >
            <Grid3X3 size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUndo();
            }}
            disabled={paths.length === 0}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 dark:hover:text-slate-400 transition-colors shrink-0"
            title="Undo"
          >
            <Undo size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRedo();
            }}
            disabled={redoPaths.length === 0}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 dark:hover:text-slate-400 transition-colors shrink-0"
            title="Redo"
          >
            <Redo size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowClearConfirm(true);
            }}
            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors shrink-0 relative"
            title="Clear All"
          >
            <Trash2 size={16} />
          </button>

          <div className="w-px h-6 bg-white/10 dark:bg-slate-900/10 mx-1 shrink-0" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              const canvas = canvasRef.current;
              if (canvas) {
                // Create a temporary canvas to draw the background
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const ctx = tempCanvas.getContext("2d");
                if (ctx) {
                  ctx.fillStyle ="#0F172A";
                  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

                  if (showGrid) {
                    ctx.fillStyle ="rgba(255, 255, 255, 0.05)";
                    for (let x = 0; x < tempCanvas.width; x += 20) {
                      for (let y = 0; y < tempCanvas.height; y += 20) {
                        ctx.beginPath();
                        ctx.arc(x + 2, y + 2, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                      }
                    }
                  }

                  ctx.drawImage(canvas, 0, 0);
                  const link = document.createElement("a");
                  link.download ="rough-work.png";
                  link.href = tempCanvas.toDataURL("image/png");
                  link.click();
                }
              }
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
            title="Download Rough Work"
          >
            <Download size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2 border-l border-slate-900/10 dark:border-white/10 pl-2">
          {!inline && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={isExpanded ?"Minimize" :"Maximize"}
            >
              {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
            title="Close Scratchpad"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-gradient-to-b from-[#0F172A] to-[#1E293B] cursor-crosshair touch-none"
      >
        {/* Clear Confirmation Modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-50/90 dark:bg-slate-800/90 p-8 rounded-[2rem] border border-slate-900/10 dark:border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-xs w-full text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-500/20 relative z-10 shadow-inner">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 relative z-10">
                  Clear Canvas?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium relative z-10">
                  This will permanently remove all your rough work.
                </p>
                <div className="flex gap-3 relative z-10">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-colors border border-transparent hover:border-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleClear();
                      setShowClearConfirm(false);
                    }}
                    className="flex-1 py-3 rounded-xl font-bold text-slate-900 dark:text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                  >
                    Clear All
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid Background */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:"radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1.5px, transparent 0)",
              backgroundSize:"24px 24px",
            }}
          />
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="absolute inset-0 w-full h-full touch-none"
        />
      </div>
    </motion.div>
  );
};

export default Scratchpad;
