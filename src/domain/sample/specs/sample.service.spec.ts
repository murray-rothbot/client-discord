import { HttpModule } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { SampleRepository } from './../sample.repository'
import { SampleService } from './../sample.service'

describe('SampleService', () => {
  let service: SampleService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SampleService, SampleRepository],
      imports: [HttpModule],
    }).compile()

    service = module.get<SampleService>(SampleService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
