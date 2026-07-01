/* A small, static "ask about me" search. No backend, no API key: it just
   keyword-matches your question against a curated set of facts and returns
   the best match. Everything here is fixed, truthful content, not a model. */
(function () {
  const KB = [
    { q: "who are you / who is rahinul / introduce yourself",
      a: "I'm Md Rahinul Islam Bhuiyan (Rahin), a second-year Computer Science undergraduate at the University of Malaya, specializing in Artificial Intelligence." },
    { q: "what do you work on / what do you do / focus area / interests",
      a: "I work at the intersection of AI security, mechanistic interpretability, and LLM infrastructure: security tooling for AI agents, evaluation dashboards, and circuit-level interpretability of security detectors." },
    { q: "education / university / school / degree / studying",
      a: "I'm pursuing a Bachelor of Computer Science, specializing in Artificial Intelligence, at the University of Malaya. Expected graduation: March 2028." },
    { q: "research / paper / honeypot / interpretability",
      a: "My current research reverse-engineers a smart-contract honeypot detector, training a small transformer (test F1 = 0.98) and using per-head ablation, attention attribution, and activation patching to test whether its decisions are trustworthy and reproducible, not an artifact of a single training run. Code and data are on Zenodo (DOI: 10.5281/zenodo.20972391)." },
    { q: "warden / ai agent security / provenance firewall",
      a: "warden is a provenance firewall for AI agents: it blocks a tool call when untrusted data, not the user, caused it. It includes a GRC agent, signed audit logs, REST/MCP integrations, and a live dashboard. It's currently a private repository." },
    { q: "guard / security scanner / api keys / prompt injection",
      a: "guard is a pre-commit Python security scanner that catches leaked API keys (via entropy analysis) and prompt-injection risks before they ship, as a zero-config CLI for CI/CD pipelines." },
    { q: "measure / llm evaluation / hallucination",
      a: "measure is an LLM evaluation dashboard that scores faithfulness, relevancy, contextual precision, and hallucination rate, entirely on-device with zero API cost." },
    { q: "router / cost / cheap model / routing",
      a: "router is a FastAPI service that routes queries by complexity across GPT-4, Claude, and Gemini, cutting LLM inference cost by about 60% while keeping quality." },
    { q: "retrieval / rag / citations / documents",
      a: "retrieval is a local-first RAG pipeline (Ollama + ChromaDB) where every answer cites its source page, so claims can actually be checked instead of trusted blindly." },
    { q: "projects / what have you built / portfolio",
      a: "My main projects are warden (AI agent security), guard (secret/prompt-injection scanner), measure (LLM evaluation), router (cost-optimized LLM routing), and retrieval (cited RAG). See the Projects page for the full list." },
    { q: "blog / posts / writing / articles",
      a: "I write short technical posts on the Blog page about each project, in the style of Anthropic's Transformer Circuits Thread, each grounded in a real paper (RAGAS, FrugalGPT, indirect prompt injection, the original RAG paper, and so on)." },
    { q: "skills / tech stack / tools / programming languages",
      a: "Python, SQL, PyTorch, LangChain, FastAPI, and Streamlit/Plotly for dashboards. I write tested code (pytest, CI) and I'm comfortable across model training, evaluation, APIs, and deployment." },
    { q: "experience / freelance / work history / job",
      a: "I work independently as an AI developer (since Jan 2024), building an autonomous AI assistant (LLMs + n8n automation) and prototyping an AI-powered wellness conversational agent." },
    { q: "leadership / umisa / activities / extracurricular",
      a: "I'm Event Vice Director at the UM International Students Association (UMISA), where I built a task-management dashboard for 15+ cross-functional members and led events for 300+ attendees." },
    { q: "contact / email / reach / hire / get in touch",
      a: "Email: rahin577@gmail.com. GitHub: github.com/cyberjaya101. My resume is downloadable from this page." },
    { q: "resume / cv / download",
      a: "You can download my resume as a PDF from the link at the bottom of this page." },
    { q: "location / based / where do you live / country",
      a: "I'm based in Kuala Lumpur, Malaysia." },
  ];

  function score(question, entry) {
    const qWords = question.toLowerCase().match(/[a-z0-9]+/g) || [];
    const kWords = entry.q.toLowerCase().match(/[a-z0-9]+/g) || [];
    let s = 0;
    for (const w of qWords) if (kWords.includes(w)) s++;
    return s;
  }

  function answer(question) {
    if (!question.trim()) return null;
    let best = null, bestScore = 0;
    for (const entry of KB) {
      const s = score(question, entry);
      if (s > bestScore) { bestScore = s; best = entry; }
    }
    if (!best || bestScore === 0) {
      return "I don't have an answer for that yet. Try asking about my research, projects (warden, guard, measure, router, retrieval), education, or how to get in touch.";
    }
    return best.a;
  }

  window.RahinAsk = { answer };

  // Self-wiring: attach to #ask-input / #ask-answer if present on the page.
  // Kept in this external file (not inline) so the site's script-src 'self'
  // CSP doesn't need an 'unsafe-inline' exception.
  document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("ask-input");
    const out = document.getElementById("ask-answer");
    if (!input || !out) return;
    function run() {
      const q = input.value;
      if (!q.trim()) { out.classList.remove("show"); return; }
      out.textContent = answer(q);
      out.classList.add("show");
    }
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
    input.addEventListener("input", function () { if (!input.value.trim()) out.classList.remove("show"); });
  });
})();
