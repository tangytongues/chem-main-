import React, { useState, useEffect } from "react";
import {
  Beaker,
  FlaskConical,
  TestTube,
  Droplet,
  Thermometer,
} from "lucide-react";

interface EquipmentProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  onDrag: (id: string, x: number, y: number) => void;
  position: { x: number; y: number } | null;
  chemicals?: Array<{
    id: string;
    name: string;
    color: string;
    amount: number;
    concentration: string;
  }>;
  onChemicalDrop?: (
    chemicalId: string,
    equipmentId: string,
    amount: number,
  ) => void;
  onRemove?: (id: string) => void;
  isHeating?: boolean;
  actualTemperature?: number;
  targetTemperature?: number;
  heatingTime?: number;
  onStartHeating?: () => void;
  onStopHeating?: () => void;
}

export const Equipment: React.FC<EquipmentProps> = ({
  id,
  name,
  icon,
  onDrag,
  position,
  chemicals = [],
  onChemicalDrop,
  onRemove,
  isHeating = false,
  actualTemperature = 25,
  targetTemperature = 25,
  heatingTime = 0,
  onStartHeating,
  onStopHeating,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState(0);

  const handleDragStart = (e: React.DragEvent) => {
    // Set both equipment and text/plain for broader compatibility
    e.dataTransfer.setData("equipment", id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ type: "equipment", id }),
    );
    setShowContextMenu(false);
    setIsDragging(true);
    setDragStartTime(Date.now());

    // Clear any existing dropping animations
    setIsDropping(false);

    // Set drag effect
    e.dataTransfer.effectAllowed = "move";

    // Create a cleaner drag image
    const dragElement = e.currentTarget as HTMLElement;
    dragElement.style.opacity = "0.8";
    dragElement.style.transform = "scale(0.95)";

    // Log for debugging - especially for magnetic stirrer
    console.log(`🎯 Dragging equipment: ${id} (${name})`);
    if (id === "magnetic_stirrer") {
      console.log("🧲 Magnetic stirrer drag started!");
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log(`🏁 Drag ended for equipment: ${id} (${name})`);
    setIsDragging(false);
    const dragElement = e.currentTarget as HTMLElement;
    dragElement.style.opacity = "1";
    dragElement.style.transform = "";

    if (id === "magnetic_stirrer") {
      console.log("🧲 Magnetic stirrer drag ended!");
    }

    // Reset any drag-related states after a short delay to ensure clean state
    setTimeout(() => {
      setIsDropping(false);
      setIsDragOver(false);
    }, 100);
  };

  const handleDoubleClick = () => {
    if (isOnWorkbench && onRemove) {
      onRemove(id);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    if (isOnWorkbench) {
      e.preventDefault();
      setContextMenuPos({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  const handleRemoveClick = () => {
    if (onRemove) {
      onRemove(id);
    }
    setShowContextMenu(false);
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showContextMenu]);

  const handleChemicalDragOver = (e: React.DragEvent) => {
    // Only handle chemical drops, not equipment drags
    const hasChemical =
      e.dataTransfer.types.includes("chemical") ||
      e.dataTransfer.getData("chemical");
    const hasEquipment =
      e.dataTransfer.types.includes("equipment") ||
      e.dataTransfer.getData("equipment");

    if (hasEquipment && !hasChemical) {
      return; // Don't interfere with equipment dragging
    }

    e.preventDefault();
    e.stopPropagation();

    // Only show drag over state for chemicals, not during equipment dragging
    if (!isDragging) {
      setIsDragOver(true);
    }
  };

  const handleChemicalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Use a small delay to prevent flickering
    setTimeout(() => {
      if (!isDragging) {
        setIsDragOver(false);
      }
    }, 50);
  };

  const handleChemicalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear drag over state immediately
    setIsDragOver(false);

    // Only handle chemical drops
    const chemicalData = e.dataTransfer.getData("chemical");
    if (chemicalData && onChemicalDrop && !isDragging) {
      setIsDropping(true);

      const chemical = JSON.parse(chemicalData);
      onChemicalDrop(chemical.id, id, chemical.volume || 25);

      // Show success feedback briefly
      console.log(
        `Added ${chemical.volume || 25}mL of ${chemical.name} to ${name}`,
      );

      // Reset dropping animation after a shorter delay
      setTimeout(() => setIsDropping(false), 1500);
    }
  };

  const isOnWorkbench = position && (position.x !== 0 || position.y !== 0);
  const isContainer = [
    "beaker",
    "flask",
    "burette",
    "erlenmeyer_flask",
    "conical_flask",
    "test_tubes",
    "beakers",
  ].includes(id);

  // Calculate mixed color from all chemicals
  const getMixedColor = () => {
    if (chemicals.length === 0) return "transparent";
    if (chemicals.length === 1) return chemicals[0].color;

    // Enhanced color mixing for chemical reactions
    const chemicalIds = chemicals.map((c) => c.id).sort();

    // Specific reaction colors
    if (chemicalIds.includes("hcl") && chemicalIds.includes("naoh")) {
      if (chemicalIds.includes("phenol")) {
        return "#FFB6C1"; // Pink when phenolphthalein is added to basic solution
      }
      return "#E8F5E8"; // Light green for neutralization
    }

    if (chemicalIds.includes("phenol") && chemicalIds.includes("naoh")) {
      return "#FF69B4"; // Bright pink
    }

    // Default color mixing
    let r = 0,
      g = 0,
      b = 0,
      totalAmount = 0;

    chemicals.forEach((chemical) => {
      const color = chemical.color;
      const amount = chemical.amount;

      const hex = color.replace("#", "");
      const rVal = parseInt(hex.substr(0, 2), 16);
      const gVal = parseInt(hex.substr(2, 2), 16);
      const bVal = parseInt(hex.substr(4, 2), 16);

      r += rVal * amount;
      g += gVal * amount;
      b += bVal * amount;
      totalAmount += amount;
    });

    if (totalAmount === 0) return "transparent";

    r = Math.round(r / totalAmount);
    g = Math.round(g / totalAmount);
    b = Math.round(b / totalAmount);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const getSolutionHeight = () => {
    const totalVolume = chemicals.reduce(
      (sum, chemical) => sum + chemical.amount,
      0,
    );
    return Math.min(85, (totalVolume / 100) * 85);
  };

  const getEquipmentSpecificRendering = () => {
    // Use realistic images when equipment is on the workbench
    if (isOnWorkbench) {
      if (id === "erlenmeyer_flask" || id === "flask") {
        return (
          <div className="relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fd30aba391b974a07b1dc4ee95e17e59e%2F5a2c42e1b48244e886bf6dca231660fb?format=webp&width=800"
              alt="Erlenmeyer Flask"
              className="w-72 h-84 object-contain"
              style={{
                filter: isHeating
                  ? "brightness(1.1) saturate(1.2) drop-shadow(0 0 20px rgba(255,165,0,0.5))"
                  : "drop-shadow(0 10px 25px rgba(0,0,0,0.2))",
              }}
            />

            {/* Solution overlay on the realistic flask */}
            {chemicals.length > 0 && (
              <div
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 rounded-b-full transition-all duration-700 ease-out"
                style={{
                  backgroundColor: getMixedColor(),
                  width: "65%",
                  height: `${Math.min(120, getSolutionHeight() * 1.2)}px`,
                  opacity: 0.8,
                  boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {/* Surface shimmer */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-white opacity-40 rounded-full"></div>

                {/* Bubbling animation */}
                {(chemicals.length > 1 || isHeating) && (
                  <div className="absolute inset-0">
                    {[...Array(isHeating ? 8 : 4)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-80"
                        style={{
                          left: `${20 + (i % 3) * 20}%`,
                          bottom: `${5 + (i % 2) * 10}px`,
                          animationName: "bounce",
                          animationDuration: isHeating ? "0.8s" : "1.2s",
                          animationIterationCount: "infinite",
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Temperature indicator when heating */}
            {isHeating && (
              <div className="absolute -left-6 top-4 w-2 h-8 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-red-500 transition-all duration-500 rounded-full"
                  style={{
                    height: `${Math.min(100, ((actualTemperature - 25) / 60) * 100)}%`,
                  }}
                ></div>
                <div className="absolute -left-6 top-0 text-[8px] text-gray-600 font-mono">
                  {Math.round(actualTemperature)}°C
                </div>
              </div>
            )}
          </div>
        );
      }

      if (id === "conical_flask" && isOnWorkbench) {
        return (
          <div className="relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F697e1d72304b4a6ba798abf6498db515%2F01095f65af064da795e5b66ed8ae9d05?format=webp&width=800"
              alt="250mL Conical Flask"
              className="w-40 h-48 object-contain"
              style={{
                filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.2))",
              }}
            />

            {/* Solution overlay on the realistic flask */}
            {chemicals.length > 0 && (
              <div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-out"
                style={{
                  backgroundColor: getMixedColor(),
                  width: "60%",
                  height: `${Math.min(120, getSolutionHeight() * 1.2)}px`,
                  opacity: 0.8,
                  borderRadius: "0 0 60% 60%",
                  clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
                  boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {/* Surface shimmer */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-white opacity-40 rounded-full"></div>

                {/* Bubbling animation */}
                {(chemicals.length > 1 || isHeating) && (
                  <div className="absolute inset-0">
                    {[...Array(isHeating ? 8 : 4)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-80"
                        style={{
                          left: `${20 + (i % 3) * 20}%`,
                          bottom: `${5 + (i % 2) * 10}px`,
                          animationName: "bounce",
                          animationDuration: isHeating ? "0.8s" : "1.2s",
                          animationIterationCount: "infinite",
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Endpoint color change indicator - pink for titration */}
                {chemicals.some((c) => c.id === "naoh") &&
                  chemicals.some((c) => c.id === "phenol") && (
                    <div className="absolute inset-0">
                      <div
                        className="absolute inset-0 bg-pink-300 opacity-40 animate-pulse"
                        style={{ animationDuration: "3s" }}
                      ></div>
                      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-pink-700 bg-white bg-opacity-80 px-1 rounded">
                        Endpoint!
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Professional label */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
              <div className="bg-white border border-gray-300 px-2 py-1 rounded shadow">
                <div className="text-sm font-semibold text-gray-800">
                  250mL Conical Flask
                </div>
              </div>
              {chemicals.length > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  Vol:{" "}
                  {chemicals.reduce((sum, c) => sum + c.amount, 0).toFixed(1)}
                  mL
                </div>
              )}
            </div>
          </div>
        );
      }

      if (id === "magnetic_stirrer" && isOnWorkbench) {
        return (
          <div className="relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F1a9b24906fa84be2b69896b5634a3dd3%2F6ec0b9be54184506ac8daf8a5c4fe46a?format=webp&width=800"
              alt="Magnetic Stirrer"
              className="w-40 h-24 object-contain"
              style={{
                filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.2))",
              }}
            />

            {/* Status indicator */}
            <div className="absolute top-1 right-1 space-y-1">
              <div
                className={`w-3 h-3 rounded-full ${chemicals.length > 0 ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
              ></div>
            </div>

            {/* Animated stir bar when chemicals are present */}
            {chemicals.length > 0 && (
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                <div
                  className="w-8 h-1 bg-white border border-gray-400 rounded-full shadow opacity-60"
                  style={{
                    animationName: "spin",
                    animationDuration: "0.8s",
                    animationIterationCount: "infinite",
                    animationTimingFunction: "linear",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white rounded-full"></div>
                </div>
              </div>
            )}

            {/* Equipment label */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
              <div className="bg-white border border-gray-300 px-2 py-1 rounded shadow text-xs font-semibold text-gray-800">
                Magnetic Stirrer
              </div>
              {chemicals.length > 0 && (
                <div className="text-xs text-green-600 mt-1">● Active</div>
              )}
            </div>
          </div>
        );
      }

      if (id === "graduated_cylinder" || id === "burette") {
        return (
          <div className="relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F3ac4fed498614db287eb1f9aa48832e0%2Fcbb897db39e9400fa4cec1eb64f8d0b5?format=webp&width=800"
              alt="Graduated Cylinder"
              className="w-28 h-48 object-contain"
              style={{
                filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.15))",
              }}
            />

            {/* Solution in graduated cylinder/burette */}
            {chemicals.length > 0 && (
              <div
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-out"
                style={{
                  backgroundColor: getMixedColor(),
                  width: "75%",
                  height: `${Math.min(160, getSolutionHeight() * 1.2)}px`,
                  opacity: 0.85,
                  borderRadius: "0 0 4px 4px",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-white opacity-30 rounded-full"></div>

                {/* Liquid movement animation for burette */}
                {id === "burette" && (
                  <div className="absolute inset-0">
                    <div
                      className="absolute top-1 left-1 w-1 h-2 bg-white opacity-20 rounded-full"
                      style={{
                        animationName: "pulse",
                        animationDuration: "2s",
                        animationIterationCount: "infinite",
                        animationDelay: "0.3s",
                      }}
                    ></div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced drop animation for burette */}
            {id === "burette" && isDropping && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-2 rounded-full"
                    style={{
                      backgroundColor: getMixedColor(),
                      left: `${-2 + i}px`,
                      animationName: "bounce",
                      animationDuration: "0.8s",
                      animationIterationCount: "infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      }

      if (id === "thermometer") {
        return (
          <div className="relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fd30aba391b974a07b1dc4ee95e17e59e%2Ff88985d180ee4381acf1ac1886943b8b?format=webp&width=800"
              alt="Thermometer"
              className="w-48 h-132 object-contain"
              style={{
                filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.15))",
              }}
            />

            {/* Temperature reading overlay */}
            <div className="absolute -right-8 top-2 bg-black text-green-400 px-1 py-0.5 rounded text-[8px] font-mono">
              {Math.round(actualTemperature)}°C
            </div>
          </div>
        );
      }

      if (id === "beaker") {
        // For beaker, create a more realistic glass appearance
        return (
          <div className="relative">
            <div
              className="w-108 h-96 bg-gradient-to-b from-transparent via-gray-50 to-gray-100 border-2 border-gray-300 rounded-b-lg relative overflow-hidden"
              style={{
                filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.15))",
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.7) 50%, rgba(200,200,200,0.3) 100%)",
                backdropFilter: "blur(1px)",
              }}
            >
              <div className="absolute top-2 left-2 w-3 h-12 bg-white opacity-40 rounded-full"></div>
              <div className="absolute top-1 right-2 w-1 h-8 bg-white opacity-30 rounded-full"></div>

              {/* Solution in beaker */}
              {chemicals.length > 0 && (
                <div
                  className="absolute bottom-1 left-1 right-1 rounded-b-lg transition-all duration-700 ease-out"
                  style={{
                    backgroundColor: getMixedColor(),
                    height: `${Math.min(150, getSolutionHeight() * 1.8)}px`,
                    opacity: 0.8,
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-30 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    if (id === "water_bath" && isOnWorkbench) {
      return (
        <div className="relative">
          {/* Realistic Water Bath with Enhanced Controls */}
          <div
            className={`cursor-pointer transition-all duration-300 ${
              isHeating ? "scale-105" : ""
            }`}
            onClick={isHeating ? onStopHeating : onStartHeating}
          >
            <div className="relative w-32 h-24 bg-gradient-to-b from-gray-300 to-gray-600 rounded-lg shadow-lg overflow-hidden">
              {/* Water bath container */}
              <div
                className={`absolute inset-2 rounded-md transition-all duration-500 ${
                  isHeating
                    ? "bg-gradient-to-b from-orange-200 to-orange-400"
                    : "bg-gradient-to-b from-blue-100 to-blue-300"
                }`}
              >
                {/* Water surface with realistic movement */}
                <div
                  className={`absolute top-1 left-1 right-1 h-3 rounded-t-md transition-colors duration-500 ${
                    isHeating ? "bg-orange-300" : "bg-blue-200"
                  }`}
                >
                  {/* Surface ripples */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                </div>

                {/* Bubbles when heating */}
                {isHeating && (
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-70"
                        style={{
                          left: `${20 + (i % 4) * 20}%`,
                          top: `${40 + Math.floor(i / 4) * 20}%`,
                          animationName: "bounce",
                          animationDuration: "1s",
                          animationIterationCount: "infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Control panel */}
              <div className="absolute top-1 right-1 bg-black rounded px-1 py-0.5">
                <div className="text-[8px] text-green-400 font-mono">
                  {Math.round(actualTemperature)}°C
                </div>
              </div>

              {/* Heating indicator */}
              <div
                className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full transition-colors ${
                  isHeating ? "bg-red-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>

              {/* Steam effect when heating */}
              {isHeating && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-6 bg-white opacity-40 rounded-full"
                      style={{
                        left: `${-4 + i * 4}px`,
                        animationName: "pulse",
                        animationDuration: "2s",
                        animationIterationCount: "infinite",
                        animationDelay: `${i * 0.3}s`,
                        transform: `rotate(${-10 + i * 10}deg)`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-lg">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isHeating ? onStopHeating?.() : onStartHeating?.();
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      isHeating
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {isHeating ? "Stop" : "Heat"}
                  </button>
                  <div className="text-xs text-gray-600">
                    Target: {targetTemperature}°C
                  </div>
                  {isHeating && (
                    <div className="text-xs text-blue-600">
                      {Math.floor(heatingTime / 60)}:
                      {String(heatingTime % 60).padStart(2, "0")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            {!isHeating && (
              <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 text-center">
                Click to start heating
              </div>
            )}
          </div>
        </div>
      );
    }

    if (id === "burette" && isOnWorkbench) {
      return (
        <div className="relative">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F697e1d72304b4a6ba798abf6498db515%2F23076c6b585f423a9cedebd4d9cd3d6a?format=webp&width=800"
            alt="50mL Burette"
            className="w-32 h-96 object-contain"
            style={{
              filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.2))",
            }}
          />

          {/* Solution overlay on the realistic burette */}
          {chemicals.length > 0 && (
            <div
              className="absolute bottom-16 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ease-out"
              style={{
                height: `${Math.min((chemicals.reduce((sum, c) => sum + c.amount, 0) / 50) * 300, 300)}px`,
                width: "12px",
                background: `linear-gradient(180deg, ${getMixedColor()}f0, ${getMixedColor()})`,
                opacity: 0.85,
                borderRadius: "0 0 2px 2px",
              }}
            >
              {/* Realistic meniscus curve */}
              <div className="absolute top-0 left-0 right-0 h-1">
                <div className="w-full h-full bg-white opacity-25 rounded-full transform scale-y-50"></div>
              </div>

              {/* Liquid texture and bubbles */}
              <div className="absolute inset-0">
                {/* Air bubbles */}
                <div className="absolute top-3 left-1 w-0.5 h-0.5 bg-white opacity-60 rounded-full animate-pulse"></div>
                <div
                  className="absolute top-6 right-1 w-0.5 h-0.5 bg-white opacity-40 rounded-full animate-pulse"
                  style={{ animationDelay: "0.8s" }}
                ></div>
              </div>
            </div>
          )}

          {/* Ultra-realistic drop animation */}
          {isDropping && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                {/* Main droplet */}
                <div
                  className="w-2 h-3 rounded-full animate-bounce shadow-sm"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${getMixedColor()}aa, ${getMixedColor()})`,
                    animationDuration: "0.6s",
                  }}
                ></div>

                {/* Secondary smaller droplets */}
                <div
                  className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-1.5 rounded-full animate-bounce"
                  style={{
                    backgroundColor: getMixedColor(),
                    animationDelay: "0.2s",
                    animationDuration: "0.8s",
                  }}
                ></div>

                {/* Droplet trail effect */}
                <div
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-2 opacity-60"
                  style={{ backgroundColor: getMixedColor() }}
                ></div>
              </div>
            </div>
          )}

          {/* Professional equipment label */}
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-white border-2 border-gray-300 px-3 py-2 rounded-lg shadow-lg">
              <div className="text-sm font-bold text-gray-800">
                50mL Burette
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Precision: ±0.05mL
              </div>
            </div>
            <div className="text-xs text-blue-600 mt-2 bg-blue-50 px-2 py-1 rounded border">
              Vol: {chemicals.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
              mL
            </div>
            {chemicals.length > 0 && (
              <div className="text-xs text-purple-600 mt-1">
                {chemicals[0]?.name}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (id === "erlenmeyer_flask" && isOnWorkbench) {
      const isBeingHeated = isHeating && actualTemperature > 30;

      return (
        <div className="relative">
          {/* Realistic Erlenmeyer Flask with 3D appearance */}
          <div className="relative w-24 h-32">
            {/* Flask body with realistic glass effect */}
            <div
              className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
                isBeingHeated ? "filter brightness-110 saturate-110" : ""
              }`}
            >
              {/* Main flask body */}
              <div
                className="relative w-20 h-20 bg-gradient-to-br from-white via-gray-50 to-gray-100
                            rounded-full border-2 border-gray-300 shadow-lg overflow-hidden"
              >
                {/* Glass reflection effect */}
                <div
                  className="absolute top-2 left-2 w-3 h-6 bg-gradient-to-br from-white to-transparent
                              opacity-60 rounded-full transform rotate-12"
                ></div>

                {/* Solution in flask with improved physics */}
                {chemicals.length > 0 && (
                  <div
                    className="absolute bottom-1 left-1 right-1 rounded-b-full transition-all duration-700 ease-out"
                    style={{
                      backgroundColor: getMixedColor(),
                      height: `${Math.min(70, getSolutionHeight() * 0.8)}px`,
                      opacity: 0.9,
                      boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.1)`,
                    }}
                  >
                    {/* Solution surface with meniscus */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 rounded-full"></div>

                    {/* Enhanced bubbling animation for reactions */}
                    {(chemicals.length > 1 || isBeingHeated) && (
                      <div className="absolute inset-0">
                        {[...Array(isBeingHeated ? 12 : 6)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                            style={{
                              left: `${15 + (i % 4) * 15}%`,
                              bottom: `${10 + (i % 3) * 15}px`,
                              animationName: "bounce",
                              animationDuration: isBeingHeated ? "1s" : "1.5s",
                              animationIterationCount: "infinite",
                              animationDelay: `${i * 0.15}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Heat distortion effect when heating */}
                    {isBeingHeated && (
                      <div className="absolute inset-0">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-6 h-px bg-white opacity-30"
                            style={{
                              left: `${10 + i * 15}%`,
                              top: `${20 + i * 10}%`,
                              animationName: "pulse",
                              animationDuration: "2s",
                              animationIterationCount: "infinite",
                              animationDelay: `${i * 0.3}s`,
                              transform: `rotate(${-5 + i * 3}deg)`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Heating glow effect on flask body */}
                {isBeingHeated && (
                  <div className="absolute inset-0 rounded-full bg-orange-300 opacity-20 animate-pulse"></div>
                )}
              </div>

              {/* Flask neck */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8
                            w-6 h-10 bg-gradient-to-b from-gray-100 to-gray-200
                            border-2 border-gray-300 rounded-t-lg shadow-sm"
              >
                {/* Glass reflection on neck */}
                <div className="absolute top-1 left-1 w-1 h-6 bg-white opacity-50 rounded-full"></div>

                {/* Steam/vapor when heating */}
                {isBeingHeated && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-px h-8 bg-white opacity-40"
                        style={{
                          left: `${-2 + i * 2}px`,
                          animationName: "pulse",
                          animationDuration: "2s",
                          animationIterationCount: "infinite",
                          animationDelay: `${i * 0.3}s`,
                          transform: `rotate(${-5 + i * 5}deg)`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Flask opening */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8
                            w-8 h-2 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full border border-gray-400"
              ></div>
            </div>

            {/* Volume markings */}
            <div className="absolute right-0 top-8 space-y-3 text-[8px] text-gray-600 font-mono">
              <div className="flex items-center">
                <div className="w-2 h-px bg-gray-400 mr-1"></div>
                <span>125</span>
              </div>
              <div className="flex items-center">
                <div className="w-1 h-px bg-gray-400 mr-1"></div>
                <span>100</span>
              </div>
              <div className="flex items-center">
                <div className="w-1 h-px bg-gray-400 mr-1"></div>
                <span>50</span>
              </div>
            </div>

            {/* Temperature indicator when heating */}
            {isBeingHeated && (
              <div className="absolute left-0 top-8 w-3 h-12 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-red-500 transition-all duration-500 rounded-full"
                  style={{
                    height: `${Math.min(100, ((actualTemperature - 25) / 60) * 100)}%`,
                  }}
                ></div>
                <div className="absolute -left-8 top-0 text-[8px] text-gray-600 font-mono">
                  {Math.round(actualTemperature)}°C
                </div>
              </div>
            )}
          </div>

          {/* Enhanced chemical composition display */}
          {chemicals.length > 0 && (
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-xs shadow-lg">
              <div className="text-gray-800 font-medium text-center">
                {chemicals.map((c) => c.name.split(" ")[0]).join(" + ")}
              </div>
              <div className="text-gray-600 text-center">
                {chemicals.reduce((sum, c) => sum + c.amount, 0).toFixed(1)} mL
                total
              </div>
              {isBeingHeated && (
                <div className="text-orange-600 text-center font-medium">
                  🔥 Heating: {Math.round(actualTemperature)}°C
                </div>
              )}
              {/* Color indicator */}
              <div
                className="w-full h-2 rounded-full mt-1"
                style={{ backgroundColor: getMixedColor() }}
              ></div>
            </div>
          )}

          {/* Smooth drop success animation */}
          {isDropping && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div
                className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium
                            animate-bounce shadow-lg border border-green-600"
              >
                ✓ Added!
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        {icon}

        {/* Solution visualization for other containers */}
        {isContainer &&
          chemicals.length > 0 &&
          isOnWorkbench &&
          id !== "erlenmeyer_flask" && (
            <div className="absolute inset-0 flex items-end justify-center">
              <div
                className="rounded-b-lg transition-all duration-500 opacity-80"
                style={{
                  backgroundColor: getMixedColor(),
                  height: `${getSolutionHeight()}%`,
                  width: id === "beaker" ? "70%" : "60%",
                  minHeight: "8px",
                }}
              >
                {/* Enhanced liquid effects */}
                <div className="relative w-full h-full overflow-hidden rounded-b-lg">
                  {/* Surface shimmer */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-40 animate-pulse"></div>

                  {/* Bubbling animation for reactions */}
                  {chemicals.length > 1 && (
                    <div className="absolute inset-0">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white opacity-70 rounded-full"
                          style={{
                            left: `${15 + i * 20}%`,
                            bottom: `${5 + (i % 2) * 15}px`,
                            animationName: "bounce",
                            animationDuration: "1.5s",
                            animationIterationCount: "infinite",
                            animationDelay: `${i * 0.3}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {/* Color change animation */}
                  {chemicals.some((c) => c.id === "phenol") &&
                    chemicals.some((c) => c.id === "naoh") && (
                      <div className="absolute inset-0 bg-pink-300 opacity-50 animate-pulse rounded-b-lg"></div>
                    )}
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  return (
    <>
      <div
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={isContainer ? handleChemicalDragOver : undefined}
        onDragLeave={isContainer ? handleChemicalDragLeave : undefined}
        onDrop={isContainer ? handleChemicalDrop : undefined}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleRightClick}
        className={`${
          isOnWorkbench
            ? "cursor-grab active:cursor-grabbing relative"
            : "flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing border-2 border-gray-200 hover:border-blue-400 relative"
        } ${
          isContainer && isDragOver && isOnWorkbench && !isDragging
            ? "scale-105"
            : ""
        } ${
          isDropping && isOnWorkbench && !isDragging ? "animate-pulse" : ""
        } ${isDragging ? "opacity-80 transition-none" : ""}`}
        style={{
          position: isOnWorkbench ? "absolute" : "relative",
          left: isOnWorkbench && position ? position.x : "auto",
          top: isOnWorkbench && position ? position.y : "auto",
          zIndex: isOnWorkbench ? 10 : "auto",
          transform: isOnWorkbench ? "translate(-50%, -50%)" : "none",
          userSelect: "none", // Prevent text selection during drag
        }}
        title={
          isOnWorkbench
            ? "Double-click or right-click to remove"
            : "Drag to workbench"
        }
      >
        {/* Subtle drop zone indicator - only show during chemical drags, not equipment drags */}
        {isContainer && isOnWorkbench && isDragOver && !isDragging && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full opacity-70 animate-pulse"></div>
        )}

        {/* Subtle drag over effect - only for chemical drops */}
        {isDragOver && isOnWorkbench && !isDragging && (
          <div className="absolute inset-0 bg-green-200 opacity-20 rounded-lg animate-pulse"></div>
        )}

        <div
          className={`mb-3 transition-all duration-200 relative ${
            isOnWorkbench ? "text-blue-700" : "text-blue-600"
          } ${isDragOver && !isDragging ? "scale-110" : ""}`}
        >
          {getEquipmentSpecificRendering()}
        </div>

        {/* Only show name in sidebar, not on workbench for realistic look */}
        {!isOnWorkbench && (
          <span className="text-sm font-semibold text-center text-gray-700">
            {name}
          </span>
        )}

        {/* Enhanced chemical composition display */}
        {chemicals.length > 0 && isOnWorkbench && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-xs shadow-lg min-w-max">
            <div className="text-gray-800 font-medium">
              {chemicals
                .map((chemical) => chemical.name.split(" ")[0])
                .join(" + ")}
            </div>
            <div className="text-gray-600 text-center">
              {chemicals
                .reduce((sum, chemical) => sum + chemical.amount, 0)
                .toFixed(1)}{" "}
              mL
            </div>
            {/* Color indicator */}
            <div
              className="w-full h-1 rounded-full mt-1"
              style={{ backgroundColor: getMixedColor() }}
            ></div>
          </div>
        )}

        {/* Drop success animation */}
        {isDropping && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-bounce">
              Added!
            </div>
          </div>
        )}

        {/* Remove button for workbench items */}
        {isOnWorkbench && (
          <button
            onClick={handleRemoveClick}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold transition-colors flex items-center justify-center shadow-md"
            title="Remove from workbench"
          >
            ×
          </button>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && isOnWorkbench && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-2 z-50"
          style={{
            left: contextMenuPos.x,
            top: contextMenuPos.y,
          }}
        >
          <button
            onClick={handleRemoveClick}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Remove from workbench
          </button>
        </div>
      )}
    </>
  );
};

export const equipmentList = [
  {
    id: "beaker",
    name: "Beaker",
    icon: (
      <div className="w-9 h-9 bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-400 rounded-b-lg shadow-md relative overflow-hidden">
        <div className="absolute top-1 left-1 w-1 h-4 bg-white opacity-50 rounded-full"></div>
        <div className="absolute bottom-0 left-1 right-1 h-2 bg-blue-200 opacity-60 rounded-b-lg"></div>
      </div>
    ),
  },
  {
    id: "flask",
    name: "Erlenmeyer Flask",
    icon: (
      <div className="w-9 h-9 relative">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full border-2 border-gray-400 shadow-md">
          <div className="absolute top-1 left-1 w-1 h-2 bg-white opacity-50 rounded-full"></div>
        </div>
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-400 rounded-t-lg"></div>
      </div>
    ),
  },
  {
    id: "burette",
    name: "Burette",
    icon: (
      <div className="w-9 h-9 flex items-center justify-center">
        <div className="w-2 h-8 bg-gradient-to-b from-transparent to-gray-200 border-2 border-gray-400 rounded-b-lg shadow-md relative">
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-blue-200 opacity-60 rounded-b-lg"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-500 rounded-full"></div>
        </div>
      </div>
    ),
  },
  {
    id: "thermometer",
    name: "Thermometer",
    icon: (
      <div className="w-9 h-9 flex items-center justify-center">
        <div className="w-1 h-7 bg-gray-300 border border-gray-400 rounded-full relative shadow-sm">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full -mb-0.5"></div>
          <div className="absolute bottom-3 left-0 right-0 h-2 bg-red-400 rounded-full"></div>
        </div>
      </div>
    ),
  },
];
