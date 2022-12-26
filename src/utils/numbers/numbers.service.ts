/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common'

@Injectable()
export class NumbersService {
  kFormatter(num: number): any {
    return Math.abs(num) > 999
      ? (Math.sign(num) * (Math.abs(num) / 1000)).toFixed(1) + 'k'
      : Math.sign(num) * Math.abs(num)
  }

  formatter = new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
  })

  formatterUSD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  formatterBRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
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
