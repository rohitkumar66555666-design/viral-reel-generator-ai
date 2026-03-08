import type { ReelIdea } from "@/components/IdeaCard";

const ideaTemplates: Record<string, ReelIdea[]> = {
  motivation: [
    { id: 1, title: "The 5AM Secret Nobody Talks About", hook: "I woke up at 5AM for 30 days and this happened…", script: "Start with alarm going off. Show morning routine montage. Reveal the unexpected benefit: not productivity, but mental clarity. End with a powerful quote overlay.", caption: "The real reason successful people wake up early isn't what you think 🌅", hashtags: "#5AMClub #MorningRoutine #Motivation #Success #MindsetShift #GrowthMindset #DisciplineEqualsFreedom", viralScore: 92 },
    { id: 2, title: "Your Comfort Zone is Lying to You", hook: "Stop scrolling. Your comfort zone is literally shrinking your brain.", script: "Open with brain scan visual. Explain neuroplasticity in simple terms. Show before/after of someone who took one uncomfortable action daily. CTA: what's one thing you'll do today?", caption: "Science says staying comfortable is making you dumber. Here's proof 🧠", hashtags: "#ComfortZone #BrainScience #PersonalGrowth #Mindset #LevelUp #SelfImprovement", viralScore: 88 },
    { id: 3, title: "The Rejection That Changed Everything", hook: "I got rejected 100 times in one month. On purpose.", script: "Share the rejection therapy concept. Show funny/awkward rejection moments. Reveal how confidence skyrocketed. End with the best unexpected 'yes'.", caption: "What if rejection was the shortcut to confidence? 💪", hashtags: "#RejectionTherapy #Confidence #FearOfRejection #GrowthMindset #MentalStrength", viralScore: 95 },
    { id: 4, title: "1% Better Every Day Visualization", hook: "If you improved just 1% every day, in one year you'd be…", script: "Start with calculator on screen. Show the math: 1.01^365 = 37.78x better. Visualize with stacking blocks animation. End with 'start today'.", caption: "The math behind becoming 37x better than you are today 📈", hashtags: "#1PercentBetter #CompoundEffect #DailyGrowth #Motivation #SuccessMindset", viralScore: 85 },
    { id: 5, title: "What Winners Do at Night", hook: "Every successful person I know does this before bed…", script: "Reveal the evening review habit. Show journaling 3 wins. Planning tomorrow's top 3. Gratitude practice. Show sleep quality improvement.", caption: "Your nighttime routine matters more than your morning one 🌙", hashtags: "#EveningRoutine #SuccessHabits #Journaling #Gratitude #WinnerMindset", viralScore: 82 },
    { id: 6, title: "The 2-Minute Rule That Destroys Procrastination", hook: "You can beat procrastination with just 2 minutes.", script: "Explain the 2-minute rule from Atomic Habits. Demo with real tasks. Show the domino effect of starting small. Timelapse of completing a big project.", caption: "Procrastination hates this one simple trick ⏱️", hashtags: "#Procrastination #2MinuteRule #AtomicHabits #Productivity #GetItDone", viralScore: 90 },
    { id: 7, title: "Discipline vs Motivation: The Truth", hook: "Motivation is a scam. Here's what actually works.", script: "Show motivation graph going up and down. Compare with discipline as a flat line. Share 3 discipline hacks. End with 'motivation gets you started, discipline keeps you going'.", caption: "Stop waiting to feel motivated. Start being disciplined 🔥", hashtags: "#Discipline #Motivation #HardTruths #SuccessTips #Grind #MindsetMatters", viralScore: 87 },
    { id: 8, title: "The Power of Saying No", hook: "The most successful word in the English language has only two letters.", script: "Open with overwhelmed person saying yes to everything. Show calendar chaos. Introduce 'no' as a power move. Before/after of protected time. Warren Buffett quote.", caption: "Every time you say yes to something, you say no to something else 🚫", hashtags: "#SayNo #Boundaries #TimeManagement #SuccessTips #Focus #Priorities", viralScore: 83 },
    { id: 9, title: "From Rock Bottom to the Top", hook: "365 days ago I was sleeping on a couch. Today…", script: "Show humble beginning photos. Montage of daily grind. Key turning point moment. Current success reveal. Message: 'your chapter 1 isn't your chapter 20'.", caption: "A year from now you'll wish you started today 🏆", hashtags: "#Transformation #NeverGiveUp #SuccessStory #Comeback #HustleHard", viralScore: 91 },
    { id: 10, title: "The Mirror Technique for Confidence", hook: "Talk to yourself in the mirror for 30 seconds. I dare you.", script: "Explain mirror affirmation science. Show awkward first attempt. Day 7 vs Day 30 comparison. Show real confidence change in social situations.", caption: "Your reflection is your most powerful coach 🪞", hashtags: "#MirrorTechnique #Affirmations #Confidence #SelfLove #MentalHealth #InnerStrength", viralScore: 79 },
  ],
};

// Generate fallback ideas for any niche
function generateFallback(niche: string): ReelIdea[] {
  const nicheLabel = niche.charAt(0).toUpperCase() + niche.slice(1);
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `${nicheLabel} Reel Idea #${i + 1}: The Untold Secret`,
    hook: `Nobody in ${niche} is talking about this yet…`,
    script: `Open with a shocking ${niche} stat. Break down the concept in 3 steps. Show a real-world example. End with a strong CTA asking viewers to share their experience.`,
    caption: `This ${niche} hack changed everything for me 🔥 Save this for later!`,
    hashtags: `#${nicheLabel} #${nicheLabel}Tips #ViralReels #ContentCreator #Trending #Shorts`,
    viralScore: Math.floor(Math.random() * 25) + 70,
  }));
}

export function getMockIdeas(niche: string, _platform: string): ReelIdea[] {
  return ideaTemplates[niche] || generateFallback(niche);
}
