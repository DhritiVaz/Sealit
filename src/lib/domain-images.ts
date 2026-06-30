export const DOMAIN_GRADIENTS: Record<string, string> = {
  Health: "linear-gradient(135deg, #1B3A6B 0%, #4A90D9 100%)",
  "Dev Tools": "linear-gradient(135deg, #0A0A0A 0%, #434343 100%)",
  AgriTech: "linear-gradient(135deg, #2D6A4F 0%, #95D5B2 100%)",
  FinTech: "linear-gradient(135deg, #1B3A6B 0%, #52B788 100%)",
  EdTech: "linear-gradient(135deg, #7B2D8B 0%, #C77DFF 100%)",
  LegalTech: "linear-gradient(135deg, #444440 0%, #888884 100%)",
  Climate: "linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)",
  Accessibility: "linear-gradient(135deg, #B45309 0%, #FBBF24 100%)",
  Housing: "linear-gradient(135deg, #BE123C 0%, #FB7185 100%)",
  Infrastructure: "linear-gradient(135deg, #434343 0%, #9CA3AF 100%)",
  "Civic Tech": "linear-gradient(135deg, #0369A1 0%, #38BDF8 100%)",
  "Mental Health": "linear-gradient(135deg, #7B2D8B 0%, #E879F9 100%)",
  CleanTech: "linear-gradient(135deg, #2D6A4F 0%, #52B788 100%)",
  Other: "linear-gradient(135deg, #1B3A6B 0%, #4A90D9 100%)",
};

export function getDomainGradient(domain: string): string {
  return DOMAIN_GRADIENTS[domain] ?? "linear-gradient(135deg, #1B3A6B 0%, #4A90D9 100%)";
}
