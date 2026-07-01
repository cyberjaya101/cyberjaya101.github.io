---
layout: default
title: About
permalink: /about/
---

<div class="ask-hero">
  <div class="ask-name">RAHINUL</div>
  <p class="ask-tag">An AI undergraduate building security and interpretability tooling for AI agents.</p>

  <div class="ask-box">
    <input id="ask-input" class="ask-input" type="text" placeholder="Ask me anything, e.g. &quot;What is your research about?&quot;">
    <div id="ask-answer" class="ask-answer"></div>
    <p class="ask-hint">Hi, I'm a small, static assistant that knows the facts on this page. Ask a full
      question ("What projects have you built?" not "projects") and I'll do my best to answer.</p>
  </div>

  <div class="ask-pills">
    <a href="#about">About</a>
    <a href="{{ '/assets/files/Rahinul_Islam_Bhuiyan_Resume.pdf' | relative_url }}">Resume</a>
    <a href="{{ '/projects/' | relative_url }}">Projects</a>
    <a href="{{ '/blog/' | relative_url }}">Blog</a>
    <a href="mailto:rahin577@gmail.com">Contact</a>
  </div>
</div>

<h1 id="about">About</h1>

I'm **Md Rahinul Islam Bhuiyan** (Rahin), a second-year Artificial Intelligence
undergraduate at the **University of Malaya**.

My work sits at the intersection of **AI security**, **mechanistic interpretability**,
and **LLM infrastructure**. I like building systems that make machine-learning models
safer and easier to understand: red-teaming tools, security scanners, evaluation
dashboards, and circuit-level interpretability of security detectors.

My current research reverse-engineers a smart-contract honeypot detector to ask a
question that matters for any deployed security model: *when it fires, is it reading a
real signal or a quirk of the data?*

## Contact

- Email: [rahin577@gmail.com](mailto:rahin577@gmail.com)
- GitHub: [github.com/cyberjaya101](https://github.com/cyberjaya101)
- Resume: [download PDF]({{ '/assets/files/Rahinul_Islam_Bhuiyan_Resume.pdf' | relative_url }})

<script src="{{ '/assets/js/ask.js' | relative_url }}"></script>
