var counter = 0;
require('http').createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('' + (++counter));
}).listen(8080);
