export interface Stage {
  id: string;
  label: string;
  sub: string;
}

export const STAGES: Stage[] = [
  { id: "db", label: "Banco de origem", sub: "PostgreSQL" },
  { id: "wal", label: "WAL", sub: "log de transação" },
  { id: "debezium", label: "Debezium", sub: "conector CDC" },
  { id: "connect", label: "Kafka Connect", sub: "MSK Connect" },
  { id: "msk", label: "AWS MSK", sub: "tópico por tabela" },
];

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
