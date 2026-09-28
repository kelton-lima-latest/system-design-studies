export interface ModuleMeta {
  slug: string;
  order: string;
  badge: string;
  title: string;
  description: string;
  summary: string;
  tags: string[];
  accentClass: string;
  docsPath: string;
}

export const MODULES: ModuleMeta[] = [
  {
    slug: "cdc-kafka",
    order: "01",
    badge: "CDC · Debezium · Kafka (AWS MSK)",
    title: "Change Data Capture",
    summary:
      "Debezium captura mudanças do log de transação do banco e publica em tópicos Kafka no MSK para múltiplos consumidores.",
    description:
      "Debezium captura as mudanças do banco de origem direto do log de transação e publica cada evento em um tópico Kafka no AWS MSK. Múltiplos consumidores leem esse fluxo de forma independente, sem tocar no banco original.",
    tags: ["Kafka", "Debezium", "AWS MSK", "Event-driven"],
    accentClass: "border-l-teal-500",
    docsPath: "../examples/cdc-kafka-debezium-msk/README.md",
  },
  {
    slug: "cloudfront-s3",
    order: "02",
    badge: "CloudFront · S3 · Route 53",
    title: "Site Estático com CDN",
    summary:
      "Domínio comprado no registro.br com DNS delegado ao Route 53, CloudFront na frente de um bucket S3 versionado por release.",
    description:
      "Route 53 resolve o domínio (registrado no registro.br) para uma distribuição CloudFront, que serve os arquivos estáticos a partir da versão ativa em S3. Compare a estratégia de publicar na raiz do bucket com a de pastas de release versionadas.",
    tags: ["CloudFront", "S3", "Route 53", "Deploy"],
    accentClass: "border-l-amber-500",
    docsPath: "../examples/site-estatico-cloudfront-s3/README.md",
  },
  {
    slug: "api-privada-gateway",
    order: "03",
    badge: "API Gateway · OAuth2/OIDC · Rede privada",
    title: "API Privada Exposta a Parceiros",
    summary:
      "API interna com login federado via Google/Microsoft, exposta a serviços de parceiros só por VPN/PrivateLink — nunca pela internet pública.",
    description:
      "Login de usuário delega autenticação a um IdP externo (Google/Microsoft) via um BFF; serviços de parceiros autenticam com client credentials + mTLS através de um canal de rede privado. O API Gateway nunca tem endpoint público.",
    tags: ["API Gateway", "OAuth2", "OIDC", "Zero Trust"],
    accentClass: "border-l-violet-500",
    docsPath: "../examples/api-privada-gateway/README.md",
  },
];
