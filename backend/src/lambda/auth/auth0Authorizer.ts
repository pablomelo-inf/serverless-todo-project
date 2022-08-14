import { CustomAuthorizerEvent, CustomAuthorizerResult,CustomAuthorizerHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'
//import { Jwt } from '../../auth/Jwt'

//const auth0Secret = process.env.AUTH_0_SECRET
const logger = createLogger('auth')
const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

const client = new AWS.SecretsManager()

//Cache secret if a Lambda instance is reused
let cachedSecret: string


export const handler: CustomAuthorizerHandler =async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  
  // logger.info('authHeader a user', event)
  try{
    const decodedToken  = await verifyToken(event.authorizationToken)
    //console.log('User was authorized');
    logger.info('decodedToken:', decodedToken)
    

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

async function verifyToken(authHeader: string): Promise<JwtToken> {

  if (!authHeader) 
    throw new Error("No authorization header");   

  if(!authHeader.toLocaleLowerCase().startsWith('bearer '))
     throw new Error("Invalid authorization header");

  const split = authHeader.split(' ')
  const token = split[1]

  //logger.info('secret a secretID', secretId)
  const secretObject: any =await getSecret()
  const secret = secretObject[secretField]
  //logger.info('secret a secretObject:', secretObject)
  //logger.info('token a user', token)
  return verify(token, secret) as JwtToken
     

}

async function getSecret(){
  if(cachedSecret) return cachedSecret

  const data = await client
        .getSecretValue({
          SecretId: secretId
        })
        .promise()
  
  cachedSecret = data.SecretString
  logger.info('cachedSecret a user', cachedSecret)

  return JSON.parse(cachedSecret)
}


/*
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

TODO: Provide a URL that can be used to download a certificate that can be used
to verify JWT token signature.
To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = '...'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
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
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
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

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  console.log(token)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return undefined
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
*/