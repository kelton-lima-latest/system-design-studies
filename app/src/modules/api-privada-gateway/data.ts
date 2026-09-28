export type AccessChannel = "internet" | "vpn-privatelink";
export type CallerType = "usuario-final" | "servico-parceiro";
export type IdentityProvider = "google" | "microsoft";
export type ServiceAuthMethod = "api-key" | "client-credentials-mtls";

export interface Partner {
  id: string;
  name: string;
  network: string;
  quotaPerMinute: number;
}

export interface UseCase {
  title: string;
  description: string;
  tag: string;
}

export const PARTNERS: Partner[] = [
  { id: "logistica-xyz", name: "Logística XYZ", network: "VPC peering (mesma nuvem)", quotaPerMinute: 60 },
  { id: "erp-parceiro", name: "ERP Financeiro Parceiro", network: "VPN Site-to-Site", quotaPerMinute: 30 },
  { id: "marketplace-abc", name: "Marketplace ABC", network: "PrivateLink", quotaPerMinute: 120 },
];

export const IDENTITY_PROVIDERS: Record<IdentityProvider, { label: string; domain: string }> = {
  google: { label: "Google Identity Platform", domain: "accounts.google.com" },
  microsoft: { label: "Microsoft Entra ID", domain: "login.microsoftonline.com" },
};

export const USE_CASES: UseCase[] = [
  {
    title: "Backend-for-Frontend (BFF)",
    description: "Único componente com egress liberado para falar com o IdP; troca o authorization_code por id_token e emite um token próprio da aplicação.",
    tag: "OIDC",
  },
  {
    title: "Zero Trust entre redes",
    description: "Mesmo dentro de VPN/PrivateLink, cada chamada ainda é autenticada e autorizada — a rede privada não substitui a identidade.",
    tag: "Zero Trust",
  },
  {
    title: "mTLS por parceiro",
    description: "Certificado de cliente único por parceiro, validado na camada de transporte antes mesmo do token OAuth2 ser checado.",
    tag: "Transporte",
  },
  {
    title: "Resource policy no Gateway",
    description: "Allowlist explícita de VPC endpoints/VPCs autorizadas — um Gateway 'privado' mal configurado ainda pode aceitar qualquer VPC.",
    tag: "IAM",
  },
  {
    title: "Rate limiting por client_id",
    description: "Cada parceiro tem uma quota independente, evitando que um cliente mal comportado afete os demais.",
    tag: "Throttling",
  },
  {
    title: "Rotação de JWKS",
    description: "Chave pública do IdP cacheada com respeito à rotação — nunca fixada para sempre no validador de JWT.",
    tag: "Segurança",
  },
];

export function randomToken(prefix: string): string {
  const chars = "abcdef0123456789";
  let out = "";
  for (let i = 0; i < 24; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}.${out}`;
}
