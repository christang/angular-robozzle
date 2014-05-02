'use strict';

describe('Directive: canvas', function () {

  // load the directive's module
  beforeEach(module('robozzleCanvas'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<canvas></canvas>');
    element = $compile(element)(scope);
    // todo: test canvas elements
  }));
});
