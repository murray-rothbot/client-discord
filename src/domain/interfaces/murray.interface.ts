export interface InvoiceTip {
  num_satoshis: number
  user: any
}

export interface InvoiceTipResponse {
  data: {
    payment_request: string
  }
}
