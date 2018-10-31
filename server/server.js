require("./config/config");

const express = require("express"),
    bodyParser = require("body-parser"),
    _ = require("lodash");

const { mongoose } = require("./db/mongoose"),
    { ObjectID } = require("mongodb"),
    { Todo } = require("./models/todo"),
    { User } = require("./models/user"),
    { authenticate } = require("./middleware/authenticate");

const app = express(),
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

app.delete("/todos/:id", (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    };

    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        };

        res.send({todo});
    }).catch((err) => {
        res.status(400).send();
    });
});

app.patch("/todos/:id", (req, res) => {
    const id = req.params.id,
        body = _.pick(req.body, ["text", "completed"]);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    };

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    };

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((err) => {
        res.status(400).send();
    });
});

app.post("/users", (req, res) => {
    const user = new User(_.pick(req.body, ["email", "password"]));

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header("x-auth", token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.get("/users/me", authenticate, (req, res) => {
    res.send(req.user);
});

app.post("/users/login", (req, res) => {
    const body = _.pick(req.body, ["email", "password"]);

    User.findByCredentials(body.email, body.password)
        .then((user) => {
            return user.generateAuthToken().then((token) => {
                res.header("x-auth", token).send(user);
            });
        })
        .catch((err) => {
            res.status(400).send();
        });
})

app.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});

module.exports = {
    app
}
