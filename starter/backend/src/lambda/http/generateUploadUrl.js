import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getAndUpdateAttachmentUrl} from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'

const logger = createLogger("Gerenate Upload Url")

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const url = await getAndUpdateAttachmentUrl(userId, todoId)

    logger.info("Gerenate upload url successfully")
    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: url })
    }
  })
