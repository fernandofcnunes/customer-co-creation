(() => {
  type Inputs = Parameters<typeof Engine.analyze>[0];
  type Candidate = ReturnType<typeof Engine.analyze>["candidates"][number];

  interface Session {
    inputs: Inputs;
    selectedId: string;
    approvedAt?: string;
  }

  const storageKey = "customer-co-creation:v2";
  const form = document.querySelector<HTMLFormElement>("#brief-form")!;
  const brief = document.querySelector<HTMLTextAreaElement>("#brief")!;
  const feedback = document.querySelector<HTMLTextAreaElement>("#feedback")!;
  const approval = document.querySelector<HTMLButtonElement>("#approve")!;
  const exportButton = document.querySelector<HTMLButtonElement>("#export")!;
  const status = document.querySelector<HTMLElement>("#result-status")!;
  const decisionStatus = document.querySelector<HTMLElement>("#decision-status")!;
  const rankedOptions = document.querySelector<HTMLElement>("#ranked-options")!;
  const detail = document.querySelector<HTMLElement>("#option-detail")!;
  const weights = document.querySelector<HTMLElement>("#weights")!;
  const presets = document.querySelector<HTMLElement>("#presets")!;
  const pilotView = document.querySelector<HTMLElement>("#pilot")!;
  const conflicts = document.querySelector<HTMLElement>("#conflicts")!;
  const baselineRate = document.querySelector<HTMLInputElement>("#baseline-rate")!;
  const targetLift = document.querySelector<HTMLInputElement>("#target-lift")!;
  const sampleResult = document.querySelector<HTMLElement>("#sample-result")!;
  const sliders = new Map<keyof Inputs["weights"], { control: HTMLInputElement; output: HTMLOutputElement }>();

  let session = loadSession() ?? { inputs: Engine.defaults, selectedId: "" };
  let analysis = Engine.analyze(session.inputs);
  let isDirty = false;

  const pilotFields: ReadonlyArray<[keyof Candidate["pilot"], string]> = [
    ["hypothesis", "Hypothesis"],
    ["control", "Control"],
    ["variant", "Variant"],
    ["metric", "Primary metric"],
    ["threshold", "Success threshold"],
    ["guardrail", "Guardrail"],
    ["sample", "Suggested sample"],
  ];

  function element<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    value?: string,
  ): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }

  function loadSession(): Session | undefined {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<Session>;
      const inputs = parsed.inputs;
      if (typeof inputs?.brief !== "string" || !inputs.brief.trim() ||
          typeof inputs.feedback !== "string" || typeof parsed.selectedId !== "string") return;
      if (!Engine.criteria.every(({ id }) => Number.isFinite(inputs.weights?.[id]) &&
          inputs.weights[id] >= 0 && inputs.weights[id] <= 100)) return;
      if (typeof parsed.approvedAt === "string" && Number.isFinite(Date.parse(parsed.approvedAt))) {
        return { inputs, selectedId: parsed.selectedId, approvedAt: parsed.approvedAt };
      }
      return { inputs, selectedId: parsed.selectedId };
    } catch {
      return;
    }
  }

  function saveSession() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(session));
    } catch {
      // The session still works in memory when storage is unavailable.
    }
  }

  function buildControls() {
    for (const { label, feedback: presetFeedback } of Engine.presets) {
      const button = element("button", "preset-btn", label);
      button.type = "button";
      button.addEventListener("click", () => {
        feedback.value = presetFeedback;
        runAnalysis();
      });
      presets.append(button);
    }

    for (const { id, label } of Engine.criteria) {
      const wrapper = element("div", "weight-control");
      const caption = element("label", undefined, label);
      caption.htmlFor = `weight-${id}`;
      const control = element("input");
      control.id = caption.htmlFor;
      control.type = "range";
      control.min = "0";
      control.max = "100";
      control.step = "5";
      const output = element("output");
      output.htmlFor.add(control.id);
      control.addEventListener("input", () => {
        output.value = control.value;
        markDirty();
      });
      wrapper.append(caption, output, control);
      weights.append(wrapper);
      sliders.set(id, { control, output });
    }
  }

  function fillControls(inputs: Inputs) {
    brief.value = inputs.brief;
    feedback.value = inputs.feedback;
    for (const [id, { control, output }] of sliders) {
      control.value = String(inputs.weights[id]);
      output.value = control.value;
    }
  }

  function getInputs(): Inputs {
    const currentWeights = { ...Engine.defaults.weights };
    for (const [id, { control }] of sliders) currentWeights[id] = control.valueAsNumber;
    return { brief: brief.value.trim(), feedback: feedback.value.trim(), weights: currentWeights };
  }

  function sameInputs(a: Inputs, b: Inputs) {
    return a.brief === b.brief && a.feedback === b.feedback &&
      Engine.criteria.every(({ id }) => a.weights[id] === b.weights[id]);
  }

  function markDirty() {
    brief.setCustomValidity("");
    isDirty = !sameInputs(getInputs(), session.inputs);
    updateDecision();
    if (isDirty) status.textContent = "Inputs changed. Run the analysis to refresh the ranking.";
    else renderStatus();
  }

  function selectedCandidate() {
    const selected = analysis.candidates.find(({ id }) => id === session.selectedId);
    return selected ?? analysis.candidates[0];
  }

  function runAnalysis() {
    brief.setCustomValidity(brief.value.trim() ? "" : "Enter the customer brief.");
    if (!form.reportValidity()) return;
    const inputs = getInputs();
    if (!Object.values(inputs.weights).some((weight) => weight > 0)) {
      isDirty = true;
      status.textContent = "Give at least one criterion a positive weight to rank the concepts.";
      updateDecision();
      return;
    }

    if (!sameInputs(inputs, session.inputs)) {
      analysis = Engine.analyze(inputs);
      session = { inputs, selectedId: analysis.candidates[0].id };
    }
    isDirty = false;
    saveSession();
    render();
  }

  function renderStatus() {
    const leader = analysis.candidates[0];
    status.textContent = `${analysis.candidates.length} concepts ranked. ${leader.title} ranks first at ${Math.round(leader.score)}/100.`;
  }

  function renderSampleEstimate() {
    const baseline = baselineRate.valueAsNumber / 100;
    const lift = targetLift.valueAsNumber / 100;
    const target = baseline + lift;
    if (!baselineRate.validity.valid || !targetLift.validity.valid || target >= 1) {
      sampleResult.textContent = "Enter positive whole percentages with a combined total below 100.";
      return;
    }

    // Normal approximation for two independent proportions with equal allocation.
    const mean = (baseline + target) / 2;
    const nullDeviation = Math.sqrt(2 * mean * (1 - mean));
    const alternativeDeviation = Math.sqrt(baseline * (1 - baseline) + target * (1 - target));
    const perGroup = Math.ceil(((1.96 * nullDeviation + 0.8416 * alternativeDeviation) / lift) ** 2);
    const format = new Intl.NumberFormat("en");
    sampleResult.textContent = `About ${format.format(perGroup)} participants per group (${format.format(2 * perGroup)} total).`;
  }

  function render() {
    renderStatus();
    if (analysis.conflicts.length) {
      const warningList = element("ul");
      for (const conflict of analysis.conflicts) warningList.append(element("li", undefined, conflict));
      conflicts.replaceChildren(element("h3", undefined, "Trade-offs to review"), warningList);
    } else {
      conflicts.replaceChildren();
    }
    conflicts.hidden = analysis.conflicts.length === 0;
    renderSelection();
  }

  function renderSelection() {
    const chosen = selectedCandidate();
    rankedOptions.replaceChildren();
    for (const [index, item] of analysis.candidates.entries()) {
      const option = element("button", "candidate");
      const selected = item.id === chosen.id;
      option.type = "button";
      option.dataset.optionId = item.id;
      option.dataset.selected = String(selected);
      option.setAttribute("aria-pressed", String(selected));
      const copy = element("span", "candidate-copy");
      copy.append(element("span", "candidate-name", item.title),
        element("span", "candidate-description", item.description));
      option.append(element("span", "candidate-rank", String(index + 1)), copy,
        element("span", "candidate-score", `${Math.round(item.score)}/100`));
      option.addEventListener("click", () => {
        if (item.id === chosen.id) return;
        session = { inputs: session.inputs, selectedId: item.id };
        saveSession();
        renderSelection();
        rankedOptions.querySelector<HTMLButtonElement>(`[data-option-id="${item.id}"]`)?.focus();
      });
      rankedOptions.append(option);
    }

    const breakdown = element("div", "criteria-grid");
    for (const criterion of chosen.criteria) {
      const card = element("div", "criterion");
      const meter = element("meter");
      meter.min = 0;
      meter.max = 100;
      meter.value = criterion.score;
      meter.setAttribute("aria-label", criterion.label);
      card.append(element("strong", undefined, criterion.label),
        element("span", "criterion-score", `${Math.round(criterion.score)}/100`),
        meter, element("p", undefined, criterion.reason));
      breakdown.append(card);
    }
    const sources = element("div", "evidence-list");
    for (const source of chosen.evidence) {
      const evidence = element("article", "evidence-card");
      evidence.append(element("h4", undefined, `${source.id} · ${source.title}`),
        element("p", undefined, source.excerpt));
      if (source.matchedTerms.length) {
        evidence.append(element("p", "evidence-terms", `Matched: ${source.matchedTerms.join(", ")}`));
      }
      sources.append(evidence);
    }
    if (!chosen.evidence.length) {
      sources.append(element("p", undefined, "No matching evidence was retrieved for this concept."));
    }

    detail.replaceChildren(element("h3", undefined, chosen.title), breakdown,
      element("h3", undefined, "Retrieved evidence"), sources);
    if (chosen.risks.length) {
      const risks = element("ul", "risk-list");
      for (const risk of chosen.risks) risks.append(element("li", undefined, risk));
      detail.append(element("h3", undefined, "Risks to review"), risks);
    }

    const plan = element("dl", "pilot-grid");
    for (const [key, label] of pilotFields) {
      const row = element("div");
      row.append(element("dt", undefined, label), element("dd", undefined, chosen.pilot[key]));
      plan.append(row);
    }
    pilotView.replaceChildren(element("h3", undefined, chosen.title), plan);
    updateDecision();
  }

  function updateDecision() {
    const isApproved = Boolean(session.approvedAt) && session.selectedId === selectedCandidate().id;
    approval.disabled = isDirty || isApproved;
    exportButton.disabled = isDirty || !isApproved;
    if (isDirty) {
      decisionStatus.textContent = "Review the refreshed ranking before approving a pilot.";
    } else if (isApproved) {
      decisionStatus.textContent = "Pilot approved in this workspace. Export is ready.";
    } else {
      decisionStatus.textContent = "Awaiting human review. Approve the selected pilot to export it.";
    }
  }

  function exportPilot() {
    if (isDirty || !session.approvedAt) return;

    const chosen = selectedCandidate();
    const snapshot = {
      scenario: "Fictional customer co-creation demo",
      approvedAt: session.approvedAt,
      ...session.inputs,
      selectedConcept: chosen,
      tradeOffs: analysis.conflicts,
      ranking: analysis.candidates.map(({ id, title, score }) => ({ id, title, score })),
    };
    const file = new Blob([JSON.stringify(snapshot, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const download = element("a");
    download.href = url;
    download.download = `pilot-${chosen.id}.json`;
    document.body.append(download);
    download.click();
    download.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runAnalysis();
  });
  brief.addEventListener("input", markDirty);
  feedback.addEventListener("input", markDirty);
  document.querySelector<HTMLButtonElement>("#reset")!.addEventListener("click", () => {
    session = { inputs: Engine.defaults, selectedId: "" };
    analysis = Engine.analyze(session.inputs);
    isDirty = false;
    brief.setCustomValidity("");
    fillControls(session.inputs);
    baselineRate.value = baselineRate.defaultValue;
    targetLift.value = targetLift.defaultValue;
    renderSampleEstimate();
    saveSession();
    render();
  });
  approval.addEventListener("click", () => {
    if (isDirty || session.approvedAt) return;
    session = { ...session, selectedId: selectedCandidate().id, approvedAt: new Date().toISOString() };
    saveSession();
    updateDecision();
  });
  exportButton.addEventListener("click", exportPilot);
  baselineRate.addEventListener("input", renderSampleEstimate);
  targetLift.addEventListener("input", renderSampleEstimate);

  buildControls();
  fillControls(session.inputs);
  render();
  renderSampleEstimate();
})();
