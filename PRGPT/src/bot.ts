import {info, warning} from '@actions/core'
import OpenAI from 'openai'
import pRetry from 'p-retry'
import {OpenAIOptions, Options} from './options'

export interface Ids {
  parentMessageId?: string
  conversationId?: string
}

export class Bot {
  private readonly api: OpenAI
  private readonly options: Options
  private readonly openaiOptions: OpenAIOptions

  constructor(options: Options, openaiOptions: OpenAIOptions) {
    this.options = options
    this.openaiOptions = openaiOptions
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      this.api = new OpenAI({apiKey})
    } else {
      const err =
        "Unable to initialize the OpenAI API, 'OPENAI_API_KEY' environment variable is not available"
      throw new Error(err)
    }
  }

  chat = async (message: string, ids: Ids): Promise<[string, Ids]> => {
    let res: [string, Ids] = ['', {}]
    try {
      res = await this.chat_(message, ids)
      return res
    } catch (e: any) {
      warning(`Failed to chat: ${e}, backtrace: ${e.stack}`)
      return res
    }
  }

  private readonly chat_ = async (
    message: string,
    ids: Ids
  ): Promise<[string, Ids]> => {
    const start = Date.now()
    if (!message) {
      return ['', {}]
    }

    let responseText = ''

    try {
      const currentDate = new Date().toISOString().split('T')[0]
      const systemMessage = `${this.options.systemMessage} 
Knowledge cutoff: ${this.openaiOptions.tokenLimits.knowledgeCutOff}
Current date: ${currentDate}

IMPORTANT: Entire response must be in the language with ISO code: ${this.options.language}
`

      const result = await pRetry(
        async () => {
          const res = await this.api.chat.completions.create({
            model: this.openaiOptions.model,
            temperature: this.options.openaiModelTemperature,
            messages: [
              {role: 'system', content: systemMessage},
              {role: 'user', content: message}
            ]
          })

          if (res.choices.length > 0 && res.choices[0].message?.content) {
            return res.choices[0].message.content
          }
          return ''
        },
        {
          retries: this.options.openaiRetries
        }
      )

      responseText = result
    } catch (e: any) {
      info(`failed to send message to openai: ${e}, backtrace: ${e.stack}`)
    }

    const end = Date.now()
    info(
      `openai sendMessage (including retries) response time: ${end - start} ms`
    )

    if (responseText === '') {
      warning('openai response is empty')
    }

    if (responseText.startsWith('with ')) {
      responseText = responseText.substring(5)
    }

    if (this.options.debug) {
      info(`openai responses: \n${responseText}`)
    }

    const newIds: Ids = {
      parentMessageId: Math.random().toString(36).substring(7),
      conversationId:
        ids.conversationId || Math.random().toString(36).substring(7)
    }
    return [responseText, newIds]
  }
}
