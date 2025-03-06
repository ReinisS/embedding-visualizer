// Types based on the backend schemas

export interface TextInput {
  text: string;
}

export interface Coordinates2D {
  x: number;
  y: number;
}

export interface Coordinates3D {
  x: number;
  y: number;
  z: number;
}

export interface DimensionalityReductionResult {
  algorithm: "pca" | "tsne" | "umap";
  coordinates_2d: Coordinates2D;
  coordinates_3d: Coordinates3D;
}

export interface VisualizationRequest {
  texts: TextInput[];
}

export interface ItemResult {
  label: string;
  embedding: number[];
  reductions: DimensionalityReductionResult[];
}

export interface VisualizationResponse {
  results: ItemResult[];
}

// UI specific types
export interface PresetExample {
  id: string;
  name: string;
  texts: string[];
  visualizationData?: VisualizationResponse;
}
