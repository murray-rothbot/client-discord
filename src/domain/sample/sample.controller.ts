import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { SampleService } from './sample.service'
import { CreateSampleDto } from './dto/create-sample.dto'
import { UpdateSampleDto } from './dto/update-sample.dto'
import { SampleRequestDto } from './dto'
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger'
import { SampleResponseDto } from './dto/response-sample.dto'

@Controller('sample')
@ApiTags('sample')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Post()
  create(@Body() createSampleDto: CreateSampleDto) {
    return this.sampleService.create(createSampleDto)
  }

  @Get()
  findAll() {
    return this.sampleService.findAll()
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.sampleService.findOne(+id)
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSampleDto: UpdateSampleDto) {
    return this.sampleService.update(+id, updateSampleDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sampleService.remove(+id)
  }

  @ApiQuery({
    name: 'symbol',
    example: 'BTCBRL',
  })
  @ApiOkResponse({ type: SampleResponseDto })
  @Get('/ticker')
  async getTicker(@Query() params: SampleRequestDto): Promise<SampleResponseDto> {
    return this.sampleService.getTicker(params)
  }
}
