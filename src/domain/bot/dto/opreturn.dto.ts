import { TextInputValue } from '@discord-nestjs/core'

export class OpReturnDTO {
  @TextInputValue()
  opreturn_message: string
}
