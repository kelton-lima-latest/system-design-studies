import { CLOUDFRONT_USE_CASES, initialReleases, type Release, type StorageMode } from "./data";

const TEMPLATE = `
  <div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
    <div class="flex flex-col gap-6">
      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <span class="text-teal-500 font-mono text-xs">01</span> Domínio &amp; DNS
        </h2>
        <p class="text-xs text-ink_text-500 mb-3">
          Domínio registrado no <strong class="text-ink_text-300">registro.br</strong>, com o DNS delegado
          para uma Hosted Zone no <strong class="text-ink_text-300">Route 53</strong>.
        </p>
        <div class="text-xs font-mono text-ink_text-300 bg-ink-900 border border-ink-600 rounded-lg p-3 flex flex-col gap-1.5 mb-3">
          <div>meusite.com.br</div>
          <div class="text-ink_text-700">NS → ns-xxxx.awsdns-xx.com</div>
          <div class="text-ink_text-700">NS → ns-xxxx.awsdns-xx.org</div>
        </div>
        <button id="simulate-dns-btn" type="button" class="w-full bg-ink-600 hover:bg-ink-500 disabled:opacity-50 text-white font-semibold text-sm rounded-lg py-2 transition-colors">
          Simular resolução da requisição
        </button>
      </section>

      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <span class="text-teal-500 font-mono text-xs">02</span> Estratégia de armazenamento
        </h2>
        <p class="text-xs text-ink_text-500 mb-4">Onde os arquivos de cada deploy ficam no bucket S3.</p>
        <div class="flex bg-ink-900 border border-ink-500 rounded-lg p-1 text-xs font-medium">
          <button type="button" data-mode="root" class="mode-btn flex-1 rounded-md py-1.5 transition-colors">Raiz do bucket</button>
          <button type="button" data-mode="releases" class="mode-btn flex-1 rounded-md py-1.5 transition-colors">Pastas de release</button>
        </div>
        <p id="mode-explainer" class="text-xs text-ink_text-500 mt-3 leading-relaxed"></p>
      </section>

      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <span class="text-teal-500 font-mono text-xs">03</span> Publicar deploy
        </h2>
        <p class="text-xs text-ink_text-500 mb-4">Sobe uma nova versão do site para o bucket.</p>
        <form id="deploy-form" class="flex flex-col gap-3">
          <div>
            <label for="version-input" class="block text-xs font-medium text-ink_text-300 mb-1">Versão</label>
            <input id="version-input" type="text" value="v1.4.3" class="w-full bg-ink-900 border border-ink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 rounded-lg px-3 py-2 font-mono text-sm text-white" />
          </div>
          <button type="submit" id="deploy-btn" class="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-ink-600 disabled:text-ink_text-700 text-ink-950 font-semibold text-sm rounded-lg py-2 transition-colors">
            Publicar nova versão
          </button>
        </form>
      </section>
    </div>

    <div class="flex flex-col gap-6 min-w-0">
      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1">Caminho da requisição</h2>
        <p class="text-xs text-ink_text-500 mb-5">Do domínio até o arquivo servido pela origem ativa.</p>
        <div id="pipeline-stages" class="flex flex-wrap items-center gap-2 justify-center"></div>
      </section>

      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <div class="flex items-center justify-between mb-1">
          <h2 class="font-display text-sm font-semibold text-white">Estrutura do bucket S3</h2>
        </div>
        <p class="text-xs text-ink_text-500 mb-4">Reflete a estratégia escolhida acima em tempo real.</p>
        <div id="bucket-tree" class="flex flex-col gap-2 text-xs font-mono"></div>
      </section>

      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1">Log de deploys</h2>
        <p class="text-xs text-ink_text-500 mb-4">Mais recente no topo, com os passos executados pelo CI.</p>
        <div id="deploy-log-empty" class="text-sm text-ink_text-700 text-center py-10 border border-dashed border-ink-600 rounded-lg">
          Nenhum deploy realizado ainda.
        </div>
        <div id="deploy-log" class="hidden flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1"></div>
      </section>

      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1">Outros usos reais do CloudFront</h2>
        <p class="text-xs text-ink_text-500 mb-4">Além de hospedar site estático — casos comuns em produção.</p>
        <div id="use-cases-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
      </section>
    </div>
  </div>
`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MODE_EXPLAINERS: Record<StorageMode, string> = {
  root: "Cada deploy sobrescreve os arquivos na raiz do bucket. Simples, mas sem rollback instantâneo: reverter exige refazer o deploy da versão anterior.",
  releases: "Cada deploy sobe para uma pasta nova (releases/&lt;versão&gt;/). O CloudFront aponta para a versão ativa via origin path — rollback é só trocar o ponteiro.",
};

export function mountCloudfrontS3(container: HTMLElement): void {
  container.innerHTML = TEMPLATE;

  const el = {
    simulateDnsBtn: container.querySelector<HTMLButtonElement>("#simulate-dns-btn")!,
    modeBtns: Array.from(container.querySelectorAll<HTMLButtonElement>(".mode-btn")),
    modeExplainer: container.querySelector<HTMLParagraphElement>("#mode-explainer")!,
    deployForm: container.querySelector<HTMLFormElement>("#deploy-form")!,
    versionInput: container.querySelector<HTMLInputElement>("#version-input")!,
    deployBtn: container.querySelector<HTMLButtonElement>("#deploy-btn")!,
    pipelineStages: container.querySelector<HTMLDivElement>("#pipeline-stages")!,
    bucketTree: container.querySelector<HTMLDivElement>("#bucket-tree")!,
    deployLog: container.querySelector<HTMLDivElement>("#deploy-log")!,
    deployLogEmpty: container.querySelector<HTMLDivElement>("#deploy-log-empty")!,
    useCasesGrid: container.querySelector<HTMLDivElement>("#use-cases-grid")!,
  };

  let mode: StorageMode = "releases";
  let releases: Release[] = initialReleases();
  let deployCounter = 0;
  let busy = false;

  el.useCasesGrid.innerHTML = CLOUDFRONT_USE_CASES.map(
    (u) => `
      <div class="bg-ink-900 border border-ink-600 rounded-lg p-3.5">
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <div class="text-sm font-semibold text-white">${u.title}</div>
          <span class="text-[10px] font-mono uppercase tracking-wide text-teal-400 bg-teal-500/10 border border-teal-500/30 rounded px-1.5 py-0.5 whitespace-nowrap">${u.tag}</span>
        </div>
        <p class="text-xs text-ink_text-500 leading-relaxed">${u.description}</p>
      </div>
    `,
  ).join("");

  function activeVersion(): string {
    const active = releases.find((r) => r.active);
    return active ? active.version : releases[releases.length - 1]?.version ?? "v1.0.0";
  }

  function renderModeButtons(): void {
    el.modeBtns.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.mode === mode));
    el.modeExplainer.innerHTML = MODE_EXPLAINERS[mode];
  }

  function renderBucketTree(): void {
    if (mode === "root") {
      el.bucketTree.innerHTML = `
        <div class="bg-ink-900 border border-ink-600 rounded-md px-2.5 py-1.5 flex items-center justify-between">
          <span class="text-ink_text-300">/index.html</span>
          <span class="text-ink_text-700">versão atual: ${activeVersion()}</span>
        </div>
        <div class="bg-ink-900 border border-ink-600 rounded-md px-2.5 py-1.5 text-ink_text-300">/assets/app.[hash].js</div>
        <div class="bg-ink-900 border border-ink-600 rounded-md px-2.5 py-1.5 text-ink_text-300">/assets/app.[hash].css</div>
      `;
      return;
    }

    el.bucketTree.innerHTML = releases
      .slice()
      .reverse()
      .map(
        (r) => `
        <div class="bucket-release bg-ink-900 border ${r.active ? "border-teal-500" : "border-ink-600"} rounded-md px-2.5 py-1.5 flex items-center justify-between" data-version="${r.version}">
          <span class="${r.active ? "text-teal-400" : "text-ink_text-300"}">/releases/${r.version}/</span>
          ${
            r.active
              ? '<span class="text-[10px] font-mono uppercase text-teal-400 bg-teal-500/10 border border-teal-500/30 rounded px-1.5 py-0.5">origin path ativo</span>'
              : `<button type="button" class="rollback-btn text-[10px] font-mono uppercase text-ink_text-500 hover:text-teal-400 border border-ink-600 rounded px-1.5 py-0.5" data-version="${r.version}">tornar ativa (rollback)</button>`
          }
        </div>
      `,
      )
      .join("");

    el.bucketTree.querySelectorAll<HTMLButtonElement>(".rollback-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        void withBusyLock(() => activateRelease(btn.dataset.version!, true));
      });
    });
  }

  function renderPipeline(originLabel: string): void {
    el.pipelineStages.innerHTML = `
      <div class="stage-box" data-stage="user"><div class="text-xs font-semibold text-white">Usuário</div><div class="text-[10px] text-ink_text-500 font-mono mt-0.5">HTTPS</div></div>
      <span class="stage-arrow">&rarr;</span>
      <div class="stage-box" data-stage="dns"><div class="text-xs font-semibold text-white">Route 53</div><div class="text-[10px] text-ink_text-500 font-mono mt-0.5">Hosted Zone</div></div>
      <span class="stage-arrow">&rarr;</span>
      <div class="stage-box" data-stage="cf"><div class="text-xs font-semibold text-white">CloudFront</div><div class="text-[10px] text-ink_text-500 font-mono mt-0.5">edge cache</div></div>
      <span class="stage-arrow">&rarr;</span>
      <div class="stage-box" data-stage="s3"><div class="text-xs font-semibold text-white">S3</div><div class="text-[10px] text-ink_text-500 font-mono mt-0.5">${originLabel}</div></div>
    `;
  }

  async function animatePipeline(): Promise<void> {
    const stageEls = Array.from(el.pipelineStages.querySelectorAll<HTMLDivElement>(".stage-box"));
    for (const stageEl of stageEls) {
      stageEl.classList.add("is-active");
      await sleep(220);
      stageEl.classList.remove("is-active");
    }
  }

  function appendLog(lines: string[]): void {
    deployCounter += 1;
    el.deployLogEmpty.classList.add("hidden");
    el.deployLog.classList.remove("hidden");

    const entry = document.createElement("div");
    entry.className = "event-entry bg-ink-900 border border-ink-600 rounded-lg p-3";
    entry.innerHTML = `
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs font-mono text-teal-400 font-semibold">Deploy #${deployCounter}</span>
      </div>
      <ul class="text-xs text-ink_text-500 leading-relaxed list-disc pl-4">
        ${lines.map((l) => `<li>${l}</li>`).join("")}
      </ul>
    `;
    el.deployLog.prepend(entry);
  }

  async function activateRelease(version: string, isRollback: boolean): Promise<void> {
    releases = releases.map((r) => ({ ...r, active: r.version === version }));
    renderPipeline(`releases/${version}/`);
    await animatePipeline();
    renderBucketTree();
    appendLog(
      isRollback
        ? [
            `Origin path da distribuição CloudFront alterado para <code>/releases/${version}</code>.`,
            "Invalidação de <code>/index.html</code> disparada.",
            "Nenhum novo arquivo foi enviado ao S3 — a versão já estava publicada.",
          ]
        : [
            `Arquivos enviados para <code>s3://bucket/releases/${version}/</code>.`,
            `Origin path da distribuição CloudFront alterado para <code>/releases/${version}</code>.`,
            "Invalidação de <code>/index.html</code> disparada no CloudFront.",
          ],
    );
  }

  async function deployToRoot(version: string): Promise<void> {
    renderPipeline("/ (raiz)");
    await animatePipeline();
    const treeEls = Array.from(el.bucketTree.querySelectorAll<HTMLDivElement>("div"));
    treeEls.forEach((t) => t.classList.add("is-active"));
    await sleep(300);
    treeEls.forEach((t) => t.classList.remove("is-active"));
    releases = [{ version, active: true }];
    renderBucketTree();
    appendLog([
      `<code>aws s3 sync dist/ s3://bucket/</code> sobrescreveu os arquivos anteriores na raiz.`,
      "Invalidação de <code>/*</code> disparada no CloudFront (não há hash isolando o que mudou).",
      "Sem versão anterior retida: um rollback exigiria reenviar o build anterior.",
    ]);
  }

  async function withBusyLock(fn: () => Promise<void>): Promise<void> {
    if (busy) return;
    busy = true;
    el.deployBtn.disabled = true;
    el.simulateDnsBtn.disabled = true;
    try {
      await fn();
    } finally {
      busy = false;
      el.deployBtn.disabled = false;
      el.simulateDnsBtn.disabled = false;
    }
  }

  el.modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode as StorageMode;
      if (mode === "root" && releases.length > 1) releases = [{ version: activeVersion(), active: true }];
      renderModeButtons();
      renderBucketTree();
      renderPipeline(mode === "root" ? "/ (raiz)" : `releases/${activeVersion()}/`);
    });
  });

  el.simulateDnsBtn.addEventListener("click", () => {
    void withBusyLock(async () => {
      renderPipeline(mode === "root" ? "/ (raiz)" : `releases/${activeVersion()}/`);
      await animatePipeline();
    });
  });

  el.deployForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const version = el.versionInput.value.trim() || `v1.0.${Date.now() % 1000}`;
    void withBusyLock(async () => {
      if (mode === "root") {
        await deployToRoot(version);
        return;
      }
      if (!releases.some((r) => r.version === version)) {
        releases.push({ version, active: false });
      }
      await activateRelease(version, false);
    });
  });

  renderModeButtons();
  renderBucketTree();
  renderPipeline(`releases/${activeVersion()}/`);
}
