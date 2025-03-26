"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import Introduction from "@/components/Introduction";
import TextInputForm from "@/components/TextInputForm";
import RawEmbeddings from "@/components/RawEmbeddings";
import GitHubButton from "@/components/GitHubButton";
import VisualizationTabs from "@/components/VisualizationTabs";
import useAuthenticatedFetch from "@/hooks/useAuthenticatedFetch";
import { fetchVisualization } from "@/lib/api";
import { VisualizationResponse } from "@/lib/types";
import { presetExamples } from "@/lib/presets";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<VisualizationResponse | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [texts, setTexts] = useState<string[]>(["", "", ""]);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const authenticatedFetch = useAuthenticatedFetch();
  const [hasMounted, setHasMounted] = useState(false);

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = presetExamples.find((p) => p.id === presetId);
    if (preset) {
      setTexts(preset.texts);
      setActivePresetId(presetId);
      setIsCustomInput(false);
      setError(null);

      if (preset.visualizationData) {
        setResults(preset.visualizationData);
      }
    }
  }, []);

  // Select the first preset by default when component first mounts
  useEffect(() => {
    if (!hasMounted && presetExamples.length > 0) {
      handlePresetSelect(presetExamples[0].id);
      setHasMounted(true);
    }
  }, [hasMounted, handlePresetSelect]);

  const handleTextChange = useCallback((index: number, value: string) => {
    setTexts((prevTexts) => {
      const newTexts = [...prevTexts];
      newTexts[index] = value;
      return newTexts;
    });
    setActivePresetId(null);
    setIsCustomInput(true);
  }, []);

  const handleClearData = useCallback(() => {
    setTexts(["", "", ""]);
    setActivePresetId(null);
    setIsCustomInput(true);
  }, []);

  const handleAddText = useCallback(() => {
    setTexts((prevTexts) => [...prevTexts, ""]);
    setActivePresetId(null);
    setIsCustomInput(true);
  }, []);

  const handleRemoveText = useCallback((index: number) => {
    setTexts((prevTexts) => {
      if (prevTexts.length <= 3) {
        return prevTexts; // Maintain minimum of 3 text inputs
      }
      const newTexts = [...prevTexts];
      newTexts.splice(index, 1);
      return newTexts;
    });
    setActivePresetId(null);
    setIsCustomInput(true);
  }, []);

  const handleSubmit = useCallback(
    async (texts: string[]) => {
      if (!isSignedIn) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchVisualization(authenticatedFetch, texts);
        setResults(response);
      } catch (err) {
        console.error("Error fetching visualization:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching the visualization data."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isSignedIn, authenticatedFetch]
  );

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4">
      <div className="mb-12 text-center">
        <h1 className="mb-2 text-3xl font-bold">Text Embedding Visualizer</h1>
        <p className="text-lg text-gray-400">
          Learn how computers understand the meaning behind text
        </p>

        <div className="mt-4 flex justify-center gap-4">
          <GitHubButton />
        </div>
      </div>

      <Introduction />

      <TextInputForm
        texts={texts}
        activePresetId={activePresetId}
        isCustomInput={isCustomInput}
        isLoading={isLoading}
        onTextChange={handleTextChange}
        onAddText={handleAddText}
        onRemoveText={handleRemoveText}
        onPresetSelect={handlePresetSelect}
        onSubmit={handleSubmit}
        onClearData={handleClearData}
      />

      {error && (
        <div
          className="mb-8 rounded-md bg-red-500/20 p-4"
          style={{ color: `var(--destructive-foreground)` }}
        >
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {results && results.results.length > 0 && (
        <>
          <RawEmbeddings results={results.results} />
          <VisualizationTabs results={results.results} />
        </>
      )}
    </div>
  );
}
