import express from "express";
import { storage } from "../dist/index.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mock storage for Vercel (since we can't import the full server)
const mockStorage = {
  async getAllExperiments() {
    return [
      {
        id: 1,
        title: "Aspirin Synthesis",
        description:
          "Learn the synthesis of acetylsalicylic acid through a step-by-step laboratory procedure.",
        category: "Organic Chemistry",
        difficulty: "Intermediate",
        duration: 45,
        steps: 8,
        rating: 48,
        imageUrl: "/api/placeholder/400/300",
        equipment: ["Round-bottom flask", "Reflux condenser", "Heating mantle"],
        stepDetails: [],
        safetyInfo: "Wear safety goggles and gloves at all times.",
      },
      {
        id: 2,
        title: "Acid-Base Titration",
        description:
          "Master the fundamentals of acid-base titrations and pH curve analysis.",
        category: "Analytical Chemistry",
        difficulty: "Beginner",
        duration: 30,
        steps: 6,
        rating: 46,
        imageUrl: "/api/placeholder/400/300",
        equipment: ["Burette", "Conical flask", "pH meter"],
        stepDetails: [],
        safetyInfo: "Handle acids and bases with care.",
      },
    ];
  },

  async getExperiment(id) {
    const experiments = await this.getAllExperiments();
    return experiments.find((exp) => exp.id === id);
  },
};

// API Routes
app.get("/api/experiments", async (req, res) => {
  try {
    const experiments = await mockStorage.getAllExperiments();
    res.json(experiments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch experiments" });
  }
});

app.get("/api/experiments/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid experiment ID" });
    }
    const experiment = await mockStorage.getExperiment(id);
    if (!experiment) {
      return res.status(404).json({ message: "Experiment not found" });
    }
    res.json(experiment);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch experiment" });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const stats = {
      experiments: 2,
      students: 2543,
      completed: 15678,
      rating: 4.9,
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Export for Vercel
export default app;
