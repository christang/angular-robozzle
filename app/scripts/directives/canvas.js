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
      template: '<text proxy>•</text>',
      restrict: 'E',
      replace: true,
      controller: function _controller() {
        this.coordOfX = function (x, width, pad) {
          return x * width + ( 2 * x + 1 ) * pad;
        };
        this.coordOfY = function (y, height, pad) {
          return y * height + ( 2 * y + 1 ) * pad;
        };
      },
      link: function _linker(scope, $element, $attrs, tileCtrl) {
        $attrs.$observe('posX', function __setX(newX) {
          $attrs.$set('x', tileCtrl.coordOfX(newX,
                                             scope.tileWidth,
                                             scope.tileWidthPad));
        });
        $attrs.$observe('posY', function __setY(newY) {
          $attrs.$set('y', tileCtrl.coordOfY(newY,
                                             scope.tileHeight,
                                             scope.tileHeightPad));
        });
      }
    };
  })

  ;
