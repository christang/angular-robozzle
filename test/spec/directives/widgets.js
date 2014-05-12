'use strict';

describe('Directive: widgets', function() {
  
  // load the service's module
  beforeEach(module('robozzleWidgets'));

  var StyleMap;

  beforeEach(inject(function (_StyleMap_) {
    StyleMap = _StyleMap_;
  }));

  it('should exist', function() {
    expect(StyleMap.icons).toBeDefined();
    expect(StyleMap.classes).toBeDefined();
  });
});