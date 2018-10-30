const expect = require("expect"),
    request = require("supertest"),
    { ObjectID } = require("mongodb");

const { app } = require("./../server"),
    { Todo } = require("./../models/todo");

const todos = [{
    _id: new ObjectID(),
    text: "First test todo"
}, {
    _id: new ObjectID(),
    text: "Second test todo",
    completed: true,
    completedAt: 333
}];

beforeEach((done) => {
    Todo.deleteMany({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe("POST /todos", () => {
    it("should create a new todo", (done) => {
        const text = "Test todo text";

        request(app)
            .post("/todos")
            .send({
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                })
                .catch((err) => done(err));
            });
    });

    it("should not create todo with invalid body data", (done) => {
        request(app)
            .post("/todos")
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                })
                .catch((err) => done(err));
            });
    });
});

describe("GET /todos", () => {
    it("should get all todos", (done) => {
        request(app)
            .get("/todos")
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe("GET /todos/:id", () => {
    it("should return todo doc", (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it("should return a 404 if todo not found", (done) => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it("should return a 404 for non-object IDs", (done) => {
        request(app)
            .get("/todos/123")
            .expect(404)
            .end(done);
    });
});

describe("DELETE /todos/:id", () => {
    it("should remove a todo", (done) => {
        request(app)
            .delete(`/todos/${todos[1]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(todos[1]._id.toHexString());
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                };

                Todo.findById(todos[1]._id.toHexString()).then((todo) => {
                    expect(todo).toBeFalsy();
                    done();
                }).catch((err) => done(err));
            });
    });

    it("should return a 404 if todo not found", (done) => {
        request(app)
            .delete(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it("should return a 404 for non-object IDs", (done) => {
        request(app)
            .delete("/todos/123")
            .expect(404)
            .end(done);
    });
});

describe("PATCH /todos/:id", () => {
    it("should update a todo", (done) => {
        const text = "Update from test";

        request(app)
            .patch(`/todos/${todos[1]._id.toHexString()}`)
            .send({
                text,
                "completed": true
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(typeof res.body.todo.completedAt).toBe("number");
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                };

                Todo.findById(todos[1]._id.toHexString()).then((todo) => {
                    expect(todo.text).toBe(text);
                    expect(todo.completed).toBe(true);
                    expect(typeof todo.completedAt).toBe("number");
                    done();
                }).catch((err) => done(err));
            });
    });

    it("should clear completedAt when todo is not completed", (done) => {
        const text = "Update from test";

        request(app)
            .patch(`/todos/${todos[1]._id.toHexString()}`)
            .send({
                text,
                "completed": false
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBeFalsy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                };

                Todo.findById(todos[1]._id.toHexString()).then((todo) => {
                    expect(todo.text).toBe(text);
                    expect(todo.completed).toBe(false);
                    expect(todo.completedAt).toBeFalsy();
                    done();
                }).catch((err) => done(err));
            });
    });
})
