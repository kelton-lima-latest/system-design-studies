export type StorageMode = "root" | "releases";

export interface Release {
  version: string;
  active: boolean;
}

export interface CloudFrontUseCase {
  title: string;
  description: string;
  tag: string;
}

export const CLOUDFRONT_USE_CASES: CloudFrontUseCase[] = [
  {
    title: "Aceleração de API",
    description: "CloudFront na frente de um API Gateway/ALB, aproveitando a rede da AWS até a origem mesmo para conteúdo não cacheável.",
    tag: "API",
  },
  {
    title: "Streaming de vídeo (VOD e live)",
    description: "Distribuição de vídeo sob demanda ou ao vivo com Signed URLs/Cookies para restringir acesso a assinantes.",
    tag: "Media",
  },
  {
    title: "Distribuição de software",
    description: "Instaladores, updates de apps e imagens de containers, aproveitando cache de longa duração e alta taxa de transferência.",
    tag: "Releases",
  },
  {
    title: "WAF + Shield na borda",
    description: "CloudFront como ponto de entrada único, integrado a WAF e Shield, protegendo a origem de tráfego malicioso e DDoS.",
    tag: "Segurança",
  },
  {
    title: "Lambda@Edge / CF Functions",
    description: "Lógica na borda antes da origem: redirecionamento por país, testes A/B, reescrita de URL, autenticação leve.",
    tag: "Edge compute",
  },
  {
    title: "Failover multi-região",
    description: "Origem primária e secundária em regiões diferentes (origin failover), aumentando disponibilidade sem lógica no cliente.",
    tag: "Disponibilidade",
  },
];

export function initialReleases(): Release[] {
  return [
    { version: "v1.2.0", active: false },
    { version: "v1.3.0", active: false },
    { version: "v1.4.2", active: true },
  ];
}
