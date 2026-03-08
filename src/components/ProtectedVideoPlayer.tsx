import { useRef, useState } from "react";
import { Play, Pause, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedVideoPlayerProps {
  src: string;
  watermarkText?: string;
}

export function ProtectedVideoPlayer({ src, watermarkText = "PREVIEW ONLY" }: ProtectedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div
      className="group relative overflow-hidden rounded-lg bg-muted"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* Video element — no controls, no download */}
      <video
        ref={videoRef}
        src={src}
        className="aspect-video w-full object-cover"
        loop
        muted
        playsInline
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onEnded={() => setPlaying(false)}
      />

      {/* Watermark overlay — blocks screen capture quality */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="select-none text-lg font-bold tracking-widest text-foreground/10 sm:text-2xl">
          {watermarkText}
        </span>
      </div>

      {/* Transparent overlay to block drag/save */}
      <div className="absolute inset-0" style={{ background: "transparent" }} />

      {/* Play/Pause button */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-12 w-12 rounded-full bg-background/60 text-foreground backdrop-blur-sm hover:bg-background/80"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
      </div>

      {/* Badge */}
      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
        <Eye className="h-3 w-3" />
        View only
      </div>
    </div>
  );
}
