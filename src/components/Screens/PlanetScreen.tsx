import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Edit3, Trash2, Eye, EyeOff } from "lucide-react";
import { useGameStore } from "../../store/gameStore";
import { useAuthStore } from "../../store/authStore";
import {
  worldInteractivePointsService,
  WorldInteractivePoint,
  CreateInteractivePointData,
  UpdateInteractivePointData,
} from "../../services/worldInteractivePointsService";

interface Planet {
  id: string;
  name: string;
  color: string;
}

export const PlanetScreen: React.FC = () => {
  const { currentPlanet, setCurrentScreen } = useGameStore();
  const { user } = useAuthStore();
  const [interactivePoints, setInteractivePoints] = useState<
    WorldInteractivePoint[]
  >([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isCreatingPoint, setIsCreatingPoint] = useState(false);
  const [selectedPoint, setSelectedPoint] =
    useState<WorldInteractivePoint | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load interactive points when planet changes
  useEffect(() => {
    if (currentPlanet) {
      loadInteractivePoints();
    }
  }, [currentPlanet]);

  const loadInteractivePoints = async () => {
    if (!currentPlanet) return;

    if (user?.isAdmin && isAdminMode) {
      // Load all points for admin in edit mode
      const points = await worldInteractivePointsService.getAllPointsForWorld(
        currentPlanet.id,
      );
      setInteractivePoints(points);
    } else {
      // Load only active points for regular users
      const points = await worldInteractivePointsService.getPointsForWorld(
        currentPlanet.id,
      );
      setInteractivePoints(points);
    }
  };

  // Reload points when admin mode changes
  useEffect(() => {
    loadInteractivePoints();
  }, [isAdminMode]);

  const handleImageClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    if (!user?.isAdmin || !isAdminMode || !isCreatingPoint || !imageRef.current)
      return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const newPointData: CreateInteractivePointData = {
      world_id: currentPlanet!.id,
      x_percent: Math.round(xPercent * 100) / 100,
      y_percent: Math.round(yPercent * 100) / 100,
      title: `Ponto ${interactivePoints.length + 1}`,
      description: "Descrição do ponto",
      action_type: "dialog",
      action_data: { message: "Olá! Este é um ponto interativo." },
    };

    const newPoint =
      await worldInteractivePointsService.createPoint(newPointData);
    if (newPoint) {
      setInteractivePoints((prev) => [...prev, newPoint]);
      setIsCreatingPoint(false);
    }
  };

  const handlePointClick = (
    point: WorldInteractivePoint,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    if (user?.isAdmin && isAdminMode) {
      setSelectedPoint(point);
      setShowEditModal(true);
    } else {
      // Handle regular user interaction
      switch (point.action_type) {
        case "dialog":
          alert(
            point.action_data?.message ||
              point.description ||
              "Ponto interativo",
          );
          break;
        default:
          console.log("Action not implemented yet:", point.action_type);
      }
    }
  };

  const handleDeletePoint = async (pointId: string) => {
    const success = await worldInteractivePointsService.deletePoint(pointId);
    if (success) {
      setInteractivePoints((prev) => prev.filter((p) => p.id !== pointId));
      setShowEditModal(false);
      setSelectedPoint(null);
    }
  };

  const handleTogglePointActive = async (
    pointId: string,
    isActive: boolean,
  ) => {
    const success = await worldInteractivePointsService.togglePointActive(
      pointId,
      !isActive,
    );
    if (success) {
      setInteractivePoints((prev) =>
        prev.map((p) =>
          p.id === pointId ? { ...p, is_active: !isActive } : p,
        ),
      );
    }
  };

  if (!currentPlanet) {
    return null;
  }

  // Gerar uma imagem placeholder baseada na cor do planeta
  const generatePlanetImage = (color: string) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Cdefs%3E%3CradialGradient id='planet' cx='40%25' cy='40%25'%3E%3Cstop offset='0%25' stop-color='${encodeURIComponent(color)}' stop-opacity='1'/%3E%3Cstop offset='70%25' stop-color='${encodeURIComponent(color)}' stop-opacity='0.8'/%3E%3Cstop offset='100%25' stop-color='%23000' stop-opacity='0.6'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='800' height='600' fill='%23000011'/%3E%3Ccircle cx='400' cy='300' r='200' fill='url(%23planet)' /%3E%3Ccircle cx='350' cy='250' r='15' fill='%23ffffff' fill-opacity='0.3'/%3E%3Ccircle cx='420' cy='320' r='10' fill='%23ffffff' fill-opacity='0.2'/%3E%3Ccircle cx='450' cy='280' r='8' fill='%23ffffff' fill-opacity='0.4'/%3E%3C/svg%3E`;
  };

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="bg-white rounded-3xl shadow-xl p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          {currentPlanet.name}
        </h1>
        <div className="w-full h-[calc(100vh-280px)] sm:h-[calc(100vh-300px)] md:h-[calc(100vh-320px)] lg:h-[calc(100vh-340px)] relative rounded-2xl overflow-hidden">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            src={generatePlanetImage(currentPlanet.color)}
            alt={`Superfície de ${currentPlanet.name}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex justify-center mt-4">
          <motion.button
            onClick={() => setCurrentScreen("world")}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
