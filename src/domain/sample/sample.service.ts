import { Injectable } from '@nestjs/common'
import { SampleRequestDto } from './dto'
import { CreateSampleDto } from './dto/create-sample.dto'
import { SampleResponseDto } from './dto/response-sample.dto'
import { UpdateSampleDto } from './dto/update-sample.dto'
import { SampleRepository } from './sample.repository'

@Injectable()
export class SampleService {
  constructor(private readonly repository: SampleRepository) {}

  create(createSampleDto: CreateSampleDto) {
    return 'This action adds a new sample'
  }

  findAll() {
    return `This action returns all sample`
  }

  findOne(id: number) {
    return `This action returns a #${id} sample`
  }

  update(id: number, updateSampleDto: UpdateSampleDto) {
    return `This action updates a #${id} sample`
  }

  remove(id: number) {
    return `This action removes a #${id} sample`
  }

  async getTicker(params: SampleRequestDto): Promise<SampleResponseDto> {
    const { lastPrice, symbol } = await this.repository.getTicker(params)
    return { lastPrice, symbol }
  }
}
