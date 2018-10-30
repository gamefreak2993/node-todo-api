const mongoose = require("mongoose"),
    validator = require("validator"),
    jwt = require("jsonwebtoken"),
    _ = require("lodash");

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

const User = mongoose.model("User", UserSchema);

module.exports = {
    User
}
