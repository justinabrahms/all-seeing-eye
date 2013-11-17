function Rule (selector, color) {
  this.selector = selector;
  this.color = color;
}

Rule.prototype.toJSON = function () {
  return {
    selector: this.selector,
    color: this.color
  };
};

var RuleList = function () {
  this.rules = [];
};

RuleList.prototype.add = function (rule) {
  this.rules.push(rule);
  _.each(onAdd, function (cb) {
    return cb(rule);
  });
};

RuleList.prototype.remove = function (selectorText) {
  this.rules = _.reject(this.rules, function (rule) {
    return selectorText == rule.selector;
  });
  _.each(onDelete, function (cb) {
    return cb(selectorText);
  });
};

RuleList.prototype.toJSON = function () {
  return _.invoke(this.rules, 'toJSON');
};

function submitForParsing () {
  var source = $('#source-input').val();
  if (source.trim() === '') {
    return;
  }
  fetchResults().done(renderParsed);
}

function renderRules () {
  // render variables
  output($('.rule-list'), ruleList.toJSON());
}


// a lame attempt at generating pseudo random colors that don't clash.
var hRange = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];
var lRange = [25, 50, 75];
var ranges = _.shuffle(function () {
  var x = [];
  _.each(hRange, function (h) {
    return _.each(lRange, function (l) {
      x.push([h, '100%', l+'%']);
    });
  });
  return x;
}());

function randColor() {
  // TODO(justinabrahms): Find a better way to generate colors,
  // preferrably within a theme.
  var val = ranges.shift();
  return "hsl(" +
    val[0] +  ", " +
    val[1] + ", " +
    val[2] + ");";
}


function addRule(ruleText, color) {
  if (!color) {
    color = randColor();
  }
  ruleList.add(new Rule(ruleText, color));
  return ruleList;
}

function output($el, rules) {
  $el.empty();
  var $lis = _.map(rules, function (rule) {
    var $li = $('<li>');
    $li.append(
      $('<a>', {
        href: "javascript:void(0)", // jshint ignore:line
        class: "js-remove-rule pull-right",
        text: "Delete"
      }));
    $li.append(
      $('<span>', {
        text: rule.selector,
        style: "color: " + rule.color,
        class: 'rule'
      }));
    return $li;
  });
  $el.append($lis);
}

function renderParsed (dataString) {
  var json = JSON.parse(dataString);
  $('#rendered-code code').html(json.markedUp);
  $('#display-tab').tab('show');
  $('.js-node-container').html(renderNodes(json.nodeList));
}

function fetchResults () {
  var rules = ruleList.toJSON();
  var source = $('#source-input').val();
  return $.ajax({
    url: "/",
    method: "POST",
    data: {
      rules: JSON.stringify(rules),
      source: source
    }
  });
}

function renderNodes(nodeList) {
  var $dl = $("<dl>");
  _.each(nodeList, function (n) {
    $dl.append($('<dt />', {text: n.selector}));
    $dl.append(
      $('<dd>'+ 
        '<textarea style="display: none;" name="json">' + n.nodes + '</textarea>' +
        '<button>View Offsite</button>' +
        "</dd>"));
  });
  return '<form action="http://json.parser.online.fr/" method="POST">' + 
    $dl.html() +
    '</form>';
}

function bindEvents () {

  $('.rule-list').on('click', '.js-remove-rule', function (e) {
    var selectorText = $(e.target).siblings('.rule').text();
    ruleList.remove(selectorText);
  });

  $('.js-parse').click(function () {
    submitForParsing();
  });

  $('.js-example-redis').click(function (e) {
    $('#source-input').text(
      $('#node_redis__generate_commands').text());
  });

  $('.example-rules').click(function (e) {
    var rule = $(e.target).data('rule');
    if (!rule) {
      return;
    }
    addRule(rule, randColor());
  });

  $('.js-add-rule').click(function (e) {
    var $rule = $('#rule') ;
    var rule = $rule.val();
    var $color = $('#color');
    var color = $color.val();
    var ruleList = addRule(rule, color);
    $rule.val("");
    $color.val("#cc0099");
  });

  $('.nav-tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

}

var ruleList = new RuleList();
// TODO(justinabrahms): Get a reasonable event system setup.
var onAdd = [submitForParsing, renderRules];
var onDelete = [submitForParsing, renderRules];

/*
TODO: disable tabs until user activates.
TODO: something page-guide-esque.
*/
$(document).ready(bindEvents);
