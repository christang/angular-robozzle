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

  .directive('grid', ['applyAndSet', function (applyAndSet) {
    return {
      type: 'svg',
      scope: true,
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
      link: function _linker(scope, $element, $attrs, ctrl) {
        $attrs.$observe('dx', applyAndSet('dx', parseInt, 0, ctrl));
        $attrs.$observe('dy', applyAndSet('dy', parseInt, 0, ctrl));
      }
    };
  }])

  .directive('tile', ['applyAndSet', function (applyAndSet) {
    return {
      type: 'svg',
      templateUrl: 'views/partials/tile.svg',
      restrict: 'E',
      replace: true,
      require: '^grid',
      scope: {
        classes: '@',
        icon: '@'
      },
      link: function _linker(scope, $element, $attrs, ctrl) {
        // observers
        $attrs.$observe('posX', applyAndSet('posX', parseInt, 0, scope));
        $attrs.$observe('posY', applyAndSet('posY', parseInt, 0, scope));
        $attrs.$observe('width', applyAndSet('width', parseInt, 1, scope));
        $attrs.$observe('height', applyAndSet('height', parseInt, 1, scope));
        $attrs.$observe('horizPad', applyAndSet('horizPad', parseInt, 0, scope));
        $attrs.$observe('verticalPad', applyAndSet('verticalPad', parseInt, 0, scope));

        // watchers
        scope.$watch(
          function __watcher() {
            return [scope.posX, scope.width, scope.horizPad];
          },
          function __changed() {
            scope.x = ctrl.coordOfX(scope.posX, scope.width, scope.horizPad);
          }, true);

        scope.$watch(
          function __watcher() {
            return [scope.posY, scope.height, scope.verticalPad];
          },
          function __changed() {
            scope.y = ctrl.coordOfX(scope.posY, scope.height, scope.verticalPad);
          }, true);
      }
    };
  }])

  .value('applyAndSet', function (name, func, dfault) {
    var objs = [];
    for (var i=3; i<arguments.length; i++) { 
      var obj = arguments[i];
      objs.push(obj);
      obj[name] = dfault;
    }
    return function __setObjs(newValue) {
      _.each(objs, function __setObj(obj) { 
        obj[name] = newValue ? func(newValue) : dfault; 
      })
    };
  })

  ;
