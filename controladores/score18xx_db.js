var Partida = require('../models/partida.js');
var Juego = require('../models/juego.js');

//POST - Añadir nueva partida
exports.addPartida = function(req, res) {  
    console.log('POST');
    console.log(req.body);

    var part = new Partida({
        nombre:   	req.body.nombre,
        jugadores:      req.body.jugadores,
        juego:    	req.body.juego,
        loc: 		req.body.loc,
        fecha:    	req.body.fecha
    });

    part.save(function(err) {
        if(err) return res.status(500).send( err.message);
        res.status(200).jsonp(part);
    });

};

exports.getJuegos = function(req, res) {  
    console.log('GET /juegos');
    
    Juego.find(function(err, juegos) {
        if(err) res.send(500, err.message);
        res.status(200).jsonp(juegos);
    });
};
