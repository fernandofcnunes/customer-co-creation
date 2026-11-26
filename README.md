# From customer brief to shared pilot

A grocery advertiser wants to know what happens to a dinner plan when an ingredient is unavailable. A media sales team and its customer use a shared workspace to compare concepts, challenge the evidence and agree on what to test.

**My role.** I lead commercial teams that build solutions with customers. In a real collaboration, our team built a shared space for day-to-day account work and new ideas. This independent case uses a fictional brief to show how I involve the customer in early prototype decisions.

[Open the GitHub Pages demo](https://fernandofcnunes.github.io/customer-co-creation/)

## Walk through the case

1. **Frame the brief.** Try the one-handed experience, low bandwidth or short video feedback presets. You can edit the brief and feedback and tune the decision weights.
2. **Evaluate the trade-offs.** Compare an ingredient swap card, a prep clip, a saved shopping list and a pantry filter. Inspect the score breakdown, matched terms, source notes and risks. The ranking changes as the customer's needs change.
3. **Agree on a test.** Select a concept and review the control, variant, primary metric, guardrail and threshold. The follow-up sample planner estimates how many participants a larger A/B test might require. A human approves the selected pilot before it can be exported as JSON. Editing the brief, feedback or weights requires rerunning the analysis before approving a new plan.

## How it works

- **Retrieval.** BM25 ranks a small corpus of synthetic notes against the brief and feedback. A domain vocabulary normalizes equivalent terms, and the feedback receives extra weight. The interface shows each concept's matching notes.
- **Decision model.** A weighted score combines customer impact, feasibility and evidence confidence. Explicit rules account for concerns such as offline use or captions and flag competing needs. Evidence confidence reflects retrieval strength within the fictional corpus. It does not estimate the probability of a pilot succeeding.
- **Pilot selection.** Each concept has a distinct pilot template. The approval and analysis inputs are stored in the browser when local storage is available. A follow-up sample estimate uses a normal approximation for two independent proportions under equal allocation.
- **Runtime.** Strict TypeScript compiles to a static browser script. The demo uses local search and scoring without calling a generative model, server or third-party API. The scenario, evidence and pilot plans are fictional.

## Run locally

Download or clone the repository and open `index.html`. The compiled `app.js` and `styles.css` must be alongside it. To serve the folder over HTTP, run `python3 -m http.server 8000` and open `http://localhost:8000`.

To rebuild the browser script after changing the TypeScript:

```sh
npx --yes --package typescript@5.9.3 tsc --project tsconfig.json
```

The TypeScript sources are in `src/`. Commit the regenerated `app.js` with source changes so the GitHub Pages site can serve the same build.
