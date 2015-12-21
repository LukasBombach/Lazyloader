var http = require('http');

const PORT=8080;

var server = http.createServer(function handleRequest(req, res){

  var extension = req.url.substr(req.url.lastIndexOf('.') + 1);
  var filenameParts = req.url.substr(1, req.url.lastIndexOf('.') - 1).split('-');
  var ms = filenameParts[0];
  var color = filenameParts[1];

  setTimeout(function () {
    if (extension === 'css') {
      res.writeHead(200, {'Content-Type': 'text/css'});
      res.end('body { background-color: #' + color + ';}');
    } else if (extension === 'js') {
      res.end('console.log(\'' + req.url + ' is loaded\');');
    }
  }, ms);

});

server.listen(PORT, function(){
  console.log("Server listening on: http://localhost:%s", PORT);
});
