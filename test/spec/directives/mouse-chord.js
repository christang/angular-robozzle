'use strict';

describe('Directive: mouseChord', function () {

  // load the directive's module
  beforeEach(module('mouseUI'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.capture = function () {};
  }));

  it('should execute capture on mouse event', inject(function ($compile) {
    element = angular.element('<div mouse-chord on-displacement="capture"></div>');
    element = $compile(element)(scope);
    expect(scope.dx).toBe(undefined);
    expect(scope.dy).toBe(undefined);
  }));
});
