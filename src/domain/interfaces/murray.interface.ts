export interface InvoiceTip {
  satoshis: number
  user: any
}

export interface InvoiceTipResponse {
  data: {
    payment_request: string
  }
}
