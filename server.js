// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('kVbGmDAzdXwE6h5y');

var isProduction = (process.env.NODE_ENV === 'production');
var http = require('http');
var router = require('flask-router')();
var server = http.createServer(router.route);
var csf = require('cssauron-falafel');
var falafel = require('falafel');
var _ = require('underscore');
var formidable = require('formidable');
var fs = require('fs');
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

var START  = '<b>';
var END = '</b>';

function render(res, filename, json) {
  json = _.defaults(json || {}, {
    code: '',
    source: '',
    rule: ''
  });
  fs.readFile(filename, function (err, data) {
    var contents = new String(data);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(_.template(contents, json));
    res.end();
  });
};

function insertAtIndex(origin, toInsert, index) {
  return origin.slice(0, index) + toInsert + origin.slice(index);
}

router.post('/', function (req, res) {
  var form = formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    // read in text.
    var selector = fields.rule;
    var inputText = fields.source;
    var origText = inputText.slice(0);
    try {
      var found = matchingNodes(selector, inputText);
      var ranges = _.pluck(found, 'range');
      var currentOffset = 0;
      _.each(ranges, function (rangePair) {
        var start = rangePair[0];
        var end = rangePair[1];

        var startOffset = start + currentOffset;
        inputText = insertAtIndex(inputText, START, startOffset);
        currentOffset += START.length;

        var endOffset = end + currentOffset;
        inputText = insertAtIndex(inputText, END, endOffset);
        currentOffset += END.length;
      });
    } catch (e) {
      // error parsing information.
      inputText = e;
    }

    // output text on page.
    render(res, './main_page.html', {
      code: inputText,
      source: origText,
      rule: selector
    });
  });
});

router.get('/', function (req, res) {
  render(res, './main_page.html');
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
