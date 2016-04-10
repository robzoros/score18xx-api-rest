var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var juegoSchema = new Schema({  
    _id:            { type: String },
    _name:          { type: String },
    description:    { type: String },
    usuario:        { type: String },
    companies:      [{ type: String }]
});

module.exports = mongoose.model('Juego', juegoSchema); 