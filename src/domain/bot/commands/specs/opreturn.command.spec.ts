import { Test, TestingModule } from '@nestjs/testing'
import { OpReturnCommand } from '../op-return.command'

describe('OpreturnCommand', () => {
  let service: OpReturnCommand

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpReturnCommand],
      providers: [],
    }).compile()

    service = module.get(OpReturnCommand)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('handler', () => {
    it('should', () => {})
  })

  describe('onModuleSubmit', () => {
    it('should', () => {})
  })
})
