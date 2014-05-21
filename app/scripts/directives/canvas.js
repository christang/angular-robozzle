'use strict';

angular.module('robozzleCanvas', [])

  .directive('addShadows', function () {
    return {
      templateUrl: 'views/filters/dropshadow.svg'
    };
  })

  .directive('canvas', function () {
    return {
      template: '<svg height="600" ng-transclude />',
      restrict: 'E',
      replace: true,
      transclude: true
    };
  })

  .directive('sframe', function () {
    return {
      type: 'svg',
      template: '<g ng-transclude />',
      restrict: 'E',
      replace: true,
      transclude: true
    };
  })

  .directive('grid', function () {
    return {
      type: 'svg',
      template: '<g ng-transclude />',
      restrict: 'E',
      replace: true,
      transclude: true,
      controller: function _controller() {
        this.coordOfX = function (x, width, pad, dx) {
          x -= (dx || this.dx);
          return x * width + ( 2 * x + 1 ) * pad;
        };
        this.coordOfY = function (y, height, pad, dy) {
          y -= (dy || this.dy);
          return y * height + ( 2 * y + 1 ) * pad;
        };
      },
      link: function (scoe, $element, $attrs, ctrl) {
        ctrl.dx = $attrs.dx || 0;
        ctrl.dy = $attrs.dy || 0;
      }
    };
  })

  .directive('tile', function () {
    return {
      type: 'svg',
      templateUrl: 'views/partials/tile.svg',
      restrict: 'E',
      replace: true,
      require: '^grid',
      scope: {
        x: '@',
        y: '@',
        width: '@',
        height: '@',
        horizPad: '@',
        verticalPad: '@',
        classes: '@',
        icon: '@'
      },
      link: function _linker(scope, $element, $attrs, ctrl) {
        $attrs.$observe('posX', function __setX(newX) {
          if (newX) {
            scope.x = ctrl.coordOfX(newX, scope.width,
                                        scope.horizPad);
          }
        });
        $attrs.$observe('posY', function __setY(newY) {
          if (newY) {
            scope.y = ctrl.coordOfY(newY, scope.height,
                                        scope.verticalPad);
          }
        });
      }
    };
  })

  ;
