export interface Startup {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  sector: string;
  country: string;
  valuation: number;
  minInvestment: number;
}

export const mockStartups: Startup[] = [
  {
    id: "startup-1",
    name: "QuantumLeap AI",
    logoUrl: "https://picsum.photos/seed/logo1/100/100",
    description: "Developing next-generation quantum computing algorithms for financial modeling. Potential to revolutionize trading strategies.",
    sector: "FinTech",
    country: "United States",
    valuation: 50_000_000,
    minInvestment: 250_000,
  },
  {
    id: "startup-2",
    name: "BioSynth",
    logoUrl: "https://picsum.photos/seed/logo2/100/100",
    description: "AI-driven platform for rapid drug discovery and personalized medicine. Aims to reduce R&D costs by 50%.",
    sector: "HealthTech",
    country: "Germany",
    valuation: 120_000_000,
    minInvestment: 500_000,
  },
  {
    id: "startup-3",
    name: "AgriGrow",
    logoUrl: "https://picsum.photos/seed/logo3/100/100",
    description: "IoT and drone technology for precision agriculture. Increases crop yield and reduces water consumption.",
    sector: "AgriTech",
    country: "India",
    valuation: 25_000_000,
    minInvestment: 50_000,
  },
  {
    id: "startup-4",
    name: "CyberSecure",
    logoUrl: "https://picsum.photos/seed/logo4/100/100",
    description: "Decentralized cybersecurity solution using blockchain to protect against DDoS attacks and data breaches.",
    sector: "Cybersecurity",
    country: "Israel",
    valuation: 80_000_000,
    minInvestment: 100_000,
  },
  {
    id: "startup-5",
    name: "EduVerse",
    logoUrl: "https://picsum.photos/seed/logo5/100/100",
    description: "Immersive VR and AR learning experiences for K-12 and higher education. Personalized and engaging content.",
    sector: "EdTech",
    country: "United Kingdom",
    valuation: 40_000_000,
    minInvestment: 75_000,
  },
  {
    id: "startup-6",
    name: "HelioDrive",
    logoUrl: "https://picsum.photos/seed/logo6/100/100",
    description: "Innovations in perovskite solar cell technology, aiming for higher efficiency and lower production costs.",
    sector: "CleanTech",
    country: "China",
    valuation: 200_000_000,
    minInvestment: 1_000_000,
  },
];
