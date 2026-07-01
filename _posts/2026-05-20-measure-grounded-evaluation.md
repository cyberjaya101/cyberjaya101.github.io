---
layout: article
eyebrow: LLM Evaluation
title: "measure: turning \"the LLM seems fine\" into a number"
author: Md Rahinul Islam Bhuiyan
affiliation: University of Malaya
date: 2026-05-20
abstract: "Most teams evaluate an LLM app by reading a few outputs and deciding they look okay. I built measure because that doesn't scale and doesn't catch the failures that matter, and it's mostly an implementation of an evaluation framework that already exists in the literature, run entirely on-device."
---

A surprising number of LLM applications ship without any quantitative evaluation at all. Someone tries a handful of prompts, the answers look reasonable, and that's the bar. The problem is that the failures that actually hurt in production (a confidently wrong fact, an answer that ignores the retrieved context, a response that's technically on-topic but useless) don't show up reliably in a quick manual check. You need something closer to a test suite.

## Four numbers instead of a vibe

I built `measure` around four metrics, and I didn't invent these from scratch. The framing follows RAGAS<sup>1</sup>, a reference-free evaluation framework for retrieval-augmented generation that breaks "is this answer good" into separable, checkable pieces:

- **Faithfulness**, whether the claims in the answer are actually supported by the retrieved context, rather than added by the model.
- **Relevancy**, whether the answer addresses the question that was asked.
- **Precision**, whether the answer is appropriately focused, not padded with hedging or irrelevant detail.
- **Hallucination rate**, the fraction of stated facts that don't trace back to anything in the context.

The thing I think is worth saying out loud: <mark>these four numbers are mostly orthogonal</mark>. An answer can be fully faithful to its context and still useless, because it didn't answer the question. It can be relevant and confident and still hallucinate a date or a number that isn't in the source. Treating "quality" as one scalar hides exactly the failure modes you'd want a dashboard to surface.

## Why I ran it on-device

A lot of evaluation tooling calls out to a larger model to judge the smaller model's outputs (LLM-as-judge). That works, but it adds an API bill and a dependency to something whose whole job is catching reliability problems, which felt backwards for a tool meant to run on every commit.

`measure` instead computes these metrics with local techniques: semantic similarity between claims and source context, entailment-style checks, and lightweight extraction, all running without an external API call. <mark class="tc-hl-strong">Zero marginal cost per evaluation</mark> is what makes it realistic to run this on every change to a prompt or a retrieval pipeline, not just once before a demo.

## A worked example

On a small test suite, a hallucinated-facts response scores 0.396 overall (faithfulness 0.125), while a clean, grounded response on the same question scores 0.825. An off-topic answer scores 0.018, mostly on relevancy. None of this is visible if you're just eyeballing the text, the off-topic answer reads as fluent, confident English. The numbers are what catch it.

<hr class="tc-rule">

<div class="tc-refs" markdown="1">

## Code

- **measure:** [github.com/cyberjaya101/measure](https://github.com/cyberjaya101/measure)

## Notes

1. Es, James, Espinosa-Anke, Schockaert. *RAGAS: Automated Evaluation of Retrieval Augmented Generation.* EACL, 2024.

</div>
