import React, { useState } from "react";
import { ItemResult } from "@/lib/types";

interface RawEmbeddingsProps {
  results: ItemResult[];
}

export default function RawEmbeddings({ results }: RawEmbeddingsProps) {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(10);

  if (!results || results.length === 0) {
    return null;
  }

  const toggleExpand = (index: number) => {
    if (expandedItem === index) {
      setExpandedItem(null);
    } else {
      setExpandedItem(index);
    }
  };

  const showMore = () => {
    setDisplayCount(Math.min(displayCount + 10, results[0].embedding.length));
  };

  const showLess = () => {
    setDisplayCount(Math.max(10, displayCount - 10));
  };

  return (
    <div className="mb-12">
      <h2 className="mb-4 text-xl font-semibold">Raw Embedding Vectors</h2>
      <p className="mb-6 text-gray-300">
        Below are the raw embedding vectors for each text input. Each vector has hundreds of
        dimensions, representing different semantic features of the text. Similar texts will have
        similar values across these dimensions.
      </p>

      <div className="space-y-4">
        {results.map((item, index) => (
          <div key={index} className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
            <div
              className="flex cursor-pointer items-center justify-between p-4 hover:bg-white/10"
              onClick={() => toggleExpand(index)}
            >
              <div className="font-medium">
                <span className="mr-2 inline-block h-3 w-3 rounded-full bg-blue-500"></span>
                {item.label.length > 50 ? `${item.label.substring(0, 50)}...` : item.label}
              </div>
              <div className="text-sm text-gray-400">
                {item.embedding.length} dimensions
                <span className="ml-2">{expandedItem === index ? "▲" : "▼"}</span>
              </div>
            </div>

            {expandedItem === index && (
              <div className="border-t border-white/10 p-4">
                <div className="mb-2 flex justify-between text-sm text-gray-400">
                  <div>
                    Showing dimensions 0-{displayCount - 1} of {item.embedding.length}
                  </div>
                  <div className="flex gap-3">
                    {displayCount > 10 && (
                      <button onClick={showLess} className="hover:text-white">
                        Show fewer
                      </button>
                    )}
                    {displayCount < item.embedding.length && (
                      <button onClick={showMore} className="hover:text-white">
                        Show more
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {item.embedding.slice(0, displayCount).map((value, i) => (
                    <div key={i} className="rounded bg-white/5 p-2 text-xs">
                      <span className="text-gray-400">Dim {i}:</span> {value.toFixed(4)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
