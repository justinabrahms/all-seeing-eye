var assert = require("assert");
var server = require("../server.js");

describe('insert markup in text', function () {
  it('should not do anything given an empty range', function () {
    assert.equal('test', server.insertAtIndex('test', '', 1));
  });

  it('should insert text at appropriate index', function () {
    assert.equal(
      'te1234st',
      server.insertAtIndex('test', '1234', 2));
  });
});

describe('inserting around ranges', function () {
  it('should wrap text in start and end tags', function () {
    assert.equal(
      'var <b>x</b> = 1;',
      server.insertOnRange(
        'var x = 1;',
        [4,5],
        '<b>',
        '</b>'
      ));
  });
});


describe('inserting multiple ranges', function () {
  it('should take into account previous insertions', function () {
    
    assert.equal(
      'var <b>x</b> = <b>1</b>;',
      server.multiRangeInsert(
        'var x = 1;',
        [
          {
            start: 4,
            end: 5,
            startString: "<b>",
            endString: "</b>"
          },
          {
            start: 8,
            end: 9,
            startString: "<b>",
            endString: "</b>"
          }
        ]
      ));
    
  });
  it('should handle previous insertions not being inserted before the current one', function () {

    assert.equal(
      'var <b>x</b> = <b>1</b>;',
      server.multiRangeInsert(
        'var x = 1;',
        [
          {
            start: 8,
            end: 9,
            startString: "<b>",
            endString: "</b>"
          },                     
          {
            start: 4,
            end: 5,
            startString: "<b>",
            endString: "</b>"
          }
        ]
      ));
    
  });
  it('should handle handle the potential for ranges which wrap other ranges', function () {
    assert.equal(
      '<b>x > <b>1</b></b>',
      server.multiRangeInsert(
        'x > 1',
        [
          {
            start: 0,
            end: 5,
            startString: "<b>",
            endString: "</b>"
          },
          {
            start: 4,
            end: 5,
            startString: "<b>",
            endString: "</b>"
          }
        ]));
  });
});
