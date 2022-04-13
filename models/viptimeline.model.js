const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var VipTimeLineModelSchema = new Schema({
    starttime: {type: Date, default: ''},
    endtime: {type: Date, default: ''},
    userid: {type: String, default: ''},
    name: {type: String, default: ''},
    phone: {type: String, default: ''}
});

module.exports = mongoose.model('viptimeline', VipTimeLineModelSchema);