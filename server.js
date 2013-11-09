// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('kVbGmDAzdXwE6h5y');

var isProduction = (process.env.NODE_ENV === 'production');
var http = require('http');
var router = require('flask-router')();
var server = http.createServer(router.route);
var csf = require('cssauron-falafel');
var falafel = require('falafel');
var _ = require('underscore');
var port = (isProduction ? 80 : 8000);

/*
TODO: Real template language
TODO: Real design
TODO: 302 Redirect on post
TODO: Saving results
*/

function matchingNodes(selector, content) {
  var found = [];
  falafel(src, function (node) {
    if (csf(pattern)(node) {
      found.push(node);
    }
  });
  return found;
}

router.post('/parse', function (req, res) {
  // read in text.
  // run selector on text.
  // build mapping of matched nodes to string offsets
  // turn mapping into text decoration
  // output text on page.
});

router.get('/', function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("<html><body>" +
            "<form method='post' action='/parse'>" +
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
