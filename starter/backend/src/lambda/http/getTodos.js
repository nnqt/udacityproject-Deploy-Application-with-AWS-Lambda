import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getAllTodos } from '../../businessLogic/todos.mjs'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger("Get Todos")

export const handler = middy()
.use(httpErrorHandler())
.use(
  cors({
    credentials: true
  })
)
.handler(async (event) => {
  const userId = getUserId(event)
  const todos = await getAllTodos(userId)

  logger.info("Get todos successfully")

  return { 
    statusCode: 200,
    body: JSON.stringify({
      items: todos
    })
  }
})
