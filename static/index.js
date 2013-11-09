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

function addRule(ruleText) {
  masterRuleList.push(new Rule(ruleText, null));
  return masterRuleList;
}

function output($el, rules) {
  $el.empty();
  var $lis = _.map(rules, function (rule) {
    var $li = $('<li>');
    $li.append(
      $('<span>', {
        text: rule.selector, 
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

  $('.js-add-rule').click(function (e) {
    var $rule = $('#rule') ;
    var rule = $rule.val();
    var ruleList = addRule(rule);
    output($('.rule-list'), ruleList);
    $rule.val("");
  });

}

$(document).ready(bindEvents);
