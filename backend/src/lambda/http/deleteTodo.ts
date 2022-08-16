import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

import { deleteTodo } from '../../helpers/todos'
import { getUserId } from '../utils'
const logger = createLogger('deleteTodoHandler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const userId =   getUserId(event); 
    const todoDeleted = await deleteTodo(userId, todoId)
    logger.info('todo deleted', todoDeleted)

    return{
        statusCode: 201,
        body: JSON.stringify({
          todoDeleted
        })
      }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
