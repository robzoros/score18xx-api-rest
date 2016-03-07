var mongoose = require('mongoose'),
    Juego = require('../models/juego.js')
    Schema   = mongoose.Schema;

var partidaSchema = new Schema({  
    nombre:     { type: String },
    jugadores:  { type: Number },
    juego:      { type: Object },
    loc:        { type: String },
    fecha:      { type: Date }
});

module.exports = mongoose.model('Partida', partidaSchema); 