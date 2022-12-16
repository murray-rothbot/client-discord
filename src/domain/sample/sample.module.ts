import { Module } from '@nestjs/common'
import { SampleService } from './sample.service'
import { SampleController } from './sample.controller'
import { HttpModule } from '@nestjs/axios'
import { SampleRepository } from './sample.repository'

@Module({
  controllers: [SampleController],
  imports: [HttpModule],
  providers: [SampleService, SampleRepository],
})
export class SampleModule {}
