// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('kVbGmDAzdXwE6h5y');

var isProduction = (process.env.NODE_ENV === 'production');
var http = require('http');
var router = require('flask-router')();
var server = http.createServer(router.route);
var port = (isProduction ? 80 : 8000);


router.get('/', function (req, res) {
  console.log('awww yiss');
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("<html><body>" +
            "<form>" +
            "<label for='rule'>Rule:</label><input type='text' id='rule' name='rule' /><br />" + 
            "<label for='source'>Source Code</label><textarea id='source' name='source'></textarea><br />" +
            "<button type='submit'>Parse</button>" +
            "</form>" +
            "</body></html>");
  res.end();
});



server.listen(port, function(err) {
  if (err) { console.error(err); process.exit(-1); }

  // if run as root, downgrade to the owner of this file
  if (process.getuid() === 0) {
    require('fs').stat(__filename, function(err, stats) {
      if (err) { return console.error(err); }
      process.setuid(stats.uid);
    });
  }

  console.log('Server running at http://0.0.0.0:' + port + '/');
});
