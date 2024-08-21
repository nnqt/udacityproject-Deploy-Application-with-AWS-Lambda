import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { updateTodo } from '../../businessLogic/todos.mjs'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger("Update Todo")

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const todoId = event.pathParameters.todoId
    const updates = JSON.parse(event.body)
    const userId = getUserId(event)
    const result = await updateTodo(userId, todoId, updates)

    logger.info("Update todo successfully")
    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  })
