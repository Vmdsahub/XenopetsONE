import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NPCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIALOGUE_TEXT =
  "Olá, viajante! Sou um explorador errante deste vasto cosmos. Há muito tempo navego por estas águas estelares, observando os mistérios que se desenrolam entre os planetas. Você parece ter uma energia especial... Talvez possamos trocar algumas palavras sobre suas aventuras?";

export const NPCModal: React.FC<NPCModalProps> = ({ isOpen, onClose }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter effect
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText("");
      setCurrentIndex(0);
      setIsTypingComplete(false);
      setInputValue("");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    if (currentIndex < DIALOGUE_TEXT.length) {
      intervalRef.current = setTimeout(() => {
        setDisplayedText((prev) => prev + DIALOGUE_TEXT[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30); // 30ms per character for smooth typing
    } else {
      setIsTypingComplete(true);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isOpen, currentIndex]);

  // Skip typewriter effect on click
  const handleSkipTyping = () => {
    if (!isTypingComplete) {
      setDisplayedText(DIALOGUE_TEXT);
      setCurrentIndex(DIALOGUE_TEXT.length);
      setIsTypingComplete(true);
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    }
  };

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // You can add logic here to handle the player's response
      console.log("Player response:", inputValue);
      setInputValue("");
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
              aria-label="Fechar modal"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* NPC Image */}
            <div className="flex justify-center p-6 pb-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Ff3204b51264f46c7b764e817db763ddb%2F23e86f6660a946409dcb3d1263f31bde?format=webp&width=800"
                alt="Explorador Errante"
                className="w-32 h-32 object-contain rounded-2xl bg-gray-50 p-2"
                style={{ imageRendering: "crisp-edges" }}
              />
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-6">
              {/* Character name */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Explorador Errante
                </h2>
                <div className="w-32 h-0.5 bg-gray-200 mx-auto rounded-full"></div>
              </div>

              {/* Dialogue box */}
              <div
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 cursor-pointer min-h-[120px] relative"
                onClick={handleSkipTyping}
              >
                <div className="text-gray-700 leading-relaxed text-base">
                  {displayedText}
                  {!isTypingComplete && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      className="text-gray-500 ml-1"
                    >
                      |
                    </motion.span>
                  )}
                </div>

                {!isTypingComplete && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500 opacity-70">
                    Clique para pular
                  </div>
                )}
              </div>

              {/* Input field */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isTypingComplete ? 1 : 0.5,
                  y: isTypingComplete ? 0 : 20,
                }}
                transition={{ delay: isTypingComplete ? 0 : 0.5 }}
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                <label className="block text-amber-800 font-medium">
                  Sua resposta:
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      isTypingComplete
                        ? "Digite sua resposta..."
                        : "Aguarde o diálogo terminar..."
                    }
                    disabled={!isTypingComplete}
                    className="flex-1 px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white text-amber-900 placeholder-amber-500 disabled:bg-amber-50 disabled:text-amber-400 transition-colors"
                    maxLength={200}
                  />
                  <button
                    type="submit"
                    disabled={!isTypingComplete || !inputValue.trim()}
                    className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Enviar
                  </button>
                </div>
                <div className="text-xs text-amber-600 text-right">
                  {inputValue.length}/200 caracteres
                </div>
              </motion.form>

              {/* Action buttons */}
              <div className="flex justify-center gap-4 pt-4 border-t border-amber-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-2 bg-amber-200 text-amber-800 rounded-lg hover:bg-amber-300 transition-colors font-medium"
                >
                  Despedir-se
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
