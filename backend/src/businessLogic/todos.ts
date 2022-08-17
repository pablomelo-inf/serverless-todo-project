import * as uuid from 'uuid'
import { TodosResponse } from '../models/TodoItemsResponse'
import { TodoItem } from '../models/TodoItem';
import { TodoAccess } from '../dataLayer/todosAcess';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todosAccess = new TodoAccess();

export async function getAllTodosByUserId(userId: string, params) : Promise<TodosResponse> {
  return todosAccess.getAllTodosByUserId(userId, params);
}

export async function getTodosForUser(userId: string): Promise<TodosResponse> {
  return await getAllTodosByUserId(userId, {});
}

export async function createTodo(todoItem: CreateTodoRequest, userId: string) : Promise<TodoItem> {
   
    const newTodoId = uuid.v4(); 
    const item : TodoItem = {
      ...todoItem,
      todoId: newTodoId,
      userId,
      createdAt: new Date().toISOString(),
      done: false
    }
  return todosAccess.createTodo(item);
}

export async function updateTodo(userId: string, todoId: string, updateTodo: UpdateTodoRequest) : Promise<UpdateTodoRequest> {
  return todosAccess.updateTodo(userId, todoId, updateTodo);
}

export async function deleteTodo(userId: string, todoId: string) {
  return todosAccess.deleteTodo(userId, todoId);
}

export async function checkTodoExists(currentUserId: string, todoId: string) {
  return todosAccess.checkTodoExists(currentUserId, todoId);
}

export async function getTodoItem(currentUserId: string, todoId: string) {
  return todosAccess.getTodoItem(currentUserId, todoId);
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string) {
  const bucketName = process.env.ATTACHMENT_S3_BUCKET;
  const attachmentUrl =  `https://${bucketName}.s3.amazonaws.com/${todoId}`;
  return todosAccess.addTodoAttachmentUrl(userId, todoId, attachmentUrl);
}