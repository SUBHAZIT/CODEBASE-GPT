import {Probot, Context} from 'probot'
import {Bot} from './bot'
import {OpenAIOptions, Options} from './options'
import {Prompts} from './prompts'
import {codeReview} from './review'
import {handleReviewComment} from './review-comment'

export default (app: Probot) => {
  app.on(
    ['pull_request.opened', 'pull_request.synchronize'],
    async (context: Context<'pull_request.opened' | 'pull_request.synchronize'>) => {
      const repo = context.repo()
      const options = createOptions()
      const prompts = createPrompts()
      const {lightBot, heavyBot} = createBots(options)

      try {
        await codeReview(
          lightBot,
          heavyBot,
          options,
          prompts,
          context,
          repo,
          context.octokit
        )
      } catch (e: any) {
        app.log.error(`Failed to run code review: ${e.message}`)
      }
    }
  )

  app.on(
    'pull_request_review_comment.created',
    async (context: Context<'pull_request_review_comment.created'>) => {
      const repo = context.repo()
      const options = createOptions()
      const prompts = createPrompts()
      const {heavyBot} = createBots(options)

      try {
        await handleReviewComment(
          heavyBot,
          options,
          prompts,
          context,
          repo,
          context.octokit
        )
      } catch (e: any) {
        app.log.error(`Failed to handle review comment: ${e.message}`)
      }
    }
  )
}

function createOptions() {
  return new Options(
    process.env.DEBUG === 'true',
    process.env.DISABLE_REVIEW === 'true',
    process.env.DISABLE_RELEASE_NOTES === 'true'
  )
}

function createPrompts() {
  return new Prompts(
    process.env.SUMMARIZE || '',
    process.env.SUMMARIZE_RELEASE_NOTES || ''
  )
}

function createBots(options: Options) {
  const lightBot = new Bot(
    options,
    new OpenAIOptions(options.openaiLightModel, options.lightTokenLimits)
  )
  const heavyBot = new Bot(
    options,
    new OpenAIOptions(options.openaiHeavyModel, options.heavyTokenLimits)
  )
  return {lightBot, heavyBot}
}
