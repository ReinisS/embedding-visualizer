"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { presetExamples } from "@/lib/presets";
import { VisualizationResponse } from "@/lib/types";

interface TextInputFormProps {
  onSubmit: (texts: string[]) => void;
  onPresetSelect: (presetId: string, visualizationData: VisualizationResponse) => void;
  isLoading: boolean;
}

export default function TextInputForm({ onSubmit, onPresetSelect, isLoading }: TextInputFormProps) {
  const { isSignedIn } = useAuth();
  const [texts, setTexts] = useState<string[]>(["", "", ""]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isCustomInput, setIsCustomInput] = useState(false);

  const handlePresetSelect = useCallback(
    (presetId: string) => {
      const preset = presetExamples.find((p) => p.id === presetId);
      if (preset) {
        setTexts(preset.texts);
        setActivePreset(presetId);
        setIsCustomInput(false);

        // If preset has visualization data, notify parent component
        if (preset.visualizationData) {
          onPresetSelect(presetId, preset.visualizationData);
        }
      }
    },
    [onPresetSelect]
  );

  // Select the first preset by default when component mounts
  useEffect(() => {
    if (presetExamples.length > 0 && !activePreset) {
      handlePresetSelect(presetExamples[0].id);
    }
  }, [activePreset, handlePresetSelect]);

  const handleTextChange = (index: number, value: string) => {
    const newTexts = [...texts];
    newTexts[index] = value;
    setTexts(newTexts);
    setActivePreset(null);
    setIsCustomInput(true);
  };

  const handleAddText = () => {
    setTexts([...texts, ""]);
    setIsCustomInput(true);
  };

  const handleRemoveText = (index: number) => {
    if (texts.length <= 3) {
      return; // Maintain minimum of 3 text inputs
    }
    const newTexts = [...texts];
    newTexts.splice(index, 1);
    setTexts(newTexts);
    setActivePreset(null);
    setIsCustomInput(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredTexts = texts.filter((text) => text.trim() !== "");
    if (filteredTexts.length < 3) {
      alert("Please enter at least 3 text samples");
      return;
    }
    onSubmit(filteredTexts);
  };

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">Enter Text Samples</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {presetExamples.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                activePreset === preset.id
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {texts.map((text, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-grow">
              <textarea
                value={text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                placeholder={`Text sample ${index + 1}`}
                className="w-full rounded-md border border-white/10 bg-white/5 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={2}
                maxLength={100}
              />
              <div className="mt-1 text-right text-xs text-gray-400">
                {text.length}/100 characters
              </div>
            </div>
            {texts.length > 3 && (
              <button
                type="button"
                onClick={() => handleRemoveText(index)}
                className="self-start p-2 text-gray-400 hover:text-white"
                aria-label="Remove text input"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleAddText}
            className="rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            + Add Another Text
          </button>

          {isSignedIn ? (
            <button
              type="submit"
              disabled={isLoading || !isCustomInput}
              className={`rounded-md px-6 py-2 font-medium text-white ${
                isLoading
                  ? "cursor-not-allowed bg-blue-600/50"
                  : !isCustomInput
                    ? "cursor-default bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading
                ? "Processing..."
                : !isCustomInput
                  ? "Using Preset Data"
                  : "Visualize Custom Input"}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
              >
                Sign In to Visualize
              </button>
            </SignInButton>
          )}
        </div>
      </form>
    </div>
  );
}
