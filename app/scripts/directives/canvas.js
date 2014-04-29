'use strict';

angular.module('robozzleApp')

  .directive('canvas', function () {
    return {
      template: '<svg ng-transclude />',
      restrict: 'E',
      replace: true,
      transclude: true
    };
  })

  .directive('grid', function () {
    return {
      template: '<g proxy ng-transclude />',
      restrict: 'E',
      replace: true,
      transclude: true
    };
  })

  .directive('tile', function () {
    return {
      template: '<text proxy>{{"A"}}</text>',
      restrict: 'E',
      replace: true,
      link: function linker(scope, $element, $attrs) {
        $attrs.$observe('posX', function __setX(newX) {
          $attrs.$set('x', scope.coordOfX(newX));
        });
        $attrs.$observe('posY', function __setY(newY) {
          $attrs.$set('y', scope.coordOfY(newY));
        });
      }
    };
  })

  ;
