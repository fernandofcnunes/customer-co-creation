import { analyze, scenarios } from "./engine.mjs";

const form = document.querySelector("#question-form");
const question = document.querySelector("#question");
const description = document.querySelector("#scenario-description");
const options = document.querySelector("#scenario-options");
const status = document.querySelector("#status");
const briefing = document.querySelector("#briefing");
const commitments = document.querySelector("#commitments");
const questions = document.querySelector("#questions");
const conflicts = document.querySelector("#conflicts");
const conflictList = conflicts.querySelector("ul");
const sources = document.querySelector("#sources");
const trace = document.querySelector("#trace");

let active = scenarios[0];
const buttons = new Map();

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function sourceAnchor(id) {
  return `record-${id}`;
}

function appendCitations(node, ids, sourceById) {
  for (const id of ids) {
    const source = sourceById.get(id);
    if (!source) continue;
    const link = element("a", id, "citation");
    link.href = `#${sourceAnchor(id)}`;
    link.setAttribute("aria-label", `Read source ${id}: ${source.title}`);
    node.append(" ", link);
  }
}

function evidenceLine(item, sourceById, className) {
  const row = element("li", undefined, className);
  const copy = element("p", item.text);
  appendCitations(copy, item.sourceIds, sourceById);
  row.append(copy);
  return row;
}

function sourceCard(source) {
  const card = element("article", undefined, "source-card");
  card.id = sourceAnchor(source.id);
  const scores = `Hybrid score ${source.score} · lexical ${source.lexical} · concept ${source.concept}`;
  card.append(
    element("h3", `${source.id} · ${source.title}`),
    element("p", source.kind, "source-kind"),
    element("blockquote", source.text),
    element("small", scores),
  );
  return card;
}

function render(result) {
  const sourceById = new Map(result.sources.map((source) => [source.id, source]));
  briefing.replaceChildren(...result.briefing.map((item) => evidenceLine(item, sourceById, "brief-line")));
  questions.replaceChildren(...result.questions.map((item) => evidenceLine(item, sourceById)));
  conflictList.replaceChildren(...result.conflicts.map((item) => evidenceLine(item, sourceById)));
  conflicts.hidden = result.conflicts.length === 0;

  const commitmentCards = result.commitments.map((item) => {
    const card = element("div", undefined, "commitment");
    const details = element("p", `${item.owner ?? "Owner unconfirmed"} · ${item.due ?? "Date unconfirmed"}`);
    appendCitations(details, item.sourceIds, sourceById);
    card.append(element("strong", item.action), details);
    return card;
  });
  commitments.replaceChildren(...(commitmentCards.length
    ? commitmentCards
    : [element("p", "The retrieved records do not establish a commitment.")]));

  const records = result.sources.map(sourceCard);
  sources.replaceChildren(...(records.length
    ? records
    : [element("p", "No record met the retrieval criteria for this question.")]));

  trace.replaceChildren(...result.trace.map((step) => {
    const row = element("li");
    row.append(element("strong", step.label), ` · ${step.detail}`);
    return row;
  }));
  const sourceCount = `${result.sources.length} source${result.sources.length === 1 ? "" : "s"}`;
  const conflictCount = `${result.conflicts.length} conflict${result.conflicts.length === 1 ? "" : "s"}`;
  status.textContent = `${sourceCount} · ${conflictCount}`;
}

function generate() {
  const query = question.value.trim();
  question.setCustomValidity(query ? "" : "Enter a decision question.");
  if (!form.reportValidity()) return;
  render(analyze(query, active.id));
}

function selectScenario(scenario) {
  active = scenario;
  for (const [id, button] of buttons) {
    button.setAttribute("aria-pressed", String(id === scenario.id));
  }
  description.textContent = scenario.description;
  question.value = scenario.query;
  generate();
}

for (const scenario of scenarios) {
  const button = element("button", scenario.title, "scenario-option");
  button.type = "button";
  button.addEventListener("click", () => selectScenario(scenario));
  options.append(button);
  buttons.set(scenario.id, button);
}

question.addEventListener("input", () => {
  question.setCustomValidity("");
  status.textContent = "Question changed. Generate a new briefing.";
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
});
selectScenario(active);
