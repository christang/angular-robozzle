'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('robozzleMain'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should attach range to the scope', function () {
    expect(scope.range).toBe(_.range);
  });
});
