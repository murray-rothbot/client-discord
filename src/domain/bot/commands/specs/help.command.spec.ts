import { Test, TestingModule } from '@nestjs/testing'
import { HelpCommand } from '../help.command'

describe('HelpCommand', () => {
  let service: HelpCommand

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelpCommand],
      providers: [],
    }).compile()

    service = module.get(HelpCommand)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('handler', () => {
    it('should', () => {})
  })
})
