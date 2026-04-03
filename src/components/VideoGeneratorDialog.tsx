import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, Download, Loader2, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
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
const DURATION_SECONDS = 15;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;

const THEMES = [
  { bg1: "#0f0f23", bg2: "#1a1a3e", accent: "#ff6b6b", text: "#ffffff", sub: "#b8b8d4", char: "😎" },
  { bg1: "#0d1117", bg2: "#161b22", accent: "#58a6ff", text: "#f0f6fc", sub: "#8b949e", char: "🤓" },
  { bg1: "#1a0a2e", bg2: "#2d1b4e", accent: "#f72585", text: "#ffffff", sub: "#c8b6ff", char: "🔥" },
  { bg1: "#0b1d0b", bg2: "#1a3a1a", accent: "#00ff87", text: "#ffffff", sub: "#a8d5ba", char: "💪" },
];

// Animated character poses (emoji sequences for different moods)
const CHARACTER_SETS: Record<string, string[]> = {
  motivation: ["💪", "🏆", "⭐", "🚀", "🔥"],
  comedy: ["😂", "🤣", "😜", "🎭", "😆"],
  fitness: ["🏋️", "💪", "🏃", "🧘", "⚡"],
  cooking: ["👨‍🍳", "🍳", "🔪", "🍕", "😋"],
  tech: ["💻", "🤖", "📱", "⚙️", "🧠"],
  beauty: ["💄", "✨", "💅", "🌟", "💫"],
  education: ["📚", "🎓", "✏️", "🧠", "💡"],
  travel: ["✈️", "🌍", "🗺️", "🏖️", "📸"],
  finance: ["💰", "📈", "🏦", "💎", "🤑"],
  default: ["🎬", "⚡", "🌟", "🎯", "✨"],
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
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

function drawAnimatedBackground(ctx: CanvasRenderingContext2D, frame: number, theme: typeof THEMES[0]) {
  const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  grad.addColorStop(0, theme.bg1);
  grad.addColorStop(1, theme.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const t = frame / TOTAL_FRAMES;

  // Animated particles
  for (let i = 0; i < 12; i++) {
    const x = CANVAS_WIDTH * (0.1 + 0.8 * Math.sin(t * Math.PI * 2 + i * 1.1));
    const y = CANVAS_HEIGHT * (0.1 + 0.8 * Math.cos(t * Math.PI * 1.7 + i * 0.7));
    const r = 4 + 3 * Math.sin(t * Math.PI * 4 + i);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = theme.accent + "40";
    ctx.fill();
  }

  // Glowing orbs
  for (let i = 0; i < 3; i++) {
    const x = CANVAS_WIDTH * (0.2 + 0.6 * Math.sin(t * Math.PI * 1.5 + i * 2.1));
    const y = CANVAS_HEIGHT * (0.15 + 0.7 * Math.cos(t * Math.PI * 1.2 + i * 1.5));
    const r = 100 + 50 * Math.sin(t * Math.PI * 2 + i);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, theme.accent + "20");
    glow.addColorStop(1, theme.accent + "00");
    ctx.fillStyle = glow;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Top accent bar
  const lineWidth = CANVAS_WIDTH * easeOutCubic(Math.min(frame / 20, 1));
  ctx.fillStyle = theme.accent;
  ctx.fillRect((CANVAS_WIDTH - lineWidth) / 2, 0, lineWidth, 6);
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  frame: number,
  sceneStart: number,
  emojis: string[],
  x: number,
  y: number,
  size: number
) {
  const localFrame = frame - sceneStart;
  if (localFrame < 0) return;

  // Bounce entrance
  const enterT = Math.min(localFrame / 15, 1);
  const scale = easeOutBack(enterT);

  // Idle bobbing
  const bob = Math.sin((localFrame / 10) * Math.PI) * 8;

  // Cycle through emojis
  const emojiIndex = Math.floor(localFrame / 30) % emojis.length;

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale, scale);
  ctx.font = `${size}px "Arial"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emojis[emojiIndex], 0, 0);
  ctx.restore();
}

function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  maxWidth: number,
  theme: typeof THEMES[0],
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `bold 32px "Arial", sans-serif`;
  const lines = wrapText(ctx, text, maxWidth - 40);
  const lineH = 42;
  const padX = 30;
  const padY = 20;
  const bubbleW = maxWidth;
  const bubbleH = lines.length * lineH + padY * 2;
  const bubbleX = x - bubbleW / 2;
  const bubbleY = y;

  // Bubble background
  ctx.beginPath();
  ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 20);
  ctx.fillStyle = "#ffffff15";
  ctx.fill();
  ctx.strokeStyle = theme.accent + "60";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Bubble tail
  ctx.beginPath();
  ctx.moveTo(x - 15, bubbleY + bubbleH);
  ctx.lineTo(x, bubbleY + bubbleH + 20);
  ctx.lineTo(x + 15, bubbleY + bubbleH);
  ctx.fillStyle = "#ffffff15";
  ctx.fill();

  // Text
  ctx.fillStyle = theme.text;
  ctx.textAlign = "center";
  lines.forEach((line, i) => {
    ctx.fillText(line, x, bubbleY + padY + 28 + i * lineH);
  });

  ctx.restore();
}

// Audio wave visualization
function drawAudioWave(ctx: CanvasRenderingContext2D, frame: number, y: number, theme: typeof THEMES[0], alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.6;
  const bars = 20;
  const barWidth = 12;
  const gap = 8;
  const totalWidth = bars * (barWidth + gap);
  const startX = (CANVAS_WIDTH - totalWidth) / 2;

  for (let i = 0; i < bars; i++) {
    const height = 15 + 25 * Math.abs(Math.sin(frame * 0.15 + i * 0.5));
    const x = startX + i * (barWidth + gap);
    ctx.beginPath();
    ctx.roundRect(x, y - height / 2, barWidth, height, 4);
    ctx.fillStyle = theme.accent;
    ctx.fill();
  }
  ctx.restore();
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  frame: number,
  idea: ReelIdea,
  theme: typeof THEMES[0],
  niche: string
) {
  drawAnimatedBackground(ctx, frame, theme);

  const padding = 80;
  const maxTextWidth = CANVAS_WIDTH - padding * 2;
  const charEmojis = CHARACTER_SETS[niche] || CHARACTER_SETS.default;

  // Scene 1: Hook with character (frames 0–120)
  if (frame < 130) {
    const enter = easeOutCubic(Math.min(frame / 20, 1));
    const exit = frame > 100 ? easeInOutQuad((frame - 100) / 30) : 0;
    const alpha = enter * (1 - exit);
    const yOffset = (1 - enter) * 60 + exit * -40;

    ctx.globalAlpha = alpha;

    // Character at top
    drawCharacter(ctx, frame, 0, charEmojis, CANVAS_WIDTH / 2, 280 + yOffset, 120);

    // Audio wave under character (shows "speaking")
    drawAudioWave(ctx, frame, 370 + yOffset, theme, alpha);

    // "HOOK" label
    ctx.font = `bold 36px "Arial", sans-serif`;
    ctx.fillStyle = theme.accent;
    ctx.textAlign = "center";
    ctx.fillText("🎣 HOOK", CANVAS_WIDTH / 2, 430 + yOffset);

    // Hook text in speech bubble style
    ctx.font = `bold 58px "Arial", sans-serif`;
    ctx.fillStyle = theme.text;
    const hookLines = wrapText(ctx, idea.hook, maxTextWidth);
    hookLines.forEach((line, i) => {
      const lineDelay = i * 5;
      const lineAlpha = easeOutCubic(Math.min(Math.max(frame - lineDelay - 5, 0) / 15, 1));
      ctx.globalAlpha = alpha * lineAlpha;
      ctx.fillText(line, CANVAS_WIDTH / 2, 520 + i * 75 + yOffset);
    });

    // Viral score badge
    if (frame > 35) {
      const badgeEnter = easeOutCubic(Math.min((frame - 35) / 15, 1));
      ctx.globalAlpha = alpha * badgeEnter;
      const badgeY = 520 + hookLines.length * 75 + 50 + yOffset;
      const badgeW = 240;
      const badgeH = 64;
      const badgeX = (CANVAS_WIDTH - badgeW) / 2;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 32);
      ctx.fillStyle = theme.accent;
      ctx.fill();

      ctx.font = `bold 30px "Arial", sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`⚡ ${idea.viralScore}% Viral`, CANVAS_WIDTH / 2, badgeY + 42);
    }

    ctx.globalAlpha = 1;
  }

  // Scene 2: Script with animated character narrating (frames 110–300)
  if (frame >= 110 && frame < 310) {
    const localFrame = frame - 110;
    const enter = easeOutCubic(Math.min(localFrame / 20, 1));
    const exit = localFrame > 170 ? easeInOutQuad((localFrame - 170) / 30) : 0;
    const alpha = enter * (1 - exit);
    const yOffset = (1 - enter) * 80;

    ctx.globalAlpha = alpha;

    // Character on left side narrating
    drawCharacter(ctx, frame, 110, charEmojis, 140, 300 + yOffset, 100);

    // Audio wave next to character
    if (localFrame > 5) {
      drawAudioWave(ctx, frame, 380 + yOffset, theme, alpha * 0.5);
    }

    // "SCRIPT" label
    ctx.font = `bold 36px "Arial", sans-serif`;
    ctx.fillStyle = theme.accent;
    ctx.textAlign = "center";
    ctx.fillText("📝 SCRIPT", CANVAS_WIDTH / 2, 200 + yOffset);

    // Script text with typewriter effect
    ctx.font = `38px "Arial", sans-serif`;
    ctx.fillStyle = theme.text;
    const scriptText = idea.script.substring(0, 400) + (idea.script.length > 400 ? "..." : "");
    const scriptLines = wrapText(ctx, scriptText, maxTextWidth);
    const maxLines = Math.min(scriptLines.length, 16);

    // Reveal lines progressively
    for (let i = 0; i < maxLines; i++) {
      const lineDelay = i * 4;
      const lineProgress = Math.min(Math.max(localFrame - 10 - lineDelay, 0) / 10, 1);
      const lineAlpha = easeOutCubic(lineProgress);

      if (lineProgress > 0) {
        ctx.globalAlpha = alpha * lineAlpha;

        // Highlight current line being "spoken"
        const isCurrentLine = lineProgress > 0 && lineProgress < 1;
        if (isCurrentLine) {
          ctx.fillStyle = theme.accent;
          ctx.font = `bold 40px "Arial", sans-serif`;
        } else {
          ctx.fillStyle = theme.text;
          ctx.font = `38px "Arial", sans-serif`;
        }

        ctx.fillText(scriptLines[i], CANVAS_WIDTH / 2, 280 + i * 52 + yOffset);
      }
    }

    // Small reaction emojis floating up during narration
    if (localFrame > 20 && localFrame < 160) {
      const reactions = ["😂", "🔥", "💯", "👏", "❤️"];
      for (let i = 0; i < 3; i++) {
        const rFrame = (localFrame - 20 + i * 40) % 50;
        if (rFrame < 40) {
          const rAlpha = rFrame < 10 ? rFrame / 10 : rFrame > 30 ? (40 - rFrame) / 10 : 1;
          const rx = CANVAS_WIDTH - 120 + Math.sin(rFrame * 0.2 + i) * 30;
          const ry = CANVAS_HEIGHT - 400 - rFrame * 8;
          ctx.globalAlpha = alpha * rAlpha * 0.7;
          ctx.font = `48px "Arial"`;
          ctx.fillText(reactions[(i + Math.floor(localFrame / 50)) % reactions.length], rx, ry);
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  // Scene 3: Caption with character presenting (frames 290–380)
  if (frame >= 290 && frame < 390) {
    const localFrame = frame - 290;
    const enter = easeOutCubic(Math.min(localFrame / 20, 1));
    const exit = localFrame > 70 ? easeInOutQuad((localFrame - 70) / 30) : 0;
    const alpha = enter * (1 - exit);
    const scale = 0.85 + 0.15 * enter;

    ctx.globalAlpha = alpha;
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.scale(scale, scale);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);

    // Character at top center
    drawCharacter(ctx, frame, 290, ["✍️", "📝", "💬", "📢"], CANVAS_WIDTH / 2, 320, 80);

    // "CAPTION" label
    ctx.font = `bold 36px "Arial", sans-serif`;
    ctx.fillStyle = theme.accent;
    ctx.textAlign = "center";
    ctx.fillText("✍️ CAPTION", CANVAS_WIDTH / 2, 420);

    // Caption in a styled box
    ctx.font = `42px "Arial", sans-serif`;
    ctx.fillStyle = theme.text;
    const captionLines = wrapText(ctx, idea.caption, maxTextWidth);
    const boxH = captionLines.slice(0, 10).length * 58 + 40;
    ctx.beginPath();
    ctx.roundRect(padding - 10, 450, CANVAS_WIDTH - padding * 2 + 20, boxH, 16);
    ctx.fillStyle = "#ffffff08";
    ctx.fill();
    ctx.strokeStyle = theme.accent + "40";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = theme.text;
    captionLines.slice(0, 10).forEach((line, i) => {
      const ld = i * 3;
      const la = easeOutCubic(Math.min(Math.max(localFrame - 8 - ld, 0) / 10, 1));
      ctx.globalAlpha = alpha * la;
      ctx.fillText(line, CANVAS_WIDTH / 2, 500 + i * 58);
    });

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Scene 4: Hashtags with character celebration (frames 370–450)
  if (frame >= 370) {
    const localFrame = frame - 370;
    const enter = easeOutCubic(Math.min(localFrame / 20, 1));
    const alpha = enter;

    ctx.globalAlpha = alpha;

    // Celebration characters
    drawCharacter(ctx, frame, 370, ["🎉", "🥳", "🎊", "✨", "🏆"], CANVAS_WIDTH / 2, 350, 100);

    // Confetti effect
    if (localFrame > 10) {
      for (let i = 0; i < 15; i++) {
        const confettiColors = [theme.accent, "#FFD700", "#FF69B4", "#00CED1", "#FF6347"];
        const cx = ((i * 137 + localFrame * 3) % CANVAS_WIDTH);
        const cy = ((localFrame - 10) * (3 + (i % 4))) % CANVAS_HEIGHT;
        const cSize = 8 + (i % 5) * 3;
        const rotation = (localFrame * 5 + i * 30) * Math.PI / 180;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.fillStyle = confettiColors[i % confettiColors.length];
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillRect(-cSize / 2, -cSize / 2, cSize, cSize / 3);
        ctx.restore();
      }
    }

    ctx.globalAlpha = alpha;

    // "HASHTAGS" label
    ctx.font = `bold 36px "Arial", sans-serif`;
    ctx.fillStyle = theme.accent;
    ctx.textAlign = "center";
    ctx.fillText("# HASHTAGS", CANVAS_WIDTH / 2, 460);

    // Hashtags with staggered bounce-in
    ctx.font = `bold 40px "Arial", sans-serif`;
    ctx.fillStyle = theme.accent;
    const hashLines = wrapText(ctx, idea.hashtags, maxTextWidth);
    hashLines.slice(0, 8).forEach((line, i) => {
      const tagDelay = i * 6;
      const tagT = Math.min(Math.max(localFrame - 15 - tagDelay, 0) / 12, 1);
      const tagScale = easeOutBack(tagT);
      ctx.save();
      ctx.translate(CANVAS_WIDTH / 2, 550 + i * 58);
      ctx.scale(tagScale, tagScale);
      ctx.globalAlpha = alpha * tagT;
      ctx.fillText(line, 0, 0);
      ctx.restore();
    });

    // Title at bottom
    if (localFrame > 25) {
      const titleAlpha = easeOutCubic(Math.min((localFrame - 25) / 15, 1));
      ctx.globalAlpha = titleAlpha;
      ctx.font = `bold 32px "Arial", sans-serif`;
      ctx.fillStyle = theme.sub;
      ctx.textAlign = "center";
      ctx.fillText(idea.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 240);
    }

    // Audio wave at bottom
    drawAudioWave(ctx, frame, CANVAS_HEIGHT - 170, theme, alpha);

    // Branding
    if (localFrame > 35) {
      const brandAlpha = easeOutCubic(Math.min((localFrame - 35) / 15, 1));
      ctx.globalAlpha = brandAlpha * 0.6;
      ctx.font = `24px "Arial", sans-serif`;
      ctx.fillStyle = theme.sub;
      ctx.fillText("Made with Viral Reel Generator ⚡", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 120);
    }

    ctx.globalAlpha = 1;
  }
}

// Browser TTS voiceover
function speakText(text: string, rate = 1, pitch = 1): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;

    // Try to pick a good voice
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("google")
    ) || voices.find((v) => v.lang.startsWith("en")) || voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
  });
}

export function VideoGeneratorDialog({ open, onOpenChange, idea, platform }: VideoGeneratorDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const animFrameRef = useRef<number>(0);
  const nicheRef = useRef("default");

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  // Load voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      speechSynthesis.getVoices();
    }
  }, []);

  // Preview animation
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
      renderFrame(ctx, frame % TOTAL_FRAMES, idea, theme, nicheRef.current);
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
      // Create audio context for combining voice + video
      const stream = canvas.captureStream(FPS);

      // Add audio destination if voice enabled
      let audioCtx: AudioContext | null = null;
      let audioDestination: MediaStreamAudioDestinationNode | null = null;

      if (voiceEnabled && "speechSynthesis" in window) {
        audioCtx = new AudioContext();
        audioDestination = audioCtx.createMediaStreamDestination();

        // Merge audio track into video stream
        audioDestination.stream.getAudioTracks().forEach((track) => {
          stream.addTrack(track);
        });
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus",
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

      // Start voiceover narration in parallel
      if (voiceEnabled && "speechSynthesis" in window) {
        speechSynthesis.cancel();
        // Narrate hook
        setTimeout(() => {
          speakText(idea.hook, 0.9, 1.1);
        }, 200);
        // Narrate script after hook scene
        setTimeout(() => {
          speakText(idea.script.substring(0, 300), 0.85, 1.0);
        }, 3800);
        // Narrate caption
        setTimeout(() => {
          speakText(idea.caption, 0.9, 1.0);
        }, 10000);
        // Read hashtags
        setTimeout(() => {
          speakText(idea.hashtags.replace(/#/g, "hashtag ").substring(0, 100), 1.0, 1.0);
        }, 12500);
      }

      // Render each frame
      for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
        renderFrame(ctx, frame, idea, theme, nicheRef.current);
        setProgress(Math.round((frame / TOTAL_FRAMES) * 100));
        await new Promise((r) => setTimeout(r, 1000 / FPS));
      }

      mediaRecorder.stop();
      speechSynthesis.cancel();

      const url = await videoReady;
      setVideoUrl(url);
      toast.success("Video created with voiceover! 🎬🔊");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate video. Try a different browser.");
    } finally {
      setGenerating(false);
    }
  }, [idea, voiceEnabled]);

  const handleDownload = () => {
    if (!videoUrl || !idea) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `reel-${idea.title.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}.webm`;
    a.click();
    toast.success("Video downloaded! 📥");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) speechSynthesis?.cancel();
      onOpenChange(v);
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Video className="h-5 w-5 text-primary" />
            Create Reel Video
          </DialogTitle>
          <DialogDescription>
            Animated video with characters, voiceover, hooks, script, captions & hashtags.
          </DialogDescription>
        </DialogHeader>

        {idea && (
          <div className="space-y-4">
            {/* Voice toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm font-medium text-muted-foreground">🔊 Voice Narration</span>
              <Button
                variant={voiceEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? (
                  <><Volume2 className="mr-1 h-4 w-4" /> On</>
                ) : (
                  <><VolumeX className="mr-1 h-4 w-4" /> Off</>
                )}
              </Button>
            </div>

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

            <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="hidden" />

            {generating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Rendering with {voiceEnabled ? "voiceover" : "visuals only"}…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {videoUrl && (
              <div className="overflow-hidden rounded-xl border border-primary/30">
                <video src={videoUrl} controls autoPlay loop className="w-full" style={{ maxHeight: 400 }} />
              </div>
            )}

            <div className="flex gap-3">
              {!videoUrl ? (
                <Button variant="gradient" className="flex-1" onClick={generateVideo} disabled={generating}>
                  {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  {generating ? `Rendering… ${progress}%` : "Generate Video 🎥"}
                </Button>
              ) : (
                <>
                  <Button variant="gradient" className="flex-1" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Download Video
                  </Button>
                  <Button variant="outline" onClick={() => { setVideoUrl(null); generateVideo(); }}>
                    <RotateCcw className="mr-1 h-4 w-4" /> Redo
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
