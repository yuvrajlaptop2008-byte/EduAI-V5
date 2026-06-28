import React, { useState, useEffect } from"react";
import { motion, AnimatePresence } from"motion/react";
import {
  Bell,
  Settings,
  Moon,
  Sun,
  ChevronDown,
  X,
  Check,
  Calculator,
  Dna,
  ChevronRight,
  BookOpen,
} from"lucide-react";
import { useUser } from"../context/UserContext";
import { useNavigate } from"react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, profilePic, field, setField, theme, setTheme } = useUser();
  const navigate = useNavigate();
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [tempField, setTempField] = useState(field);
  const isDarkTheme =
    theme ==="dark" ||
    (theme ==="system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    setTempField(field);
  }, [field]);

  const handleUpdateField = () => {
    setField(tempField);
    setIsFieldModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          >
            {/* Floating Close Button */}
            <button
              onClick={onClose}
              className="absolute top-1/3 right-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-xl"
            >
              <X size={20} /> Close
            </button>
          </motion.div>

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x:"-100%" }}
            animate={{ x: 0 }}
            exit={{ x:"-100%" }}
            transition={{ type:"spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white dark:bg-slate-900 z-[101] flex flex-col shadow-2xl border-r border-slate-900/5 dark:border-white/5"
          >
            {/* User Profile Section */}
            <div className="p-6 pb-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-600 shrink-0">
                  <img
                    src={
                      profilePic ||
                      `https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.uid || "user"}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                    {user?.name ||"Student"}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Class 12 • 2026
                  </p>
                </div>
              </div>

              {/* Field Selector Button */}
              <button
                onClick={() => {
                  setTempField(field);
                  setIsFieldModalOpen(true);
                }}
                className="w-full bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 text-blue-400 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors border border-slate-900/5 dark:border-white/5"
              >
                {field} <ChevronDown size={18} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 px-4 py-2 space-y-1">
              <button
                onClick={() => {
                  onClose();
                  navigate("/app/profile", {
                    state: { activeView:"notifications" },
                  });
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors text-slate-900 dark:text-white"
              >
                <div className="flex items-center gap-4">
                  <Bell
                    size={22}
                    className="text-slate-600 dark:text-slate-300"
                  />
                  <span className="text-lg font-medium">Notification</span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-slate-500 dark:text-slate-400"
                />
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate("/app/profile", {
                    state: { activeView:"settings" },
                  });
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors text-slate-900 dark:text-white"
              >
                <div className="flex items-center gap-4">
                  <Settings
                    size={22}
                    className="text-slate-600 dark:text-slate-300"
                  />
                  <span className="text-lg font-medium">Settings</span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-slate-500 dark:text-slate-400"
                />
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate("/app/profile", {
                    state: { activeView:"exam_updates" },
                  });
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors text-slate-900 dark:text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <BookOpen
                      size={22}
                      className="text-slate-600 dark:text-slate-300"
                    />
                    {(() => {
                      const newUpdatesCount = [
                        { isNew: true, target:"Engineering" },
                        { isNew: true, target:"Both" },
                        { isNew: false, target:"Medical" },
                        { isNew: false, target:"Engineering" },
                      ].filter(
                        (u) =>
                          u.isNew &&
                          (u.target ==="Both" ||
                            u.target === field ||
                            (field !=="Medical" && field !=="Engineering")),
                      ).length;

                      return newUpdatesCount > 0 ? (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1e293b]"></div>
                      ) : null;
                    })()}
                  </div>
                  <span className="text-lg font-medium">Exam updates</span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-slate-500 dark:text-slate-400"
                />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setTheme(isDarkTheme ?"light" :"dark");
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors text-slate-900 dark:text-white mt-1"
              >
                <div className="flex items-center gap-4">
                  {isDarkTheme ? (
                    <Sun
                      size={22}
                      className="text-slate-600 dark:text-slate-300"
                    />
                  ) : (
                    <Moon
                      size={22}
                      className="text-slate-600 dark:text-slate-300"
                    />
                  )}
                  <span className="text-lg font-medium">
                    Switch to {isDarkTheme ?"Light" :"Dark"} Mode
                  </span>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="p-6 flex items-center justify-between border-t border-slate-900/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                  <span className="text-slate-900 dark:text-white text-[10px] font-bold">
                    M
                  </span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                  MARKS
                </span>
              </div>
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                v2.0.3.1 (Beta)
              </span>
            </div>
          </motion.div>

          {/* Field Selection Modal */}
          <AnimatePresence>
            {isFieldModalOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 z-[102] shadow-2xl border border-slate-900/10 dark:border-white/10"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                  Change field
                </h3>

                <div className="space-y-3 mb-8">
                  <button
                    onClick={() => setTempField("Engineering")}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                      tempField ==="Engineering"
                        ?"border-blue-500 bg-blue-500/10 text-white"
                        :"border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6">
                        <span className="text-lg font-mono font-bold leading-none">
                          +-
                          <br />
                          ×=
                        </span>
                      </div>
                      <span className="text-lg font-medium">Engineering</span>
                    </div>
                    {tempField ==="Engineering" && (
                      <Check size={20} className="text-blue-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setTempField("Medical")}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                      tempField ==="Medical"
                        ?"border-blue-500 bg-blue-500/10 text-white"
                        :"border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Dna size={24} />
                      <span className="text-lg font-medium">Medical</span>
                    </div>
                    {tempField ==="Medical" && (
                      <Check size={20} className="text-blue-500" />
                    )}
                  </button>
                </div>

                <button
                  onClick={handleUpdateField}
                  className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  Update
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Overlay */}
          <AnimatePresence>
            {isFieldModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFieldModalOpen(false)}
                className="fixed inset-0 bg-black/40 z-[101]"
              />
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
