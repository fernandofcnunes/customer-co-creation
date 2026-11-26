/**
 * Offline decision support for the fictional grocery case.
 * BM25 retrieves synthetic notes. A separate weighted model ranks interventions.
 */
namespace Engine {
  const STOP_WORDS = new Set([
    "a", "about", "an", "and", "are", "as", "at", "be", "been", "but", "by",
    "can", "could", "do", "for", "from", "has", "have", "how", "i", "if", "in",
    "into", "is", "it", "its", "just", "may", "more", "of", "on", "one", "or",
    "our", "s", "so", "that", "the", "their", "them", "then", "they", "this",
    "to", "up", "us", "use", "want", "was", "we", "what", "when", "where",
    "which", "who", "will", "with", "would", "you", "your",
  ]);

  const ALIASES: Readonly<Record<string, string>> = {
    accessibility: "accessible",
    alternatives: "substitute",
    alternative: "substitute",
    animated: "video",
    animation: "video",
    captions: "caption",
    clips: "video",
    clip: "video",
    dietary: "diet",
    filtering: "filter",
    filters: "filter",
    groceries: "shopping",
    grocery: "shopping",
    hands: "hand",
    ingredients: "ingredient",
    inventory: "stock",
    items: "ingredient",
    lists: "list",
    missing: "unavailable",
    mobile: "phone",
    notifications: "reminder",
    phones: "phone",
    placement: "position",
    players: "video",
    prep: "cook",
    prepared: "cook",
    preparation: "cook",
    recipes: "recipe",
    reminders: "reminder",
    replacing: "substitute",
    replacements: "substitute",
    replacement: "substitute",
    shoppers: "shopper",
    signals: "signal",
    simplified: "simple",
    static: "card",
    substitutes: "substitute",
    substitutions: "substitute",
    swap: "substitute",
    swaps: "substitute",
    taps: "tap",
    text: "written",
    videos: "video",
    visible: "visibility",
  };

  function tokenize(input: string): string[] {
    const normalized = input.toLowerCase().replace(/\bout[- ]of[- ]stock\b/g, "unavailable");
    const words = normalized.match(/[a-z]+/g) ?? [];
    return words.filter((word) => !STOP_WORDS.has(word)).map((word) =>
      Object.prototype.hasOwnProperty.call(ALIASES, word) ? ALIASES[word] : word);
  }

  function round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  function bounded(value: number, minimum: number, maximum: number): number {
    return Math.max(minimum, Math.min(maximum, value));
  }

  export interface Weights {
    impact: number;
    feasibility: number;
    confidence: number;
  }

  export interface AnalysisInput {
    brief: string;
    feedback: string;
    weights: Weights;
  }

  interface Criterion {
    label: string;
    score: number;
    reason: string;
  }

  interface Evidence {
    id: string;
    title: string;
    excerpt: string;
    matchedTerms: string[];
  }

  interface Pilot {
    hypothesis: string;
    control: string;
    variant: string;
    metric: string;
    threshold: string;
    guardrail: string;
    sample: string;
  }

  export interface Candidate {
    id: string;
    title: string;
    description: string;
    score: number;
    criteria: Criterion[];
    evidence: Evidence[];
    risks: string[];
    pilot: Pilot;
  }

  export interface Analysis {
    candidates: Candidate[];
    conflicts: string[];
  }

  export const defaults: AnalysisInput = {
    brief: "A grocery advertiser wants to know what happens to a dinner plan when an ingredient is unavailable. How could our recipe content help shoppers find a substitute before they start cooking?",
    feedback: "A shopper holding a phone in one hand should see the substitute on the recipe, without scrolling or opening another screen.",
    weights: { impact: 50, feasibility: 30, confidence: 20 },
  };

  export const presets = [
    { label: "One-handed use", feedback: defaults.feedback },
    {
      label: "Low bandwidth",
      feedback: "Many shoppers have a weak connection or are offline in the aisle. Prioritize lightweight written instructions in a saved shopping list. No image or video should be required.",
    },
    {
      label: "Short video",
      feedback: "Shoppers already use our short recipe clips before cooking. Prioritize a captioned video demonstration and show the substitute in the first five seconds.",
    },
  ];

  export const criteria: ReadonlyArray<{ id: keyof Weights; label: string }> = [
    { id: "impact", label: "Customer impact" },
    { id: "feasibility", label: "Feasibility" },
    { id: "confidence", label: "Evidence confidence" },
  ];

  interface Proposal {
    id: string;
    title: string;
    description: string;
    baseline: Pick<Weights, "impact" | "feasibility">;
    rationale: Pick<Record<keyof Weights, string>, "impact" | "feasibility">;
    risks: string[];
    pilot: Pilot;
  }

  const proposals: Proposal[] = [
    {
      id: "swap-card",
      title: "Ingredient swap card",
      description: "Pin an editor-approved substitute beside the missing ingredient, with the quantity and preparation change in the recipe itself.",
      baseline: { impact: 76, feasibility: 83 },
      rationale: {
        impact: "The substitute appears at the ingredient decision, beside the original quantity.",
        feasibility: "One recipe template and a small editorial checklist can support the first test.",
      },
      risks: [
        "A substitute can change the recipe's outcome or allergens. Editorial review is required before testing.",
        "The card only covers the selected recipe and unavailable ingredient.",
      ],
      pilot: {
        hypothesis: "An inline substitute beside the ingredient increases the share of shoppers who choose a usable alternative before cooking.",
        control: "The same mobile recipe with the original ingredient list.",
        variant: "Add one visible substitute next to the unavailable ingredient, with the amount and a short preparation note.",
        metric: "Share selecting an acceptable substitute within 20 seconds, unassisted.",
        threshold: "Explore a wider test if the variant is at least 15 percentage points higher and the guardrail holds.",
        guardrail: "Any incorrect allergen or quantity shown pauses the pilot.",
        sample: "24 exploratory sessions, 12 per variant, balanced by device. Report counts and uncertainty.",
      },
    },
    {
      id: "prep-clip",
      title: "Captioned prep clip",
      description: "Show the substitute in use in a short, captioned prep clip. Put the swap near the beginning and keep the recipe text usable on its own.",
      baseline: { impact: 72, feasibility: 61 },
      rationale: {
        impact: "Seeing the alternate technique can resolve uncertainty about when or how to use the substitute.",
        feasibility: "The test needs two edited cuts, caption review and a stable mobile player.",
      },
      risks: [
        "Buffering and muted viewing can hide the substitute unless the caption and fallback are visible.",
        "A polished excerpt can blend the effect of swap timing with differences in editing.",
      ],
      pilot: {
        hypothesis: "Showing the swap in the first five seconds raises correct identification of the substitute and when to add it.",
        control: "A 15-second captioned recipe clip that shows the same swap near the end.",
        variant: "Move the same swap and caption to the first five seconds, holding the rest of the clip constant where possible.",
        metric: "Share correctly naming the substitute and its preparation step after one viewing.",
        threshold: "Explore a wider test if the variant is at least 15 percentage points higher and the guardrail holds.",
        guardrail: "A written fallback must remain available on mobile, including under a throttled connection.",
        sample: "24 viewers, 12 per cut. Include sound-off and slow-connection sessions in each group.",
      },
    },
    {
      id: "shopping-list",
      title: "Saved shopping-list fallback",
      description: "Include an editor-approved fallback as plain text in the saved shopping list, so it stays visible in-store with a weak connection.",
      baseline: { impact: 64, feasibility: 77 },
      rationale: {
        impact: "The fallback is useful when stock changes in the aisle, provided shoppers have already saved the list.",
        feasibility: "A lightweight saved-list prototype avoids video and live inventory dependencies.",
      },
      risks: [
        "The list may be stale if availability changes after it is saved.",
        "Shoppers who start from a recipe in the kitchen need a way to reach the fallback.",
      ],
      pilot: {
        hypothesis: "Adding a written fallback to the saved list increases successful substitution during a simulated low-connectivity shop.",
        control: "The saved list contains only the original ingredient.",
        variant: "The same saved list also names a substitute and the required quantity beside the ingredient.",
        metric: "Share identifying an acceptable fallback within 20 seconds under a throttled or offline connection.",
        threshold: "Explore a wider test if the variant is at least 15 percentage points higher and the guardrail holds.",
        guardrail: "All approved text must be readable after connectivity is disabled.",
        sample: "24 simulated aisle tasks, 12 per list. Test both new and returning shoppers.",
      },
    },
    {
      id: "pantry-finder",
      title: "Guided pantry finder",
      description: "Ask what the shopper already has and return a short list of approved substitutes by substitution type and cooking method.",
      baseline: { impact: 69, feasibility: 46 },
      rationale: {
        impact: "Guided choices can help when several substitutes exist and the shopper already has an option.",
        feasibility: "Adding verified rules and ingredient combinations takes more editorial effort than a single fixed swap.",
      },
      risks: [
        "A suggestion must stay within the checked ingredients and cannot infer suitability for a dietary restriction.",
        "Extra selections may slow people who have a phone in one hand.",
      ],
      pilot: {
        hypothesis: "A guided pantry lookup improves the share of shoppers who find a substitute they already own.",
        control: "A static list of three editor-approved substitutes with the same quantities and notes.",
        variant: "A guided selector that filters the same substitutes by pantry availability and cooking method.",
        metric: "Share selecting an approved alternative they already have within 30 seconds.",
        threshold: "Explore a wider test if the variant is at least 15 percentage points higher and the guardrail holds.",
        guardrail: "Unknown ingredient combinations must return a clear no-match and no unverified suggestion.",
        sample: "24 tasks, 12 per variant, with pantry inventories assigned before the session.",
      },
    },
  ];

  interface Note {
    id: string;
    title: string;
    excerpt: string;
    keywords: string;
    proposals: string[];
  }

  const notes: Note[] = [
    {
      id: "INT-01",
      title: "Customer interview · One-handed use",
      excerpt: "A shopper holding a phone in one hand should find the substitute beside the unavailable ingredient before starting to cook. Opening another screen adds friction.",
      keywords: "accessible tap scroll position recipe single hand pinned",
      proposals: ["swap-card"],
    },
    {
      id: "EDIT-02",
      title: "Editorial note · Swap quality",
      excerpt: "A single approved substitute is quick to publish when the recipe specifies its quantity, preparation change and allergens.",
      keywords: "recipe control safety editorial ingredient portion amount allergy",
      proposals: ["swap-card", "shopping-list"],
    },
    {
      id: "VID-03",
      title: "Concept review · Captioned clip",
      excerpt: "The customer wants to see the working technique rather than just a name. A short clip can show the ingredient in use, with the swap captioned in the first five seconds.",
      keywords: "early visual explain demo playback video cook sound off",
      proposals: ["prep-clip"],
    },
    {
      id: "QA-04",
      title: "Prototype QA · Slow, muted playback",
      excerpt: "A slow connection can delay video. Keep the substitute available as written text so sound-off viewers and shoppers who skip playback can still use it.",
      keywords: "low bandwidth offline load mobile phone caption accessible",
      proposals: ["prep-clip", "shopping-list"],
    },
    {
      id: "SHOP-05",
      title: "Shopper interview · The store aisle",
      excerpt: "When a product is out of stock, the saved list is easier to reach than the recipe. Weak connectivity favors a lightweight written fallback with no required image.",
      keywords: "shopping list low bandwidth offline download network cached store pickup",
      proposals: ["shopping-list"],
    },
    {
      id: "PAN-06",
      title: "Research note · What is already at home",
      excerpt: "A shopper with multiple ingredients at home wants to filter approved substitutions by pantry availability and cooking method.",
      keywords: "pantry cupboard lookup choose filter options selector match recipe",
      proposals: ["pantry-finder"],
    },
    {
      id: "OPS-07",
      title: "Commercial workshop · Pilot size",
      excerpt: "Start with one recipe and one unavailable ingredient. Capture whether shoppers find a usable substitute before committing to a wider launch.",
      keywords: "customer pilot commitment effort measure decision task analytics",
      proposals: ["swap-card", "prep-clip", "shopping-list", "pantry-finder"],
    },
    {
      id: "UX-08",
      title: "Prototype QA · Extra interactions",
      excerpt: "Guided questions are useful for finding a pantry match, but extra taps may make a single-ingredient substitution less convenient on a phone.",
      keywords: "friction one-handed steps interaction screen effort interactive",
      proposals: ["swap-card", "pantry-finder"],
    },
  ];

  interface IndexedNote {
    note: Note;
    frequencies: Map<string, number>;
    length: number;
  }

  interface RetrievedNote {
    note: Note;
    score: number;
    matchedTerms: string[];
  }

  const index: IndexedNote[] = notes.map((note) => {
    const tokens = tokenize(`${note.title} ${note.excerpt} ${note.keywords}`);
    const frequencies = new Map<string, number>();
    for (const token of tokens) {
      frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
    }
    return { note, frequencies, length: tokens.length };
  });

  const averageLength = index.reduce((sum, entry) => sum + entry.length, 0) / index.length;

  const documentFrequencies = new Map<string, number>();
  for (const { frequencies } of index) {
    for (const term of frequencies.keys()) {
      documentFrequencies.set(term, (documentFrequencies.get(term) ?? 0) + 1);
    }
  }

  function retrieve(brief: string, feedback: string): RetrievedNote[] {
    const queryWeights = new Map<string, number>();
    for (const term of new Set(tokenize(brief))) {
      queryWeights.set(term, 1);
    }
    for (const term of new Set(tokenize(feedback))) {
      queryWeights.set(term, (queryWeights.get(term) ?? 0) + 1.5);
    }

    const saturation = 1.2;
    const lengthNormalization = 0.75;
    return index.map(({ note, frequencies, length }) => {
      let score = 0;
      const matches: { term: string; contribution: number }[] = [];
      for (const [term, queryWeight] of queryWeights) {
        const count = frequencies.get(term);
        if (count === undefined) continue;
        const documentFrequency = documentFrequencies.get(term) ?? 0;
        const distinctiveness = Math.log(
          1 + (index.length - documentFrequency + 0.5) / (documentFrequency + 0.5),
        );
        const adjustedLength = 1 - lengthNormalization + lengthNormalization * length / averageLength;
        const contribution = queryWeight * distinctiveness * count * (saturation + 1)
          / (count + saturation * adjustedLength);
        score += contribution;
        matches.push({ term, contribution });
      }
      const matchedTerms = matches.sort((a, b) => b.contribution - a.contribution)
        .slice(0, 6).map(({ term }) => term);
      return { note, score, matchedTerms };
    }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);
  }

  interface Effect {
    impact: number;
    feasibility: number;
    reason: string;
    risk?: string;
  }

  interface Constraint {
    id: string;
    pattern: RegExp;
    effects: Record<string, Effect>;
  }

  const videoExclusion = /\b(?:(?:no|avoid|without) (?:an? )?(?:images? or )?(?:(?:required|short|captioned|recipe) )*(?:videos?|clips?|playback)|(?:videos?|clips?|playback) (?:should not|must not|shouldn't|mustn't) be required|text[- ]only)\b/i;

  const constraints: Constraint[] = [
    {
      id: "inline",
      pattern: /\b(?:one[- ]hand(?:ed)?|without scrolling|no (?:extra )?(?:taps?|scrolling)|inline|next to the ingredient|no (?:extra|other) screen|without opening another screen)\b/i,
      effects: {
        "swap-card": { impact: 16, feasibility: 5, reason: "Fits one-handed use at the point of need." },
        "prep-clip": { impact: -12, feasibility: -3, reason: "Playback adds a step before the shopper can see the substitute." },
        "shopping-list": { impact: -8, feasibility: 0, reason: "An extra screen weakens the one-handed recipe path." },
        "pantry-finder": { impact: -14, feasibility: -5, reason: "The guided flow adds choices and taps." },
      },
    },
    {
      id: "offline",
      pattern: /\b(?:offline|without (?:a )?(?:network|connection)|low[- ]bandwidth|(?:weak|poor|slow|unstable) (?:signal|connection|connectivity|network)|lightweight|text[- ]only|written (?:instructions?|fallback)|no imag(?:e|es))\b/i,
      effects: {
        "swap-card": { impact: 3, feasibility: 8, reason: "A static card can be made lightweight." },
        "prep-clip": {
          impact: -25, feasibility: -15, reason: "Playback is sensitive to poor connectivity.",
          risk: "Test the written fallback offline before relying on the media clip.",
        },
        "shopping-list": { impact: 24, feasibility: 12, reason: "A saved text list is available with a weak or absent connection." },
        "pantry-finder": { impact: -8, feasibility: -10, reason: "The interaction and rule set add work to support a reliable offline state." },
      },
    },
    {
      id: "saved",
      pattern: /\b(?:shopping list|saved list|in[- ]store|(?:the|an) aisle|checkout)\b/i,
      effects: {
        "swap-card": { impact: -5, feasibility: 0, reason: "An inline recipe card is outside the saved-list context." },
        "prep-clip": { impact: -5, feasibility: 0, reason: "A clip makes the in-store lookup longer." },
        "shopping-list": { impact: 14, feasibility: 3, reason: "The saved list meets shoppers in the aisle." },
      },
    },
    {
      id: "video",
      pattern: /\b(?:(?:short|captioned|prioriti[sz]e (?:a )?|use (?:a )?) ?(?:video|(?:recipe )?clips?)|first (?:five|5) seconds|(?:show|see|demonstrate) (?:the )?(?:technique|prep(?:aration)?))\b/i,
      effects: {
        "swap-card": { impact: -13, feasibility: 0, reason: "A card leaves the visual technique to text." },
        "prep-clip": { impact: 28, feasibility: 8, reason: "Showing the method early satisfies the video priority." },
        "shopping-list": { impact: -8, feasibility: 0, reason: "A saved note cannot show a technique." },
      },
    },
    {
      id: "no-video",
      pattern: videoExclusion,
      effects: {
        "prep-clip": {
          impact: -27, feasibility: -18, reason: "The concept relies on the medium the customer wants to avoid.",
          risk: "The video requirement conflicts with the requested format.",
        },
      },
    },
    {
      id: "pantry",
      pattern: /\b(?:pantry|cupboard|what (?:they|i|we) already (?:have|own)|filter by|multiple substitutes)\b/i,
      effects: {
        "swap-card": { impact: -14, feasibility: 0, reason: "A single alternative does not cover multiple inventories." },
        "prep-clip": { impact: -10, feasibility: 0, reason: "The clip covers a fixed alternative." },
        "shopping-list": { impact: -7, feasibility: 0, reason: "A fixed list does not filter by ingredients already owned." },
        "pantry-finder": { impact: 30, feasibility: 13, reason: "Filtering uses ingredients and methods shoppers already have." },
      },
    },
  ];

  function numericWeights(weights: Weights): Weights {
    const clean = (value: number) => Number.isFinite(value) ? bounded(value, 0, 100) : 0;
    const result = {
      impact: clean(weights.impact),
      feasibility: clean(weights.feasibility),
      confidence: clean(weights.confidence),
    };
    return result.impact + result.feasibility + result.confidence === 0 ? defaults.weights : result;
  }

  function conflictNotes(active: Constraint[], brief: string, feedback: string, hits: RetrievedNote[]): string[] {
    const present = (id: string) => active.some((constraint) => constraint.id === id);
    const conflicts: string[] = [];

    if (present("video") && present("no-video")) {
      conflicts.push("The feedback requests a video and also rules one out. Ask whether a written fallback is mandatory or whether motion is out of scope.");
    } else if (present("video") && present("offline")) {
      conflicts.push("The video preference and offline constraint pull in different directions. Agree on an offline written fallback and test it alongside the clip.");
    }
    if (present("inline") && present("pantry")) {
      conflicts.push("A one-step recipe experience leaves little room for pantry questions. Agree which task takes priority in this pilot.");
    }
    if (present("inline") && present("saved")) {
      conflicts.push("The feedback points to both the recipe and the saved list. Choose one place for the first pilot so the result is interpretable.");
    }

    const caseTerms = /\b(?:cook|ingredient|recipe|shopping|stock|substitute|unavailable)\b/;
    if (!caseTerms.test(tokenize(brief).join(" "))) {
      conflicts.push("The brief has little overlap with the grocery substitution case. Scores are provisional because the study notes cover this scenario only.");
    } else if (feedback.trim() && hits.length < 2) {
      conflicts.push("Few study notes matched this wording. Ask the customer for a concrete example before running a pilot.");
    }
    return conflicts;
  }

  function reasons(baseline: string, effects: Effect[], criterion: "impact" | "feasibility"): string {
    const strongest = effects.filter((effect) => effect[criterion] !== 0)
      .sort((a, b) => Math.abs(b[criterion]) - Math.abs(a[criterion]))[0];
    return strongest ? `${baseline} ${strongest.reason}` : baseline;
  }

  export function analyze({ brief, feedback, weights }: AnalysisInput): Analysis {
    const hits = retrieve(brief, feedback);
    const feedbackWithoutExcludedFormats = feedback.replace(new RegExp(videoExclusion.source, "gi"), " ");
    const active = constraints.filter(({ id, pattern }) =>
      pattern.test(id === "video" ? feedbackWithoutExcludedFormats : feedback));
    const appliedWeights = numericWeights(weights);
    const weightTotal = appliedWeights.impact + appliedWeights.feasibility + appliedWeights.confidence;
    const candidates = proposals.map((proposal): Candidate => {
      const supportingHits = hits.filter(({ note }) => note.proposals.includes(proposal.id)).slice(0, 3);
      const effects = active.map(({ effects }) => effects[proposal.id]).filter((effect): effect is Effect => Boolean(effect));
      const impact = proposal.baseline.impact + effects.reduce((score, effect) => score + effect.impact, 0);
      const feasibility = proposal.baseline.feasibility
        + effects.reduce((score, effect) => score + effect.feasibility, 0);
      const retrievalStrength = supportingHits.reduce((score, hit, rank) => score + hit.score / (rank + 1), 0);
      const confidence = 16 + 70 * (1 - Math.exp(-retrievalStrength / 16));
      const scores: Weights = {
        impact: round(bounded(impact, 0, 100)),
        feasibility: round(bounded(feasibility, 0, 100)),
        confidence: round(confidence),
      };
      const criterionReasons: Record<keyof Weights, string> = {
        impact: reasons(proposal.rationale.impact, effects, "impact"),
        feasibility: reasons(proposal.rationale.feasibility, effects, "feasibility"),
        confidence: supportingHits.length
          ? `${supportingHits.length} relevant synthetic note${supportingHits.length === 1 ? "" : "s"}. This score measures retrieval strength; pilot evidence is still pending.`
          : "No synthetic note matched this proposal and query. Validate the assumptions with a customer.",
      };
      const score = criteria.reduce((sum, { id }) => sum + scores[id] * appliedWeights[id], 0) / weightTotal;
      return {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        score: round(score),
        criteria: criteria.map(({ id, label }) => ({ label, score: scores[id], reason: criterionReasons[id] })),
        evidence: supportingHits.map(({ note, matchedTerms }) => ({
          id: note.id,
          title: note.title,
          excerpt: note.excerpt,
          matchedTerms,
        })),
        risks: [...proposal.risks, ...effects.flatMap(({ risk }) => risk ? [risk] : [])],
        pilot: proposal.pilot,
      };
    });
    candidates.sort((a, b) => b.score - a.score);
    return { candidates, conflicts: conflictNotes(active, brief, feedback, hits) };
  }
}
