import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, niche, language = "english" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction = language !== "english"
      ? `IMPORTANT: Write ALL titles, hooks, scripts, captions, and hashtags in ${language}. Only the JSON keys should remain in English.`
      : "";

    const systemPrompt = `You are a viral content strategist, professional scriptwriter, and director. Generate exactly 10 viral reel ideas for ${platform} in the ${niche} niche.
${langInstruction}

Return ONLY a valid JSON array (no markdown, no code blocks) with exactly 10 objects. Each object must have:
- "id": number (1-10)
- "title": string (catchy title)
- "hook": string (compelling first 3 seconds hook — write the EXACT words to say, with tone/delivery cues in parentheses like (whispering), (excited), (shocked face))
- "script": string — THIS IS THE MOST IMPORTANT FIELD. Write an EXTREMELY DETAILED, FULL production-ready script with 15-25+ lines minimum. The script MUST include ALL of the following:

  **DIALOGUE & DELIVERY:**
  - Every single word the creator must say, written as exact dialogue
  - Tone/delivery instructions in parentheses: (whispering), (yelling), (sarcastic tone), (dead serious), (excited), (confused voice), (dramatic pause), (speaking fast), (slow and deliberate)
  - Emphasis markers: *stressed words* in the dialogue

  **VISUAL DIRECTIONS in [brackets]:**
  - Camera angles: [close-up on face], [wide shot], [over-the-shoulder], [POV shot], [bird's eye view], [dutch angle], [handheld shaky cam]
  - Camera movements: [slow zoom in], [quick zoom out], [pan left to right], [tracking shot following subject], [whip pan]
  - Transitions: [jump cut], [smooth transition], [flash cut], [smash cut to black], [crossfade]
  - Framing: [center frame], [rule of thirds - subject left], [tight crop on hands]

  **PERFORMANCE DIRECTIONS in [brackets]:**
  - Facial expressions: [raises eyebrows], [jaw drops], [smirk], [eye roll], [dead stare into camera], [fake crying], [genuine laugh], [confused squint], [wink]
  - Body language: [leans into camera], [steps back dramatically], [hand gestures wildly], [crosses arms], [points at camera], [shrugs], [facepalm], [chef's kiss]
  - Physical actions: [picks up prop], [turns phone to show screen], [walks to new location], [sits down], [stands up abruptly]

  **TECHNICAL PRODUCTION CUES:**
  - Music/audio: [upbeat background music starts], [music drops to silence], [bass drop], [record scratch], [suspenseful music builds], [lo-fi beats], [sound effect: ding!], [sound effect: wrong buzzer], [music fades out]
  - On-screen text: [TEXT ON SCREEN: "exact text here" - white bold, center], [CAPTION APPEARS: "text" - bottom third]
  - Lighting: [dramatic side lighting], [bright natural light], [dim moody lighting]
  - Timing: [hold 2 seconds], [quick 0.5s pause], [beat], [long dramatic pause - 3 seconds]

  **GENRE-SPECIFIC REQUIREMENTS:**
  - Comedy: Include setup, misdirection, punchline, comedic timing [beat], reaction shots, callback jokes, [audience laugh track optional]
  - Educational: Step-by-step breakdown, [TEXT ON SCREEN] for key facts/stats, visual demonstrations, "here's the proof" moments
  - Motivational: Building intensity, emotional peaks, powerful one-liners, [inspirational music crescendo]
  - Storytelling: Beginning/middle/end structure, cliffhanger moments, plot twists, character voices
  - Tutorial/DIY: Numbered steps, before/after shots, close-ups of process, common mistakes to avoid

  **STRUCTURE THE SCRIPT LIKE THIS:**
  Line 1: [SCENE SETUP - location, lighting, music]
  Line 2: HOOK delivery (first 3 seconds)
  Lines 3-20+: Full content with ALL above elements woven in naturally
  Final lines: Strong CTA with [end card] or [loop point back to start]

- "caption": string (engaging caption with 2-3 relevant emojis, a strong call-to-action, AND a question to boost comments. Make it feel personal and conversational.)
- "hashtags": string (10-12 relevant hashtags with # prefix, mix of trending + niche-specific + broad reach)
- "viralScore": number (70-98, realistic viral potential score)

CRITICAL RULES:
1. Scripts must be SO detailed that a creator can film IMMEDIATELY without any planning
2. Every script must feel like reading a movie screenplay — visual, specific, and directorial
3. NO vague instructions like "talk about the topic" — write the EXACT words and actions
4. Vary the viral scores realistically (not all 90+)
5. Each idea must be unique in format/style (mix talking head, skit, tutorial, storytelling, etc.)`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate 10 viral ${platform} reel ideas for the ${niche} niche. Return only the JSON array.`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Parse JSON from the response, handling potential markdown code blocks
    let ideas;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      ideas = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ideas error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
