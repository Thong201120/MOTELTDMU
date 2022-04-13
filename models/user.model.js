const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;


var UserModelSchema = new Schema({
    facebook: {
        id: Number,
        token: String,
    },
    google:{
        id: Number,
        token: String
    },
    local: {
        password: String,
        name: {type: String},
        email: {type: String},
    },
    name: {type: String, default: ''},
    email: {type: String, default: ''},
    address: {type: String, default: ''},
    permission: { type: Number, default: 0 },
    countPost: { type: Number, default: 0 },
    phoneNumber: {type: String, default: ''},
    avatar: {type: String, default: '/images/no-avatar.jpeg'},
    status: {type: Number, default: 0},
    money: {type: Number, default: 0},
    resetPasswordToken: String,
    resetPasswordExpires: Date
});


UserModelSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


UserModelSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
}


module.exports = mongoose.model('users', UserModelSchema);