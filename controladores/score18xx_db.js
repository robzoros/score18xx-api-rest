var Partida = require('../models/partida.js');
var Juego = require('../models/juego.js');

//POST - Añadir nueva partida
exports.addPartida = function(req, res) {  
    console.log('POST');
    console.log(req.body);

    var jugadores = {};
    jugadores.numero = req.body.jugadores;
    var part = new Partida({
        nombre:   	req.body.nombre,
        jugadores:      jugadores,
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

exports.getPartida = function(req, res) {  
    console.log('GET /partida id: ' +req.params.id);
    
    Partida.findById(req.params.id,function(err, partida) {
        if(err) res.send(500, err.message);
        res.status(200).jsonp(partida);
    });
};

exports.getListaPartidas = function(req, res) {  
    console.log('GET /lista');
    
    Partida.find(function(err, partidas) {
        if(err) res.send(500, err.message);
        res.status(200).jsonp(partidas);
    });
};

exports.putPartida = function(req, res) {  
    console.log('PUT /partida id: ' + req.params.id);
    console.log(JSON.stringify(req.body,null,3));
    
    Partida.findById(req.params.id, function(err, partida) {
        if(err) res.send(500, err.message);
        console.log('Nombre: ' + req.body.nombre);
        partida.nombre = req.body.nombre;
        partida.juego = req.body.juego;
        partida.loc = req.body.loc;
        partida.fecha = req.body.fecha;
        partida.jugadores = req.body.jugadores;
        partida.empresas = req.body.empresas;
        partida.dividendos = req.body.dividendos;
            
        partida.save(function(err){
            if(err) res.send(500, err.message);
            res.status(200).jsonp(partida);
        });
    });
};   
    
exports.borrarPartida = function(req, res) {
    console.log('DELETE /partida id: ' + req.params.id);
    console.log(JSON.stringify(req.body,null,3));
    
    Partida.findById(req.params.id, function(err, partida) {
        partida.remove(function(err) {
            if(err) return res.status(500).send(err.message);
            res.status(200).send();
        });
    });    
};