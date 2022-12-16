import { HttpModule } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { SampleRequestDto } from './../dto'
import { SampleResponseDto } from './../dto/response-sample.dto'
import { SampleController } from './../sample.controller'
import { SampleRepository } from './../sample.repository'
import { SampleService } from './../sample.service'

const SampleRepositoryMock = {
  getTicker({ symbol }) {
    if (symbol === 'INVALID') {
      throw new Error()
    }

    return {
      lastPrice: 10,
      symbol,
    }
  },
}

describe('SampleController', () => {
  let controller: SampleController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SampleController],
      providers: [
        SampleService,
        {
          provide: SampleRepository,
          useValue: SampleRepositoryMock,
        },
      ],
      imports: [HttpModule],
    }).compile()

    controller = module.get<SampleController>(SampleController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('ticker', () => {
    for (let test_symbol of ['BTCBRL', 'BTCUSDT']) {
      it(`should return price for ${test_symbol}`, async () => {
        const request = new SampleRequestDto()
        request.symbol = test_symbol

        const response: SampleResponseDto = await controller.getTicker(request)
        expect(response.symbol).toBe(test_symbol)
      })
    }

    it(`invalid symbol should throw exception`, async () => {
      const request = new SampleRequestDto()
      request.symbol = 'INVALID'

      await expect(controller.getTicker(request)).rejects.toThrow()
    })
  })
})
