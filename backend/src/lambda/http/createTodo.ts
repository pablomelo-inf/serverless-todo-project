import 'source-map-support/register'
import { APIGatewayProxyEvent,  APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const logger = createLogger('createTodoHandler')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {    

      logger.info('Authorizing a user', event)

      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      const userId =   getUserId(event); 
      
      logger.info('create todo ini..', event)
      logger.info('create new todo', newTodo)

      const item = await createTodo( newTodo, userId)
  
      return{
        statusCode: 201,
        body: JSON.stringify({
          item
        })
      }
    }
)
handler.use(
  cors({
    credentials: true
  })
)