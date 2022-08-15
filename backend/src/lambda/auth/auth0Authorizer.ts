import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'
//import { Jwt } from '../../auth/Jwt'


const logger = createLogger('auth')

import * as middy from 'middy'
import {secretsManager} from 'middy/middlewares'


const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

export const handler =  middy(
 async (event: CustomAuthorizerEvent,
        context    
  ): Promise<CustomAuthorizerResult> => {
  
  // logger.info('authHeader a user', event)
  try{
    const decodedToken  = verifyToken(
      event.authorizationToken,
      context.AUTH0_SECRET[secretField]
    )
    //console.log('User was authorized');
    logger.info('User was authorized', decodedToken)
    

    return{
      principalId: decodedToken.sub,
      policyDocument:{
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }

  }catch(e){
    // console.log('User was not authorized', e.message)
    // logger.info('Exception:', e.message)
    logger.info('Exception:', e)
    return{
      principalId: 'user',
      policyDocument:{
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }

  }
}
)


function verifyToken(authHeader: string, secret: string): JwtToken {

  if (!authHeader) 
    throw new Error("No authorization header");   

  if(!authHeader.toLocaleLowerCase().startsWith('bearer '))
     throw new Error("Invalid authorization header");

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, secret) as JwtToken    

}


handler.use(
  secretsManager({
    cache: true,
    cacheExpiryInMillis: 60000,
    throwOnFailedCall: true,
    secrets: {
      AUTH0_SECRET: secretId
    }
  })
)

/*async function getSecret(){
 // if(cachedSecret) return cachedSecret
 logger.info('token a user', cachedSecret)
  const data = await client
        .getSecretValue({
          SecretId: secretId
        })
        .promise()
  
  cachedSecret = data.SecretString
  logger.info('cachedSecret a user', cachedSecret)

  return JSON.parse(cachedSecret)
}*/