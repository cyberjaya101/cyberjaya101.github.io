---
layout: article
eyebrow: AI Security
title: "guard: catching secrets and prompt injection before they ship"
author: Md Rahinul Islam Bhuiyan
affiliation: University of Malaya
date: 2026-05-15
abstract: "Two small, unrelated-looking problems (a leaked API key and a hijacked agent) turn out to share a detection strategy: look at the statistics of the string, not just its content. We built a scanner around that idea and it's mostly worked."
---

We built `guard` after noticing how often the same two mistakes show up in AI codebases: someone commits a real API key by accident, and someone wires up an agent that will follow instructions found in the data it reads, not just from the user. Different failure modes, but we ended up using a similar trick for both.

## Secrets aren't grep-able, but they are unusual

The naive way to catch a leaked key is a regex for known prefixes (`sk-`, `AKIA`, and so on). That catches a lot, but it misses anything generated after your regex was written, and it's noisy on anything that merely looks like a prefix.

What actually distinguishes a real secret from ordinary code is <mark>that it looks random</mark>. A variable name, a URL, a comment, these all have the low entropy of natural language or structured syntax. A generated API key doesn't. This isn't a new idea, entropy-based secret scanning is roughly how tools like `gitleaks` and TruffleHog work, and it traces back to a basic fact about information theory: <mark class="tc-hl-strong">high Shannon entropy is a property random-looking strings have and human-written code mostly doesn't</mark>.

So `guard` doesn't just pattern-match known prefixes. It computes entropy over candidate substrings and flags anything that's both prefix-plausible and statistically unlikely to be hand-typed. In practice this is what catches secrets from providers we never explicitly coded for.

## Prompt injection is a different problem with a similar shape

The other half of `guard` looks for prompt injection, things like "ignore previous instructions" hiding in a document an agent is about to read. This is a newer and messier problem. Greshake et al.<sup>1</sup> were among the first to lay out *indirect* prompt injection clearly: the attack doesn't come from the user's prompt at all, it comes from content the model retrieves, a webpage, a PDF, a tool's output, and the model can't always tell the difference between an instruction and a piece of data it's summarizing.

We don't think pattern-matching phrases like "ignore previous instructions" is a complete defense, attackers can paraphrase past almost any fixed list. (Our other project, `warden`, takes a more structural approach to this same problem, tracking where data came from rather than what it says.) But as a pre-commit and CI check, a signature-based scan still catches the obvious cases cheaply, which is most of what shows up by accident in early-stage codebases.

## What this looks like in practice

`guard scan .` runs both checks over a repo: entropy-based secret detection across 10+ provider patterns, and signature matching against 20+ known injection and SAST patterns (command injection, SQL injection in source). Zero config, meant to run in a pre-commit hook or CI step where a human won't be watching closely.

<hr class="tc-rule">

<div class="tc-refs" markdown="1">

## Code

- **guard:** [github.com/cyberjaya101/guard](https://github.com/cyberjaya101/guard)

## Notes

1. Greshake, Abdelnabi, Mishra, Endres, Holz, Fritz. *Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection.* AISec, 2023.

</div>
