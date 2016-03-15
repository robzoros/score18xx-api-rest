var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require('mongoose');
	
// Connection to DB	
mongoose.connect('mongodb://localhost/score18xx', function(err, res) {  
  if(err) {
     throw err;
  } else{
	console.log('Conectado a MongoDB');
  }
});	

var Partida  = require('./models/partida');

//CORS
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
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

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
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

router.route('/juegos')
    // recoge todos los juegos (accessed at GET http://localhost:3000/api/juegos)
    .get(score18xx_db.getJuegos);

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

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

app.listen(3000, function() {  
    console.log("Servidor esperando peticiones en http://localhost:3000");
});
