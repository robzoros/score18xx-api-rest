var Partida = require('../models/partida.js');
var Juego   = require('../models/juego.js');
var User    = require('../models/user.js');
var jwt     = require('jwt-simple');
var config  = require('../config/database'); // get db config file
var global  = require('../global');
var email   = require('../mail');

function obtenerUsuarioToken(req, cb) {
    var token = global.getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({name: decoded.name}, function(err, user) {
            cb (err, user);
        });
    }
    else {
        cb("Error: Token no encontrado");
    }
};

// Promesa para verificar usuario
function verificarUsuario (req, res) {
    return new Promise ( function(resolve, reject) {
        User.findOne({name: req.body.usuario}, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err.message);
            };

            if (!user) {
                console.log('Authentication failed. User not found.');
                return res.status(403).send('Authentication failed. User not found.');
            } 
            else {
                resolve(req, res);
            };
        });
    });
};

// Promesa para verificar token y usuario administrador
function verificarToken (req, res) {
    return new Promise ( function(resolve, reject) {
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

                resolve(user);
            });
        }
        else {
            console.log('Authentication failed. Token not found.');
            return res.status(403).send('Authentication failed. Token not found.');
        };
    });

};

// Funciones que llamarán en las promesas
actualizaPartida = function (req, res) {
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

nuevaPartida = function(req, res) {
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
};

nuevoJuego = function(req, res) {
    var juego = new Juego({
        _name:   	req.body._name,
        _id:            req.body._id,
        description:    req.body.description,
        companies:    	req.body.companies,
        usuario:        req.body.usuario
    });
    juego.save(function(err) {

        if (err) {
            console.log(err);
            return res.status(500).send( err.message);
        };
        res.status(200).jsonp(juego);
    }); 
};

deleteJuego = function(req, res, user) {
    var resp = res;
    Juego.findById(req.params.id, function(err, juego) {
        if ((juego.usuario === user.name) || ((juego.usuario === 'admin') && (user.rol === 'Administrador')) ) {
            juego.remove(function(err) {
                if (err) {
                    console.log(err);
                    return res.status(500).send( err.message);
                };
                resp.status(200).send();
            });
            
        }
        else{
            console.log('El usuario %s no tiene privilegios sobre el juego.', user.name);
            return res.status(403).send('El usuario ' + user.name + ' no tiene privilegios sobre el juego.');
        };
    });
};
        
actualizarJuego = function(req, res, user) {
    var resp = res;    
    Juego.findById(req.params.id, function(err, juego) {
        if (err) {
            console.log(err);
            return res.status(500).send( err.message);
        };
        if ((juego.usuario === user.name) || ((juego.usuario === 'admin') && (user.rol === 'Administrador')) ) {

            juego._name = req.body._name;
            juego.description = req.body.description;
            juego.companies = req.body.companies;
            juego.usuario = req.body.usuario;

            juego.save(function(err){
                if (err) {
                    console.log(err);
                    return resp.status(500).send( err.message);
                };
                res.status(200).jsonp(juego);
            });
        }
        else{
            console.log('El usuario %s no tiene privilegios sobre el juego.', user.name);
            return res.status(403).send('El usuario ' + user.name + ' no tiene privilegios sobre el juego.');
        };
    });
};

obtenerPartida = function (req, res) {
    Partida.findById(req.params.id, function(err, partida) {
        if(err){
            console.log(err);
            return res.status(500).send(err.message);
        }
        else {
            if (partida)
                res.status(200).jsonp(partida);
            else
                res.status(404).send("Partida no encontrada");
        }
    });
};

//CRUD Partidas
exports.addPartida = function(req, res) {
    verificarUsuario(req, res).then( function() {
        nuevaPartida(req, res);
    });
};

exports.getPartida = function(req, res) {  
    obtenerPartida(req, res);
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
    verificarUsuario(req, res).then( function(){
        actualizaPartida(req, res);
    });
};
   
    
exports.borrarPartida = function(req, res) {
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
    verificarToken(req, res).then( function () {
        nuevoJuego(req, res);
    });
};

exports.getJuegos = function(req, res) {  
    //console.log('GET /juegos');
    obtenerUsuarioToken(req, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        };
 
        if (!user) {
            console.log('User not found.');
            return res.status(403).send('User not found.');
        } else {
    
            Juego.find( {$or:[ {'usuario': 'admin'}, {'usuario': user.name} ]}, function(err, juegos) {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err.message);
                };
                res.status(200).jsonp(juegos);
            });
        };
    });
};

exports.getJuego = function(req, res) {  
    obtenerUsuarioToken(req, function(err, user) {
        if (err) {
            console.log(err);
            res.status(500).send(err.message);
        };
 
        if (!user) {
            console.log('User not found.');
            return res.status(403).send('User not found.');
        } else {
    
            Juego.findById(req.params.id,function(err, juego) {
                if (err) {
                    console.log(err);
                    res.status(500).send(err.message);
                };
                if (juego) {
                    if ((juego.usuario === user.name) || (juego.usuario === 'admin')) 
                        res.status(200).jsonp(juego);
                    else {
                        console.log('El usuario %s no tiene privilegios sobre el juego.', user.name);
                        return res.status(403).send('El usuario ' + user.name + ' no tiene privilegios sobre el juego.');
                    }
                }
                else
                    res.status(404).send("Juego no encontrado");
            });
        };
    });
};

exports.putJuego = function(req, res) {  
    verificarToken(req, res).then(function(user) {
        actualizarJuego(req, res, user);
    });
};   
    
exports.borrarJuego = function(req, res) {
    verificarToken(req, res).then( function(user) {
        deleteJuego(req, res, user);
    });
};

// usuarios
exports.crearUsuario = function(req, res) {
    if (!req.body.name || !req.body.password || !req.body.email) {
        res.json({success: false, msg: 'Please pass name and password.'});
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password,
            rol: "Consulta",
            email: req.body.email,
            idioma: req.body.idioma
        });

        // save the user
        newUser.save(function(err) {
            if (err) {
                console.log('El usuario o el correo ya existen.');
                return res.json({success: false, msg: 'El usuario o el correo ya existen.'});
            }
            res.json({success: true, msg: 'Successful created new user.'});
        });
    }    
};

exports.login = function(req, res) {
    User.findOne({
        name: req.body.name
    }, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
 
        if (!user) {
            console.log('Authentication failed. User not found.');
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
                    console.log('Not Compare Pass');

                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
};

exports.reset = function(req, res) {
    User.findOne({email: req.body.email}, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        };

        if (!user) {
            console.log('El email proporcionado no existe.');
            return res.status(403).send('El email proporcionado no existe.');
        } 
        else {
            var make_passwd = function(n, a) {
                var index = (Math.random() * (a.length - 1)).toFixed(0);
                return n > 0 ? a[index] + make_passwd(n - 1, a) : '';
            };
            var password = make_passwd(7, 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890');
            
            user.password = password;
            
            user.save(function(err) {
                if (err) {
                    console.log('Error con email facilitado.');
                    return res.json({success: false, msg: 'Error con email facilitado.'});
                }
                email.sendMail(user, password, function() {
                    res.json({success: true, msg: 'Password creada correctamente.'});
                });
                    
            });
        };
    });    
}

exports.cambioPass = function(req, res) {
    obtenerUsuarioToken(req, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        };
 
        if (!user) {
            console.log('User not found.');
            return res.status(403).send('User not found.');
        } else {

            // Usuario encontrado, cambiamos la password.
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    user.password = req.body.newPassword;

                    // if user is found and password is right create a token
                    user.save(function(err) {
                        if (err) {
                            console.log(err);
                            return res.json(err);
                        }

                        // Mandamos nuevo token
                        var token = jwt.encode(user, config.secret);
                        // return the information including token as JSON
                        res.json({success: true, token: 'JWT ' + token, rol: user.rol});

                    });
                } else {
                    console.log('Not Compare Pass');

                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        };
    });    
};

exports.cambiarIdioma = function(req, res) {
    obtenerUsuarioToken(req, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        };
 
        if (!user) {
            console.log('User not found.');
            return res.status(403).send('User not found.');
        } else {

            // Usuario encontrado, cambiamos idioma.
            user.idioma = req.body.idioma;

            // if user is found and password is right create a token
            user.save(function(err) {
                if (err) {
                    console.log(err);
                    return res.json(err);
                }

                // Mandamos nuevo token
                var token = jwt.encode(user, config.secret);
                // return the information including token as JSON
                res.json({success: true, token: 'JWT ' + token, rol: user.rol, idioma: user.idioma});

            });
        };
    });    
};

// ***********************************
// Agregadores
// ***********************************

// Función DRY
function estadisticas(res, estad, err, user) {
    if(err) {
        console.log(err);
        return res.status(500).send(err.message);
    }
        
    if (user === -1) {
        /// No hay token
        console.log('Authentication failed. Token not found.');
        return res.status(403).send('Authentication failed. Token not found.');
    }
    else {
        // Hay token
        if (!user) {
            console.log('Authentication failed. User not found.');
            return res.status(403).send('Authentication failed. User not found.');
        } 
        
        // Definimos las variables
        var groupJxPartidaUser = [
            { $match: {
                usuario: user.name
            }},
            { $group: {
                _id: "$juego._name",
                cuenta: { $sum: 1  },
                media_j: {$avg: "$jugadores.numero"}
            }}];
        var groupJxPartidaAdmin = { 
            $group: {
                _id: "$juego._name",
                cuenta: { $sum: 1  },
                media_j: {$avg: "$jugadores.numero"}
            }};
        var groupPartidasUser = [
            { $match: {
                usuario: user.name
            }},
            { $group: {
                _id: null,
                cuenta: { $sum: 1  }
            }}];
        var groupPartidasAdmin = { 
            $group: {
                _id: null,
                cuenta: { $sum: 1  },
                media_j: {$avg: "$jugadores.numero"}
            }};
        var groupJuegosUser = [ 
            { $match: {
                usuario: user.name
            }},
            { $group: {
                _id: null,
                cuenta: { $sum: 1  }
            }}];
        var groupJuegosAdmin = { 
            $group: {
                _id: null,
                cuenta: { $sum: 1  }
            }};
        var groupUsuarios = {
            $group: {
                _id: null,
                cuenta: { $sum: 1  }
            }};
        var esquema;
        var groupVariable;
        switch (estad) {
            case 'groupJxPartida':
                esquema = Partida;
                if (user.rol === 'Consulta')
                    groupVariable = groupJxPartidaUser;
                else
                    groupVariable = groupJxPartidaAdmin;
                break;
            case 'groupPartidas':
                esquema = Partida;
                if (user.rol === 'Consulta')
                    groupVariable = groupPartidasUser;
                else
                    groupVariable = groupPartidasAdmin;
                break;         
            case 'groupJuegos':
                esquema = Juego;
                if (user.rol === 'Consulta')
                    groupVariable = groupJuegosUser;
                else
                    groupVariable = groupJuegosAdmin;
                break;
            case 'groupUsuarios':
                esquema = User;
                groupVariable = groupUsuarios;
                break;
        };
        esquema.aggregate(groupVariable, function (err, result) { 
            if (err) {
                console.log(err);
                return res.status(403).send(err);
            }
            res.status(200).jsonp(result);
        });
    }
};

exports.getCuentaJuegosP = function(req, res) {  
    obtenerUsuarioToken( req, function(err, user) {
        estadisticas(res, 'groupJxPartida', err, user);
    });
};

exports.getCuentaPartidas = function(req, res) { 
    obtenerUsuarioToken( req, function(err, user) {
        estadisticas(res, 'groupPartidas', err, user );
    });
};

exports.getCuentaJuegos = function(req, res) {  
    obtenerUsuarioToken( req, function(err, user) {
        estadisticas(res, 'groupJuegos', err, user );
    });
};

exports.getCuentaUsuarios = function(req, res) {  
    obtenerUsuarioToken( req, function(err, user) {
        estadisticas(res, 'groupUsuarios', err, user );
    });
};

