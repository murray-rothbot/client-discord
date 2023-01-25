/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common'

@Injectable()
export class NumbersService {
  kFormatter(num: number, formatter?: Intl.NumberFormat): any {
    const unity = ['', 'k', 'M', 'B', 'T']
    const digits = Math.floor(Math.log10(Math.abs(num)))
    const reduce_factor = Math.floor(digits / 3)
    const value = Math.abs(num) / 10 ** (reduce_factor * 3)
    const formatted = (formatter || this.formatter).format(value)

    return `${num < 0 ? '-' : ''}${formatted}${unity[reduce_factor]}`
  }

  formatter = new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  formatterUSD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  formatterBRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  formatterBTC = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 8,
  })

  formatterSATS = new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  })

  bytesToSize(bytes: number) {
    const sizes = ['Bytes', 'kb', 'mb', 'gb', 'tb']
    if (bytes == 0) return '0 Byte'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `**${(bytes / Math.pow(1024, i)).toFixed(2)}** ${sizes[i]}`
  }
}
