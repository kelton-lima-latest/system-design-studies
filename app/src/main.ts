import "./style.css";
import { MODULES } from "./catalog";
import { renderHome } from "./home";
import { mountCdcKafka } from "./modules/cdc-kafka/view";
import { mountCloudfrontS3 } from "./modules/cloudfront-s3/view";
import { mountApiPrivadaGateway } from "./modules/api-privada-gateway/view";

const headerEl = document.querySelector<HTMLElement>("#app-header")!;
const mainEl = document.querySelector<HTMLElement>("#app-main")!;

const registry: Record<string, (container: HTMLElement) => void> = {
  "cdc-kafka": mountCdcKafka,
  "cloudfront-s3": mountCloudfrontS3,
  "api-privada-gateway": mountApiPrivadaGateway,
};

function renderHomeHeader(): void {
  headerEl.innerHTML = `
    <div class="flex items-center gap-3 text-ink_text-500 text-xs font-mono uppercase tracking-widest">
      <span class="inline-flex h-1.5 w-1.5 rounded-full bg-teal-500"></span>
      System Design Studies
    </div>
    <h1 class="font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">
      Laboratórios interativos de arquitetura
    </h1>
    <p class="text-ink_text-500 text-sm max-w-2xl">
      Cada card abre um simulador de um cenário real de system design: escolha um abaixo para explorar o
      fluxo de ponta a ponta.
    </p>
  `;
}

function renderModuleHeader(meta: (typeof MODULES)[number]): void {
  headerEl.innerHTML = `
    <a href="#/" class="text-xs text-teal-400 hover:text-teal-300 font-mono mb-2 inline-flex items-center gap-1 w-fit">
      &larr; Todos os laboratórios
    </a>
    <div class="flex items-center gap-3 text-ink_text-500 text-xs font-mono uppercase tracking-widest">
      <span class="inline-flex h-1.5 w-1.5 rounded-full bg-teal-500"></span>
      ${meta.badge}
    </div>
    <h1 class="font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">
      ${meta.title}
    </h1>
    <p class="text-ink_text-500 text-sm max-w-2xl">${meta.description}</p>
  `;
}

function renderNotFound(): void {
  headerEl.innerHTML = `
    <a href="#/" class="text-xs text-teal-400 hover:text-teal-300 font-mono mb-2 inline-flex items-center gap-1 w-fit">
      &larr; Todos os laboratórios
    </a>
    <h1 class="font-display text-2xl font-semibold text-white tracking-tight">Laboratório não encontrado</h1>
  `;
  mainEl.innerHTML = `<p class="text-sm text-ink_text-500">Esse cenário ainda não existe. Volte para a lista de laboratórios.</p>`;
}

function route(): void {
  const slug = location.hash.replace(/^#\/?/, "");
  mainEl.innerHTML = "";

  if (!slug) {
    renderHomeHeader();
    renderHome(mainEl);
    return;
  }

  const meta = MODULES.find((m) => m.slug === slug);
  const mount = registry[slug];
  if (!meta || !mount) {
    renderNotFound();
    return;
  }

  renderModuleHeader(meta);
  mount(mainEl);
  window.scrollTo({ top: 0 });
}

window.addEventListener("hashchange", route);
route();
