# System Design Studies — Laboratórios interativos

App único (Node + Vite + TypeScript + Tailwind) com uma página inicial em formato de catálogo, de onde o
usuário escolhe qual cenário de `examples/` quer explorar. Cada cenário é um módulo com sua própria simulação
interativa, roteado por hash (`#/slug-do-modulo`) dentro do mesmo app — sem depender de rewrites no servidor,
o que funciona tanto em GitHub Pages quanto em CloudFront sem configuração extra.

Contexto e decisão de arquitetura de cada cenário estão no `README.md` dentro da respectiva pasta em
`../examples/`.

## Laboratórios disponíveis

- `#/cdc-kafka` — Change Data Capture com Debezium + Kafka (AWS MSK). Doc: [`../examples/cdc-kafka-debezium-msk/README.md`](../examples/cdc-kafka-debezium-msk/README.md)
- `#/cloudfront-s3` — Site estático em CloudFront + S3, domínio registro.br delegado ao Route 53. Doc: [`../examples/site-estatico-cloudfront-s3/README.md`](../examples/site-estatico-cloudfront-s3/README.md)

## Rodando localmente

```bash
npm install
npm run dev
# abre http://localhost:5173
```

## Build de produção

```bash
npm run build
# gera ./dist
npm run preview   # opcional, serve o build localmente
```

`vite.config.ts` usa `base: "./"` (caminhos relativos) e o roteamento é feito via `location.hash`, então o
mesmo build em `dist/` funciona tanto hospedado na raiz de um domínio (CloudFront) quanto em um subcaminho de
projeto (GitHub Pages), e uma navegação direta para qualquer rota não gera 404 no servidor — tudo é resolvido
no cliente a partir de `index.html`.

## Deploy — fase 1: GitHub Pages

1. Build local: `npm run build`.
2. Publicar o conteúdo de `dist/` na branch `gh-pages` do repositório (ex: usando [`gh-pages`](https://www.npmjs.com/package/gh-pages) ou uma GitHub Action de deploy).
3. Habilitar GitHub Pages nas configurações do repositório apontando para essa branch.

```bash
npm install -D gh-pages
npx gh-pages -d dist
```

## Deploy — fase 2: AWS S3 + CloudFront

```bash
npm run build

aws s3 sync dist/ s3://SEU-BUCKET-NOME \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

aws s3 cp dist/index.html s3://SEU-BUCKET-NOME/index.html \
  --cache-control "public, max-age=60, must-revalidate" \
  --content-type "text/html"

aws cloudfront create-invalidation \
  --distribution-id SEU_DISTRIBUTION_ID \
  --paths "/index.html"
```

- Origem do CloudFront: o bucket S3 com **Origin Access Control (OAC)**, bucket privado (Block Public Access = ON).
- **Default root object**: `index.html`.
- **Viewer protocol policy**: Redirect HTTP to HTTPS.
- Arquivos com hash no nome (`assets/index-*.js`, `assets/index-*.css`, gerados pelo Vite) podem usar cache longo e imutável; só `index.html` precisa de cache curto.

## Adicionando um novo laboratório

1. Documentar o cenário em `../examples/<nome-do-caso>/README.md` (contexto, requisitos, opções, decisão, trade-offs, diagrama), seguindo o padrão do repositório.
2. Criar `src/modules/<slug>/` com a lógica do simulador (`data.ts`, `view.ts`, etc.) exportando uma função `mount(container: HTMLElement): void`.
3. Registrar o módulo em `src/main.ts` (`registry`) e adicionar sua entrada em `src/catalog.ts` (título, descrição, tags, cor de destaque, link para o doc).

## Estrutura

```
app/
├── index.html            # shell: header + main dinâmicos, preenchidos pelo router
├── src/
│   ├── main.ts            # router por hash (#/slug) + header dinâmico
│   ├── catalog.ts          # metadados de cada laboratório (catálogo da home)
│   ├── home.ts             # renderiza a grade de cards da página inicial
│   ├── style.css           # diretivas Tailwind + texturas/animações compartilhadas
│   └── modules/
│       ├── cdc-kafka/
│       │   ├── view.ts      # mountCdcKafka(container)
│       │   ├── data.ts
│       │   └── pipeline.ts
│       └── cloudfront-s3/
│           ├── view.ts      # mountCloudfrontS3(container)
│           └── data.ts
├── tailwind.config.js      # paleta ink/teal/amber/coral/violet e fontes
└── vite.config.ts
```
