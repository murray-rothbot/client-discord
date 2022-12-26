import { NumbersService } from './numbers.service'
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common'

@Module({
  imports: [],
  controllers: [],
  providers: [NumbersService],
})
export class NumbersModule {}
