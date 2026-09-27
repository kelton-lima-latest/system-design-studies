export interface TableDef {
  id: string;
  label: string;
  columns: string[];
}

export const TABLES: TableDef[] = [
  { id: "pedidos", label: "pedidos", columns: ["id", "cliente_id", "status", "valor_total", "atualizado_em"] },
  { id: "clientes", label: "clientes", columns: ["id", "nome", "email", "plano", "atualizado_em"] },
  { id: "pagamentos", label: "pagamentos", columns: ["id", "pedido_id", "status", "metodo", "atualizado_em"] },
  { id: "estoque", label: "estoque", columns: ["id", "sku", "quantidade", "deposito", "atualizado_em"] },
];

export interface Consumer {
  id: string;
  name: string;
  detail: string;
  colorClass: string;
}

export const CONSUMERS: Consumer[] = [
  { id: "dw", name: "ETL → Data Warehouse", detail: "Alimenta banco analítico consumido pelo Power BI", colorClass: "border-teal-500" },
  { id: "lake", name: "Sink S3 (Data Lake)", detail: "Grava eventos em Parquet para consultas via Athena", colorClass: "border-amber-500" },
  { id: "search", name: "Elasticsearch", detail: "Mantém índice de busca sempre atualizado", colorClass: "border-violet-500" },
  { id: "cache", name: "Cache (Redis)", detail: "Invalida/atualiza chaves quando a linha muda", colorClass: "border-coral-500" },
  { id: "svc", name: "Outro microsserviço", detail: "Mantém read model local sem chamar a API de origem", colorClass: "border-ink-500" },
];

export interface UseCase {
  title: string;
  description: string;
  tag: string;
}

export const USE_CASES: UseCase[] = [
  {
    title: "Dashboards de BI (Power BI)",
    description: "Mudanças são replicadas para um banco analítico que o Power BI consulta, sem tocar no banco transacional de produção.",
    tag: "Analytics",
  },
  {
    title: "Data lake para analytics",
    description: "Sink connector grava os eventos em S3 (Parquet/Iceberg) para consultas via Athena ou processamento em Spark/EMR.",
    tag: "Data Lake",
  },
  {
    title: "Sincronização de busca",
    description: "Eventos alimentam Elasticsearch/OpenSearch, mantendo o índice sempre atualizado sem reindexações em lote.",
    tag: "Search",
  },
  {
    title: "Invalidação de cache",
    description: "Um consumidor atualiza ou invalida chaves no Redis exatamente quando a linha correspondente muda.",
    tag: "Cache",
  },
  {
    title: "Sincronização entre microsserviços",
    description: "Outro serviço mantém seu próprio read model local, sem depender de chamadas síncronas à API de origem.",
    tag: "Microsserviços",
  },
  {
    title: "Auditoria e compliance",
    description: "Todo evento de mudança é persistido de forma imutável, atendendo requisitos regulatórios de rastreabilidade.",
    tag: "Compliance",
  },
  {
    title: "Detecção de fraude em tempo real",
    description: "Eventos de transações fluem para stream processing (Kafka Streams/Flink) aplicando regras quase em tempo real.",
    tag: "Real-time",
  },
  {
    title: "Feature store para Machine Learning",
    description: "Mantém features de modelos em produção sempre frescas, sem depender de ETLs batch noturnos.",
    tag: "ML",
  },
  {
    title: "Migração entre bancos heterogêneos",
    description: "Usado como mecanismo de migração com downtime mínimo, mantendo origem e destino sincronizados durante o corte.",
    tag: "Migração",
  },
];

export function connectorConfig(): string {
  return JSON.stringify(
    {
      name: "loja-db-connector",
      config: {
        "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
        "database.hostname": "loja-db.cluster-xxxx.us-east-1.rds.amazonaws.com",
        "database.port": "5432",
        "database.user": "debezium_replicator",
        "database.dbname": "loja_db",
        "topic.prefix": "cdc",
        "table.include.list": "public.pedidos,public.clientes,public.pagamentos,public.estoque",
        "plugin.name": "pgoutput",
        "snapshot.mode": "initial",
      },
    },
    null,
    2,
  );
}

export function topicName(tableId: string): string {
  return `cdc.public.${tableId}`;
}
