const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var BookingModelSchema = new Schema({
    user: {type: String},
    wards: {type: String},
    cost: {type: Number, default: 0},
    roomType: {type: String, default: 'Không có gác'},
    description: {type: String, default: ''},
    status: {type: Number, default: 0}
    // status = 0 là chưa trả lời, status = 1 là đã trả lời
});

module.exports = mongoose.model('booking', BookingModelSchema);