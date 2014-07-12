'use strict';

describe('Controller: PuzzleCtrl', function () {

  // load the controller's module
  beforeEach(module('robozzleApp'));

  var PuzzleCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PuzzleCtrl = $controller('PuzzleCtrl', {
      $scope: scope
    });
  }));

});
