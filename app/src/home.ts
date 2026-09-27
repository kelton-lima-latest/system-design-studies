import { MODULES } from "./catalog";

export function renderHome(container: HTMLElement): void {
  container.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      ${MODULES.map(
        (m) => `
        <a href="#/${m.slug}" class="group block bg-ink-800 border border-ink-600 ${m.accentClass} border-l-4 rounded-xl p-5 hover:border-ink-500 transition-colors">
          <div class="flex items-center gap-2 text-ink_text-500 text-xs font-mono uppercase tracking-widest mb-2">
            <span class="text-teal-500">${m.order}</span>
            <span>${m.badge}</span>
          </div>
          <h2 class="font-display text-lg font-semibold text-white mb-1.5 group-hover:text-teal-300 transition-colors">
            ${m.title}
          </h2>
          <p class="text-sm text-ink_text-500 leading-relaxed mb-4">${m.summary}</p>
          <div class="flex flex-wrap gap-1.5 mb-4">
            ${m.tags
              .map(
                (t) =>
                  `<span class="text-[10px] font-mono uppercase tracking-wide text-ink_text-300 bg-ink-900 border border-ink-600 rounded px-1.5 py-0.5">${t}</span>`,
              )
              .join("")}
          </div>
          <span class="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 group-hover:text-teal-300">
            Abrir simulação &rarr;
          </span>
        </a>
      `,
      ).join("")}
    </div>
  `;
}
