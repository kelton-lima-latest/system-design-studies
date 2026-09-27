# System Design Studies

Repositório de estudos pessoais sobre arquitetura de software e system design. Cada exemplo documenta um cenário real ou hipotético, o problema que está sendo resolvido, as opções consideradas e os trade-offs da decisão tomada.

## Estrutura

```
system-design-studies/
  examples/
    <nome-do-caso>/
      README.md        # problema, requisitos, decisão e trade-offs
      diagram.md        # diagrama (mermaid) da arquitetura, quando aplicável
  app/
    src/modules/<slug>/  # simulador interativo do cenário, um módulo por exemplo
    src/catalog.ts        # catálogo exibido na página inicial do app
```

Cada exemplo documentado em `examples/` tem, opcionalmente, um simulador interativo correspondente em
`app/src/modules/`. O `app/` é um único site (Node + Vite) com uma página inicial em formato de catálogo —
o usuário escolhe ali qual cenário quer abrir. Veja [`app/README.md`](app/README.md) para rodar localmente
e para o passo a passo de como adicionar o simulador de um novo exemplo.

## Padrão de cada exemplo

Todo exemplo em `examples/` deve conter, no mínimo:

1. **Contexto / Problema** — que necessidade de negócio ou requisito técnico motiva o design.
2. **Requisitos** — funcionais e não-funcionais (escala, latência, consistência, disponibilidade, custo).
3. **Opções consideradas** — pelo menos 2 abordagens alternativas.
4. **Decisão** — qual opção foi escolhida.
5. **Trade-offs** — o que se ganha e o que se abre mão com a escolha (nunca existe solução sem custo).
6. **Diagrama** — representação visual da arquitetura (mermaid ou ASCII).

## Convenção de nomes

Diretórios de exemplo em `kebab-case`, nomeando o problema e não a tecnologia, ex:
- `site-estatico-cloudfront-s3`
- `feed-de-noticias-fanout`
- `upload-de-arquivos-grandes`
- `notificacoes-em-tempo-real`

## Índice de exemplos

- [cdc-kafka-debezium-msk](examples/cdc-kafka-debezium-msk/README.md) — simulador: `app/` → `#/cdc-kafka`
- [site-estatico-cloudfront-s3](examples/site-estatico-cloudfront-s3/README.md) — simulador: `app/` → `#/cloudfront-s3`
