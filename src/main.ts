import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { i18nConfig } from './config/i18n.config'
import { GenericExceptionsFilter, HttpExceptionFilter } from './shared/filters'
import { ResponseInterceptor } from './shared/interceptors'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const cfgService = app.get(ConfigService)
  const APPLICATION_NAME = cfgService.get<number>('APPLICATION_NAME')
  const PORT = cfgService.get<number>('APPLICATION_PORT', 3000)
  const NODE_ENV = cfgService.get<string>('NODE_ENV', 'LOCAL')

  await i18nConfig(app)

  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new GenericExceptionsFilter(app.get(HttpAdapterHost)))
  app.useGlobalFilters(new HttpExceptionFilter())

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  await app.listen(PORT).then(() => {
    Logger.log(`:: 🚀 ${APPLICATION_NAME} :: ${NODE_ENV} ::`)
    Logger.log(`:: 💡 Running on port ${PORT} ::`)
  })
}
bootstrap()
