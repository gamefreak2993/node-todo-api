# Node Todo API
Node API to manage to-dos with authenticated users.
## Installation
### Requirements
You'll need to have [**Git**](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [**Node.js**](https://nodejs.org/en/) installed.
### Getting Started
In your terminal, `git clone https://github.com/gamefreak2993/node-todo-api.git` in your directory of choice.

`cd node-todo-api` and `npm install` to install all the project dependencies.

`node server/server.js` will start the server.

View more scripts (tests included) in [**package.json**](https://github.com/gamefreak2993/node-todo-api/blob/master/package.json)
### Create your user and to-dos
A program like [**Postman**](https://www.getpostman.com/) will be extremely helpful to handle your requests.

#### Current routes are:
* **GET /todos** `Content-Type: application/json`, `x-auth: [PROVIDED_TOKEN]`;
* **GET /todos/:id** `Content-Type: application/json`, `x-auth: [PROVIDED_TOKEN]`;
* **POST /todos** `Content-Type: application/json`, `x-auth: [PROVIDED_TOKEN]`,
`{ "text": "Be awesome!" }` (this is just an example body);
* **PATCH /todos/:id** `Content-Type: application/json`, `x-auth: [PROVIDED_TOKEN]`,
`{ "completed": true }` (this is just an example body);
* **DELETE /todos/:id** `Content-Type: application/json`, `x-auth: [PROVIDED_TOKEN]`,
`{ "text": "Be awesome!" }` (this is just an example body -- Delete the body with the provided text);
* **POST /users** `Content-Type: application/json`,
`{ "email": "email@example.com", "password": "password123" }` (this is just an example body);
* **GET /users/me** `Content-Type: application/json`, `x-auth: [PROVIDED_TOKEN]`;
* **DELETE /users/me/token** `Content-Type: application/json`, `x-auth: [PROVIDED_TOKEN]` (You will be logged out and previously provided token will be deleted);
* **POST /users/login** `Content-Type: application/json`,
`{ "email": "email@example.com", "password": "password123" }` (this is just an example body -- You will be provided with a new token after logging out);
## License
Node Todo API is Copyright &copy; 2018 Mihai Vărșăndan. View terms in the [**LICENSE**](https://github.com/gamefreak2993/node-todo-api/blob/master/LICENSE.txt) file.