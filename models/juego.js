var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var juegoSchema = new Schema({  
    _id:            { type: String },
    _nombre:        { type: String },
    description:    { type: String },
    companies:      [{ type: String }]
});

module.exports = mongoose.model('Juego', juegoSchema); 