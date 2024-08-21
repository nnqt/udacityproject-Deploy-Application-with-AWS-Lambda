import { DynamoDB} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { createLogger } from '../utils/logger.mjs'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import AWSXRay from 'aws-xray-sdk-core';

const logger = createLogger('todo-data-layer')

export class TodoAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    s3Client = AWSXRay.captureAWSv3Client(new S3Client()),
    todosTable = process.env.TODOS_TABLE,
    createAtIndex = process.env.TODOS_CREATED_AT_INDEX,
    imageS3Bucket = process.env.IMAGES_S3_BUCKET,
    urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {
    this.documentClient = documentClient
    this.todosTable = todosTable
    this.createAtIndex = createAtIndex
    this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
    this.imageS3Bucket = imageS3Bucket
    this.s3Client = s3Client
    this.urlExpiration = urlExpiration
  }

  async createTodo(todo) {
    try {
      await this.dynamoDbClient.put({
        TableName: this.todosTable,
        Item: todo
      })
      return todo
    } catch (error) {
      logger.error('Error creating todo at data layer', {
        message: error.message
      })
      throw error
    }
  }

  async getAllTodos(userId) {
    try {
      const result = await this.dynamoDbClient.query({
        TableName: this.todosTable,
        IndexName: this.todosIndex,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId,
        },
    });

      return result.Items
    } catch (error) {
      logger.error('Error getting all todo by userId at data layer', {
        message: error.message
      })
      throw error
    }
  }

  async updateTodo(userId, todoId, updates) {
    try {
      const updateExpressionParts = []
      const expressionAttributeValues = {}
      const expressionAttributeNames = {}

      Object.keys(updates).forEach((key, index) => {
        const attributeName = `#attr${index}`
        const attributeValue = `:val${index}`

        updateExpressionParts.push(`${attributeName} = ${attributeValue}`)
        expressionAttributeNames[attributeName] = key
        expressionAttributeValues[attributeValue] = updates[key]
      })

      const updateExpression = `set ${updateExpressionParts.join(', ')}`

      const params = {
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW'
      }
      const result = await this.dynamoDbClient.update(params)

      return result.Attributes
    } catch (error) {
      logger.error('Error updating todo at data layer', {
        message: error.message
      })
      throw error
    }
  }

  async deleteTodo(userId, todoId) {
    try {
      const params = {
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      }
      await this.dynamoDbClient.delete(params)

      return {}
    } catch (error) {
      logger.error('Error deleting todo at data layer', {
        message: error.message
      })
      throw error
    }
  }

  async getPresignedUrl(todoId) {
    try {
      logger.info('Getting attachment presigned url')
      const command = new PutObjectCommand({
        Bucket: this.imageS3Bucket,
        Key: todoId
      })

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: this.urlExpiration
      })
      return url
    } catch (error) {
      logger.error('Error get and update presigned url', {
        message: error.message
      })
      throw error
    }
  }
}
