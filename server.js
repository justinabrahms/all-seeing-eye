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
  falafel(content, function (node) {
    if (csf(selector)(node)) {
      found.push(node);
    }
  });
  return found;
}

function render(res, txt) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(txt);
  return res;
};

router.post('/parse', function (req, res) {
  var selector = 'variable-decl';
  // read in text.
  var inputText = "var x = 9;\nif (x > 2) {\n  console.log('got it');\n}\n";
  // run selector on text.
  var found = matchingNodes(selector, inputText);
  // build mapping of matched nodes to string offsets
  var ranges = _.pluck(found, 'range');

  console.log('ranges: ', ranges);
  // turn mapping into text decoration
  var text ='wee!';

  // output text on page.
  render(res, text).end();
});

router.get('/', function (req, res) {
  render(res, "<html><body>" +
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
