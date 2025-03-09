import React, { useState } from "react";
import { ItemResult } from "@/lib/types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface RawEmbeddingsProps {
  results: ItemResult[];
}

export default function RawEmbeddings({ results }: RawEmbeddingsProps) {
  const [displayCount, setDisplayCount] = useState(20);

  if (!results || results.length === 0) {
    return null;
  }

  const showMore = () => {
    setDisplayCount(Math.min(displayCount + 20, results[0].embedding.length));
  };

  const showLess = () => {
    setDisplayCount(Math.max(20, displayCount - 20));
  };

  return (
    <div className="mb-12">
      <Accordion type="single" collapsible>
        <AccordionItem
          value="raw-embeddings"
          className="rounded-lg border border-white/10 bg-white/5 px-4"
        >
          <AccordionTrigger className="cursor-pointer pt-2 text-xl font-semibold">
            Raw Embedding Vectors
          </AccordionTrigger>
          <AccordionContent>
            <p className="mb-6 text-gray-300">
              Below are the raw embedding vectors for each text input. Each vector has hundreds of
              dimensions, representing different semantic features of the text. Similar texts will
              have similar values across these dimensions.
            </p>

            <div className="space-y-4">
              <Accordion type="single" collapsible>
                {results.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="overflow-hidden rounded-lg border border-white/10 bg-white/5"
                  >
                    <AccordionTrigger className="cursor-pointer p-4">
                      <div className="font-medium">
                        {item.label.length > 50 ? `${item.label.substring(0, 50)}...` : item.label}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t border-white/10 p-4">
                      <div className="mb-2 flex justify-between text-sm text-gray-400">
                        <div>
                          Showing dimensions 0-{displayCount - 1} of {item.embedding.length}
                        </div>
                        <div className="flex gap-3">
                          {displayCount > 20 && (
                            <Button variant="outline" onClick={showLess}>
                              Show fewer
                            </Button>
                          )}
                          {displayCount < item.embedding.length && (
                            <Button variant="outline" onClick={showMore}>
                              Show more
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2 sm:grid-cols-5 md:grid-cols-10 lg:grid-cols-10">
                        {item.embedding.slice(0, displayCount).map((value, i) => (
                          <div key={i} className="rounded bg-white/5 p-2 text-xs">
                            {value.toFixed(4)}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
