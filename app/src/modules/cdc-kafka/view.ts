import { TABLES, CONSUMERS, USE_CASES, connectorConfig, topicName, type TableDef } from "./data";
import { STAGES, sleep } from "./pipeline";

const TEMPLATE = `
  <div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
    <div class="flex flex-col gap-6">
      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <span class="text-teal-500 font-mono text-xs">01</span> Simular alteração
        </h2>
        <p class="text-xs text-ink_text-500 mb-4">Escolha uma tabela e uma operação para disparar um evento de mudança.</p>
        <form id="event-form" class="flex flex-col gap-3">
          <div>
            <label for="table-select" class="block text-xs font-medium text-ink_text-300 mb-1">Tabela de origem</label>
            <select id="table-select" class="w-full bg-ink-900 border border-ink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 rounded-lg px-3 py-2 font-mono text-sm text-white"></select>
          </div>
          <div>
            <label for="op-select" class="block text-xs font-medium text-ink_text-300 mb-1">Operação</label>
            <select id="op-select" class="w-full bg-ink-900 border border-ink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 rounded-lg px-3 py-2 font-mono text-sm text-white">
              <option value="c">INSERT (c)</option>
              <option value="u">UPDATE (u)</option>
              <option value="d">DELETE (d)</option>
            </select>
          </div>
          <button
            type="submit"
            id="fire-event-btn"
            class="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-ink-600 disabled:text-ink_text-700 text-ink-950 font-semibold text-sm rounded-lg py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
          >
            Disparar evento de mudança
          </button>
        </form>
      </section>

      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <span class="text-teal-500 font-mono text-xs">02</span> Conector Debezium
        </h2>
        <p class="text-xs text-ink_text-500 mb-4">Configuração registrada no Kafka Connect (MSK Connect).</p>
        <pre id="connector-config" class="text-[11px] leading-relaxed font-mono text-ink_text-300 bg-ink-900 border border-ink-600 rounded-lg p-3 overflow-x-auto"></pre>
      </section>

      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <span class="text-teal-500 font-mono text-xs">03</span> Cluster AWS MSK
        </h2>
        <p class="text-xs text-ink_text-500 mb-4">Tópicos criados automaticamente pelo conector, um por tabela.</p>
        <div id="topics-list" class="flex flex-col gap-1.5 text-xs font-mono"></div>
      </section>
    </div>

    <div class="flex flex-col gap-6 min-w-0">
      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1">Pipeline de captura</h2>
        <p class="text-xs text-ink_text-500 mb-5">Acompanhe o evento percorrer cada estágio até chegar aos consumidores.</p>
        <div id="pipeline-stages" class="flex flex-wrap items-center gap-2 justify-center"></div>
        <div class="mt-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xs font-semibold text-ink_text-300 uppercase tracking-wide">Consumidores do tópico</h3>
          </div>
          <div id="consumers-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"></div>
        </div>
      </section>

      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1">Fluxo de eventos (tópico Kafka)</h2>
        <p class="text-xs text-ink_text-500 mb-4">Envelope de mudança no formato Debezium, mais recente no topo.</p>
        <div id="event-log-empty" class="text-sm text-ink_text-700 text-center py-10 border border-dashed border-ink-600 rounded-lg">
          Nenhum evento disparado ainda.
        </div>
        <div id="event-log" class="hidden flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1"></div>
      </section>

      <section class="bg-ink-800 border border-ink-600 rounded-xl p-5">
        <h2 class="font-display text-sm font-semibold text-white mb-1">Onde essa técnica é usada na prática</h2>
        <p class="text-xs text-ink_text-500 mb-4">Exemplos reais de sistemas construídos sobre CDC com Debezium e Kafka.</p>
        <div id="use-cases-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
      </section>
    </div>
  </div>
`;

function randomValue(column: string): string | number {
  if (column === "id" || column.endsWith("_id")) return Math.floor(Math.random() * 9000) + 100;
  if (column === "valor_total") return Number((Math.random() * 900 + 10).toFixed(2));
  if (column === "quantidade") return Math.floor(Math.random() * 200);
  if (column === "status") return ["pendente", "pago", "enviado", "cancelado"][Math.floor(Math.random() * 4)];
  if (column === "atualizado_em") return new Date().toISOString();
  if (column === "email") return `cliente${Math.floor(Math.random() * 999)}@exemplo.com`;
  if (column === "nome") return ["Ana Souza", "Bruno Lima", "Carla Nunes", "Diego Alves"][Math.floor(Math.random() * 4)];
  if (column === "plano") return ["free", "pro", "enterprise"][Math.floor(Math.random() * 3)];
  if (column === "metodo") return ["pix", "cartao", "boleto"][Math.floor(Math.random() * 3)];
  if (column === "sku") return `SKU-${Math.floor(Math.random() * 9000)}`;
  if (column === "deposito") return ["SP-01", "RJ-02", "MG-01"][Math.floor(Math.random() * 3)];
  return "n/a";
}

function buildRow(table: TableDef): Record<string, string | number> {
  const row: Record<string, string | number> = {};
  for (const col of table.columns) row[col] = randomValue(col);
  return row;
}

function buildEnvelope(table: TableDef, op: "c" | "u" | "d") {
  const after = buildRow(table);
  const before = op === "c" ? null : { ...after, status: "estado_anterior" };
  return {
    before: op === "c" ? null : before,
    after: op === "d" ? null : after,
    source: {
      version: "2.5.0.Final",
      connector: "postgresql",
      db: "loja_db",
      schema: "public",
      table: table.id,
      ts_ms: Date.now(),
      lsn: Math.floor(Math.random() * 900000) + 100000,
    },
    op,
    ts_ms: Date.now(),
  };
}

function opLabel(op: string): { text: string; color: string } {
  if (op === "c") return { text: "INSERT", color: "text-teal-400 bg-teal-500/10 border-teal-500/30" };
  if (op === "u") return { text: "UPDATE", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
  return { text: "DELETE", color: "text-coral-400 bg-coral-500/10 border-coral-500/30" };
}

export function mountCdcKafka(container: HTMLElement): void {
  container.innerHTML = TEMPLATE;

  const el = {
    tableSelect: container.querySelector<HTMLSelectElement>("#table-select")!,
    opSelect: container.querySelector<HTMLSelectElement>("#op-select")!,
    form: container.querySelector<HTMLFormElement>("#event-form")!,
    fireBtn: container.querySelector<HTMLButtonElement>("#fire-event-btn")!,
    connectorConfig: container.querySelector<HTMLPreElement>("#connector-config")!,
    topicsList: container.querySelector<HTMLDivElement>("#topics-list")!,
    pipelineStages: container.querySelector<HTMLDivElement>("#pipeline-stages")!,
    consumersGrid: container.querySelector<HTMLDivElement>("#consumers-grid")!,
    useCasesGrid: container.querySelector<HTMLDivElement>("#use-cases-grid")!,
    eventLog: container.querySelector<HTMLDivElement>("#event-log")!,
    eventLogEmpty: container.querySelector<HTMLDivElement>("#event-log-empty")!,
  };

  let eventCounter = 0;

  el.tableSelect.innerHTML = TABLES.map((t) => `<option value="${t.id}">${t.label}</option>`).join("");
  el.connectorConfig.textContent = connectorConfig();
  el.topicsList.innerHTML = TABLES.map(
    (t) => `
      <div class="flex items-center justify-between bg-ink-900 border border-ink-600 rounded-md px-2.5 py-1.5">
        <span class="text-ink_text-300">${topicName(t.id)}</span>
        <span class="text-ink_text-700">1 partição</span>
      </div>
    `,
  ).join("");
  el.pipelineStages.innerHTML = STAGES.map(
    (s, i) => `
      ${i > 0 ? '<span class="stage-arrow">&rarr;</span>' : ""}
      <div class="stage-box" data-stage="${s.id}">
        <div class="text-xs font-semibold text-white">${s.label}</div>
        <div class="text-[10px] text-ink_text-500 font-mono mt-0.5">${s.sub}</div>
      </div>
    `,
  ).join("");
  el.consumersGrid.innerHTML = CONSUMERS.map(
    (c) => `
      <div class="fanout-card bg-ink-900 border-2 ${c.colorClass} rounded-lg p-3" data-consumer="${c.id}">
        <div class="text-xs font-semibold text-white leading-snug">${c.name}</div>
        <div class="text-[10px] text-ink_text-500 mt-1 leading-snug">${c.detail}</div>
      </div>
    `,
  ).join("");
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

  function appendEventLog(table: TableDef, op: "c" | "u" | "d", envelope: unknown): void {
    eventCounter += 1;
    el.eventLogEmpty.classList.add("hidden");
    el.eventLog.classList.remove("hidden");

    const { text, color } = opLabel(op);
    const wrapper = document.createElement("div");
    wrapper.className = "event-entry bg-ink-900 border border-ink-600 rounded-lg p-3";
    wrapper.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-mono uppercase tracking-wide border rounded px-1.5 py-0.5 ${color}">${text}</span>
          <span class="text-xs font-mono text-ink_text-300">${topicName(table.id)}</span>
        </div>
        <span class="text-[10px] font-mono text-ink_text-700">#${eventCounter}</span>
      </div>
      <pre class="text-[11px] leading-relaxed font-mono text-ink_text-500 overflow-x-auto">${JSON.stringify(envelope, null, 2)}</pre>
    `;
    el.eventLog.prepend(wrapper);
  }

  async function runPipelineAnimation(): Promise<void> {
    const stageEls = Array.from(el.pipelineStages.querySelectorAll<HTMLDivElement>(".stage-box"));
    for (const stageEl of stageEls) {
      stageEl.classList.add("is-active");
      await sleep(220);
      stageEl.classList.remove("is-active");
    }

    const consumerEls = Array.from(el.consumersGrid.querySelectorAll<HTMLDivElement>(".fanout-card"));
    const activeCount = Math.floor(Math.random() * 2) + 3;
    const shuffled = [...consumerEls].sort(() => Math.random() - 0.5).slice(0, activeCount);
    shuffled.forEach((c) => c.classList.add("is-active"));
    await sleep(600);
    shuffled.forEach((c) => c.classList.remove("is-active"));
  }

  el.form.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const tableId = el.tableSelect.value;
    const op = el.opSelect.value as "c" | "u" | "d";
    const table = TABLES.find((t) => t.id === tableId);
    if (!table) return;

    el.fireBtn.disabled = true;
    const envelope = buildEnvelope(table, op);
    await runPipelineAnimation();
    appendEventLog(table, op, envelope);
    el.fireBtn.disabled = false;
  });
}
