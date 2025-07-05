import { useRef, useEffect, useState, useCallback } from "react";

interface Planet {
  id: string;
  x: number;
  y: number;
  size: number;
  interactionRadius: number;
}

interface NPCShipState {
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
  targetPlanet: Planet | null;
  mode: "exploring" | "circling" | "moving_to_planet";
  circleAngle: number;
  circleRadius: number;
  lastModeChange: number;
}

export interface NPCShipData {
  x: number;
  y: number;
  angle: number;
  isVisible: boolean;
}

interface UseNPCShipProps {
  planets: Planet[];
  getWrappedDistance: (coord: number, cameraCoord: number) => number;
  normalizeCoord: (coord: number) => number;
}

const WORLD_SIZE = 15000;
const CENTER_X = WORLD_SIZE / 2;
const CENTER_Y = WORLD_SIZE / 2;
const BARRIER_RADIUS = 600;
const NPC_SPEED = 0.8;
const NPC_CIRCLE_SPEED = 0.02;
export const NPC_SIZE = 25;

export const useNPCShip = ({
  planets,
  getWrappedDistance,
  normalizeCoord,
}: UseNPCShipProps) => {
  const shipStateRef = useRef<NPCShipState>({
    x: CENTER_X + 200,
    y: CENTER_Y + 100,
    angle: 0,
    vx: 0,
    vy: 0,
    targetPlanet: null,
    mode: "exploring",
    circleAngle: 0,
    circleRadius: 150,
    lastModeChange: Date.now(),
  });

  // Store dependencies in refs to avoid recreating callbacks
  const planetsRef = useRef(planets);
  const getWrappedDistanceRef = useRef(getWrappedDistance);
  const normalizeCoordRef = useRef(normalizeCoord);

  // Update refs when dependencies change
  useEffect(() => {
    planetsRef.current = planets;
    getWrappedDistanceRef.current = getWrappedDistance;
    normalizeCoordRef.current = normalizeCoord;
  }, [planets, getWrappedDistance, normalizeCoord]);

  const shipImageRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Load ship image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      shipImageRef.current = img;
      setIsImageLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load NPC ship image");
      setIsImageLoaded(true); // Still render as fallback
    };
    img.src =
      "https://cdn.builder.io/api/v1/image/assets%2Ff3204b51264f46c7b764e817db763ddb%2F0a9ef7e7db754c66a80705f93b134f77?format=webp&width=800";
  }, []);

  // Check if point is inside barrier
  const isInsideBarrier = useCallback((x: number, y: number) => {
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - CENTER_X, 2) + Math.pow(y - CENTER_Y, 2),
    );
    return distanceFromCenter <= BARRIER_RADIUS - 50; // 50px margin
  }, []);

  // Find nearest planet
  const findNearestPlanet = useCallback(
    (x: number, y: number) => {
      let nearestPlanet = null;
      let nearestDistance = Infinity;

      planets.forEach((planet) => {
        if (isInsideBarrier(planet.x, planet.y)) {
          const distance = Math.sqrt(
            Math.pow(x - planet.x, 2) + Math.pow(y - planet.y, 2),
          );
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestPlanet = planet;
          }
        }
      });

      return nearestPlanet;
    },
    [planets, isInsideBarrier],
  );

  // Update ship behavior
  const updateShip = useCallback(
    (deltaTime: number) => {
      const ship = shipStateRef.current;
      const currentTime = Date.now();

      // Change behavior every 8-15 seconds
      const timeSinceLastChange = currentTime - ship.lastModeChange;
      const shouldChangeBehavior =
        timeSinceLastChange > 8000 + Math.random() * 7000;

      // Ensure ship keeps moving in exploring mode
      if (
        ship.mode === "exploring" &&
        Math.abs(ship.vx) < 0.1 &&
        Math.abs(ship.vy) < 0.1
      ) {
        const randomAngle = Math.random() * Math.PI * 2;
        ship.vx = Math.cos(randomAngle) * NPC_SPEED;
        ship.vy = Math.sin(randomAngle) * NPC_SPEED;
        ship.angle = randomAngle;
      }

      if (shouldChangeBehavior || !ship.targetPlanet) {
        const nearestPlanet = findNearestPlanet(ship.x, ship.y);
        if (nearestPlanet) {
          ship.targetPlanet = nearestPlanet;
          ship.mode = Math.random() > 0.3 ? "circling" : "moving_to_planet";
          ship.circleRadius = 100 + Math.random() * 100;
          ship.lastModeChange = currentTime;
        } else {
          ship.mode = "exploring";
          ship.lastModeChange = currentTime;
        }
      }

      switch (ship.mode) {
        case "circling":
          if (ship.targetPlanet) {
            // Circle around planet
            ship.circleAngle += NPC_CIRCLE_SPEED * deltaTime;
            const targetX =
              ship.targetPlanet.x +
              Math.cos(ship.circleAngle) * ship.circleRadius;
            const targetY =
              ship.targetPlanet.y +
              Math.sin(ship.circleAngle) * ship.circleRadius;

            if (isInsideBarrier(targetX, targetY)) {
              ship.x = targetX;
              ship.y = targetY;
              ship.angle = ship.circleAngle + Math.PI / 2;
            } else {
              ship.mode = "exploring";
            }
          }
          break;

        case "moving_to_planet":
          if (ship.targetPlanet) {
            const dx = ship.targetPlanet.x - ship.x;
            const dy = ship.targetPlanet.y - ship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > ship.targetPlanet.interactionRadius + 50) {
              // Move towards planet
              ship.vx = (dx / distance) * NPC_SPEED;
              ship.vy = (dy / distance) * NPC_SPEED;
              ship.angle = Math.atan2(dy, dx);
            } else {
              // Start circling when close enough
              ship.mode = "circling";
              ship.circleAngle = Math.atan2(dy, dx);
            }
          }
          break;

        case "exploring":
        default:
          // Random exploration within barrier
          if (Math.abs(ship.vx) < 0.1 && Math.abs(ship.vy) < 0.1) {
            const randomAngle = Math.random() * Math.PI * 2;
            ship.vx = Math.cos(randomAngle) * NPC_SPEED;
            ship.vy = Math.sin(randomAngle) * NPC_SPEED;
            ship.angle = randomAngle;
          }
          break;
      }

      // Apply movement for exploring and moving_to_planet modes
      if (ship.mode !== "circling") {
        const newX = ship.x + ship.vx * deltaTime;
        const newY = ship.y + ship.vy * deltaTime;

        // Check barrier collision
        if (!isInsideBarrier(newX, newY)) {
          // Bounce off barrier
          const angleToCenter = Math.atan2(
            CENTER_Y - ship.y,
            CENTER_X - ship.x,
          );
          ship.vx = Math.cos(angleToCenter) * NPC_SPEED;
          ship.vy = Math.sin(angleToCenter) * NPC_SPEED;
          ship.angle = angleToCenter;
        } else {
          ship.x = newX;
          ship.y = newY;
        }
      }

      // Normalize coordinates
      ship.x = normalizeCoord(ship.x);
      ship.y = normalizeCoord(ship.y);
    },
    [findNearestPlanet, isInsideBarrier, normalizeCoord],
  );

  // Get ship data for rendering
  const getShipData = useCallback((): NPCShipData => {
    const ship = shipStateRef.current;
    return {
      x: ship.x,
      y: ship.y,
      angle: ship.angle,
      isVisible: isImageLoaded,
    };
  }, [isImageLoaded]);

  // Check if click is on ship
  const isClickOnShip = useCallback(
    (
      clickX: number,
      clickY: number,
      cameraX: number,
      cameraY: number,
      canvasWidth: number,
      canvasHeight: number,
    ): boolean => {
      const ship = shipStateRef.current;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      const wrappedDeltaX = getWrappedDistance(ship.x, cameraX);
      const wrappedDeltaY = getWrappedDistance(ship.y, cameraY);
      const shipScreenX = centerX + wrappedDeltaX;
      const shipScreenY = centerY + wrappedDeltaY;

      const distance = Math.sqrt(
        Math.pow(clickX - shipScreenX, 2) + Math.pow(clickY - shipScreenY, 2),
      );

      return distance <= NPC_SIZE;
    },
    [getWrappedDistance],
  );

  // Render ship on canvas
  const renderShip = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cameraX: number,
      cameraY: number,
      canvasWidth: number,
      canvasHeight: number,
    ) => {
      if (!isImageLoaded) return;

      const ship = shipStateRef.current;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      // Calculate screen position
      const wrappedDeltaX = getWrappedDistance(ship.x, cameraX);
      const wrappedDeltaY = getWrappedDistance(ship.y, cameraY);
      const screenX = centerX + wrappedDeltaX;
      const screenY = centerY + wrappedDeltaY;

      // Check if ship is visible on screen
      const margin = 100;
      if (
        screenX < -margin ||
        screenX > canvasWidth + margin ||
        screenY < -margin ||
        screenY > canvasHeight + margin
      ) {
        return;
      }

      ctx.save();

      // Draw ship
      if (shipImageRef.current) {
        ctx.translate(screenX, screenY);
        ctx.rotate(ship.angle);
        ctx.drawImage(
          shipImageRef.current,
          -NPC_SIZE / 2,
          -NPC_SIZE / 2,
          NPC_SIZE,
          NPC_SIZE,
        );
      } else {
        // Fallback: draw simple ship shape
        ctx.translate(screenX, screenY);
        ctx.rotate(ship.angle);

        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.ellipse(0, 0, NPC_SIZE / 2, NPC_SIZE / 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#DEB887";
        ctx.beginPath();
        ctx.ellipse(-5, 0, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },
    [isImageLoaded, getWrappedDistance],
  );

  return {
    updateShip,
    getShipData,
    renderShip,
    isClickOnShip,
  };
};
