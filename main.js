(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = $("[data-header]");
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealElements = $$(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -7% 0px" }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const terminalData = {
    fanout: {
      lines: [
        ["comment", "# Four focused tasks. Four resumable MicroVMs."],
        ["command", '<span class="prompt">❯</span> sanbox batch <span class="flag">--tasks</span> <span class="string">.sanbox/tasks.json</span> \\'],
        ["command", '    <span class="flag">--include</span> <span class="string">"app/**"</span> <span class="flag">--max-parallel</span> 4 <span class="flag">--wait</span>'],
        ["result", ""],
        ["result", '<span class="info">batch</span>  bch_01JZ8P  ·  4 runs created'],
        ["result", '<span class="success">●</span>  8fc2  auth audit         running  01:42'],
        ["result", '<span class="success">●</span>  4ad1  docs pass          running  00:39'],
        ["result", '<span class="success">●</span>  c9b7  test matrix        running  02:08'],
        ["result", '<span class="success">✓</span>  d20e  dependency review  done     01:17'],
        ["result", ""],
        ["result", '<span class="info">input</span>  148 files · secret patterns excluded'],
      ],
      stack: [
        ["8fc2", "running", "Run authentication tests", "82%", false],
        ["4ad1", "running", "Update API docs", "54%", false],
        ["c9b7", "running", "Exercise test matrix", "68%", false],
        ["d20e", "done", "Review dependencies", "100%", true],
      ],
    },
    watch: {
      lines: [
        ["comment", "# A normalized stream of agent activity."],
        ["command", '<span class="prompt">❯</span> sanbox runs watch 8fc2 <span class="flag">--view</span> compact'],
        ["result", ""],
        ["result", '<span class="info">00:00</span>  queued       Run queued'],
        ["result", '<span class="info">00:02</span>  staging      Workspace prepared'],
        ["result", '<span class="info">00:04</span>  agent        OpenCode session started'],
        ["result", '<span class="info">00:13</span>  tool         rg "refreshToken" app/src'],
        ["result", '<span class="info">00:21</span>  file         modified app/src/auth/session.ts'],
        ["result", '<span class="info">00:34</span>  test         pnpm test auth/session.test.ts'],
        ["result", '<span class="info">00:48</span>  test         <span class="warn">1 failed</span> · 18 passed'],
        ["result", '<span class="info">01:21</span>  test         <span class="success">19 passed</span>'],
        ["result", '<span class="info">01:39</span>  artifact     output/summary.md'],
        ["result", '<span class="info">01:40</span>  snapshot     filesystem + agent state saved'],
      ],
      stack: [
        ["intent", "observed", "Inspect authentication flow", "100%", true],
        ["tool", "complete", "Run targeted tests", "100%", true],
        ["file", "changed", "src/auth/session.ts", "100%", true],
        ["agent", "working", "Preparing summary", "76%", false],
      ],
    },
    collect: {
      lines: [
        ["comment", "# Inspect the portable input contract before dispatch."],
        ["command", '<span class="prompt">❯</span> sanbox bundle inspect <span class="string">./run.zip</span>'],
        ["result", ""],
        ["result", '<span class="success">✓</span> manifest.json        2.1 KB'],
        ["result", '<span class="success">✓</span> RUNBOOK.md          0.8 KB'],
        ["result", '<span class="success">✓</span> input/app/src      148 files'],
        ["result", ""],
        ["result", '<span class="info">sha256</span>  78f1…d49a'],
        ["result", '<span class="info">policy</span>  secret-like files excluded'],
        ["result", ""],
        ["comment", "# Outputs and run state remain in the filesystem snapshot."],
        ["result", '<span class="success">artifact</span>  output/summary.md     14.3 KB'],
        ["result", '<span class="success">artifact</span>  output/test-report.xml  8.7 KB'],
      ],
      stack: [
        ["input", "verified", "148 source files", "100%", true],
        ["output", "retained", "summary.md", "100%", true],
        ["output", "retained", "test-report.xml", "100%", true],
        ["snapshot", "saved", "Filesystem + agent state", "100%", true],
      ],
    },
  };

  const terminal = $("[data-terminal]");
  const terminalCode = $("[data-terminal-code]");
  const runStack = $("[data-run-stack]");
  const terminalTabs = $$("[data-terminal-tab]");

  const renderTerminal = (key) => {
    const view = terminalData[key];
    if (!view || !terminalCode || !runStack) return;
    terminalTabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.terminalTab === key)));
    terminalCode.innerHTML = view.lines
      .map(([type, content], index) => `<span class="code-line ${type}" style="--line:${index}">${content || "&nbsp;"}</span>`)
      .join("");
    runStack.innerHTML = `
      <div class="stack-label"><span>run projection</span><span>live</span></div>
      ${view.stack
        .map(
          ([id, state, task, progress, done]) => `
            <article class="run-card${done ? " is-done" : ""}">
              <div class="run-card-head"><b>${id}</b><span>${state}</span></div>
              <p>${task}</p>
              <div class="mini-progress"><i style="--p:${progress}"></i></div>
            </article>`
        )
        .join("")}`;
  };

  terminalTabs.forEach((tab) => tab.addEventListener("click", () => renderTerminal(tab.dataset.terminalTab)));
  renderTerminal("fanout");

  const deploymentData = {
    eu: {
      note: "Dedicated deployment on EU infrastructure, operated with you.",
      label: "EU MANAGED",
      title: "Dedicated Sanbox deployment in the EU.",
      summary: "The control plane, MicroVM runners, and persistent filesystem snapshots run on dedicated infrastructure in Germany.",
      control: "Dedicated instance operated with your team",
      runners: "Dedicated hosts running isolated MicroVMs",
      data: "Filesystem snapshots, artifacts, agent state, and conversation history remain in Germany",
      network: "Default-deny egress with explicit destination grants",
      aria: "EU managed deployment profile",
    },
    vpc: {
      note: "Deploy the control plane and runners inside your AWS, Azure, or GCP account.",
      label: "YOUR VPC",
      title: "Sanbox runs inside your cloud account.",
      summary: "The control plane, MicroVM runners, filesystem snapshots, and run state stay inside a VPC owned by your team.",
      control: "Private deployment in your AWS, Azure, or GCP account",
      runners: "MicroVMs run inside your subnets on infrastructure you provision",
      data: "Filesystem snapshots and run records use storage inside your account",
      network: "Your security controls plus per-run egress policies",
      aria: "Customer VPC deployment profile",
    },
    metal: {
      note: "Keep MicroVM execution and persistent filesystem snapshots on private infrastructure you operate.",
      label: "ON-PREM",
      title: "Sanbox runs on infrastructure in your datacenter.",
      summary: "The control plane, MicroVM hosts, and filesystem snapshots remain on private systems operated by your team.",
      control: "Installed on your servers or private cluster",
      runners: "Local hosts run isolated MicroVMs",
      data: "Filesystem snapshots and run records remain on storage you operate",
      network: "Private routing and local egress enforcement",
      aria: "On-premise deployment profile",
    },
  };
  const deployTabs = $$("[data-deploy]");
  const deployMap = $("[data-deploy-map]");
  const deployNote = $("[data-deploy-note]");
  const deployProfileLabel = $("[data-deploy-profile-label]");
  const deployProfileTitle = $("[data-deploy-profile-title]");
  const deployProfileSummary = $("[data-deploy-profile-summary]");
  const deployControl = $("[data-deploy-control]");
  const deployRunners = $("[data-deploy-runners]");
  const deployData = $("[data-deploy-data]");
  const deployNetwork = $("[data-deploy-network]");
  const renderDeployment = (key) => {
    const view = deploymentData[key];
    if (!view) return;
    deployTabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.deploy === key)));
    deployNote.textContent = view.note;
    deployProfileLabel.textContent = view.label;
    deployProfileTitle.textContent = view.title;
    deployProfileSummary.textContent = view.summary;
    deployControl.textContent = view.control;
    deployRunners.textContent = view.runners;
    deployData.textContent = view.data;
    deployNetwork.textContent = view.network;
    deployMap.setAttribute("aria-label", view.aria);
  };
  deployTabs.forEach((tab) => tab.addEventListener("click", () => renderDeployment(tab.dataset.deploy)));

  if (!prefersReducedMotion && terminal) {
    const cards = $$(".agent-card", terminal.closest("body"));
    let activeCard = 0;
    window.setInterval(() => {
      cards.forEach((card, index) => card.toggleAttribute("data-active", index === activeCard));
      activeCard = (activeCard + 1) % Math.max(cards.length, 1);
    }, 1800);
  }
})();
