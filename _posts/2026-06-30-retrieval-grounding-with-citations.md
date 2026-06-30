---
layout: article
eyebrow: Retrieval-Augmented Generation
title: "retrieval: an answer is only as trustworthy as its citation"
author: Md Rahinul Islam Bhuiyan
affiliation: University of Malaya
date: 2026-06-30
abstract: "Retrieval-augmented generation reduces hallucination by grounding answers in real documents, but most RAG demos still hand you a paragraph of prose with no way to check it. retrieval forces every claim back to a page number, and runs entirely on a laptop."
---

Ask a plain language model about your company's internal policy or a document it's never seen, and it will often answer anyway, fluently and wrong. This isn't a bug you can prompt your way out of, it's what these models do when they don't know something and aren't given a way to say so.

## Grounding the answer in something checkable

Retrieval-augmented generation, as introduced by Lewis et al.<sup>1</sup>, addresses this by giving the model retrieved passages from a real document store alongside the question, so the model is generating *from* something instead of purely *from memory*. This measurably reduces hallucination compared to a closed-book model, the original paper reports gains on knowledge-intensive tasks specifically because the model has something to point at.

But "something to point at" and "actually pointing at it" aren't the same thing. A lot of RAG systems retrieve the right passage and then still produce an answer with no visible link back to where it came from, which means a user has no way to check the claim without re-doing the search themselves. <mark>Retrieval without a citation back to the source is most of the way to the problem it was supposed to solve</mark>.

## What retrieval does differently

Every answer from `retrieval` includes an inline citation, `[Source: file.pdf, p.3]`, tied to the actual passage that supported the claim. If the documents don't contain an answer, the intent is for the system to say so rather than fill the gap from the model's own knowledge. <mark class="tc-hl-strong">The citation is the actual safety mechanism here</mark>, not the retrieval step alone, because it's what lets a human verify the claim in seconds instead of trusting it.

It runs on Ollama and ChromaDB locally, no API key, no document leaving the machine, which matters more than it sounds for anything involving private documents, and it also means there's no per-query cost to discourage actually checking the source.

<hr class="tc-rule">

<div class="tc-refs" markdown="1">

## Code

- **retrieval:** [github.com/cyberjaya101/retrieval](https://github.com/cyberjaya101/retrieval)

## Notes

1. Lewis et al. *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.* NeurIPS, 2020.

</div>
