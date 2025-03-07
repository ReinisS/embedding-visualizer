import { VisualizationRequest, VisualizationResponse } from "./types";

// Define the base URL for the API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/embedding-visualizer/api";

// Function to create a visualization request
export const createVisualizationRequest = (texts: string[]): VisualizationRequest => {
  return {
    texts: texts.map((text) => ({ text })),
  };
};

// Function to fetch visualization data
export const fetchVisualization = async (
  authenticatedFetch: <T>(url: string, options?: RequestInit) => Promise<T>,
  texts: string[]
): Promise<VisualizationResponse> => {
  if (texts.length < 3) {
    throw new Error("At least 3 text inputs are required");
  }

  const request = createVisualizationRequest(texts);

  try {
    return await authenticatedFetch<VisualizationResponse>(`${API_BASE_URL}/visualize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  } catch (error) {
    console.error("Error fetching visualization data:", error);
    throw error;
  }
};
