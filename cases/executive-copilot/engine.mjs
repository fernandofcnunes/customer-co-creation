/**
 * Evidence notebook for a fictional community equipment collection pilot.
 * Retrieval uses BM25 and cosine similarity over a domain concept vocabulary.
 * Drafting is extractive and deterministic. It has no network or model dependency.
 */
export const scenarios = [
  {
    id: "sufficient",
    title: "Ready for a briefing",
    description: "A small pilot has an agreed scope, named owners and a way to decide whether to expand.",
    query: "Prepare a briefing on where and when to launch the equipment collection pilot, ownership and how to measure success.",
    documents: [
      {
        id: "AGR-01",
        title: "Pilot charter",
        kind: "Approved plan",
        text: [
          "Scope: An equipment drop-off pilot for household donations, with two staffed locations and a four-week review. Business donations are outside its scope.",
          "Sites: Harbor Branch Library and Cedar Community Center.",
          "Launch window: 14–25 June 2027.",
          "Accepted items: Laptops, tablets and chargers. The pilot excludes loose batteries, broken displays and business equipment.",
          "Commitment: Review the pilot results and decide whether to expand | Owner: Jo Silva, programme lead | Due: 23 July 2027",
        ].join("\n"),
      },
      {
        id: "OPS-02",
        title: "Site operations handover",
        kind: "Confirmed handover",
        text: [
          "Staffing: Each location provides one trained attendant during its advertised collection hours, plus a named backup.",
          "Transport: Rebound Workshop collects sealed containers from both locations each Friday and logs the handover.",
          "Commitment: Confirm the attendant rota and backup at both sites | Owner: Alex Wynn, branch coordinator | Due: 7 June 2027",
          "Commitment: Run a collection handover rehearsal | Owner: Sam Noor, partner coordinator | Due: 10 June 2027",
        ].join("\n"),
      },
      {
        id: "PRV-03",
        title: "Intake and device privacy",
        kind: "Approved procedure",
        text: [
          "Data handling: Attendants log item type and count. They do not record donor names or device serial numbers. Rebound Workshop handles data-bearing devices after the documented handover.",
          "Safety: Staff set aside any item judged unsuitable for intake and direct the donor to the published alternative.",
          "Commitment: Approve the one-page intake and privacy handout | Owner: Lee Park, privacy lead | Due: 8 June 2027",
        ].join("\n"),
      },
      {
        id: "COM-04",
        title: "Resident communications",
        kind: "Approved copy brief",
        text: [
          "Sign-off: Public invitations go out after both site leads confirm their attendant rota and the intake handout is approved.",
          "Accessibility: Offer a large-print drop-off guide and list the step-free entrance for each location.",
          "Commitment: Publish the accessible drop-off guide | Owner: Amira Liu, communications lead | Due: 11 June 2027",
        ].join("\n"),
      },
      {
        id: "MET-05",
        title: "Pilot review scorecard",
        kind: "Confirmed success criteria",
        text: [
          "Success measure: Review collected device count and rejected-item share by site. Consider expansion after collecting at least 40 eligible devices in total, with fewer than 15% rejected items and zero custody exceptions.",
          "Learning goal: Compare each staffed window before adding new sites. Record where residents misread the instructions.",
          "Commitment: Prepare a two-site pilot scorecard | Owner: Robin Ellis, research lead | Due: 16 July 2027",
        ].join("\n"),
      },
    ],
  },
  {
    id: "missing",
    title: "Missing launch evidence",
    description: "Interest and a candidate site are documented. Several launch responsibilities still need agreement.",
    query: "Who is accountable for the public announcement, intake staffing, device privacy and pickup deadlines?",
    documents: [
      {
        id: "IDE-11",
        title: "Collection concept sketch",
        kind: "Working note",
        text: [
          "Scope: Explore a collection service for used household laptops and tablets.",
          "Candidate venue: Harbor Branch Library has offered to discuss a pilot. No venue approval is recorded.",
          "Commitment: Ask Harbor Branch Library about available hours | Owner: Jo Silva, programme lead | Due: 28 May 2027",
        ].join("\n"),
      },
      {
        id: "OPS-12",
        title: "Site discussion notes",
        kind: "Meeting notes",
        text: [
          "Staffing gap: The venue asked who would staff the donation table and how staff would cover breaks. There is no agreed attendant rota.",
          "Transport gap: Friday pickup was suggested. The carrier, route and pickup time remain open.",
          "Commitment: Draft a site staffing proposal | Owner: TBD | Due: TBD",
        ].join("\n"),
      },
      {
        id: "PRV-13",
        title: "Open privacy questions",
        kind: "Review notes",
        text: [
          "Data handling gap: The team has not approved a procedure for data-bearing devices or decided if donors should leave contact information.",
          "Commitment: Arrange a privacy review for intake and handover | Owner: Lee Park, privacy lead | Due: TBD",
        ].join("\n"),
      },
      {
        id: "COM-14",
        title: "Announcement preparation",
        kind: "Unapproved discussion notes",
        text: [
          "Communications gap: An announcement was discussed. There is no approval, publication date or named publisher.",
          "Commitment: Draft resident announcement copy for internal review | Owner: TBD | Due: TBD",
        ].join("\n"),
      },
    ],
  },
  {
    id: "conflict",
    title: "Conflicting launch instructions",
    description: "Two current directions disagree about the opening week and the release gate for public announcements.",
    query: "Can we tell residents the launch date now, or is the public announcement still blocked? What needs to be decided?",
    documents: [
      {
        id: "OPS-21",
        title: "Site lead’s launch decision",
        kind: "Current operating memo",
        text: [
          "Scope: Start a staffed household equipment drop-off trial at Harbor Branch Library.",
          "Sites: Harbor Branch Library.",
          "Launch window: 14–18 June 2027.",
          "Sign-off: Hold public invitations until the site lead confirms the staffing rota.",
          "Commitment: Publish the resident invitation | Owner: Amira Liu, communications lead | Due: 10 June 2027",
        ].join("\n"),
      },
      {
        id: "COM-22",
        title: "Programme lead’s release decision",
        kind: "Current programme memo",
        text: [
          "Launch window: 21–25 June 2027.",
          "Sign-off: Publish public invitations before the site lead confirms the staffing rota.",
          "Commitment: Publish the resident invitation | Owner: Amira Liu, communications lead | Due: 4 June 2027",
        ].join("\n"),
      },
      {
        id: "OPS-23",
        title: "Staffing and pickup checkpoint",
        kind: "Confirmed handover",
        text: [
          "Staffing: A team is available for either disputed week if it receives five working days of notice.",
          "Transport: Rebound Workshop can reserve one Friday pickup after the site confirms which week is in scope.",
          "Commitment: Confirm the attendant rota for the selected week | Owner: Alex Wynn, branch coordinator | Due: TBD",
        ].join("\n"),
      },
      {
        id: "PRV-24",
        title: "Agreed intake procedure",
        kind: "Approved procedure",
        text: [
          "Accepted items: Laptops, tablets and chargers. The pilot excludes loose batteries, broken displays and business equipment.",
          "Data handling: Log device type and count only. The refurbished equipment partner handles data-bearing devices after the documented handover.",
          "Accessibility: Offer a large-print guide and give directions to the step-free entrance.",
        ].join("\n"),
      },
    ],
  },
];

const STOP = new Set([
  "a", "about", "after", "an", "and", "are", "as", "at", "be", "before", "by", "can",
  "could", "do", "does", "for", "from", "has", "have", "how", "in", "into", "is", "it",
  "its", "me", "of", "on", "or", "our", "s", "so", "still", "tell", "that", "the",
  "their", "them", "there", "this", "to", "was", "we", "were", "what", "when", "where",
  "which", "who", "why", "will", "with", "would", "you", "your",
]);

const NORMAL_FORMS = new Map(Object.entries({
  announcements: "announcement", batteries: "battery", collecting: "collection",
  collected: "collection", collections: "collection", commitments: "commitment",
  dates: "date", deadlines: "deadline", devices: "device", donations: "donation",
  donors: "donor", hours: "hour", inputs: "input", laptops: "laptop", launching: "launch",
  leaves: "leave", libraries: "library", locations: "location", meetings: "meeting",
  measures: "measure", names: "name", needs: "need", notes: "note", owners: "owner",
  participants: "participant", printers: "printer", procedures: "procedure",
  records: "record", requirements: "requirement", residents: "resident", results: "result",
  rotations: "rotation", sites: "site", tablets: "tablet", tests: "test",
  weeks: "week", windows: "window",
}));

function tokens(input) {
  const words = input.toLowerCase().normalize("NFKD").replace(/\p{Diacritic}/gu, "").match(/[a-z0-9]+/g) ?? [];
  return words.filter((word) => !STOP.has(word)).map((word) => NORMAL_FORMS.get(word) ?? word);
}

const CONCEPTS = [
  {name: "pilot scope", terms: /\b(?:pilot|trial|poc|scope|first cohort|rollout|launch)\b/i},
  {name: "locations", terms: /\b(?:venue|venues|where|branch|library|site|sites|community cent(?:er|re)|drop[ -]?off|location|locations)\b/i},
  {name: "schedule", terms: /\b(?:calendar|opening|timeline|schedule|date|dates|june|july|week|window|timing|deadline|deadlines|due|when)\b/i},
  {name: "acceptable equipment", terms: /\b(?:accepted|eligible|eligibility|laptop|laptops|charger|chargers|tablet|tablets|exclud\w*|battery|batteries|what can .* donate)\b/i},
  {name: "staffing", terms: /\b(?:cover(?:age)?|headcount|shift|shifts|attendant|staff\w*|rota|rotation|back[ -]?up|people on[ -]?site|breaks)\b/i},
  {name: "privacy", terms: /\b(?:privacy|secure eras\w*|wipe|wiping|delete data|serial number|personal information|data[ -]?bearing|data handling|donor names|contact information)\b/i},
  {name: "logistics and custody", terms: /\b(?:transport|carrier|custody|sealed|hand[ -]?over|pickup|pick[ -]?up|rehearsal|transfer|collects|haul)\b/i},
  {name: "public communications", terms: /\b(?:promot\w*|announc\w*|invitation|publish|publication|residents|publicity|outreach|public communications|communications|notice|flyer|release)\b/i},
  {name: "approval", terms: /\b(?:approv\w*|sign[ -]?off|permission|block\w*|gate|go[ -]?ahead|confirm\w*)\b/i},
  {name: "accessibility", terms: /\b(?:accessib\w*|large[ -]?print|step[ -]?free|wheelchair|barrier[ -]?free|easy to read|mobility)\b/i},
  {name: "measure and expansion", terms: /\b(?:success|measure|metric|kpi|scorecard|result|threshold|scale|expan\w*|performance|reject\w*|target|evaluate)\b/i},
  {name: "accountability", terms: /\b(?:responsib\w*|accountab\w*|owner|lead|ownership|who|assignment|action item|commitment|task)\b/i},
];

function conceptVector(input) {
  return CONCEPTS.map(({terms}) => terms.test(input) ? 1 : 0);
}

function cosine(a, b) {
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const lengthProduct = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0)
    * b.reduce((sum, value) => sum + value * value, 0));
  return lengthProduct ? dot / lengthProduct : 0;
}

function indexDocuments(documents) {
  return documents.map((document) => {
    const input = `${document.title} ${document.title} ${document.text}`;
    const words = tokens(input);
    const frequency = new Map();
    for (const word of words) frequency.set(word, (frequency.get(word) ?? 0) + 1);
    return {document, frequency, vector: conceptVector(input), length: words.length};
  });
}

const INDEXES = new Map(scenarios.map(({id, documents}) => [id, indexDocuments(documents)]));

function rankDocuments(index, query) {
  const terms = [...new Set(tokens(query))];
  const vector = conceptVector(query);
  const typicalLength = index.reduce((sum, item) => sum + item.length, 0) / index.length;
  const inverseFrequencies = new Map(terms.map((term) => {
    const documentCount = index.filter(({frequency}) => frequency.has(term)).length;
    return [term, Math.log(1 + (index.length - documentCount + 0.5) / (documentCount + 0.5))];
  }));

  const results = index.map(({document, frequency, vector: documentVector, length}) => {
    const lengthNormalization = 1.2 * (0.25 + 0.75 * length / typicalLength);
    const bm25 = terms.reduce((sum, term) => {
      const count = frequency.get(term) ?? 0;
      return sum + (inverseFrequencies.get(term) * count * 2.2) / (count + lengthNormalization);
    }, 0);
    return { ...document, bm25, semanticSimilarity: cosine(vector, documentVector) };
  });
  const bestLexical = Math.max(...results.map(({bm25}) => bm25), 0);
  return results.map(({bm25, semanticSimilarity, ...document}) => {
    const lexical = bestLexical ? 100 * bm25 / bestLexical : 0;
    const concept = 100 * semanticSimilarity;
    const score = 0.6 * lexical + 0.4 * concept;
    const round = (value) => Math.round(value * 10) / 10;
    return {...document, lexical: round(lexical), concept: round(concept), score: round(score)};
  }).sort((left, right) => right.score - left.score);
}

function routeTask(query) {
  if (/\b(?:brief(?:ing)?|summary|summari[sz]e|recap|overview|snapshot)\b/i.test(query)) {
    return "Briefing";
  }
  if (/\b(?:strateg\w*|trade[ -]?off|should we|can we|what .*(?:decid\w*|unresolved|block\w*|resolve|missing)|risks?|open questions?|still blocked|what needs to be decided)\b/i.test(query)) {
    return "Strategic questions";
  }
  if (/\b(?:who (?:owns|is|will|should)|deadline\w*|due|commitment\w*|owner\w*|accountab\w*|action items?)\b/i.test(query)) {
    return "Commitments";
  }
  return "Briefing";
}

function recordsFrom(sources) {
  return sources.flatMap(({id, text, score}) => text.split("\n").map((line) => {
    const index = line.indexOf(": ");
    return {id, label: line.slice(0, index), value: line.slice(index + 2), score};
  }));
}

function groupBy(items, getKey) {
  const groups = new Map();
  for (const item of items) {
    const key = getKey(item);
    const values = groups.get(key) ?? [];
    values.push(item);
    groups.set(key, values);
  }
  return groups;
}

function sourceIds(items) {
  return [...new Set(items.map(({id}) => id))];
}

const EXCLUSIVE_FACTS = new Set(["Sites", "Launch window", "Transport", "Accepted items", "Sign-off"]);

function checkConflicts(records) {
  const choices = groupBy(records.filter(({label}) => EXCLUSIVE_FACTS.has(label)), ({label}) => label);
  const contested = new Set();
  const conflicts = [];
  for (const [label, statements] of choices) {
    const options = [...new Set(statements.map(({value}) => value))];
    if (options.length < 2) continue;
    contested.add(label);
    conflicts.push({text: `${label} has competing directions. ${options.join(" / ")}`, sourceIds: sourceIds(statements)});
  }
  return {contested, conflicts};
}

function draftCommitments(records) {
  const commitments = records.filter(({label}) => label === "Commitment").map((record) => {
    const [action, owner, due] = record.value.split(" | ");
    const known = (text) => text === "TBD" ? null : text;
    return {
      ...record,
      action,
      owner: known(owner?.slice("Owner: ".length) ?? "TBD"),
      due: known(due?.slice("Due: ".length) ?? "TBD"),
    };
  });

  const resolved = [];
  const conflicts = [];
  for (const [action, matches] of groupBy(commitments, ({action}) => action)) {
    const owners = [...new Set(matches.map(({owner}) => owner).filter(Boolean))];
    const dates = [...new Set(matches.map(({due}) => due).filter(Boolean))];
    const ids = sourceIds(matches);
    if (owners.length > 1 || dates.length > 1) {
      const disagreements = [];
      if (owners.length > 1) disagreements.push(`owners ${owners.join(" or ")}`);
      if (dates.length > 1) disagreements.push(`deadlines ${dates.join(" or ")}`);
      conflicts.push({text: `${action} has competing ${disagreements.join(" and ")}.`, sourceIds: ids});
    }
    resolved.push({
      action,
      owner: owners.length === 1 ? owners[0] : null,
      due: dates.length === 1 ? dates[0] : null,
      sourceIds: ids,
    });
  }
  return {commitments: resolved, conflicts};
}

const MISSING_CHECKS = [
  {fact: "Sites", gap: "Candidate venue", question: "Which location can commit to the collection window and staff the handover?"},
  {fact: "Launch window", gap: "Communications gap", question: "What opening window can the sites and pickup partner both hold?"},
  {fact: "Staffing", gap: "Staffing gap", question: "Who owns the site rota, who covers breaks, and when will both be confirmed?"},
  {fact: "Transport", gap: "Transport gap", question: "Who confirms the pickup time and takes custody from each site?"},
  {fact: "Data handling", gap: "Data handling gap", question: "Who approves the handling of data-bearing devices and what donor information, if any, is necessary?"},
  {fact: "Sign-off", gap: "Communications gap", question: "Who can authorize the resident announcement, and what must be settled before it goes out?"},
  {fact: "Success measure", gap: "Learning goal", question: "What result would justify running the pilot again or opening another site?"},
];

const RELEASE_REQUIREMENTS = new Set(["Sites", "Launch window", "Staffing", "Transport", "Data handling", "Sign-off"]);

const FOLLOW_UPS = [
  {facts: ["Success measure", "Staffing"], text: "If results differ by location, how will the team distinguish demand from differences in staffed hours before adding a site?"},
  {facts: ["Accessibility", "Accepted items"], text: "How will the team test whether residents understand the eligible items and can reach the drop-off point without assistance?"},
  {facts: ["Transport", "Data handling"], text: "What handover exception would pause collection, and how will the site and partner record it?"},
];

function relevance(text, query) {
  const queryTerms = new Set(tokens(query));
  const overlap = [...new Set(tokens(text))].filter((word) => queryTerms.has(word)).length;
  return 6 * Math.min(overlap, 7) + 20 * cosine(conceptVector(text), conceptVector(query));
}

function draftBriefing(records, query, contested, route) {
  const facts = records.filter(({label, score}) => score > 0 && label !== "Commitment" && !contested.has(label));
  const sorted = facts.map((fact) => ({
    ...fact,
    fit: fact.score + relevance(`${fact.label} ${fact.value}`, query) + (fact.label.endsWith("gap") ? 10 : 0),
  })).sort((a, b) => b.fit - a.fit);
  const groups = groupBy(sorted, ({label}) => label);
  return [...groups.values()].slice(0, route === "Briefing" ? 6 : 4).map(([best, ...others]) => ({
    text: `${best.label}. ${best.value}`,
    sourceIds: sourceIds([best, ...others.filter(({value}) => value === best.value)]),
  }));
}

function draftQuestions(records, query, contested, conflicts) {
  const questions = [];
  const safe = records.filter(({label}) => !contested.has(label));
  for (const {fact, gap, question} of MISSING_CHECKS) {
    if (safe.some(({label}) => label === fact)) continue;
    const identifiedGaps = safe.filter(({label}) => label === gap);
    questions.push({text: question, sourceIds: sourceIds(identifiedGaps)});
  }
  if (contested.has("Launch window") || contested.has("Sign-off")) {
    questions.push({
      text: "Which launch window and announcement gate do the site and programme leads jointly approve?",
      sourceIds: [...new Set(conflicts.flatMap(({sourceIds: ids}) => ids))],
      priority: 100,
    });
  }
  for (const followUp of FOLLOW_UPS) {
    const relevant = safe.filter(({label}) => followUp.facts.includes(label));
    const evidence = new Set(relevant.map(({label}) => label));
    if (evidence.size === followUp.facts.length) {
      questions.push({text: followUp.text, sourceIds: sourceIds(relevant)});
    }
  }
  return questions.map((item) => ({...item, relevance: (item.priority ?? 0) + relevance(item.text, query)}))
    .sort((a, b) => b.relevance - a.relevance).slice(0, 5).map(({text, sourceIds: ids}) => ({text, sourceIds: ids}));
}

export function analyze(query, scenarioId) {
  const scenario = scenarios.find(({id}) => id === scenarioId) ?? scenarios[0];
  const input = String(query ?? "").trim().slice(0, 1200) || scenario.query;
  const route = routeTask(input);
  const ranked = rankDocuments(INDEXES.get(scenario.id), input);
  const trace = [
    {label: "Task route", detail: route},
    {label: "Hybrid retrieval", detail: "60% lexical BM25 and 40% cosine similarity over a domain concept vocabulary. Lexical scores are relative to the best hit in this scenario."},
  ];
  const activeConcepts = conceptVector(input).flatMap((active, index) => active ? [CONCEPTS[index].name] : []);
  trace.push({label: "Query concepts", detail: activeConcepts.length ? activeConcepts.join(", ") : "No domain concept matched."});
  if (!ranked.some(({score}) => score > 0)) {
    return {
      briefing: [{text: "The selected evidence packet does not support an answer to this request.", sourceIds: []}],
      commitments: [],
      questions: [{text: "What decision about the collection pilot should the evidence packet address?", sourceIds: []}],
      sources: [],
      conflicts: [],
      trace: [...trace, {label: "Evidence check", detail: "No lexical or concept match. No source was selected."}],
    };
  }

  const records = recordsFrom(ranked);
  const {contested, conflicts: factConflicts} = checkConflicts(records);
  const {commitments, conflicts: commitmentConflicts} = draftCommitments(records);
  const conflicts = [...factConflicts, ...commitmentConflicts];
  const briefing = draftBriefing(records, input, contested, route);
  const questions = draftQuestions(records, input, contested, conflicts);
  if (conflicts.length) {
    const ids = [...new Set(conflicts.flatMap(({sourceIds: ids}) => ids))];
    briefing.unshift({text: "The packet contains competing directions. The disputed launch instructions cannot support a public announcement.", sourceIds: ids});
  } else {
    const recordedFacts = new Set(records.map(({label}) => label));
    const openChecks = MISSING_CHECKS.filter(({fact}) => RELEASE_REQUIREMENTS.has(fact) && !recordedFacts.has(fact));
    if (openChecks.length) {
      const gapLabels = new Set(openChecks.map(({gap}) => gap));
      const gapIds = sourceIds(records.filter(({label}) => gapLabels.has(label)));
      briefing.unshift({
        text: `The packet supports preparation only. The release checklist still needs decisions on ${openChecks.map(({fact}) => fact.toLowerCase()).join(", ")}.`,
        sourceIds: gapIds,
      });
    } else {
      briefing.unshift({
        text: "The packet supports preparing the pilot for launch. Confirm the recorded sign-off conditions before announcing it.",
        sourceIds: sourceIds(records.filter(({label}) => label === "Sites" || label === "Sign-off")),
      });
    }
  }

  const orderedCommitments = commitments.map((item) => ({
    ...item,
    fit: relevance(`${item.action} ${item.owner ?? ""} ${item.due ?? ""}`, input),
  })).sort((a, b) => b.fit - a.fit).map(({fit, ...item}) => item);

  const selectedIds = new Set(
    [...briefing, ...orderedCommitments, ...questions, ...conflicts].flatMap(({sourceIds: ids}) => ids),
  );
  const sources = ranked.filter(({id, score}, index) => selectedIds.has(id) || (score > 0 && index < 3));
  trace.push(
    {label: "Evidence check", detail: `${sources.length} of ${ranked.length} sources shown, including any required by cited checks. ${conflicts.length} conflict${conflicts.length === 1 ? "" : "s"} detected.`},
    {label: "Draft assembly", detail: "The briefing extracts recorded facts. Commitments preserve unknown owners and dates. Strategic questions use coverage gaps and conflicting directions."},
  );
  return {briefing, commitments: orderedCommitments, questions, sources, conflicts, trace};
}
