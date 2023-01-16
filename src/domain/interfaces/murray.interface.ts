export interface InvoiceTip {
  num_satoshis: number
  user: object
}

export interface InvoiceTipResponse {
  data: {
    payment_request: string
  }
}
