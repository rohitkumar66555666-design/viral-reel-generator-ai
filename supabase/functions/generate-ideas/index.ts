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
    const { platform, niche, language = "english", hookStyle = "curiosity" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction = language !== "english"
      ? `IMPORTANT: Write ALL titles, hooks, scripts, captions, and hashtags in ${language}. Only the JSON keys should remain in English.`
      : "";

    const hookStyleMap: Record<string, { label: string; rule: string }> = {
      curiosity: {
        label: "Curiosity Gap",
        rule: `Every hook MUST open with a curiosity gap that withholds key information and forces the viewer to keep watching. Use phrases like "You won't believe…", "Nobody talks about…", "The one thing nobody tells you…", "What happens next will…", "I wasn't supposed to share this but…". Tease an outcome without revealing it.`,
      },
      story: {
        label: "Story Opener",
        rule: `Every hook MUST start as a personal first-person story revealing vulnerability or transformation. Use openers like "I used to struggle with…", "3 months ago I was…", "Last year I almost gave up because…", "Nobody knows this but I…". The hook is the opening line of a story, not a statement.`,
      },
      shock: {
        label: "Shock Stat",
        rule: `Every hook MUST lead with a surprising, specific statistic or hard number that pattern-interrupts the scroll. Use formats like "9 out of 10 people…", "97% of creators are doing this wrong…", "Only 3% of…", "Studies show 80%…". The number must feel concrete and shocking. Round numbers and made-up but plausible stats are encouraged for hook impact.`,
      },
      controversial: {
        label: "Controversial Take",
        rule: `Every hook MUST be a bold, polarizing opinion that triggers debate in the comments. Use openers like "Unpopular opinion:", "Hot take:", "I'm gonna get hate for this but…", "Everyone is wrong about…", "Stop doing X. It's actually killing your…". Take a clear contrarian stance — no fence-sitting.`,
      },
      cta: {
        label: "Direct CTA",
        rule: `Every hook MUST be a direct command to the viewer that demands an immediate action or self-identification. Use openers like "Stop scrolling if you…", "Watch this before you…", "Save this if you ever…", "Don't post another reel until you…", "Read this twice.". Speak directly to the viewer using "you".`,
      },
    };

    const hookSpec = hookStyleMap[hookStyle] ?? hookStyleMap.curiosity;
    const hookStyleInstruction = `\n\nHOOK STYLE — ${hookSpec.label.toUpperCase()} (NON-NEGOTIABLE):\n${hookSpec.rule}\nALL 10 hooks must follow this exact style. Vary the wording, but never break the pattern.`;

    const platformRulesMap: Record<string, { label: string; rule: string }> = {
      instagram: {
        label: "Instagram Reels",
        rule: `INSTAGRAM REELS OUTPUT RULES (NON-NEGOTIABLE):
- "caption": Write an AESTHETIC, lifestyle-forward caption (2-4 short lines). Use poetic line breaks, soft tone, lowercase where it feels natural, and 2-3 tasteful emojis (✨🤍🌿💫🪞). End with a soft CTA or open-ended question. NO sales-y language.
- "hashtags": Output EXACTLY 3 to 5 hashtags, separated by " · " (space-dot-space), NOT spaces or new lines. Mix one broad community tag, one aesthetic tag, and one niche tag. Example format: "#aesthetic · #softlife · #morningroutine"
- "script": Optimize for 15-30 second vertical reel with smooth, beautiful B-roll cues and trending Reels audio reference in the opening scene direction.`,
      },
      tiktok: {
        label: "TikTok",
        rule: `TIKTOK OUTPUT RULES (NON-NEGOTIABLE):
- "hook": Must be PUNCHY, fast, and Gen-Z native — under 8 words when possible, written for a 1-second pattern interrupt.
- "script": MUST start the first line with a [TRENDING AUDIO SUGGESTION: "<specific song/sound name + artist or creator>"] tag (e.g. [TRENDING AUDIO SUGGESTION: "Murder On The Dancefloor — Sophie Ellis-Bextor (sped up)"]). Pick a real, plausible trending TikTok sound that matches the niche. Then follow with the rest of the directorial script. Use jump cuts, text-on-screen overlays, and 15-30s pacing.
- "caption": Short, punchy, 1-2 lines max. Conversational, slang-friendly, with 1-2 emojis and a hook for comments.
- "hashtags": Output EXACTLY 5 to 8 hashtags, space-separated. MUST include #fyp, #foryou or #foryoupage (at least one), plus #viral or #tiktokviral, mixed with niche tags. Example: "#fyp #foryoupage #viral <niche tags>"`,
      },
      youtube: {
        label: "YouTube Shorts",
        rule: `YOUTUBE SHORTS OUTPUT RULES (NON-NEGOTIABLE):
- "title": Write as an SEO-optimized YouTube title (60 chars max, include the primary keyword near the start, avoid clickbait punctuation overload).
- "hook": SEO-style — must contain the primary search keyword for the niche within the first 5 words and clearly state the value/outcome. Think "How to…", "X ways to…", "Why your…".
- "caption": LONGER, keyword-rich description (4-7 sentences). Open with the primary keyword in sentence 1, naturally weave 3-5 related long-tail keywords throughout, include a clear CTA to subscribe + comment, then a short keyword-stuffed closing line. Suitable for YouTube's description box.
- "hashtags": Output 6-10 hashtags, space-separated. MUST include #shorts and #youtubeshorts, plus keyword-rich niche tags (no fluff tags like #love).
- "script": Structure for 30-60s with strong retention beats every 5-7 seconds and a "stay tuned for #1" style loop.`,
      },
    };

    const platformSpec = platformRulesMap[platform] ?? platformRulesMap.instagram;
    const platformInstruction = `\n\nPLATFORM — ${platformSpec.label.toUpperCase()} (NON-NEGOTIABLE):\n${platformSpec.rule}`;

    const systemPrompt = `You are a viral content strategist, professional scriptwriter, and director. Generate exactly 10 viral reel ideas for ${platformSpec.label} in the ${niche} niche.
${langInstruction}${hookStyleInstruction}${platformInstruction}

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
