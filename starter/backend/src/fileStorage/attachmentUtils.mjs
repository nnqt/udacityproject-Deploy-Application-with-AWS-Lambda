import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('image-file-storage')

export class S3Attachment {
  constructor(bucketName = process.env.IMAGES_S3_BUCKET) {
    this.bucketName = bucketName
  }

  async getAttachmentUrl(todoId) {
    try {
      logger.info(`Generating upload url for todoId: ${todoId}`)
      const url = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`

      return url
    } catch {
      logger.error(`Error generate upload url for todoId ${todoId}`)
      throw error
    }
  }
}
