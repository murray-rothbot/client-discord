export interface PriceBodyDto {
  brl: {
    priceChangePercent: number
    lastPrice: number
    formattedLastPrice: string
  }
  usd: {
    priceChangePercent: number
    lastPrice: number
    formattedLastPrice: string
  }
}
