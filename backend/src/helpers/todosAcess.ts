import * as AWS  from 'aws-sdk';
import {DocumentClient, GetItemOutput} from 'aws-sdk/clients/dynamodb';

import { TodoItem } from '../models/TodoItem'
import { TodosResponse } from '../models/TodoItemsResponse'
import {UpdateTodoRequest} from '../requests/UpdateTodoRequest';


export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,   
    private readonly todoIdIndex = process.env.TODO_ID_INDEX
  ) {}

  async getAllTodosByUserId(userId: string, params): Promise<TodosResponse> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todoIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      Limit: params.limit,
      ExclusiveStartKey: params.nextKey,
      ScanIndexForward: true 
    }).promise()

    const items = result.Items
    return {
      items: items as TodoItem[],   
      nextKey: encodeNextKey(result.LastEvaluatedKey),
    };
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise();

    return todoItem;
  }

  async updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest) : Promise<UpdateTodoRequest> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': updatedTodo.name,
        ':dueDate': updatedTodo.dueDate,
        ':done': updatedTodo.done,
      },
    }).promise();
    
    return updatedTodo;
  }

  async deleteTodo(userId: string, todoId: string) {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        "todoId": todoId,
        "userId": userId
      }
    }).promise();
  }

  async checkTodoExists(userId: string, todoId: string) {
    const result = await this.getTodoItem(userId, todoId);
    return !!result.Item;
  }

  async getTodoItem(userId: string, todoId: string) : Promise<GetItemOutput> {
    return await this.docClient.get({
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      }
    }).promise();
  }

  async addTodoAttachmentUrl(userId: string, todoId: string, attachmentUrl: string) {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        'todoId': todoId,
        'userId': userId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": attachmentUrl
      }
    }).promise();
  }
}

function encodeNextKey(lastEvaluatedKey) {
  if(!lastEvaluatedKey) {
    return null;
  }

  return encodeURIComponent(JSON.stringify(lastEvaluatedKey));
}