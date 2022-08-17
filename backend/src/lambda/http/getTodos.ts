import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodoHandler')

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('event: ', event);
  const userId = getUserId(event);

  const result = await getTodosForUser(userId);
  logger.info('user: ', userId, 'todos: ', result.items);

  if (Array.isArray(result.items) && result.items.length > 0) {
    return {
      statusCode: 200,     
      body: JSON.stringify({
        items: result.items
      })
    }
  }

  return {
    statusCode: 400,
    body: 'There is no todos found for this user'
  }
})

handler.use(
  cors({
    credentials: true
  })
)