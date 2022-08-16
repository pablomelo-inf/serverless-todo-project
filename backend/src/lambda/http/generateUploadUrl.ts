import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import * as AWS  from 'aws-sdk'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const bucketName = process.env.ATTACHMENT_S3_BUCKET;
//const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const s3 = new AWS.S3({
    signatureVersion: 'v4'
  });

const logger = createLogger('createTodoHandler')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId


    logger.info('ATTACHMENT_S3_BUCKET', event)

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId =   getUserId(event); 
    const uploadUrl = await getPressignUrl(todoId);
    await createAttachmentPresignedUrl(userId,todoId)

    return {
        statusCode: 200,     
        body: JSON.stringify({
            uploadUrl
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


  function getPressignUrl(todoId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: 300
    })
  };
