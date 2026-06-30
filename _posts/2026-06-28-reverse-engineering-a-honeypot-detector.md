---
layout: article
eyebrow: Mechanistic Interpretability
title: "Understanding a Smart-Contract Honeypot Detector: Circuits, Redundancy, and Causal Testing"
author: Md Rahinul Islam Bhuiyan
affiliation: University of Malaya
date: 2026-06-28
doi: 10.5281/zenodo.20972391
abstract: "A machine-learning detector flags a malicious smart contract — but is it reading a real signal, or a quirk of the data? We train a small transformer to catch Ethereum honeypots, then take it apart. A single run tells a tidy story: one attention head, one opcode. Two checks break that story. The lesson is methodological: single-run attention and ablation can manufacture circuits that don't survive seed variation or causal tests."
---

Detectors for malicious Ethereum smart contracts are usually black boxes. When one flags a contract, we cannot tell whether it found a real signal or a quirk of the data. For a security tool, that gap matters: a model that scores well by leaning on a dataset artifact will fail quietly against an adaptive attacker. So we study the question directly — not *how accurate* is the detector, but *what has it actually learned?*

This is a small experiment in the spirit of the [Circuits](https://distill.pub/2020/circuits/) and [Transformer Circuits](https://transformer-circuits.pub/) work: pick a model small enough to take apart by hand, reverse-engineer the algorithm it has learned, and see whether the story holds up. The twist is the domain — a security classifier — and the result is partly a cautionary tale about the interpretability methods themselves.

## 1. A detector small enough to understand

A deployed contract is a string of EVM *bytecode*, which disassembles into a sequence of opcodes from a fixed instruction set (`SSTORE`, `CALL`, `EXP`, `PUSH1`, …). We treat each contract as a token sequence and train a deliberately tiny classifier: a two-layer, four-head transformer with model dimension $d=64$, reading the label off a `[CLS]` token.

On real on-chain data — 243 confirmed honeypots from the HoneyBadger set and 300 freshly-deployed benign contracts — it reaches test $\mathrm{F1}=0.98$. A plain bag-of-opcodes logistic regression reaches $1.00$, so the task is nearly linearly separable. We treat that as the point, not a weakness: an easy, separable task is a clean testbed for studying *how* a model decides, the same way toy models are.

<figure class="tc-figure">
  <img src="{{ '/assets/img/honeypot/confusion.png' | relative_url }}" alt="Confusion matrix">
  <figcaption><b>Figure 1.</b> Test-set confusion matrix for the two-layer detector. Of 55 held-out contracts it mislabels one benign contract and no honeypots (precision 0.96, recall 1.00). The model is accurate; the question is <i>why</i>.</figcaption>
</figure>

## 2. The tidy story: one head

We first ask which of the eight attention heads the detector relies on. For each head $(\ell,h)$ we define its importance as the drop in F1 when it is disabled:

$$\Delta\mathrm{F1}(\ell,h) = \mathrm{F1}(M) - \mathrm{F1}\big(M_{\setminus(\ell,h)}\big).$$

On one trained model the result is strikingly sparse. Disabling head $\mathrm{L0H3}$ collapses performance ($\Delta\mathrm{F1}=0.22$, F1 falling from 0.98 to 0.76), while every other head barely matters. This looks exactly like a one-head circuit.

<figure class="tc-figure">
  <img src="{{ '/assets/img/honeypot/ablation.png' | relative_url }}" alt="Per-head ablation importance">
  <figcaption><b>Figure 2.</b> Per-head ablation importance for one trained model. One head (here L0H3, red) dominates and the rest are near zero — the signature of a sparse circuit.</figcaption>
</figure>

So we ask what that head reads. Averaging its attention from `[CLS]` over honeypots and benign contracts, two opcodes stand out — but only one separates the classes. `PUSH2` (jump tables) is read in both, so it carries no class information. The head reads `EXP` (exponentiation) almost only on honeypots (mean top-5 attention 0.18 vs. 0.00 on benign). `EXP` is a plausible signal: arithmetic manipulation is a known honeypot trick.

<figure class="tc-figure">
  <img src="{{ '/assets/img/honeypot/attention.png' | relative_url }}" alt="Attention by opcode and class">
  <figcaption><b>Figure 3.</b> Mean top-5 attention of L0H3 from <code>[CLS]</code>, by opcode and class. <code>EXP</code> is read only on honeypots (discriminative); <code>PUSH2</code> is read in both (structural).</figcaption>
</figure>

Put together, this gives a clean, satisfying circuit: `EXP` is read by L0H3, which writes to the `[CLS]` stream, which the classifier maps to the honeypot logit.

<figure class="tc-figure">
  <img src="{{ '/assets/img/honeypot/circuit.png' | relative_url }}" alt="Candidate circuit diagram">
  <figcaption><b>Figure 4.</b> The candidate circuit from ablation and attention: <code>EXP</code> → L0H3 → <code>[CLS]</code> → honeypot logit. It is tidy, plausible, and — as we will see — not quite true.</figcaption>
</figure>

## 3. The story breaks, twice

**Check one: seeds.** We retrain and re-ablate across five seeds. The dominant head's drop is $\Delta\mathrm{F1}=0.22 \pm 0.20$, and *which* head it is changes from run to run (L0H0, L0H1, or L0H3, always in layer 0). In two of the five seeds, no head drops F1 by more than 0.02 — the model is fully redundant, with no one-head circuit at all. The clean circuit in Figure 2 is a property of *one trained model*, not of the task.

**Check two: cause.** Attention is only correlation — a head reading `EXP` does not prove `EXP` *causes* the decision. We test cause with activation patching (a denoising design): take a correctly-flagged honeypot, corrupt it by replacing every `EXP` with a neutral opcode, then patch the clean activations back in at those positions and watch the prediction.

The result is negative, and that is the point: corrupting `EXP` changes only **0.4%** of predictions. It does not depend on the edit — six different replacement opcodes all change at most 0.4%, and zeroing L0H3's attention onto `EXP` changes 0.0%. So even though L0H3 reads `EXP` and is the most important single head under ablation, the `EXP` token is **not necessary**. The detector spreads its evidence over many features.

An evasion test agrees from the attacker's side: simple semantics-preserving edits (inserting stack-neutral instructions, even targeted right before each `EXP`) fool the detector at most **0.8%** of the time. The same redundancy, seen as robustness.

## 4. What survives

> Single-run attention and ablation can produce a neat, plausible "circuit" that does not survive seed variation or causal tests. What is stable here is **redundancy**: no single head and no single feature is necessary.

That is the methodological takeaway, and it is the part that generalizes beyond this one detector. The tools that make interpretability legible — a sparse ablation plot, an attention map pointing at a meaningful token — are exactly the tools that can manufacture a story. A security audit should trust only what survives **seed variation** and **causal intervention**, not what a single run suggests.

None of this means the detector is untrustworthy or that interpretability failed. The opposite: interpretability is what let us catch the over-claim. A learned security detector need not be a black box — but reading it correctly is harder than it looks, and the discipline is in the checks.

<hr class="tc-rule">

<div class="tc-refs" markdown="1">

## Code and data

Everything here is reproducible — model, data pipeline, ablation, attention, activation patching, baselines, and figures — released openly.

- **Zenodo (code + data):** [10.5281/zenodo.20972391](https://doi.org/10.5281/zenodo.20972391)
- **Paper:** arXiv (forthcoming)

## References

1. Olah et al. *Zoom In: An Introduction to Circuits.* Distill, 2020.
2. Elhage et al. *A Mathematical Framework for Transformer Circuits.* Anthropic, 2021.
3. Wang et al. *Interpretability in the Wild (IOI).* ICLR, 2023.
4. Torres et al. *The Art of The Scam: Demystifying Honeypots in Ethereum.* USENIX Security, 2019.
5. Michel et al. *Are Sixteen Heads Really Better than One?* NeurIPS, 2019.

</div>
