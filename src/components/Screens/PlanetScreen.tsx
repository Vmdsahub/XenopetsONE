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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activePoint, setActivePoint] = useState<string | null>(null);
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
      width_percent: 10,
      height_percent: 10,
      title: `Quadrado ${interactivePoints.length + 1}`,
      description: "Área interativa",
      action_type: "dialog",
      action_data: { message: "Olá! Esta é uma área interativa." },
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800 text-center flex-1">
            {currentPlanet.name}
          </h1>
          {user?.isAdmin && (
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                isAdminMode
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isAdminMode ? "Sair Admin" : "Modo Admin"}
            </button>
          )}
        </div>

        {user?.isAdmin && isAdminMode && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setIsCreatingPoint(!isCreatingPoint)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isCreatingPoint
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                {isCreatingPoint ? "Cancelar" : "Adicionar Ponto"}
              </button>
              <span className="text-sm text-gray-600 py-1">
                Pontos: {interactivePoints.length}
              </span>
            </div>
            {isCreatingPoint && (
              <p className="text-sm text-gray-600 mt-2">
                Clique na imagem para adicionar um ponto interativo
              </p>
            )}
          </div>
        )}

        <div className="w-full h-[calc(100vh-280px)] sm:h-[calc(100vh-300px)] md:h-[calc(100vh-320px)] lg:h-[calc(100vh-340px)] relative rounded-2xl overflow-hidden">
          <motion.img
            ref={imageRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            src={generatePlanetImage(currentPlanet.color)}
            alt={`Superfície de ${currentPlanet.name}`}
            className={`w-full h-full object-cover ${isCreatingPoint ? "cursor-crosshair" : "cursor-default"}`}
            onClick={handleImageClick}
          />

          {/* Render interactive points */}
          {interactivePoints.map((point, index) => (
            <div
              key={
                point.id ||
                `point-${index}-${point.x_percent}-${point.y_percent}`
              }
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                user?.isAdmin && isAdminMode
                  ? point.is_active
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                  : "bg-transparent hover:bg-blue-500 hover:bg-opacity-20"
              } ${
                user?.isAdmin && isAdminMode
                  ? "w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer"
                  : "w-8 h-8 rounded-full cursor-pointer"
              }`}
              style={{
                left: `${point.x_percent}%`,
                top: `${point.y_percent}%`,
              }}
              onClick={(e) => handlePointClick(point, e)}
              title={
                user?.isAdmin && isAdminMode
                  ? `${point.title} (${point.is_active ? "Ativo" : "Inativo"})`
                  : point.title
              }
            />
          ))}
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

      {/* Edit Point Modal */}
      {showEditModal && selectedPoint && user?.isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Editar Ponto Interativo</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={selectedPoint.title}
                  onChange={(e) =>
                    setSelectedPoint({
                      ...selectedPoint,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={selectedPoint.description || ""}
                  onChange={(e) =>
                    setSelectedPoint({
                      ...selectedPoint,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posição
                </label>
                <p className="text-sm text-gray-500">
                  X: {selectedPoint.x_percent.toFixed(2)}%, Y:{" "}
                  {selectedPoint.y_percent.toFixed(2)}%
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleTogglePointActive(
                      selectedPoint.id,
                      selectedPoint.is_active,
                    )
                  }
                  className={`flex-1 px-4 py-2 rounded font-medium ${
                    selectedPoint.is_active
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {selectedPoint.is_active ? (
                    <>
                      <EyeOff className="w-4 h-4 inline mr-1" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 inline mr-1" />
                      Ativar
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDeletePoint(selectedPoint.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Excluir
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPoint(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const updates: UpdateInteractivePointData = {
                    title: selectedPoint.title,
                    description: selectedPoint.description,
                  };

                  const updated =
                    await worldInteractivePointsService.updatePoint(
                      selectedPoint.id,
                      updates,
                    );
                  if (updated) {
                    setInteractivePoints((prev) =>
                      prev.map((p) =>
                        p.id === selectedPoint.id ? updated : p,
                      ),
                    );
                  }

                  setShowEditModal(false);
                  setSelectedPoint(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
