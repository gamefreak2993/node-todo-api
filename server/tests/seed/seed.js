const { ObjectID } = require("mongodb"),
    jwt = require("jsonwebtoken");

const { Todo } = require("./../../models/todo"),
    { User } = require("./../../models/user");

const userOneId = new ObjectID(),
    userTwoId = new ObjectID();

const todos = [{
    _id: new ObjectID(),
    text: "First test todo",
    _creator: userOneId
}, {
    _id: new ObjectID(),
    text: "Second test todo",
    completed: true,
    completedAt: 333,
    _creator: userTwoId
}],
    users = [{
        _id: userOneId,
        email: "themike2993@gmail.com",
        password: "userOnePass",
        tokens: [{
            access: "auth",
            token: jwt.sign({_id: userOneId, access: "auth"}, process.env.JWT_SECRET).toString()
        }]
    }, {
        _id: userTwoId,
        email: "testing@gmail.com",
        password: "userTwoPass",
        tokens: [{
            access: "auth",
            token: jwt.sign({_id: userTwoId, access: "auth"}, process.env.JWT_SECRET).toString()
        }]
    }];

const populateTodos = (done) => {
    Todo.deleteMany({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
},
    populateUsers = (done) => {
        User.deleteMany({}).then(() => {
            const userOne = new User(users[0]).save(),
                userTwo = new User(users[1]).save();

            return Promise.all([userOne, userTwo]);
        }).then(() => done());
    };

module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
}
