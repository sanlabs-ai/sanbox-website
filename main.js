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
        ["result", '<span class="success">✓</span>  d20e  dependency review  completed 01:17'],
        ["result", ""],
        ["result", '<span class="info">input</span>  148 files · secret patterns excluded'],
      ],
      panel: {
        label: "runs",
        meta: "3 running · 1 completed",
        kind: "runs",
        items: [
          ["8fc2", "running", "Run authentication tests", "82%"],
          ["4ad1", "running", "Update API docs", "54%"],
          ["c9b7", "running", "Exercise test matrix", "68%"],
          ["d20e", "completed", "Review dependencies", "100%"],
        ],
      },
    },
    watch: {
      lines: [
        ["comment", "# A normalized stream of agent activity."],
        ["command", '<span class="prompt">❯</span> sanbox runs watch 8fc2 <span class="flag">--view</span> compact'],
        ["result", ""],
        ["result", '<span class="info">00:00</span>  run          Run started'],
        ["result", '<span class="info">00:02</span>  workspace    Workspace ready'],
        ["result", '<span class="info">00:04</span>  agent        OpenCode session started'],
        ["result", '<span class="info">00:13</span>  tool         rg "refreshToken" app/src'],
        ["result", '<span class="info">00:21</span>  file         modified app/src/auth/session.ts'],
        ["result", '<span class="info">00:34</span>  test         pnpm test auth/session.test.ts'],
        ["result", '<span class="info">00:48</span>  test         <span class="warn">1 failed</span> · 18 passed'],
        ["result", '<span class="info">01:21</span>  test         <span class="success">19 passed</span>'],
        ["result", '<span class="info">01:39</span>  artifact     output/summary.md'],
        ["result", '<span class="info">01:40</span>  snapshot     filesystem + agent state saved'],
      ],
      panel: {
        label: "activity",
        meta: "run 8fc2 · running",
        kind: "records",
        items: [
          ["tool call", "00:13", 'rg "refreshToken" app/src'],
          ["file changed", "00:21", "app/src/auth/session.ts"],
          ["tests", "01:21", "19 passed"],
          ["snapshot", "01:40", "Filesystem + agent state saved"],
        ],
      },
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
      panel: {
        label: "run contents",
        meta: "run 8fc2 · completed",
        kind: "records",
        items: [
          ["input bundle", "148 files", "Source files + run instructions"],
          ["artifact", "14.3 KB", "output/summary.md"],
          ["artifact", "8.7 KB", "output/test-report.xml"],
          ["snapshot", "01:40", "Filesystem + agent state"],
        ],
      },
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
    const panelCards = view.panel.items
      .map(([label, meta, detail, progress]) => {
        if (view.panel.kind === "runs") {
          return `
            <article class="run-card${meta === "completed" ? " is-done" : ""}">
              <div class="run-card-head"><b>${label}</b><span>${meta}</span></div>
              <p>${detail}</p>
              <div class="mini-progress"><i style="--p:${progress}"></i></div>
            </article>`;
        }

        return `
          <article class="run-card record-card">
            <div class="run-card-head"><b>${label}</b><time>${meta}</time></div>
            <p>${detail}</p>
          </article>`;
      })
      .join("");

    runStack.innerHTML = `
      <div class="stack-label"><span>${view.panel.label}</span><span>${view.panel.meta}</span></div>
      ${panelCards}`;
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

  const signupForm = $("[data-signup-form]");
  const signupSubmit = $("[data-signup-submit]");
  const signupSubmitLabel = $("[data-signup-submit-label]");
  const signupStatus = $("[data-signup-status]");
  const signupSuccess = $("[data-signup-success]");
  const signupEmail = $("[data-signup-email]");

  const validSignupEndpoint = (value) => {
    try {
      const url = new URL(value);
      const formspree = url.protocol === "https:" && url.hostname === "formspree.io" && /^\/f\/[A-Za-z0-9]+$/.test(url.pathname);
      const localPreview = ["localhost", "127.0.0.1"].includes(url.hostname);
      return formspree || localPreview;
    } catch {
      return false;
    }
  };

  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!signupForm.reportValidity()) return;

    const endpoint = signupForm.dataset.endpoint?.trim() || "";
    if (!validSignupEndpoint(endpoint)) {
      signupStatus.textContent = "Sign-up is not available yet. Please email sales@sanlabs.ai.";
      signupStatus.dataset.state = "error";
      return;
    }

    const formData = new FormData(signupForm);
    formData.set("submitted_at", new Date().toISOString());
    signupForm.setAttribute("aria-busy", "true");
    signupSubmit.disabled = true;
    signupSubmitLabel.textContent = "Signing up…";
    signupStatus.textContent = "";
    delete signupStatus.dataset.state;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      if (!response.ok) throw new Error(`Sign-up provider returned ${response.status}`);

      signupEmail.textContent = String(formData.get("email") || "");
      signupForm.hidden = true;
      signupSuccess.hidden = false;
      $("h3", signupSuccess)?.focus();
    } catch {
      signupStatus.textContent = "We couldn’t complete your sign-up. Please try again or email sales@sanlabs.ai.";
      signupStatus.dataset.state = "error";
      signupSubmit.disabled = false;
      signupSubmitLabel.textContent = "Sign up";
    } finally {
      signupForm.removeAttribute("aria-busy");
    }
  });

  if (!prefersReducedMotion && terminal) {
    const cards = $$(".agent-card", terminal.closest("body"));
    let activeCard = 0;
    window.setInterval(() => {
      cards.forEach((card, index) => card.toggleAttribute("data-active", index === activeCard));
      activeCard = (activeCard + 1) % Math.max(cards.length, 1);
    }, 1800);
  }
})();
