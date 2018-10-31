const expect = require("expect"),
    request = require("supertest"),
    { ObjectID } = require("mongodb");

const { app } = require("./../server"),
    { Todo } = require("./../models/todo"),
    { User } = require("./../models/user"),
    { todos, populateTodos, users, populateUsers } = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populateTodos);

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
});

describe("GET /users/me",  () => {
    it("should return user if authenticated", (done) => {
        request(app)
            .get("/users/me")
            .set("x-auth", users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it("should return a 401 if not authenticated", (done) => {
        request(app)
            .get("/users/me")
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe("POST /users", () => {
    it("should create a user", (done) => {
        const email = "example@example.com",
            password = "password123";

        request(app)
            .post("/users")
            .send({
                email,
                password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers["x-auth"]).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                }).catch((err) => done(err));
            });
    });

    it("should return validation error is request is invalid", (done) => {
        const email = "invalidemail",
            password = "pw";

        request(app)
            .post("/users")
            .send({
                email,
                password
            })
            .expect(400)
            .end(done);
    });

    it("should not create a user if email is in use", (done) => {
        const email = users[0].email, // duplicate
            password = "password123";

        request(app)
            .post("/users")
            .send({
                email,
                password
            })
            .expect(400)
            .end(done);
    });
});

describe("POST /users/login", () => {
    it("should login user and return auth token", (done) => {
        request(app)
            .post("/users/login")
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.header["x-auth"]).toBeTruthy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                };

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[0]).toMatchObject({
                        access: "auth",
                        token: res.headers["x-auth"]
                    });
                    done();
                }).catch((err) => done(err));
            });
    });

    it("should reject invalid login", (done) => {
        request(app)
        .post("/users/login")
        .send({
            email: users[1].email,
            password: "invalidpassword"
        })
        .expect(400)
        .expect((res) => {
            expect(res.header["x-auth"]).toBeFalsy();
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            };

            User.findById(users[1]._id).then((user) => {
                expect(user.tokens).toHaveLength(0);
                done();
            }).catch((err) => done(err));
        });
    });
});

describe("DELETE /users/me/token", () => {
    it("should remove auth token on logout", (done) => {
        request(app)
            .delete("/users/me/token")
            .set("x-auth", users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                };

                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens).toHaveLength(0);
                    done();
                }).catch((err) => done(err));
            });
    });
});
