import 'source-map-support/register'
//import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { APIGatewayProxyEvent,  APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
//import {getUserId} from '../utils';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
//import {createTodo} from '../../businessLogic/todos';

const logger = createLogger('auth')

export const handler = 
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {    

      logger.info('Authorizing a user', event)

      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      const userId =  '1234'//getUserId(event); 

      // TODO: Implement creating a new TODO item

      console.log('create todo ini..')
      console.log(newTodo)

      const newItemTodo = await createTodo( newTodo, userId)
  
      return{
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          newItemTodo
        })
      }
    }
  
//   handler.use(
//     cors({
//       credentials: true
//     })
//   )

/*export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const logger = createLogger('createTodoHandler');
  console.log(event)  

  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const currentUserId = getUserId(event);

  try {
    const item = await createTodo(newTodo, currentUserId);
    logger.info('Item Created', item);

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        item
      })
    }
  } catch (err) {
    logger.info('Failed to create Todo Item', err);
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: 'Failed to create Todo Item',
    }
  }
}*/