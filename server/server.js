const express = require("express"),
    bodyParser = require("body-parser");

const { mongoose } = require("./db/mongoose"),
    { ObjectID } = require("mongodb"),
    { Todo } = require("./models/todo"),
    { User } = require("./models/user");

const app = express()
    port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/todos", (req, res) => {
    const todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get("/todos", (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (err) => {
        if (err) {
            res.status(400).send(err);
        };
    });
});

app.get("/todos/:id", (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    };

    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        };

        res.send({todo});
    }).catch((err) => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});

module.exports = {
    app
}
