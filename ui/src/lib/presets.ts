import { PresetExample, VisualizationResponse } from "./types";
import petsFinanceFruitsVehiclesData from "./petsFinanceFruitsVehiclesResult.json";
import emotionsColorsShapesData from "./emotionsColorsShapesResult.json";
import weatherEmotionsData from "./weatherEmotionsResult.json";
import mixedSentencesData from "./mixedSentencesResult.json";

export const presetExamples: PresetExample[] = [
  {
    id: "petsFinanceFruitsVehicles",
    name: "Pets, Finance, Fruits, Vehicles",
    texts: petsFinanceFruitsVehiclesData.results.map((item) => item.label),
    visualizationData: petsFinanceFruitsVehiclesData as VisualizationResponse,
  },
  {
    id: "emotionsColorsShapes",
    name: "Emotions, Colors, Shapes",
    texts: emotionsColorsShapesData.results.map((item) => item.label),
    visualizationData: emotionsColorsShapesData as VisualizationResponse,
  },
  {
    id: "weatherEmotions",
    name: "Weather & Emotions",
    texts: weatherEmotionsData.results.map((item) => item.label),
    visualizationData: weatherEmotionsData as VisualizationResponse,
  },
  {
    id: "mixedSentences",
    name: "Mixed Sentences",
    texts: mixedSentencesData.results.map((item) => item.label),
    visualizationData: mixedSentencesData as VisualizationResponse,
  },
];
