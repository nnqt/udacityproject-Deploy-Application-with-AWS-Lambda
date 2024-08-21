import * as uuid from 'uuid'
import { TodoAccess } from '../dataLayer/todosAccess.mjs'
import { S3Attachment } from '../fileStorage/attachmentUtils.mjs'
import { createLogger } from '../utils/logger.mjs'

const todosAccess = new TodoAccess()
const s3Attachment = new S3Attachment()
const logger = createLogger("todo-business-logic")

export async function createTodo (createTodoRequest, userId, attachmentUrl) {
    try {
        logger.info("Creating todo for user: ", {userId})

        const todoId = uuid.v4()
        const createAt = new Date().toISOString()
        const attachmentUrl = await s3Attachment.getAttachmentUrl(todoId)
    
        return await todosAccess.createTodo({
            todoId,
            userId,
            attachmentUrl: attachmentUrl || null,
            dueDate: createTodoRequest.dueDate,
            createdAt: createAt,
            name: createTodoRequest.name,
            done: false
        })
    } catch (error) {
        logger.error("Error when create todo: ", {userId, error})
        throw error
    }

}

export async function getAllTodos(userId) {
    try {
        logger.info("Getting all todos of user: ", {userId})
        return await todosAccess.getAllTodos(userId)
    } catch (error) {
        logger.error("Error when get all todos by userId", {userId, error})
        throw error      
    }
}

export async function updateTodo(userId, todoId, updates) {
    try {
        logger.info("Updating todo by todoId", {userId, todoId})
        return await todosAccess.updateTodo(userId, todoId, updates)
    } catch (error) {
        logger.error("Error when update todo by todoId", {userId, todoId, error})
        throw error
    }
}

export async function deleteTodo(userId, todoId) {
    try {
        logger.info("Deleting todo by todoId", {userId, todoId})
        return await todosAccess.deleteTodo(userId, todoId)
    } catch (error) {
        logger.error("Error when delete todo by todoId", {userId, todoId, error})
        throw error
    }
}

export async function getAndUpdateAttachmentUrl(userId, todoId) {
    try {
        logger.info("Getting Presigned URL by todoId", { todoId})
        const url = await todosAccess.getPresignedUrl( todoId)
        logger.info("Update Attachment Url")
        await updateTodo(userId, todoId, {attachmentUrl: url.split('?')[0]})
        return url
    } catch (error) {
        logger.error("Error when get presigned url", {todoId, error})
        throw error
    }
}