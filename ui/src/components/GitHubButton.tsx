import { Button } from "@/components/ui/button";
import { SiGithub } from "@icons-pack/react-simple-icons";

function GitHubButton() {
  return (
    <Button variant="default" size="lg">
      <a
        href="https://github.com/ReinisS/embedding-visualizer"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="flex items-center gap-2">
          <SiGithub className="h-6 w-6" />
          View code of this project on GitHub
        </div>
      </a>
    </Button>
  );
}

export default GitHubButton;
