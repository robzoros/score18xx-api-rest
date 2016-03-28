var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var partidaSchema = new Schema({  
    usuario:    { type: String },
    nombre:     { type: String },
    juego:      { type: Object },
    loc:        { type: String },
    fecha:      { type: Date },
    jugadores:  { type: Object },
    empresas:   { type: Object },
    dividendos: { type: Object }
});

module.exports = mongoose.model('Partida', partidaSchema); 