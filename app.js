var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    nconf = require('nconf'),
    port;


nconf.argv()
    .env()
    .file({ file: 'config.json' });

app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

/*app.get('*', function(req, res){
    console.dir(req);
});*/

port = nconf.get('port');
app.listen(port, function(){
    console.log('Server started :' + port);
});