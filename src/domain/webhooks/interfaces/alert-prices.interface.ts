export interface IAlertPrice {
  id: number
  userId: string
  userInfo: string
  currency: string
  currentPrice: number
  price: number
  above: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}
