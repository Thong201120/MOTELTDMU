const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var ReplyModelSchema = new Schema({
    title: {type: String, default: ''},
    content: {type: String, default: ''},
    userid: {type: String, default: ''},
    adminid: {type: String, default: ''},
    contactid: {type: String, default: ''},
    time: {type: Date, default: Date.now},
});

module.exports = mongoose.model('reply', ReplyModelSchema);