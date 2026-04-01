import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, Download, Loader2, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { ReelIdea } from "@/components/IdeaCard";

interface VideoGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: ReelIdea | null;
  platform?: string;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const FPS = 30;
const DURATION_SECONDS = 12;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;

// Color themes per vibe
const THEMES = [
  { bg1: "#0f0f23", bg2: "#1a1a3e", accent: "#ff6b6b", text: "#ffffff", sub: "#b8b8d4" },
  { bg1: "#0d1117", bg2: "#161b22", accent: "#58a6ff", text: "#f0f6fc", sub: "#8b949e" },
  { bg1: "#1a0a2e", bg2: "#2d1b4e", accent: "#f72585", text: "#ffffff", sub: "#c8b6ff" },
  { bg1: "#0b1d0b", bg2: "#1a3a1a", accent: "#00ff87", text: "#ffffff", sub: "#a8d5ba" },
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawAnimatedBackground(
  ctx: CanvasRenderingContext2D,
  frame: number,
  theme: typeof THEMES[0]
) {
  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  grad.addColorStop(0, theme.bg1);
  grad.addColorStop(1, theme.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Floating circles
  const t = frame / TOTAL_FRAMES;
  for (let i = 0; i < 5; i++) {
    const x = CANVAS_WIDTH * (0.2 + 0.6 * Math.sin(t * Math.PI * 2 + i * 1.3));
    const y = CANVAS_HEIGHT * (0.15 + 0.7 * Math.cos(t * Math.PI * 1.5 + i * 0.9));
    const r = 80 + 60 * Math.sin(t * Math.PI * 3 + i);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = theme.accent + "15";
    ctx.fill();
  }

  // Accent line at top
  const lineWidth = CANVAS_WIDTH * easeOutCubic(Math.min(frame / 20, 1));
  ctx.fillStyle = theme.accent;
  ctx.fillRect((CANVAS_WIDTH - lineWidth) / 2, 0, lineWidth, 6);
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  frame: number,
  idea: ReelIdea,
  theme: typeof THEMES[0]
) {
  drawAnimatedBackground(ctx, frame, theme);

  const padding = 80;
  const maxTextWidth = CANVAS_WIDTH - padding * 2;

  // Scene 1: Hook (frames 0–100)
  if (frame < 110) {
    const enter = easeOutCubic(Math.min(frame / 20, 1));
    const exit = frame > 85 ? easeInOutQuad((frame - 85) / 25) : 0;
    const alpha = enter * (1 - exit);
    const yOffset = (1 - enter) * 60 + exit * -40;

    ctx.globalAlpha = alpha;

    // "HOOK" label
    ctx.font = `bold 36px "Arial", sans-serif`;
    ctx.fillStyle = theme.accent;
    ctx.textAlign = "center";
    ctx.fillText("🎣 HOOK", CANVAS_WIDTH / 2, 350 + yOffset);

    // Hook text
    ctx.font = `bold 64px "Arial", sans-serif`;
    ctx.fillStyle = theme.text;
    const hookLines = wrapText(ctx, idea.hook, maxTextWidth);
    hookLines.forEach((line, i) => {
      const lineDelay = i * 5;
      const lineAlpha = easeOutCubic(Math.min(Math.max(frame - lineDelay, 0) / 15, 1));
      ctx.globalAlpha = alpha * lineAlpha;
      ctx.fillText(line, CANVAS_WIDTH / 2, 450 + i * 80 + yOffset);
    });

    // Viral score badge
    if (frame > 30) {
      const badgeEnter = easeOutCubic(Math.min((frame - 30) / 15, 1));
      ctx.globalAlpha = alpha * badgeEnter;
      const badgeY = 450 + hookLines.length * 80 + 60 + yOffset;
      const badgeW = 200;
      const badgeH = 60;
      const badgeX = (CANVAS_WIDTH - badgeW) / 2;

      // Badge background
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 30);
      ctx.fillStyle = theme.accent;
      ctx.fill();

      ctx.font = `bold 32px "Arial", sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`⚡ ${idea.viralScore}% Viral`, CANVAS_WIDTH / 2, badgeY + 42);
    }

    ctx.globalAlpha = 1;
  }

  // Scene 2: Script (frames 90–250)
  if (frame >= 90 && frame < 260) {
    const localFrame = frame - 90;
    const enter = easeOutCubic(Math.min(localFrame / 20, 1));
    const exit = localFrame > 145 ? easeInOutQuad((localFrame - 145) / 25) : 0;
    const alpha = enter * (1 - exit);
    const yOffset = (1 - enter) * 80;

    ctx.globalAlpha = alpha;

    // "SCRIPT" label
    ctx.font = `bold 36px "Arial", sans-serif`;
    ctx.fillStyle = theme.accent;
    ctx.textAlign = "center";
    ctx.fillText("📝 SCRIPT", CANVAS_WIDTH / 2, 250 + yOffset);

    // Script text - animated word by word
    ctx.font = `40px "Arial", sans-serif`;
    ctx.fillStyle = theme.text;
    const scriptLines = wrapText(ctx, idea.script.substring(0, 300) + (idea.script.length > 300 ? "..." : ""), maxTextWidth);
    const maxLines = Math.min(scriptLines.length, 14);
    for (let i = 0; i < maxLines; i++) {
      const lineDelay = i * 3;
      const lineAlpha = easeOutCubic(Math.min(Math.max(localFrame - 10 - lineDelay, 0) / 12, 1));
      ctx.globalAlpha = alpha * lineAlpha;
      ctx.fillText(scriptLines[i], CANVAS_WIDTH / 2, 340 + i * 55 + yOffset);
    }

    ctx.globalAlpha = 1;
  }

  // Scene 3: Caption (frames 240–320)
  if (frame >= 240 && frame < 330) {
    const localFrame = frame - 240;
    const enter = easeOutCubic(Math.min(localFrame / 20, 1));
    const exit = localFrame > 65 ? easeInOutQuad((localFrame - 65) / 25) : 0;
    const alpha = enter * (1 - exit);
    const scale = 0.8 + 0.2 * enter;

    ctx.globalAlpha = alpha;
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.scale(scale, scale);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);

    // "CAPTION" label
    ctx.font = `bold 36px "Arial", sans-serif`;
    ctx.fillStyle = theme.accent;
    ctx.textAlign = "center";
    ctx.fillText("✍️ CAPTION", CANVAS_WIDTH / 2, 400);

    // Caption text
    ctx.font = `44px "Arial", sans-serif`;
    ctx.fillStyle = theme.text;
    const captionLines = wrapText(ctx, idea.caption, maxTextWidth);
    captionLines.slice(0, 10).forEach((line, i) => {
      ctx.fillText(line, CANVAS_WIDTH / 2, 500 + i * 60);
    });

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Scene 4: Hashtags (frames 310–360)
  if (frame >= 310) {
    const localFrame = frame - 310;
    const enter = easeOutCubic(Math.min(localFrame / 20, 1));
    const alpha = enter;

    ctx.globalAlpha = alpha;

    // "HASHTAGS" label
    ctx.font = `bold 36px "Arial", sans-serif`;
    ctx.fillStyle = theme.accent;
    ctx.textAlign = "center";
    ctx.fillText("# HASHTAGS", CANVAS_WIDTH / 2, 500);

    // Hashtags
    ctx.font = `bold 42px "Arial", sans-serif`;
    ctx.fillStyle = theme.accent;
    const hashLines = wrapText(ctx, idea.hashtags, maxTextWidth);
    hashLines.slice(0, 8).forEach((line, i) => {
      const tagDelay = i * 6;
      const tagAlpha = easeOutCubic(Math.min(Math.max(localFrame - 10 - tagDelay, 0) / 12, 1));
      ctx.globalAlpha = alpha * tagAlpha;
      ctx.fillText(line, CANVAS_WIDTH / 2, 590 + i * 60);
    });

    // Title at bottom
    if (localFrame > 20) {
      const titleAlpha = easeOutCubic(Math.min((localFrame - 20) / 15, 1));
      ctx.globalAlpha = titleAlpha;
      ctx.font = `bold 32px "Arial", sans-serif`;
      ctx.fillStyle = theme.sub;
      ctx.fillText(idea.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 200);
    }

    // Branding
    if (localFrame > 30) {
      const brandAlpha = easeOutCubic(Math.min((localFrame - 30) / 15, 1));
      ctx.globalAlpha = brandAlpha * 0.6;
      ctx.font = `24px "Arial", sans-serif`;
      ctx.fillStyle = theme.sub;
      ctx.fillText("Made with Viral Reel Generator ⚡", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 120);
    }

    ctx.globalAlpha = 1;
  }
}

export function VideoGeneratorDialog({ open, onOpenChange, idea, platform }: VideoGeneratorDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const animFrameRef = useRef<number>(0);

  // Cleanup video URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  // Show preview animation when dialog opens
  useEffect(() => {
    if (!open || !idea || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const theme = THEMES[idea.id % THEMES.length];
    let frame = 0;
    let running = true;

    const animate = () => {
      if (!running) return;
      renderFrame(ctx, frame % TOTAL_FRAMES, idea, theme);
      frame++;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [open, idea]);

  const generateVideo = useCallback(async () => {
    if (!idea || !canvasRef.current) return;

    setGenerating(true);
    setProgress(0);
    setVideoUrl(null);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("Canvas not supported");
      setGenerating(false);
      return;
    }

    const theme = THEMES[idea.id % THEMES.length];

    try {
      const stream = canvas.captureStream(FPS);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 5000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const videoReady = new Promise<string>((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          resolve(URL.createObjectURL(blob));
        };
      });

      mediaRecorder.start();

      // Render each frame
      for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
        renderFrame(ctx, frame, idea, theme);
        setProgress(Math.round((frame / TOTAL_FRAMES) * 100));

        // Wait for next frame timing
        await new Promise((r) => setTimeout(r, 1000 / FPS));
      }

      mediaRecorder.stop();
      const url = await videoReady;
      setVideoUrl(url);
      toast.success("Video created! 🎬");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate video. Try a different browser.");
    } finally {
      setGenerating(false);
    }
  }, [idea]);

  const handleDownload = () => {
    if (!videoUrl || !idea) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `reel-${idea.title.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}.webm`;
    a.click();
    toast.success("Video downloaded! 📥");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Video className="h-5 w-5 text-primary" />
            Create Reel Video
          </DialogTitle>
          <DialogDescription>
            Generate an animated video from your reel idea with hooks, script, captions & hashtags.
          </DialogDescription>
        </DialogHeader>

        {idea && (
          <div className="space-y-4">
            {/* Preview */}
            <div className="mx-auto overflow-hidden rounded-xl border border-border" style={{ maxWidth: 240 }}>
              <canvas
                ref={previewCanvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full"
                style={{ aspectRatio: "9/16" }}
              />
            </div>

            {/* Hidden render canvas */}
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="hidden"
            />

            {/* Progress */}
            {generating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Rendering video…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Video result */}
            {videoUrl && (
              <div className="overflow-hidden rounded-xl border border-primary/30">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full"
                  style={{ maxHeight: 400 }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {!videoUrl ? (
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={generateVideo}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {generating ? `Rendering… ${progress}%` : "Generate Video"}
                </Button>
              ) : (
                <>
                  <Button variant="gradient" className="flex-1" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Video
                  </Button>
                  <Button variant="outline" onClick={() => { setVideoUrl(null); generateVideo(); }}>
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Redo
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
