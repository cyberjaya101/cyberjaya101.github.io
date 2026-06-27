---
layout: post
title: "Reverse-engineering a smart-contract honeypot detector"
date: 2026-06-28
description: What mechanistic interpretability says about whether a security detector can be trusted.
---

Machine-learning detectors for malicious smart contracts are usually black boxes. When one
flags a contract, you cannot tell whether it found a real signal or a quirk of the data. For a
security tool, that gap matters: a model that scores well by leaning on a dataset artifact will
fail quietly against an adaptive attacker.

So I took one apart.

## The setup

I trained a small two-layer transformer to label Ethereum contracts as **honeypot** or
**benign** from their EVM opcode sequences. On real on-chain data (243 confirmed honeypots from
the HoneyBadger dataset, 300 freshly-deployed benign contracts) it reaches **test F1 = 0.98**.
A plain bag-of-opcodes logistic-regression baseline reaches 1.00, so the task is nearly linearly
separable. That is the point, not a weakness: an easy, separable task is a clean testbed for
studying *how* a model decides.

## The tidy story that fell apart

A single training run told a clean story. Per-head ablation pointed to **one critical head**,
and that head attended almost entirely to the `EXP` opcode on honeypots. One head, one opcode —
a textbook sparse circuit.

Two checks broke it:

1. **Seed instability.** Re-training across five seeds, the "critical" head moves around and in
   some seeds *no* head matters on its own. The clean circuit was a property of one model, not
   of the task.
2. **Causal testing.** Using activation patching to actually remove `EXP` changes only **0.4%**
   of predictions. The head *reads* `EXP`, but `EXP` is not necessary — the model spreads its
   evidence across many features.

## The lesson

What survives every check is **redundancy**: no single head and no single feature is essential.
The methodological takeaway is the part I care about most — single-run attention and ablation
can manufacture neat but non-reproducible "circuits." A security audit should trust only what
survives seed variation and causal tests.

Code and data: [Zenodo DOI 10.5281/zenodo.20972390](https://doi.org/10.5281/zenodo.20972390).
The full paper is on its way to arXiv.
