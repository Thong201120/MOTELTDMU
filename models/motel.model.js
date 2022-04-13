const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var MotelModelSchema = new Schema({
    userid: {type: String},
    userstatus: {type: Number, default: 1},
    title: {type: String},
    description: {type: String},
    streetName: {type: String},
    wards: {type: String},
    district: {type: String},
    cost: {type: Number, default: 0},
    water: {type: Number, default: 0},
    electric: {type: Number, default: 0},
    roomType: {type: String, default: 'Không có gác'},
    ultilities: {type: String, default: ''},
    uploadImage: {type: String, default: 'null'},
    Image1: {type: String, default: 'null'},
    Image2: {type: String, default: 'null'},
    Image3: {type: String, default: 'null'},
    Image4: {type: String, default: 'null'},
    time: {type: Date, default: Date.now},
    status: {type: Number, default: 0}
});

module.exports = mongoose.model('motel', MotelModelSchema);