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

var Partida  = require('./models/partida');

// pass passport for configuration
require('./config/passport')(passport);

//CORS
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
      res.send(200);
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
    // CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    // Necesita Token para acceder a los datos
    var paths = ["/signup", "/autenticar", "/juegos"];
    console.log(req._parsedUrl.path);
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
    }
        
    
    
});


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// on routes that end in /partida
// ----------------------------------------------------
var score18xx_db  = require('./controladores/score18xx_db');

router.route('/partida')
    // crea una partida (accessed at POST http://localhost:3000/api/partida)
    .post(score18xx_db.addPartida);

router.route('/partida/:id')
    // recoge una partida (accessed at GET http://localhost:3000/api/partida/id)
    .get(score18xx_db.getPartida)
    // actualiza una partida (accessed at PUT http://localhost:3000/api/partida/id)
    .put(score18xx_db.putPartida)
    // borra una partida (accessed at DELETE http://localhost:3000/api/partida/id)
    .delete(score18xx_db.borrarPartida);

router.route('/lista')
    // recoge todas las partidas (accessed at GET http://localhost:3000/api/lista)
    .get(score18xx_db.getListaPartidas);

router.route('/juego')
     // crea un juego (accessed at POST http://localhost:3000/api/juego)
    .post(score18xx_db.addJuego);

router.route('/juego/:id')
    // actualiza una juego (accessed at PUT http://localhost:3000/api/juego/id)
    .get(score18xx_db.getJuego)
    // actualiza una juego (accessed at PUT http://localhost:3000/api/juego/id)
    .put(score18xx_db.putJuego)
    // borra una juego (accessed at DELETE http://localhost:3000/api/juego/id)
    .delete(score18xx_db.borrarJuego);    

router.route('/juegos')
    // recoge todos los juegos (accessed at GET http://localhost:3000/api/juegos)
    .get(score18xx_db.getJuegos);

router.route('/signup')
    // create a new user account (POST http://localhost:3000/api/signup)
    .post(score18xx_db.crearUsuario);

router.route('/autenticar')
    // route to authenticate a user (get http://localhost:3000/api/autenticar)
    .post(score18xx_db.login);

router.get('/userinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
    // route to a restricted info (GET http://localhost:3000/api/memberinfo)    
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
                res.json({success: true, name:user.name, rol: user.rol});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

//proxy
app.use('/proxy', function(req, res) {  
    var url = req.url.replace('/?url=','');
    req.pipe(request(url)).pipe(res);
});


/* app.listen(3000, function() {  
    console.log("Servidor esperando peticiones en http://localhost:3000");
}); */

https.createServer(https_options, app).listen(3000, function() {  
    console.log("Servidor esperando peticiones en http://localhost:3000");
});
