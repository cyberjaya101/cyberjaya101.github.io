---
layout: article
eyebrow: Mechanistic Interpretability
title: "Understanding a Smart-Contract Honeypot Detector: Circuits, Redundancy, and Causal Testing"
author: Md Rahinul Islam Bhuiyan
affiliation: University of Malaya
date: 2026-06-28
doi: 10.5281/zenodo.20972391
abstract: "We train a small transformer to catch Ethereum honeypot contracts, then try to figure out what it actually learned. A single run tells a tidy story: one head, one opcode. Two checks break that story. We think the lesson generalizes: single-run attention and ablation can manufacture circuits that don't survive seed variation or a causal test."
---

We'd like to share a small experiment on a question that comes up a lot once you start using machine learning for security: when a detector flags something, how do you know it found something real, and not a quirk of the training data?

This started as a practical worry. A model that scores well on a benchmark can still be relying on something an attacker could simply avoid. The only way we know to check is to open the model up and look. So that's what we did, on a problem small enough to actually do this by hand: detecting honeypot smart contracts on Ethereum.

We want to be upfront that this is a small study (one detector, one dataset, 543 contracts) and we'd ask you to treat it the way you'd treat a colleague's preliminary results, not a finished claim. What we found was more interesting as a lesson about interpretability methods than as a claim about this particular detector.

## The setup

A deployed Ethereum contract is a string of bytecode, which disassembles into a sequence of opcodes (`SSTORE`, `CALL`, `EXP`, `PUSH1`, and so on, from a fixed instruction set). We treat a contract as a sequence of these tokens and train a small classifier on top, a two-layer, four-head transformer with model dimension 64, reading honeypot-or-not off a `[CLS]` token. We kept it deliberately tiny so we could take it apart.

On real data (243 confirmed honeypots, 300 freshly-deployed benign contracts), it gets to test F1 of 0.98. Worth noting: a plain logistic regression on opcode counts gets to 1.00. So this task is close to linearly separable, which we think is a feature rather than a bug here. It gave us a clean setting to study the interpretability methods themselves, separate from whether the underlying task is hard.

It mislabels one contract out of 55 held out, a benign one, and catches every honeypot.

## A tidy story

The first thing we tried was per-head ablation: disable one attention head at a time and see how much F1 drops. We define the importance of a head as

$$\Delta\mathrm{F1}(\ell,h) = \mathrm{F1}(M) - \mathrm{F1}\big(M_{\setminus(\ell,h)}\big).$$

On the first model we trained, this was about as clean as ablation results get. Disabling one head, L0H3, drops F1 from 0.98 to 0.76. Every other head barely moves it.

<figure class="tc-figure">
  <img src="{{ '/assets/img/honeypot/ablation.png' | relative_url }}" alt="Per-head ablation importance">
</figure>

Naturally we wanted to know what that head was reading. We averaged its attention out of `[CLS]` over honeypot and benign contracts separately. Two opcodes show up a lot, but only one of them actually tells the classes apart: `PUSH2` gets attended to in both honeypots and benign contracts (it's just used for jump tables, so it's not informative), while `EXP` gets attended to almost exclusively on honeypots. That's a plausible finding on its face. Arithmetic manipulation is a known trick in honeypot contracts.

<figure class="tc-figure">
  <img src="{{ '/assets/img/honeypot/attention.png' | relative_url }}" alt="Attention by opcode and class">
</figure>

Put the two together and you get a circuit that's almost too clean: `EXP` is read by L0H3, which writes into the residual stream at `[CLS]`, which the classifier reads off to make the call.

<figure class="tc-figure">
  <img src="{{ '/assets/img/honeypot/circuit.png' | relative_url }}" alt="Candidate circuit diagram">
</figure>

If we'd stopped here, this would have been a satisfying little writeup about a one-head, one-feature circuit. We almost did stop here. Two checks talked us out of it.

## The first check: does it survive a different seed?

We retrained the same model five times with different seeds and ran the same ablation each time. The dominant head's drop averaged 0.22, but with a standard deviation of 0.20, and which head was dominant moved around (L0H0, L0H1, or L0H3, depending on the run, though always in the first layer). In two of the five runs, no single head's removal dropped F1 by more than 0.02. There was no one-head circuit to find in those runs.

So the clean picture in the ablation plot above turned out to be a property of one trained model, not something we should expect of the task in general.

## The second check: is the head's read actually doing anything?

Attention tells you what a head looks at, not what's driving the output. To test causation directly, we used activation patching. For a correctly-flagged honeypot, we ran the model once cleanly, then again with every `EXP` token swapped for a neutral opcode, then patched the clean activations back in at exactly those positions and watched what happened to the prediction.

It barely changed anything. Corrupting `EXP` flips only 0.4% of predictions. We tried six different replacement opcodes for the corruption, all in the same range, and we also tried directly zeroing out L0H3's attention onto `EXP`, which changed 0.0% of predictions. So the head that ablation said mattered most, and that we'd shown reads `EXP` almost exclusively on honeypots, turns out not to need `EXP` to make its call. The model has the same information sitting somewhere else too.

This lined up with something we found from the other direction: simple edits that should fool the detector if it really depended on `EXP` (inserting neutral instructions, including right before each `EXP` token) only flip its prediction up to 0.8% of the time.

## What we think this means

We'd put it this way. Single-run attention maps and single-run ablation are useful, but on their own they can hand you a circuit that looks complete and isn't. What held up across seeds and across a causal test wasn't a tidy one-head story. It was redundancy: no single head, and no single feature, turned out to be necessary.

We don't think this means the detector is untrustworthy, or that the interpretability tools failed. If anything, the tools are what caught the overclaim before it became one. We just think a security audit (or a writeup like this one) should hold off on trusting a circuit until it's been checked across a few seeds and tested causally, not just read off one attention map.

<hr class="tc-rule">

<div class="tc-refs" markdown="1">

## Code and data

Model, data pipeline, ablation, attention, activation patching, baselines, and the figures above are all available.

- **Zenodo (code + data):** [10.5281/zenodo.20972391](https://doi.org/10.5281/zenodo.20972391)
- **Paper:** arXiv (forthcoming)

## A few things we drew on

1. Olah et al. *Zoom In: An Introduction to Circuits.* Distill, 2020.
2. Elhage et al. *A Mathematical Framework for Transformer Circuits.* Anthropic, 2021.
3. Wang et al. *Interpretability in the Wild (IOI).* ICLR, 2023.
4. Torres et al. *The Art of The Scam: Demystifying Honeypots in Ethereum.* USENIX Security, 2019.
5. Michel et al. *Are Sixteen Heads Really Better than One?* NeurIPS, 2019.

</div>
