var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    nconf = require('nconf'),
    router = require('./router/routes'),
    port;


nconf.argv()
    .env()
    .file({ file: 'config.json' });

app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
router(app);

/*app.get('*', function(req, res){
    console.dir(req);
});*/

mongoose.connect('mongodb://localhost/mapMarkers');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('DB connected');
});

port = nconf.get('port');
app.listen(port, function(){
    console.log('Server started :' + port);
});

