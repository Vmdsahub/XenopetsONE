import React, { useState, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Music as MusicIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";

interface Track {
  id: string;
  name: string;
  coverImage: string;
  audioFile: string;
}

interface MusicMiniModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for tracks by screen
const getTracksForScreen = (screen: string): Track[] => {
  switch (screen) {
    case "world":
      return [
        {
          id: "galaxy-1",
          name: "Cosmic Voyage",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/galaxy-music-1.mp3",
        },
        {
          id: "galaxy-2",
          name: "Stellar Dreams",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/galaxy-music-2.mp3",
        },
      ];
    case "pet":
      return [
        {
          id: "pet-1",
          name: "Pet Paradise",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/pet-music-1.mp3",
        },
      ];
    default:
      return [
        {
          id: "default-1",
          name: "Xenopets Theme",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/default-music-1.mp3",
        },
      ];
  }
};

export const MusicMiniModal: React.FC<MusicMiniModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentScreen } = useGameStore();
  const tracks = getTracksForScreen(currentScreen);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio play/pause logic
  }, [isPlaying]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseInt(e.target.value);
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
      // TODO: Implement actual volume control
    },
    [isMuted],
  );

  const handleMuteToggle = useCallback(() => {
    setIsMuted(!isMuted);
    // TODO: Implement actual mute logic
  }, [isMuted]);

  const getScreenTitle = () => {
    switch (currentScreen) {
      case "world":
        return "Mapa Galáctico";
      case "pet":
        return "Meu Pet";
      case "store":
        return "Loja";
      case "inventory":
        return "Inventário";
      case "profile":
        return "Perfil";
      default:
        return "Xenopets";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-20 right-4 left-4 z-50 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-4 max-w-sm w-full"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MusicIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">
                Trilha Sonora
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Album Cover - Larger size */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md flex-shrink-0">
              <img
                src={currentTrack?.coverImage}
                alt={currentTrack?.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Track Info and Controls */}
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {currentTrack?.name}
                </h4>
                <p className="text-xs text-gray-600">{getScreenTitle()}</p>
              </div>

              {/* Play/Pause Button */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handlePlayPause}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </motion.button>

                {/* Volume Control */}
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={handleMuteToggle}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-gray-600" />
                    )}
                  </button>

                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${isMuted ? 0 : volume}%, #e5e7eb ${isMuted ? 0 : volume}%, #e5e7eb 100%)`,
                      }}
                    />
                  </div>

                  <span className="text-xs text-gray-500 w-6 text-right">
                    {isMuted ? 0 : volume}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Track indicators if multiple tracks */}
          {tracks.length > 1 && (
            <div className="flex justify-center gap-1">
              {tracks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTrackIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentTrackIndex ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
