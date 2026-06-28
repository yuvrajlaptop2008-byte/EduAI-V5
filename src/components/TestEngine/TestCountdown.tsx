import React, { useState, useEffect } from"react";
import { motion, AnimatePresence } from"motion/react";

interface TestCountdownProps {
  onComplete: () => void;
}

const TestCountdown: React.FC<TestCountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[100] flex flex-col items-center justify-center overflow-hidden text-slate-900 dark:text-white">
      <div className="text-center relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="text-4xl">🚀</div>
        </motion.div>

        <h2 className="text-3xl font-medium mb-2">Grab Your Pen & Paper</h2>
        <h3 className="text-2xl text-slate-700 dark:text-slate-200 mb-12">
          Test starts in
        </h3>

        <div className="h-40 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={count}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[12rem] font-medium text-[#5AB2FF] leading-none"
            >
              {count > 0 ? count :"GO!"}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TestCountdown;
