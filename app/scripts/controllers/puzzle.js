'use strict';

angular.module('robozzleApp')
  .controller('PuzzleCtrl', ['$scope',
    function ($scope) {

      $scope.puzzle = {
        width: 10,
        height: 10,
        functions: 5,
        steps: [10, 10, 10, 10, 10]
      };

      function updateSteps() {
        for (var i=0; i<$scope.puzzle.functions; i++) {
          $scope.programBuilder.steps(i, $scope.puzzle.steps[i]);
        }
      }

      $scope.$watch(
        'puzzle.width',
        function __changeWorld(width) {
          $scope.worldBuilder.width(width);
          $scope.world = $scope.worldBuilder.build();
        });

      $scope.$watch(
        'puzzle.height',
        function __changeWorld(height) {
          $scope.worldBuilder.height(height);
          $scope.world = $scope.worldBuilder.build();
        });

      $scope.$watch(
        'puzzle.functions',
        function __changeProgram(length) {
          $scope.programBuilder.fns(length);
          updateSteps();
          $scope.program = $scope.programBuilder.build();
        });

      $scope.$watch(
        'puzzle.steps',
        function __changeProgram() {
          updateSteps();
          $scope.program = $scope.programBuilder.build();
        }, true);

    }]);
