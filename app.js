var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require('mongoose'),
    request     = require('request'),
    morgan      = require('morgan'),
    passport	= require('passport'), 
    config      = require('./config/database'), // get db config file
    User        = require('./models/user'), // get the mongoose model
    jwt         = require('jwt-simple'),
    fs          = require('fs'),
    https       = require('https'),
    key         = fs.readFileSync('./config/score18xx-key.pem'),
    cert        = fs.readFileSync('./config/score18xx-cert.pem'),
    global      = require('./global'),
    https_options = {
        key: key,
        cert: cert
    };

// Connection to DB	
mongoose.connect(config.database, function(err, res) {  
  if(err) {
     throw err;
  } else{
	console.log('Conectado a MongoDB');
  }
});	

// pass passport for configuration
require('./config/passport')(passport);


//CORS
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
        next();
        res.status(200).send();
    }
    else {
        next();
    }
};

app.use(allowCrossDomain);


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));
 
// Use the passport package in our application
app.use(passport.initialize());

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// Middleware to use for all requests
router.use(function(req, res, next) {
    /*/ CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
    */

    if ('OPTIONS' === req.method) {
        next();
    }
    else {
        next();
        // Necesita Token para acceder a los datos
        /*var paths = ["/signup", "/autenticar", "/juegos", ];
        if ( paths.indexOf(req._parsedUrl.path) > -1 ) {
            next();
        }
        else {
            var token = global.getToken(req.headers);
            if (token) {
                var decoded = jwt.decode(token, config.secret);
                User.findOne({
                    name: decoded.name
                }, function(err, user) {
                    if (err) throw err;

                    if (!user) {
                        return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
                    } else {
                        next(); // make sure we go to the next routes and don't stop here
                    }
                });
            } else {
                return res.status(403).send({success: false, msg: 'No token provided.'});
            }
        }*/
    }
});


// test route to make sure everything is working (accessed at GET http://local-server:Port/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// on routes that end in /partida
// ----------------------------------------------------
var score18xx_db  = require('./controladores/score18xx_db');

router.route('/partida')
    // crea una partida (accessed at POST http://local-server:Port/api/partida)
    .post(score18xx_db.addPartida);

router.route('/partida/:id')
    // recoge una partida (accessed at GET http://local-server:Port/api/partida/id)
    .get(score18xx_db.getPartida)
    // actualiza una partida (accessed at PUT http://local-server:Port/api/partida/id)
    .put(score18xx_db.putPartida)
    // borra una partida (accessed at DELETE http://local-server:Port/api/partida/id)
    .delete(score18xx_db.borrarPartida);

router.route('/lista')
    // recoge todas las partidas (accessed at GET http://local-server:Port/api/lista)
    .get(score18xx_db.getListaPartidas);

router.route('/juego')
     // crea un juego (accessed at POST http://local-server:Port/api/juego)
    .post(score18xx_db.addJuego);

router.route('/juego/:id')
    // actualiza una juego (accessed at PUT http://local-server:Port/api/juego/id)
    .get(score18xx_db.getJuego)
    // actualiza una juego (accessed at PUT http://local-server:Port/api/juego/id)
    .put(score18xx_db.putJuego)
    // borra una juego (accessed at DELETE http://local-server:Port/api/juego/id)
    .delete(score18xx_db.borrarJuego);    

router.route('/juegos')
    // recoge todos los juegos (accessed at GET http://local-server:Port/api/juegos)
    .get(score18xx_db.getJuegos);

router.route('/signup')
    // create a new user account (POST http://local-server:Port/api/signup)
    .post(score18xx_db.crearUsuario)
    // reset password (PUT http://local-server:Port/api/signup)
    .put(score18xx_db.reset);

router.route('/autenticar')
    // route to authenticate a user (POST http://local-server:Port/api/autenticar)
    .post(score18xx_db.login)
    // cambiar password (PUT http://local-server:Port/api/autenticar)
    .put(score18xx_db.cambioPass);

router.get('/userinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
    // route to a restricted info (GET http://local-server:Port/api/memberinfo)    
    var token = global.getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            name: decoded.name
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                res.json({success: true, name:user.name, rol: user.rol, email: user.email, idioma: user.idioma});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.route('/idioma')
    // route to authenticate a user (POST http://local-server:Port/api/idioma)
    .post(score18xx_db.cambiarIdioma);
    
// Agregadores varios
router.route('/pcount')
    // Cuenta de partidas (accessed at GET http://local-server:Port/api/pcount)
    .get(score18xx_db.getCuentaPartidas);

router.route('/pjcount')
    // Estadísticas de partidas por juegos (accessed at GET http://local-server:Port/api/pjcount)
    .get(score18xx_db.getCuentaJuegosP);
    
router.route('/jcount')
    // Estadísticas de partidas por juegos (accessed at GET http://local-server:Port/api/jcount)
    .get(score18xx_db.getCuentaJuegos);

router.route('/ucount')
    // Estadísticas de usuarios (accessed at GET http://local-server:Port/api/ucount)
    .get(score18xx_db.getCuentaUsuarios);


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

//proxy
app.use('/proxy', function(req, res) {  
    var url = req.url.replace('/?url=','');
    req.pipe(request(url)).pipe(res);
});

var server_port = NODEJS_PORT || 443;
var server_ip_address = NODEJS_IP || '0.0.0.0';

https.createServer(https_options, app).listen(server_port, server_ip_address, function() {
    console.log( "Listening on " + server_ip_address + ", server_port " + server_port );
});

