'use strict';

describe('Directive: svgShim', function () {

  // load the directive's module
  beforeEach(module('robozzleApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<svg-shim></svg-shim>');
    element = $compile(element)(scope);
    // todo: test proxy, svg elements
  }));
});
