import React, { useState, useEffect } from "react";
import { FlaskConical, Play, Pause, RotateCcw } from "lucide-react";
import { AnimatedEquipment } from "./AnimatedEquipment";
import { ExperimentSteps } from "./ExperimentSteps";

interface WorkBenchProps {
  onDrop: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
  selectedChemical: string | null;
  isRunning: boolean;
  experimentTitle: string;
  currentGuidedStep?: number;
}

interface Step {
  id: number;
  title: string;
  description: string;
  duration: number;
  status: "pending" | "active" | "completed" | "warning";
  requirements?: string[];
}

export const WorkBench: React.FC<WorkBenchProps> = ({
  onDrop,
  children,
  selectedChemical,
  isRunning,
  experimentTitle,
  currentGuidedStep = 1,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [temperature, setTemperature] = useState(22);
  const [volume, setVolume] = useState(0);
  const [solutionColor, setSolutionColor] = useState("#E3F2FD");
  const [isStirring, setIsStirring] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [bubbling, setBubbling] = useState(false);
  const [timer, setTimer] = useState(0);
  const [autoProgress, setAutoProgress] = useState(false);

  const experimentSteps: Step[] = [
    {
      id: 1,
      title: "Setup Equipment",
      description: "Arrange burette, conical flask, and magnetic stirrer",
      duration: 2,
      status:
        currentStep === 1
          ? "active"
          : currentStep > 1
            ? "completed"
            : "pending",
      requirements: [
        "Burette with clamp",
        "250mL conical flask",
        "Magnetic stirrer",
      ],
    },
    {
      id: 2,
      title: "Prepare Solutions",
      description: "Fill burette with NaOH solution and add HCl to flask",
      duration: 3,
      status:
        currentStep === 2
          ? "active"
          : currentStep > 2
            ? "completed"
            : "pending",
      requirements: [
        "0.1M NaOH solution",
        "25mL 0.1M HCl",
        "Phenolphthalein indicator",
      ],
    },
    {
      id: 3,
      title: "Add Indicator",
      description: "Add 2-3 drops of phenolphthalein to the acid solution",
      duration: 1,
      status:
        currentStep === 3
          ? "active"
          : currentStep > 3
            ? "completed"
            : "pending",
      requirements: ["Phenolphthalein indicator"],
    },
    {
      id: 4,
      title: "Begin Titration",
      description: "Start adding NaOH dropwise while stirring continuously",
      duration: 8,
      status:
        currentStep === 4
          ? "active"
          : currentStep > 4
            ? "completed"
            : "pending",
      requirements: ["Continuous stirring", "Slow addition of base"],
    },
    {
      id: 5,
      title: "Approach End Point",
      description: "Add base drop by drop as color changes become visible",
      duration: 5,
      status:
        currentStep === 5
          ? "active"
          : currentStep > 5
            ? "completed"
            : "pending",
      requirements: ["Very slow addition", "Careful observation"],
    },
    {
      id: 6,
      title: "Detect End Point",
      description: "Stop when permanent pink color appears",
      duration: 2,
      status:
        currentStep === 6
          ? "active"
          : currentStep > 6
            ? "completed"
            : "pending",
      requirements: ["Permanent color change"],
    },
    {
      id: 7,
      title: "Record Results",
      description: "Note the volume of NaOH used and calculate concentration",
      duration: 3,
      status:
        currentStep === 7
          ? "active"
          : currentStep > 7
            ? "completed"
            : "pending",
      requirements: ["Accurate volume reading"],
    },
    {
      id: 8,
      title: "Repeat Titration",
      description: "Perform 2-3 more titrations for accuracy",
      duration: 15,
      status:
        currentStep === 8
          ? "active"
          : currentStep > 8
            ? "completed"
            : "pending",
      requirements: ["Fresh solutions", "Clean equipment"],
    },
  ];

  // Auto-progress through experiment steps
  useEffect(() => {
    if (isRunning && autoProgress) {
      const stepDuration = experimentSteps[currentStep - 1]?.duration || 5;
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);

        // Progress to next step based on duration
        if (timer >= stepDuration * 60) {
          // Convert minutes to seconds
          if (currentStep < experimentSteps.length) {
            setCurrentStep((prev) => prev + 1);
            setTimer(0);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, autoProgress, currentStep, timer, experimentSteps]);

  // Step-specific animations and effects
  useEffect(() => {
    switch (currentStep) {
      case 1: // Setup
        setIsStirring(false);
        setIsDropping(false);
        setBubbling(false);
        break;
      case 2: // Prepare solutions
        setVolume(0);
        setSolutionColor("#FFE135"); // HCl color
        break;
      case 3: // Add indicator
        setSolutionColor("#FFCCCB"); // Slight pink tint
        break;
      case 4: // Begin titration
        setIsStirring(true);
        setIsDropping(true);
        // Gradually increase volume
        const volumeInterval = setInterval(() => {
          setVolume((prev) => {
            if (prev < 20) return prev + 0.5;
            return prev;
          });
        }, 2000);
        setTimeout(() => clearInterval(volumeInterval), 20000);
        break;
      case 5: // Approach end point
        setIsDropping(true);
        setSolutionColor("#FFB6C1"); // Light pink
        setBubbling(true);
        break;
      case 6: // End point
        setIsDropping(false);
        setSolutionColor("#FF69B4"); // Bright pink
        setBubbling(false);
        break;
      case 7: // Record results
        setIsStirring(false);
        break;
      case 8: // Repeat
        // Reset for next titration
        setTimeout(() => {
          setVolume(0);
          setSolutionColor("#FFE135");
          setCurrentStep(2);
        }, 3000);
        break;
    }
  }, [currentStep]);

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    setTimer(0);
  };

  const handleAutoProgress = () => {
    setAutoProgress(!autoProgress);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setTimer(0);
    setTemperature(22);
    setVolume(0);
    setSolutionColor("#E3F2FD");
    setIsStirring(false);
    setIsDropping(false);
    setBubbling(false);
    setAutoProgress(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Try multiple data types to get equipment data
    let id = e.dataTransfer.getData("equipment");
    if (!id) {
      id = e.dataTransfer.getData("text/plain");
    }
    if (!id) {
      try {
        const jsonData = e.dataTransfer.getData("application/json");
        if (jsonData) {
          const parsed = JSON.parse(jsonData);
          if (parsed.type === "equipment") {
            id = parsed.id;
          }
        }
      } catch (error) {
        console.warn("Failed to parse JSON data from drag event");
      }
    }

    console.log(`Dropping equipment: ${id}`);

    if (id) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      console.log(`Drop position: x=${x}, y=${y} for equipment: ${id}`);

      // Call the onDrop handler
      onDrop(id, x, y);
    } else {
      console.warn("No equipment ID found in drop event", {
        types: Array.from(e.dataTransfer.types),
        equipment: e.dataTransfer.getData("equipment"),
        textPlain: e.dataTransfer.getData("text/plain"),
      });
    }
  };

  return (
    <div className="w-full h-full">
      {/* Main Lab Bench - Full Width and Much Larger */}
      <div className="w-full h-full">
        <div className="bg-white rounded-lg shadow-lg border h-full">
          <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FlaskConical className="mr-3" size={28} />
                <div>
                  <h2 className="text-2xl font-bold">Virtual Chemistry Lab</h2>
                  <p className="text-sm opacity-90">
                    {experimentTitle.includes("Acid-Base")
                      ? "Interactive Titration Workspace"
                      : experimentTitle.includes("Aspirin")
                        ? "Aspirin Synthesis Workspace"
                        : "Interactive Chemistry Workspace"}
                  </p>
                </div>
              </div>

              {/* Quick Controls in Header - Only show for relevant experiments */}
              <div className="flex items-center space-x-3">
                {experimentTitle.includes("Acid-Base") && (
                  <>
                    <button
                      onClick={() => setIsStirring(!isStirring)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isStirring
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      {isStirring ? "Stop Stirring" : "Start Stirring"}
                    </button>

                    <button
                      onClick={() => setIsDropping(!isDropping)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDropping
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      {isDropping ? "Stop Titrant" : "Start Titrant"}
                    </button>
                  </>
                )}

                <div className="text-xs text-white/80">{experimentTitle}</div>
              </div>
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative w-full overflow-hidden"
            style={{
              height: "calc(75vh - 160px)", // Adjusted for top/bottom bars
              minHeight: "500px",
              backgroundImage: `
                linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: "25px 25px",
            }}
          >
            {/* Lab Bench Surface - More prominent */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-200 via-amber-150 to-amber-100 border-t-2 border-amber-300">
              <div className="absolute inset-0 opacity-40 bg-gradient-to-r from-amber-300 to-amber-200"></div>
              {/* Enhanced lab bench texture */}
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 3px,
                  rgba(0,0,0,0.1) 3px,
                  rgba(0,0,0,0.1) 6px
                )`,
                }}
              ></div>
              {/* Lab bench edge highlight */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 opacity-60"></div>
            </div>

            {/* Note: Equipment is now dynamically placed by user interaction */}

            {/* Helpful hints for Aspirin Synthesis */}
            {experimentTitle.includes("Aspirin") && (
              <div className="absolute top-6 left-6 bg-blue-100 border-2 border-blue-300 rounded-lg p-4 max-w-sm z-20">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-blue-800 text-sm">
                    Step {currentGuidedStep}
                  </span>
                </div>
                <div className="text-xs text-blue-700">
                  {currentGuidedStep === 1 &&
                    "Drag the Erlenmeyer Flask to the workbench to begin"}
                  {currentGuidedStep === 2 && "Add Salicylic Acid to the flask"}
                  {currentGuidedStep === 3 &&
                    "Add Acetic Anhydride to the flask"}
                  {currentGuidedStep === 4 && "Add Phosphoric Acid catalyst"}
                  {currentGuidedStep === 5 &&
                    "Set up the Water Bath for heating"}
                  {currentGuidedStep === 6 && "Heat the reaction mixture"}
                  {currentGuidedStep > 6 &&
                    "Aspirin synthesis steps completed!"}
                </div>
              </div>
            )}

            {/* Equipment placement area with more generous spacing */}
            <div className="absolute inset-0 p-12">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
