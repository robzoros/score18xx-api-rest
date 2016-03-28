var Partida = require('../models/partida.js');
var Juego   = require('../models/juego.js');
var User    = require('../models/user.js');
var jwt     = require('jwt-simple');
var config  = require('../config/database'); // get db config file
var global  = require('../global');

//CRUD Partidas
exports.addPartida = function(req, res) {  
    //console.log('POST /partida');
    //console.log(req.body);
    
    // Comprobamos que el usuario existe y tiene permisos
    User.findOne({name: req.body.usuario}, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        }
 
        if (!user) {
            console.log('Authentication failed. User not found.');
            return res.status(403).send('Authentication failed. User not found.');
        } else {
            // Creamos partida
            var jugadores = {};
            jugadores.numero = req.body.jugadores;
            var part = new Partida({
                usuario:   	req.body.usuario,
                nombre:   	req.body.nombre,
                jugadores:      jugadores,
                juego:    	req.body.juego,
                loc: 		req.body.loc,
                fecha:    	req.body.fecha
            });

            part.save(function(err) {
                if(err){
                    console.log(err);
                    return res.status(500).send( err.message);
                }
                res.status(200).jsonp(part);
            });

        }
    });

};

exports.getPartida = function(req, res) {  
    //console.log('GET /partida id: ' + req.params.id);
    
    Partida.findById(req.params.id,function(err, partida) {
        if(err){
            console.log(err);
            return res.status(500).send( err.message);
        }
        else {
            var token = global.getToken(req.headers);
            if (token) {
                var decoded = jwt.decode(token, config.secret);
                User.findOne({name: decoded.name}, function(err, user) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send( err.message);
                    };

                    if (!user) {
                        console.log('Authentication failed. User not found.');
                        return res.status(403).send('Authentication failed. User not found.');
                    } 
                    else {
                        res.status(200).jsonp(partida);
                    };
                });
            }
            else {
                console.log('Authentication failed. Token not found.');
                return res.status(403).send('Authentication failed. Token not found.');
            }
        };
    });
};

exports.getListaPartidas = function(req, res) {  
    //console.log('GET /lista');
    var token = global.getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
    
        Partida.find({usuario: decoded.name}, function(err, partidas) {
            if(err){
                console.log(err);
                return res.status(500).send(err.message);
            }
            res.status(200).jsonp(partidas);
        });
    }
    else {
        console.log('Authentication failed. Token not found.');
        return res.status(403).send('Authentication failed. Token not found.');
    };
};

exports.putPartida = function(req, res) {  
    //console.log('PUT /partida id: ' + req.params.id);
    //console.log(req.body);

    User.findOne({name: req.body.usuario}, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        };

        if (!user) {
            console.log('Authentication failed. User not found.');
            return res.status(403).send('Authentication failed. User not found.');
        } else {
            Partida.findById(req.params.id, function(err, partida) {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err.message);
                };
                if (partida.usuario === req.body.usuario) {
                    partida.nombre = req.body.nombre;
                    partida.juego = req.body.juego;
                    partida.loc = req.body.loc;
                    partida.fecha = req.body.fecha;
                    partida.jugadores = req.body.jugadores;
                    partida.empresas = req.body.empresas;
                    partida.dividendos = req.body.dividendos;

                    partida.save(function(err){
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err.message);
                        };
                        res.status(200).jsonp(partida);
                    });
                }
                else {
                    console.log('La partida no pertenece al usuario.');
                    return res.status(403).send('La partida no pertenece al usuario.');
                }
            });
        };
    });
};   
    
exports.borrarPartida = function(req, res) {
    //console.log('DELETE /partida id: ' + req.params.id);
    var token = global.getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);

        Partida.findById(req.params.id, function(err, partida) {
            if (partida.usuario === decoded.name) {
                partida.remove(function(err) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(err.message);
                    };
                    res.status(200).send();
                });
            }
            else {
                console.log('La partida no pertenece al usuario.');
                return res.status(403).send('La partida no pertenece al usuario.');
            }
        });    
    }
    else {
        console.log('Authentication failed. Token not found.');
        return res.status(403).send('Authentication failed. Token not found.');
    };
    
};

//CRUD Juegos
exports.addJuego = function(req, res) {  
    //console.log('POST Juego');
    //console.log(req.body);
    
    var token = global.getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        
        User.findOne({name: decoded.name}, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send( err.message);
            };

            if (!user) {
                console.log('Authentication failed. User not found.');
                return res.status(403).send('Authentication failed. User not found.');
            } 
            
            if (user.rol !== "Administrador") {
                console.log('El usuario %s no tiene privilegios sobre la tabla juegos.', user.name);
                return res.status(403).send('El usuario ' + user.name + ' no tiene privilegios sobre la tabla juegos.');
            }

            var juego = new Juego({
                _name:   	req.body._name,
                _id:            req.body._id,
                description:    req.body.description,
                companies:    	req.body.companies
            });

            juego.save(function(err) {
                if (err) {
                    console.log(err);
                    return res.status(500).send( err.message);
                };
                res.status(200).jsonp(juego);
            }); 
        });
 
    }
    else {
        console.log('Authentication failed. Token not found.');
        return res.status(403).send('Authentication failed. Token not found.');
    };
};

exports.getJuegos = function(req, res) {  
    //console.log('GET /juegos');
    
    Juego.find(function(err, juegos) {
        if(err) res.send(500, err.message);
        res.status(200).jsonp(juegos);
    });
};

exports.getJuego = function(req, res) {  
    //console.log('GET /juego id: ' +req.params.id);
    
    Juego.findById(req.params.id,function(err, juego) {
        if(err) res.send(500, err.message);
        res.status(200).jsonp(juego);
    });
};

exports.putJuego = function(req, res) {  
    //console.log('PUT /juego id: ' + req.params.id);
    var token = global.getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        
        User.findOne({name: decoded.name}, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send( err.message);
            };

            if (!user) {
                console.log('Authentication failed. User not found.');
                return res.status(403).send('Authentication failed. User not found.');
            } 
            
            if (user.rol !== "Administrador") {
                console.log('El usuario %s no tiene privilegios sobre la tabla juegos.', user.name);
                return res.status(403).send('El usuario ' + user.name + ' no tiene privilegios sobre la tabla juegos.');
            }

            Juego.findById(req.params.id, function(err, juego) {
                if(err) res.send(500, err.message);
                console.log('Nombre: ' + req.body._name);
                juego._name = req.body._name;
                juego.description = req.body.description;
                juego.companies = req.body.companies;

                juego.save(function(err){
                    if(err) res.send(500, err.message);
                    res.status(200).jsonp(juego);
                });
            });

        });

    }
    else {
        console.log('Authentication failed. Token not found.');
        return res.status(403).send('Authentication failed. Token not found.');
    };
};   
    
exports.borrarJuego = function(req, res) {
    //console.log('DELETE /juego id: ' + req.params.id);
    var token = global.getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        
        User.findOne({name: decoded.name}, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send( err.message);
            };

            if (!user) {
                console.log('Authentication failed. User not found.');
                return res.status(403).send('Authentication failed. User not found.');
            } 
            
            if (user.rol !== "Administrador") {
                console.log('El usuario %s no tiene privilegios sobre la tabla juegos.', user.name);
                return res.status(403).send('El usuario ' + user.name + ' no tiene privilegios sobre la tabla juegos.');
            }
            
            Juego.findById(req.params.id, function(err, juego) {
                juego.remove(function(err) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send( err.message);
                    };
                    res.status(200).send();
                });
            });
        });
  
    }
    else {
        console.log('Authentication failed. Token not found.');
        return res.status(403).send('Authentication failed. Token not found.');
    };
  
};

// usuarios
exports.crearUsuario = function(req, res) {
    //console.log('POST /signup');
    if (!req.body.name || !req.body.password) {
        res.json({success: false, msg: 'Please pass name and password.'});
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password,
            rol: "Consulta"
        });

        // save the user
        newUser.save(function(err) {
            if (err) {
                return res.json({success: false, msg: 'Username already exists.'});
            }
            res.json({success: true, msg: 'Successful created new user.'});
        });
    }    
};

exports.login = function(req, res) {
    //console.log('POST /login');
    //console.log(req.body.name);
    User.findOne({
        name: req.body.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
            res.send({success: false, msg: 'Authentication failed. User not found.'});
        } else {

            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = jwt.encode(user, config.secret);
                    // return the information including token as JSON
                    res.json({success: true, token: 'JWT ' + token, rol: user.rol});
                } else {
                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
};

