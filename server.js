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
var basePath = (isProduction ? '/home/deploy/current/' : './');

/*
  TODO: Saving results
*/


function serveFromPrefix (prefix, path, res) {
  var toServe = prefix + path;
  console.log("attempting to serve: ", toServe);
  fs.readFile(toServe, function (err, data) {
    if (err) {
      res.write("Error parsing request. " + err);
    } else {
      res.write(""+data);
    }
    res.end();
  });
}

router.get('/static/<path:path>', function (req, res) {
  return serveFromPrefix(basePath + 'static/', req.params.path, res);
});

router.get('/bower/<path:path>', function (req, res) {
  return serveFromPrefix(basePath + 'bower_components/', req.params.path, res);
});

function matchingNodes(selector, content) {
  var found = [];
  falafel(content, function (node) {
    // assigning this here will return a possible list of node with the `!` operator
    if ((node = csf(selector)(node))) {
      found.push(node);
    }
  });
  return found;
}

var START  = '<b>';
var END = '</b>';


exports.insertAtIndex = function insertAtIndex(origin, toInsert, index) {
  if (toInsert.length === 0) {
    return origin;
  }
  return origin.slice(0, index) + toInsert + origin.slice(index);
};

exports.insertOnRange = function insertOnRange(origin, range, startStr, endStr) {
  return exports.insertAtIndex(
    exports.insertAtIndex(origin, startStr, range[0]),
    endStr, (range[1] + startStr.length));
};

// rangeStringMapList = [{start: int, startString: string, end: int, endString: string}, ...]
exports.multiRangeInsert = function multiRangeInsert(origin, rangeStringMapList) {
  // list of inserts. the original insert point and how much text was inserted.
  // each element looks like: [0, 14] which is the position inserted, and number of characters
  var inserted = [
    
  ];

  var offsetForPos = function (pos) {
    var amount = 0;
    
    _.each(inserted, function (seen) {
      if (seen[0] < pos) {
        amount += seen[1];
      }
    });

    return amount;
  };

  _.each(rangeStringMapList, function (rsm) {
    
    var range = [];
    range.push(rsm.start + offsetForPos(rsm.start));
    range.push(rsm.end + offsetForPos(rsm.end));
    inserted.push([rsm.start, rsm.startString.length]);
    inserted.push([rsm.end, rsm.endString.length]);
    
    origin = exports.insertOnRange(origin, range, rsm.startString, rsm.endString);
  });
  return origin;
};

router.post('/', function (req, res) {
  console.log('Oooh, new things to parse!');
  var form = formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    console.log("rules: ", fields.rules);
    var rules = JSON.parse(fields.rules);
    var inputText = fields.source;
    var origText = inputText.slice(0);
    var rangeMaps;
    try {
      rangeMaps = _.flatten(_.map(rules, function (rules) {
        var matched = matchingNodes(rules.selector, inputText);
        var ranges = _.pluck(matched, 'range');
        return _.map(ranges, function (r) {
          return {
            start: r[0],
            end: r[1],
            startString: "<b style='color:" + rules.color + "'>",
            endString: "</b>"
          };
        });
      }));
    } catch (e) {
      inputText = e;
    }

    inputText = exports.multiRangeInsert(inputText, rangeMaps);

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(""+inputText);
    res.end();
  });
});

router.get('/', function (req, res) {
  console.log('got request for homepage');
  render(res, basePath + '/main_page.html');
});


function render(res, filename, json) {
  json = _.defaults(json || {}, {
    code: '',
    source: '',
    rule: ''
  });
  fs.readFile(filename, function (err, data) {
    var contents = ""+data;
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(_.template(contents, json));
    res.end();
  });
}


server.listen(port, function(err) {
  if (err) { console.error(err); process.exit(-1); }
  console.log("Working from: ", process.cwd());

  // if run as root, downgrade to the owner of this file
  if (process.getuid() === 0) {
    require('fs').stat(__filename, function(err, stats) {
      if (err) { return console.error(err); }
      process.setuid(stats.uid);
    });
  }

  console.log('Server running at http://0.0.0.0:' + port + '/');
});
