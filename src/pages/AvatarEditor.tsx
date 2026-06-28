import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Save,
  RefreshCw,
  Undo2,
  Redo2,
  Download,
  User,
  Scissors,
  Eye,
  Grid,
  Smile,
  Sparkles,
  Shirt,
  Glasses,
  Palette,
  Check,
} from "lucide-react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { useUser, AvatarConfig } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "skinColor", label: "Skin", icon: User, hasColor: false },
  { id: "top", label: "Hair Style", icon: Scissors, hasColor: true, colorKey: "hairColor" },
  { id: "eyes", label: "Eyes", icon: Eye, hasColor: false },
  { id: "eyebrows", label: "Eyebrows", icon: Grid, hasColor: false },
  { id: "mouth", label: "Mouth", icon: Smile, hasColor: false },
  { id: "facialHair", label: "Beard", icon: Sparkles, hasColor: true, colorKey: "facialHairColor" },
  { id: "clothing", label: "Outfit", icon: Shirt, hasColor: true, colorKey: "clothesColor" },
  { id: "accessories", label: "Glasses", icon: Glasses, hasColor: false },
  { id: "backgroundColor", label: "Backdrop", icon: Palette, hasColor: false },
];

const OPTIONS = {
  skinColor: ["edb98a", "fd9841", "f8d25c", "ffdbb4", "d08b5b", "ae5d29", "614335"],
  hairColor: ["2c1b18", "4a3123", "b58143", "d6b370", "724133", "a55728", "f59797", "ecdcbf", "c93305", "e8e1e1"],
  top: [
    "shortHairShortFlat",
    "shortHairShortRound",
    "shortHairShortWaved",
    "shortHairSides",
    "shortHairTheCaesar",
    "shortHairTheCaesarAndSidePart",
    "shortHairDreads01",
    "shortHairDreads02",
    "shortHairFrizzle",
    "shortHairShaggyMullet",
    "longHairBigHair",
    "longHairBob",
    "longHairBun",
    "longHairCurly",
    "longHairCurvy",
    "longHairDreads",
    "longHairFrida",
    "longHairFro",
    "longHairFroBand",
    "longHairNotTooLong",
    "longHairShavedSides",
    "longHairMiaWallace",
    "longHairStraight",
    "longHairStraight2",
    "longHairStraightStrand",
    "eyepatch",
    "hat",
    "hijab",
    "turban",
    "winterHat1",
    "winterHat2",
    "winterHat3",
    "winterHat4",
  ],
  facialHair: ["blank", "beardMedium", "beardLight", "beardMajestic", "moustaceMagnum", "moustacheFancy"],
  facialHairColor: ["2c1b18", "4a3123", "b58143", "d6b370", "724133", "a55728", "f59797", "ecdcbf", "c93305", "e8e1e1"],
  eyes: ["default", "close", "cry", "dizzy", "eyeRoll", "happy", "hearts", "side", "squint", "surprised", "wink", "winkWacky"],
  eyebrows: [
    "default",
    "defaultNatural",
    "angry",
    "angryNatural",
    "flatNatural",
    "raisedExcited",
    "raisedExcitedNatural",
    "sadConcerned",
    "sadConcernedNatural",
    "unibrowNatural",
    "upDown",
    "upDownNatural",
  ],
  mouth: ["default", "concerned", "disbelief", "eating", "grimace", "sad", "screamOpen", "serious", "smile", "smirk", "twinkle", "vomit"],
  clothing: ["blazerAndShirt", "blazerAndSweater", "collarAndSweater", "graphicShirt", "hoodie", "overall", "shirtCrewNeck", "shirtScoopNeck", "shirtVNeck"],
  clothesColor: [
    "262e33",
    "65c9ff",
    "5199e4",
    "25557c",
    "e6e6e6",
    "929598",
    "3c4f5c",
    "b1e2ff",
    "a7ffc4",
    "ffdeb5",
    "ffafb9",
    "ffffb1",
    "ff488e",
    "ff5c5c",
    "ffffff",
  ],
  accessories: ["blank", "kurt", "prescription01", "prescription02", "round", "sunglasses", "wayfarers"],
  backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "transparent", "e2e8f0", "f8fafc", "fef08a", "bbf7d0", "fbcfe8"],
};

const DEFAULT_CONFIG: AvatarConfig = {
  seed: "custom",
  backgroundColor: ["b6e3f4"],
  skinColor: ["edb98a"],
  hairColor: ["2c1b18"],
  facialHairColor: ["2c1b18"],
  clothesColor: ["262e33"],
  eyes: ["default"],
  eyebrows: ["default"],
  mouth: ["smile"],
  top: ["shortHairShortFlat"],
  accessories: ["blank"],
  facialHair: ["blank"],
  clothing: ["hoodie"],
  clothingGraphic: ["bat"],
};

export default function AvatarEditor() {
  const navigate = useNavigate();
  const { avatarConfig, setAvatarConfig, setProfilePic } = useUser();
  const [config, setConfig] = useState<AvatarConfig>(avatarConfig || DEFAULT_CONFIG);
  const [activeCategory, setActiveCategory] = useState<string>("skinColor");

  // Undo/Redo & Bounce states
  const [history, setHistory] = useState<AvatarConfig[]>([avatarConfig || DEFAULT_CONFIG]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [bounceTrigger, setBounceTrigger] = useState(0);

  // 3D Tilt states
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const avatarSvg = useMemo(() => {
    const avatar = createAvatar(avataaars, {
      ...(config as any),
      size: 280,
    });
    return avatar.toDataUri();
  }, [config]);

  const handleSave = async () => {
    setAvatarConfig(config);
    setProfilePic(avatarSvg);
    toast.success("Profile avatar updated successfully!");
    navigate("/app/profile");
  };

  const updateConfig = (key: keyof AvatarConfig, value: string) => {
    const newConfig = { ...config, [key]: [value] };
    setConfig(newConfig);
    setBounceTrigger((prev) => prev + 1);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newConfig);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setConfig(history[newIndex]);
      setBounceTrigger((prev) => prev + 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setConfig(history[newIndex]);
      setBounceTrigger((prev) => prev + 1);
    }
  };

  const handleRandomize = () => {
    const randomConfig: any = { seed: Math.random().toString(36).substring(7) };
    Object.keys(OPTIONS).forEach((key) => {
      const options = OPTIONS[key as keyof typeof OPTIONS];
      randomConfig[key] = [options[Math.floor(Math.random() * options.length)]];
    });
    const newConfig = randomConfig as AvatarConfig;
    setConfig(newConfig);
    setBounceTrigger((prev) => prev + 1);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newConfig);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    toast.success("Random avatar generated!");
  };

  const handleDownload = () => {
    const svgContent = createAvatar(avataaars, {
      ...(config as any),
      size: 512,
    }).toString();

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bitmarks-avatar-${config.seed || "custom"}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Avatar downloaded successfully as SVG!");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    // Rotate max 12 degrees
    const rotateX = -(y / (box.height / 2)) * 12;
    const rotateY = (x / (box.width / 2)) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const activeCategoryData = CATEGORIES.find((c) => c.id === activeCategory);

  // Snapchat Bitmoji dynamic gradient styling
  const backdropColor = config.backgroundColor?.[0] || "transparent";
  const dynamicBackdropGradient = backdropColor === "transparent"
    ? "radial-gradient(circle, rgba(148, 163, 184, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)"
    : `radial-gradient(circle, #${backdropColor}55 0%, rgba(15, 23, 42, 0.95) 100%)`;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-base font-black tracking-wider uppercase text-slate-100">Avatar Customizer</h1>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-950 rounded-full font-black text-sm transition-all shadow-lg shadow-yellow-500/10 active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>SAVE</span>
        </button>
      </header>

      {/* 3D Preview Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative min-h-[35vh] overflow-hidden">
        {/* Stage glow backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none" />

        {/* 3D Tilt Card wrapper */}
        <div className="perspective-1000 w-full max-w-sm flex justify-center">
          <motion.div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            animate={{
              rotateX: tilt.x,
              rotateY: tilt.y,
              scale: isHovered ? 1.03 : 1,
            }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
            style={{
              transformStyle: "preserve-3d",
              background: dynamicBackdropGradient,
            }}
            className="relative w-64 h-64 md:w-72 md:h-72 rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex items-center justify-center cursor-pointer group bg-grid-pattern"
          >
            {/* Parallax Inner Ring */}
            <div
              className="absolute inset-4 rounded-[2rem] border border-dashed border-white/10 pointer-events-none transition-transform duration-300 group-hover:scale-102"
              style={{ transform: "translateZ(20px)" }}
            />

            {/* Avatar Layer with Parallax translateZ */}
            <motion.div
              key={bounceTrigger}
              initial={{ scale: 0.92, y: 0 }}
              animate={{
                scale: [0.92, 1.05, 1],
                y: [0, -4, 0],
              }}
              transition={{ type: "spring", stiffness: 180, damping: 12 }}
              style={{ transform: "translateZ(50px) scale(0.95)" }}
              className="w-full h-full flex items-center justify-center"
            >
              <img
                src={avatarSvg}
                alt="Avatar Preview"
                className="w-4/5 h-4/5 object-contain select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Tactical Glassmorphic Actions Panel */}
        <div className="flex gap-2.5 mt-6 relative z-10">
          <button
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="p-3 bg-slate-900/60 border border-white/5 text-slate-300 rounded-full shadow-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/80 active:scale-95 transition-all"
            title="Undo"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
            className="p-3 bg-slate-900/60 border border-white/5 text-slate-300 rounded-full shadow-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/80 active:scale-95 transition-all"
            title="Redo"
          >
            <Redo2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleRandomize}
            className="p-3 bg-slate-900/60 border border-white/5 text-slate-300 rounded-full shadow-xl hover:bg-slate-800/80 active:scale-95 transition-all"
            title="Randomize"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-3 bg-gradient-to-tr from-slate-900 to-slate-800/90 border border-white/10 text-yellow-300 rounded-full shadow-xl hover:text-yellow-200 active:scale-95 transition-all"
            title="Download Avatar SVG"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Snapchat-Style Bottom Customizer Sheet */}
      <div className="bg-slate-900 border-t border-white/10 pb-safe rounded-t-[2.5rem] shadow-2xl relative z-20 flex flex-col max-h-[48vh] sm:max-h-[50vh]">
        {/* iOS Pull Handle */}
        <div className="w-12 h-1 bg-white/15 rounded-full mx-auto my-3 shrink-0" />

        {/* Category Icons Slider */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-white/5 px-4 pb-2 scroll-smooth shrink-0">
          <div className="flex gap-2 mx-auto">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-200 shrink-0 ${
                    isActive
                      ? "bg-gradient-to-b from-yellow-400/20 to-yellow-400/5 text-yellow-300 shadow-md shadow-yellow-500/5"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-all ${isActive ? "bg-yellow-400 text-slate-950 scale-105" : "bg-slate-800"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inner customization drawer space */}
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {/* Sub-row horizontal color swatches selector */}
          {activeCategoryData?.hasColor && activeCategoryData.colorKey && (
            <div className="mb-4">
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 block mb-2 px-1">
                Choose Color
              </span>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {OPTIONS[activeCategoryData.colorKey as keyof typeof OPTIONS].map((color) => {
                  const isSelected = config[activeCategoryData.colorKey as keyof AvatarConfig]?.[0] === color;
                  return (
                    <button
                      key={color}
                      onClick={() => updateConfig(activeCategoryData.colorKey as keyof AvatarConfig, color)}
                      className={`w-9 h-9 rounded-full border-2 shrink-0 transition-all flex items-center justify-center shadow-inner ${
                        isSelected ? "border-yellow-400 scale-110 ring-2 ring-yellow-400/20" : "border-slate-800 hover:scale-105"
                      }`}
                      style={{ backgroundColor: `#${color}` }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Features options grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {OPTIONS[activeCategory as keyof typeof OPTIONS].map((option) => {
              const isColor = activeCategory.toLowerCase().includes("color");
              const isSelected = config[activeCategory as keyof AvatarConfig]?.[0] === option;

              return (
                <button
                  key={option}
                  onClick={() => updateConfig(activeCategory as keyof AvatarConfig, option)}
                  className={`relative aspect-square rounded-[1.5rem] overflow-hidden border-2 transition-all flex items-center justify-center p-1.5 ${
                    isSelected
                      ? "border-yellow-400 bg-yellow-400/5 scale-102 shadow-lg shadow-yellow-500/5 ring-1 ring-yellow-400/20"
                      : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                  style={isColor && option !== "transparent" ? { backgroundColor: `#${option}` } : {}}
                >
                  {/* Option mini preview render */}
                  {!isColor && (
                    <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
                      <img
                        src={createAvatar(avataaars, {
                          ...(config as any),
                          [activeCategory]: [option],
                          backgroundColor: ["transparent"],
                          size: 72,
                        }).toDataUri()}
                        alt={option}
                        className="w-full h-full object-contain"
                        draggable={false}
                      />
                    </div>
                  )}

                  {/* Empty/transparent background state */}
                  {isColor && option === "transparent" && (
                    <span className="text-[10px] font-black tracking-wider uppercase text-slate-500">None</span>
                  )}

                  {/* Active selection dot indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
