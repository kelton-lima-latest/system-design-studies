import {
  IDENTITY_PROVIDERS,
  PARTNERS,
  USE_CASES,
  randomToken,
  type AccessChannel,
  type CallerType,
  type IdentityProvider,
  type Partner,
  type ServiceAuthMethod,
} from "./data";

const TEMPLATE = `
  <div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
    <div class="flex flex-col gap-6">
      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <span class="text-teal-500 font-mono text-xs">01</span> Quem está chamando a API
        </h2>
        <p class="text-xs text-ink_text-500 mb-3">Login de usuário final é um fluxo; chamada de serviço parceiro é outro — nunca reutilize o mesmo token.</p>
        <div class="flex bg-ink-900 border border-ink-500 rounded-lg p-1 text-xs font-medium">
          <button type="button" data-caller="usuario-final" class="caller-btn mode-btn flex-1 rounded-md py-1.5 transition-colors">Usuário final</button>
          <button type="button" data-caller="servico-parceiro" class="caller-btn mode-btn flex-1 rounded-md py-1.5 transition-colors">Serviço parceiro</button>
        </div>
        <p id="caller-status" class="text-xs text-ink_text-500 mt-2">
          Simulando: <span class="font-semibold text-teal-400"></span>
        </p>
      </section>

      <section id="panel-usuario" class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <span class="text-teal-500 font-mono text-xs">02</span> Login federado (OIDC)
        </h2>
        <p class="text-xs text-ink_text-500 mb-3">A senha do usuário nunca passa pela nossa infraestrutura — o BFF troca o código de autorização por um token.</p>
        <div>
          <label for="idp-select" class="block text-xs font-medium text-ink_text-300 mb-1">Provedor de identidade</label>
          <select id="idp-select" class="w-full bg-ink-900 border border-ink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 rounded-lg px-3 py-2 font-mono text-sm text-white mb-3">
            <option value="google">Google Identity Platform</option>
            <option value="microsoft">Microsoft Entra ID</option>
          </select>
        </div>
        <button id="login-btn" type="button" class="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-ink-600 disabled:text-ink_text-700 text-ink-950 font-semibold text-sm rounded-lg py-2 transition-colors">
          Fazer login e chamar a API
        </button>
      </section>

      <section id="panel-servico" class="bg-ink-800 border border-ink-600 rounded-xl p-5 hidden">
        <h2 class="font-display text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <span class="text-teal-500 font-mono text-xs">02</span> Serviço parceiro
        </h2>
        <p class="text-xs text-ink_text-500 mb-3">O canal de rede e o método de autenticação são duas camadas independentes de proteção.</p>
        <div class="mb-3">
          <label for="partner-select" class="block text-xs font-medium text-ink_text-300 mb-1">Parceiro</label>
          <select id="partner-select" class="w-full bg-ink-900 border border-ink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 rounded-lg px-3 py-2 font-mono text-sm text-white"></select>
        </div>
        <div class="mb-3">
          <label class="block text-xs font-medium text-ink_text-300 mb-1">Canal de rede</label>
          <div class="flex bg-ink-900 border border-ink-500 rounded-lg p-1 text-xs font-medium">
            <button type="button" data-channel="internet" class="channel-btn mode-btn flex-1 rounded-md py-1.5 transition-colors">Internet pública</button>
            <button type="button" data-channel="vpn-privatelink" class="channel-btn mode-btn flex-1 rounded-md py-1.5 transition-colors">VPN / PrivateLink</button>
          </div>
          <p id="channel-status" class="text-xs text-ink_text-500 mt-2">
            Canal selecionado: <span class="font-semibold text-teal-400"></span>
          </p>
        </div>
        <div class="mb-4">
          <label class="block text-xs font-medium text-ink_text-300 mb-1">Método de autenticação</label>
          <div class="flex bg-ink-900 border border-ink-500 rounded-lg p-1 text-xs font-medium">
            <button type="button" data-auth="api-key" class="auth-btn mode-btn flex-1 rounded-md py-1.5 transition-colors">API Key</button>
            <button type="button" data-auth="client-credentials-mtls" class="auth-btn mode-btn flex-1 rounded-md py-1.5 transition-colors">Client Credentials + mTLS</button>
          </div>
          <p id="auth-status" class="text-xs text-ink_text-500 mt-2">
            Método selecionado: <span class="font-semibold text-teal-400"></span>
          </p>
        </div>
        <button id="call-btn" type="button" class="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-ink-600 disabled:text-ink_text-700 text-ink-950 font-semibold text-sm rounded-lg py-2 transition-colors">
          Chamar a API
        </button>
        <p id="quota-explainer" class="text-xs text-ink_text-500 mt-3 leading-relaxed"></p>
      </section>
    </div>

    <div class="flex flex-col gap-6 min-w-0">
      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1">Caminho da requisição</h2>
        <p class="text-xs text-ink_text-500 mb-5">Do chamador até a API privada — repare no que muda entre os dois cenários.</p>
        <div id="pipeline-stages" class="flex flex-wrap items-center gap-2 justify-center"></div>
      </section>

      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1">Log de chamadas</h2>
        <p class="text-xs text-ink_text-500 mb-4">Mais recente no topo, com o motivo de sucesso ou bloqueio.</p>
        <div id="call-log-empty" class="text-sm text-ink_text-700 text-center py-10 border border-dashed border-ink-600 rounded-lg">
          Nenhuma chamada realizada ainda.
        </div>
        <div id="call-log" class="hidden flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1"></div>
      </section>

      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1">Práticas usadas para não expor a API publicamente</h2>
        <p class="text-xs text-ink_text-500 mb-4">Cada card é uma camada de proteção independente, combinada no cenário completo.</p>
        <div id="use-cases-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
      </section>
    </div>
  </div>
`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface Stage {
  id: string;
  label: string;
  sub: string;
}

function userStages(idp: IdentityProvider): Stage[] {
  return [
    { id: "user", label: "Usuário", sub: "navegador" },
    { id: "idp", label: IDENTITY_PROVIDERS[idp].label, sub: IDENTITY_PROVIDERS[idp].domain },
    { id: "bff", label: "BFF de login", sub: "troca code por token" },
    { id: "gw", label: "API Gateway", sub: "endpoint PRIVATE" },
    { id: "api", label: "api-pedidos", sub: "100% privada" },
  ];
}

function serviceStages(channel: AccessChannel): Stage[] {
  return [
    { id: "svc", label: "Serviço parceiro", sub: "fora da rede" },
    { id: "net", label: channel === "internet" ? "Internet pública" : "VPN / PrivateLink", sub: channel === "internet" ? "sem rota autorizada" : "canal controlado" },
    { id: "gw", label: "API Gateway", sub: "endpoint PRIVATE" },
    { id: "api", label: "api-pedidos", sub: "100% privada" },
  ];
}

export function mountApiPrivadaGateway(container: HTMLElement): void {
  container.innerHTML = TEMPLATE;

  const el = {
    callerBtns: Array.from(container.querySelectorAll<HTMLButtonElement>(".caller-btn")),
    callerStatus: container.querySelector<HTMLSpanElement>("#caller-status span")!,
    panelUsuario: container.querySelector<HTMLElement>("#panel-usuario")!,
    panelServico: container.querySelector<HTMLElement>("#panel-servico")!,
    idpSelect: container.querySelector<HTMLSelectElement>("#idp-select")!,
    loginBtn: container.querySelector<HTMLButtonElement>("#login-btn")!,
    partnerSelect: container.querySelector<HTMLSelectElement>("#partner-select")!,
    channelBtns: Array.from(container.querySelectorAll<HTMLButtonElement>(".channel-btn")),
    channelStatus: container.querySelector<HTMLSpanElement>("#channel-status span")!,
    authBtns: Array.from(container.querySelectorAll<HTMLButtonElement>(".auth-btn")),
    authStatus: container.querySelector<HTMLSpanElement>("#auth-status span")!,
    callBtn: container.querySelector<HTMLButtonElement>("#call-btn")!,
    quotaExplainer: container.querySelector<HTMLParagraphElement>("#quota-explainer")!,
    pipelineStages: container.querySelector<HTMLDivElement>("#pipeline-stages")!,
    callLog: container.querySelector<HTMLDivElement>("#call-log")!,
    callLogEmpty: container.querySelector<HTMLDivElement>("#call-log-empty")!,
    useCasesGrid: container.querySelector<HTMLDivElement>("#use-cases-grid")!,
  };

  let caller: CallerType = "usuario-final";
  let channel: AccessChannel = "vpn-privatelink";
  let authMethod: ServiceAuthMethod = "client-credentials-mtls";
  let callCounter = 0;
  let busy = false;
  const callsPerPartner: Record<string, number> = {};

  el.partnerSelect.innerHTML = PARTNERS.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
  el.useCasesGrid.innerHTML = USE_CASES.map(
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

  function currentPartner(): Partner {
    return PARTNERS.find((p) => p.id === el.partnerSelect.value) ?? PARTNERS[0];
  }

  const CALLER_LABEL: Record<CallerType, string> = {
    "usuario-final": "Usuário final (login federado)",
    "servico-parceiro": "Serviço parceiro (server-to-server)",
  };

  const CHANNEL_LABEL: Record<AccessChannel, string> = {
    internet: "Internet pública (sem rota autorizada)",
    "vpn-privatelink": "VPN / PrivateLink (canal privado)",
  };

  const AUTH_LABEL: Record<ServiceAuthMethod, string> = {
    "api-key": "API Key (mais fraco)",
    "client-credentials-mtls": "Client Credentials + mTLS (recomendado)",
  };

  function renderCallerButtons(): void {
    el.callerBtns.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.caller === caller));
    el.callerStatus.textContent = CALLER_LABEL[caller];
    el.panelUsuario.classList.toggle("hidden", caller !== "usuario-final");
    el.panelServico.classList.toggle("hidden", caller !== "servico-parceiro");
  }

  function renderChannelButtons(): void {
    el.channelBtns.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.channel === channel));
    el.channelStatus.textContent = CHANNEL_LABEL[channel];
  }

  function renderAuthButtons(): void {
    el.authBtns.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.auth === authMethod));
    el.authStatus.textContent = AUTH_LABEL[authMethod];
  }

  function renderQuotaExplainer(): void {
    const partner = currentPartner();
    const used = callsPerPartner[partner.id] ?? 0;
    el.quotaExplainer.innerHTML = `Quota de <strong class="text-ink_text-300">${partner.name}</strong>: ${used}/${partner.quotaPerMinute} chamadas neste minuto simulado. Conectado via <strong class="text-ink_text-300">${partner.network}</strong>.`;
  }

  function renderPipeline(stages: Stage[]): void {
    el.pipelineStages.innerHTML = stages
      .map(
        (s, i) => `
        ${i > 0 ? '<span class="stage-arrow">&rarr;</span>' : ""}
        <div class="stage-box" data-stage="${s.id}">
          <div class="text-xs font-semibold text-white">${s.label}</div>
          <div class="text-[10px] text-ink_text-500 font-mono mt-0.5">${s.sub}</div>
        </div>
      `,
      )
      .join("");
  }

  async function animatePipeline(upToIndex?: number): Promise<void> {
    const stageEls = Array.from(el.pipelineStages.querySelectorAll<HTMLDivElement>(".stage-box"));
    const limit = upToIndex ?? stageEls.length - 1;
    for (let i = 0; i < stageEls.length; i += 1) {
      if (i > limit) break;
      stageEls[i].classList.add("is-active");
      await sleep(220);
      if (i < limit) stageEls[i].classList.remove("is-active");
    }
  }

  function appendLog(title: string, ok: boolean, lines: string[]): void {
    callCounter += 1;
    el.callLogEmpty.classList.add("hidden");
    el.callLog.classList.remove("hidden");

    const entry = document.createElement("div");
    entry.className = `event-entry bg-ink-900 border ${ok ? "border-ink-600" : "border-coral-500/50"} rounded-lg p-3`;
    entry.innerHTML = `
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs font-mono font-semibold ${ok ? "text-teal-400" : "text-coral-400"}">${title}</span>
        <span class="text-[10px] font-mono text-ink_text-700">#${callCounter}</span>
      </div>
      <ul class="text-xs text-ink_text-500 leading-relaxed list-disc pl-4">
        ${lines.map((l) => `<li>${l}</li>`).join("")}
      </ul>
    `;
    el.callLog.prepend(entry);
  }

  async function runUsuarioFinal(): Promise<void> {
    const idp = el.idpSelect.value as IdentityProvider;
    const stages = userStages(idp);
    renderPipeline(stages);
    await animatePipeline();

    const idToken = randomToken("id_token");
    const appToken = randomToken("app_token");
    appendLog(`Login via ${IDENTITY_PROVIDERS[idp].label} — sucesso`, true, [
      `Usuário autenticou em <code>${IDENTITY_PROVIDERS[idp].domain}</code>, senha nunca chegou à nossa infraestrutura.`,
      `BFF trocou o <code>authorization_code</code> por <code>${idToken}</code> diretamente com o IdP.`,
      `BFF emitiu token próprio da aplicação (<code>${appToken}</code>) para chamar a API interna.`,
      "API Gateway validou issuer/audience/expiração do token próprio e liberou a chamada — nenhum token do Google/Microsoft trafega além do BFF.",
    ]);
  }

  async function runServicoParceiro(): Promise<void> {
    const partner = currentPartner();
    const stages = serviceStages(channel);
    renderPipeline(stages);

    if (channel === "internet") {
      await animatePipeline(1);
      appendLog(`${partner.name} — bloqueado`, false, [
        "O API Gateway não possui endpoint público (<code>PRIVATE</code>) — não há rota para tráfego vindo da internet.",
        "O handshake TCP é recusado antes mesmo de qualquer credencial ser avaliada.",
        "Isso vale mesmo que o parceiro tenha uma API Key ou certificado mTLS válidos — a camada de rede é a primeira barreira.",
      ]);
      return;
    }

    callsPerPartner[partner.id] = (callsPerPartner[partner.id] ?? 0) + 1;
    renderQuotaExplainer();

    if (callsPerPartner[partner.id] > partner.quotaPerMinute) {
      await animatePipeline(2);
      appendLog(`${partner.name} — 429 Too Many Requests`, false, [
        `Quota de ${partner.quotaPerMinute} chamadas/minuto excedida para este parceiro.`,
        "O API Gateway aplica o throttling antes de repassar a chamada ao backend, protegendo os demais parceiros.",
      ]);
      return;
    }

    await animatePipeline();

    if (authMethod === "api-key") {
      const apiKey = randomToken("key");
      appendLog(`${partner.name} — autorizado (API Key)`, true, [
        `Chamada chegou via <strong class="text-ink_text-300">${partner.network}</strong>, dentro do canal privado.`,
        `API Gateway validou a API Key <code>${apiKey}</code> e aplicou a quota do parceiro.`,
        "Atenção: API Key sozinha é o método mais fraco — se vazar, qualquer origem dentro do canal privado pode reutilizá-la; prefira Client Credentials + mTLS para parceiros críticos.",
      ]);
      return;
    }

    const accessToken = randomToken("access_token");
    appendLog(`${partner.name} — autorizado (Client Credentials + mTLS)`, true, [
      `Chamada chegou via <strong class="text-ink_text-300">${partner.network}</strong>, dentro do canal privado.`,
      `Certificado de cliente mTLS validado na camada de transporte, específico deste parceiro.`,
      `Access token <code>${accessToken}</code> obtido via Client Credentials Flow, validado (issuer/audience/expiração) pelo Gateway.`,
      "Duas camadas independentes de identidade — rede e aplicação — precisam ser válidas ao mesmo tempo.",
    ]);
  }

  async function withBusyLock(fn: () => Promise<void>): Promise<void> {
    if (busy) return;
    busy = true;
    el.loginBtn.disabled = true;
    el.callBtn.disabled = true;
    try {
      await fn();
    } finally {
      busy = false;
      el.loginBtn.disabled = false;
      el.callBtn.disabled = false;
    }
  }

  el.callerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      caller = btn.dataset.caller as CallerType;
      renderCallerButtons();
      renderPipeline(caller === "usuario-final" ? userStages(el.idpSelect.value as IdentityProvider) : serviceStages(channel));
    });
  });

  el.channelBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      channel = btn.dataset.channel as AccessChannel;
      renderChannelButtons();
      renderPipeline(serviceStages(channel));
    });
  });

  el.authBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      authMethod = btn.dataset.auth as ServiceAuthMethod;
      renderAuthButtons();
    });
  });

  el.partnerSelect.addEventListener("change", renderQuotaExplainer);
  el.idpSelect.addEventListener("change", () => {
    if (caller === "usuario-final") renderPipeline(userStages(el.idpSelect.value as IdentityProvider));
  });

  el.loginBtn.addEventListener("click", () => {
    void withBusyLock(runUsuarioFinal);
  });

  el.callBtn.addEventListener("click", () => {
    void withBusyLock(runServicoParceiro);
  });

  renderCallerButtons();
  renderChannelButtons();
  renderAuthButtons();
  renderQuotaExplainer();
  renderPipeline(userStages(el.idpSelect.value as IdentityProvider));
}
