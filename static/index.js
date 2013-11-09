function Rule (selector, color) {
  this.selector = selector;
  this.color = color;
};

Rule.prototype.toJSON = function () {
  return {
    selector: this.selector,
    color: this.color
  };
};

var masterRuleList = [];

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
  masterRuleList.push(new Rule(ruleText, color));
  return masterRuleList;
}

function output($el, rules) {
  $el.empty();
  var $lis = _.map(rules, function (rule) {
    var $li = $('<li>');
    $li.append(
      $('<span>', {
        text: rule.selector,
        style: "color: " + rule.color,
        class: 'rule'
      }));
    $li.append(
      $('<a>', {
        href: "javascript:void(0)",
        class: "js-remove-rule",
        text: "Delete"
      })
    );
    return $li;
  });
  $el.append($lis);
}

function bindEvents () {

  $('.rule-list').on('click', '.js-remove-rule', function (e) {
    masterRuleList = _.filter(masterRuleList, function (rule) {
      return $(e.target).closest('.rule').text() == rule.selector;
    });
    $(e.target).parent('li').remove();
  });

  $('.js-parse').click(function (e) {
    var rules = _.invoke(masterRuleList, 'toJSON');
    var source = $('#source').val();
    $.ajax({
      url: "/",
      method: "POST",
      data: {
        rules: JSON.stringify(rules),
        source: source
      }
    }).done(function (data) {
      $('#rendered-code code').html(data);
    });
  });

  $('.js-example-redis').click(function (e) {
    $('#source').text(
      $('#node_redis__generate_commands').text());
  });

  $('.js-add-rule').click(function (e) {
    var $rule = $('#rule') ;
    var rule = $rule.val();
    var $color = $('#color');
    var color = $color.val();
    var ruleList = addRule(rule, color);
    output($('.rule-list'), ruleList);
    $rule.val("");
    $color.val("");
  });

}

$(document).ready(bindEvents);
