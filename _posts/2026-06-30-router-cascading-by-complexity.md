---
layout: article
eyebrow: LLM Infrastructure
title: "router: most queries don't need your biggest model"
author: Md Rahinul Islam Bhuiyan
affiliation: University of Malaya
date: 2026-06-30
abstract: "GPT-4-class models cost roughly sixty times more per token than the cheap tier, and most production traffic doesn't need that much model. router classifies a query's complexity first and only reaches for the expensive model when the question actually calls for it."
---

The default pattern we kept seeing in small LLM apps is: pick one model, send every query to it. That's simple, and it's also wasteful, because most queries in a typical workload are easy. "What is 2+2" and "explain the trade-offs between microservices and a monolith" are not the same query, but a lot of systems pay GPT-4 prices for both.

## The idea isn't new, but it isn't common either

Routing requests to different models by difficulty has a name in the literature, model cascades, and it shows up in a few recent papers. FrugalGPT<sup>1</sup> frames it directly: query a cheap model first, and only escalate to an expensive one when there's a reason to believe the cheap one will fail. RouteLLM<sup>2</sup> trains a router on real human preference data to predict, before generation, which queries actually need the stronger model.

We think the underlying claim is intuitive once you say it out loud: <mark>cost and capability scale together across model tiers, but query difficulty doesn't scale at all uniformly</mark>, most real workloads are heavily skewed toward simple requests. If 70% of your traffic is simple and you route it to a cheap model, you're not trading away much quality. You're just not overpaying for the other 70%.

## What router actually does

`router` classifies an incoming query's complexity (length, structure, the kind of reasoning it seems to need) and routes it to the cheapest model in a pool that can plausibly handle it, falling back to a stronger model when the classifier is uncertain or the cheap model's response looks unreliable. It sits in front of OpenAI, Anthropic, and Gemini behind one FastAPI service, with real-time cost tracking so the savings are something you can actually see, not just claim.

<mark class="tc-hl-strong">On a 70/30 simple-to-complex workload mix, this cuts spend by about 60%</mark>, without changing which model handles the genuinely hard 30%.

## Where this breaks down

We don't think this is free. A bad complexity classifier either sends hard queries to a model that can't handle them (silent quality loss, worse than the cost it saved) or sends easy queries to the expensive tier anyway (no savings). The honest failure mode of this whole approach is miscalibration, not the idea itself, which is why the fallback path matters as much as the router.

<hr class="tc-rule">

<div class="tc-refs" markdown="1">

## Code

- **router:** [github.com/cyberjaya101/router](https://github.com/cyberjaya101/router)

## Notes

1. Chen, Zaharia, Zou. *FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance.* arXiv:2305.05176, 2023.
2. Ong et al. *RouteLLM: Learning to Route LLMs with Preference Data.* arXiv:2406.18665, 2024.

</div>
