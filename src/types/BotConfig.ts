export interface BotConfig {
  symbols: string[];
  amountPerTrade: number;
  duration?: number;
  candleInterval?: string;
  strategy?: string;
}
