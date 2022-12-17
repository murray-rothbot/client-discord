import { Test, TestingModule } from '@nestjs/testing'
import { OpreturnCommand } from '../opreturn.command'

describe('OpreturnCommand', () => {
  let service: OpreturnCommand

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpreturnCommand],
      providers: [],
    }).compile()

    service = module.get(OpreturnCommand)
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
