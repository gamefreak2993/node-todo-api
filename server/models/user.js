const mongoose = require("mongoose"),
    validator = require("validator"),
    jwt = require("jsonwebtoken"),
    _ = require("lodash"),
    bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 5,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "{VALUE} is not a valid email"
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function() {
    const user = this,
        userObject = user.toObject();

    return _.pick(userObject, ["_id", "email"]);
};

UserSchema.methods.generateAuthToken = function() {
    const user = this,
        access = "auth",
        token = jwt.sign({_id: user._id.toHexString(), access}, "salt").toString();

    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() => token);
};

UserSchema.statics.findByToken = function(token) {
    const User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, "salt");
    } catch (err) {
        return Promise.reject(err);
    };

    return User.findOne({
        "_id": decoded._id,
        "tokens.token": token,
        "tokens.access": "auth"
    });
};

UserSchema.pre("save", function(next) {
    const user = this;

    if (user.isModified("password")) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    };
});

const User = mongoose.model("User", UserSchema);

User.createIndexes();

module.exports = {
    User
}
