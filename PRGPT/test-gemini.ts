import * as dotenv from 'dotenv'
import {Bot} from './src/bot.ts'
import {Options, GeminiOptions} from './src/options.ts'
import {TokenLimits} from './src/limits.ts'

dotenv.config()

async function testGemini() {
  const options = new Options(
    true, // debug
    false, // disableReview
    false, // disableReleaseNotes
    '10', // maxFiles
    false, // reviewSimpleChanges
    false, // reviewCommentLGTM
    null, // pathFilters
    'You are a helpful assistant.', // systemMessage
    'gemini-2.0-flash',
    'gemini-2.0-flash',
    '0.7',
    '3',
    '120000',
    '6',
    '6',
    'en-US'
  )

  const geminiOptions = new GeminiOptions(
    options.geminiHeavyModel,
    new TokenLimits(options.geminiHeavyModel)
  )

  try {
    const bot = new Bot(options, geminiOptions)
    console.log('--- Testing Gemini Chat ---')
    console.log('Sending message to Gemini...')
    const [response, ids] = await bot.chat(
      'Hello! Can you confirm you are PRGPT powered by Gemini?',
      {}
    )
    console.log('Response:', response)
    console.log('IDs:', ids)
    console.log('--- Test Successful! ---')
  } catch (error) {
    console.error('--- Test Failed! ---')
    console.error(error)
  }
}

testGemini()
