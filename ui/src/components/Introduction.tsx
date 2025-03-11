import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function Introduction() {
  const accordionItems = ["embeddings", "ai", "visualization", "usage"];
  const [openItems, setOpenItems] = useState<string[]>(accordionItems);

  const expandAll = () => {
    setOpenItems(accordionItems);
  };

  const collapseAll = () => {
    setOpenItems([]);
  };

  return (
    <div className="mb-12">
      <h1 className="mb-6 text-3xl font-bold">Understanding Text Embeddings</h1>

      <div className="mb-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={expandAll}>
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>
          Collapse All
        </Button>
      </div>

      <Accordion
        type="multiple"
        value={openItems}
        onValueChange={setOpenItems}
        className="space-y-6"
      >
        <AccordionItem value="embeddings" className="rounded-lg border border-white/10 bg-white/5">
          <AccordionTrigger className="cursor-pointer px-4 pt-2 text-xl font-semibold">
            What are Text Embeddings?
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <p className="mb-4">
              Text embeddings are numbers that represent words and sentences. These numbers
              represent the meaning of the text in a way that computers can understand and compare
              with other text embeddings. Texts with similar meanings will have similar embeddings,
              and texts with different meanings will have different embeddings.
            </p>
            <p>
              When we convert text to embeddings, we are essentially translating human language into
              a high-dimensional mathematical space where:
            </p>
            <ul className="my-4 list-disc space-y-2 pl-6">
              <li>Similar concepts are positioned near each other</li>
              <li>Related ideas form clusters</li>
              <li>Opposite concepts are placed far apart</li>
            </ul>
            <p className="mb-4">
              For example, the embeddings for &quot;dog&quot; and &quot;cat&quot; will be closer
              together than the embeddings for &quot;dog&quot; and &quot;car&quot;.
            </p>
            <p>
              There are different ways how to create these text embeddings, but usually it involves
              training a model on a large dataset of text to learn the relationships between words
              and sentences. One such example is the Word2Vec model, which you can learn more about{" "}
              {/* [here](https://en.wikipedia.org/wiki/Word2vec). */}
              <a
                href="https://en.wikipedia.org/wiki/Word2vec"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ai" className="rounded-lg border border-white/10 bg-white/5">
          <AccordionTrigger className="cursor-pointer px-4 pt-2 text-xl font-semibold">
            How This Relates to Modern AI
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <p className="mb-4">
              Text embeddings are used more and more in the modern days to help computers understand
              and deal with human language. For example, instead of using text directly, Large
              Language Models (LLMs) like ChatGPT, Claude, and others use text embeddings as a
              fundamental building block.
            </p>
            <p>
              Text embeddings are important both to understand the user's input text, and to
              generate some output. For example, the word "bank" could mean a financial institution,
              or the side of a river. The embedding helps the model understand the right meaning
              based on surrounding words and context.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="visualization"
          className="rounded-lg border border-white/10 bg-white/5"
        >
          <AccordionTrigger className="cursor-pointer px-4 pt-2 text-xl font-semibold">
            About This Tool
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <p className="mb-4">
              This is the Text Embedding Visualizer tool. In this tool, you can enter different
              pieces of text, see what embeddings are generated, and see how the embeddings relate
              to each other in embedding space.
            </p>
            <p className="mb-4">
              This tool uses the{" "}
              <a
                href="https://huggingface.co/Xenova/all-MiniLM-L6-v2"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Xenova/all-MiniLM-L6-v2
              </a>{" "}
              model to generate text embeddings. Since real text embeddings usually have hundreds of
              dimensions (384 dimensions in our case), it's not trivial to visualize and see them in
              a nice way. So, in this tool, we use a few{" "}
              <a
                href="https://en.wikipedia.org/wiki/Dimensionality_reduction"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                dimensionality reduction
              </a>{" "}
              methods to reduce the embeddings to 2D and 3D for visualization:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>
                <strong>PCA</strong> (
                <a
                  href="https://en.wikipedia.org/wiki/Principal_component_analysis"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Principal Component Analysis
                </a>
                )
              </li>
              <li>
                <strong>t-SNE</strong> (
                <a
                  href="https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  t-Distributed Stochastic Neighbor Embedding
                </a>
                )
              </li>
              <li>
                <strong>UMAP</strong> (
                <a
                  href="https://pair-code.github.io/understanding-umap/"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Uniform Manifold Approximation and Projection
                </a>
                )
              </li>
            </ul>
            <p>
              Each of these methods has its own strengths and weaknesses, and can provide different
              insights into the data. You can switch between these methods below to see how the
              embeddings are positioned in the 2D and 3D space using these different techniques.
              Different datasets may also require different methods to visualize effectively.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="usage" className="rounded-lg border border-white/10 bg-white/5">
          <AccordionTrigger className="cursor-pointer px-4 pt-2 text-xl font-semibold">
            How to Use This Tool
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <ol className="list-decimal space-y-2 pl-6">
              <li>Explore the preset text sample datasets</li>
              <li>
                Enter your own text samples if you'd like (requires you to Sign In - it's free!). At
                least 3 different text samples are required
              </li>
              <li>Explore the raw generated embedding values</li>
              <li>
                View the 2D and 3D visualizations to see how your text samples relate to each other.
                You can hover over the points to see more information about each point. You can also
                click and drag to rotate the 3D visualization
              </li>
              <li>Try different text samples to see how the relationships change</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
