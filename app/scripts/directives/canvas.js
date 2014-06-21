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
        $attrs.$observe('hPad', applyAndSet('hPad', parseInt, 0, scope));
        $attrs.$observe('vPad', applyAndSet('vPad', parseInt, 0, scope));

        // watchers
        scope.$watch(
          function __watcher() {
            return [scope.posX, scope.width, scope.hPad];
          },
          function __changed() {
            scope.x = ctrl.coordOfX(scope.posX, scope.width, scope.hPad);
          }, true);

        scope.$watch(
          function __watcher() {
            return [scope.posY, scope.height, scope.vPad];
          },
          function __changed() {
            scope.y = ctrl.coordOfX(scope.posY, scope.height, scope.vPad);
          }, true);
      }
    };
  }])

  .directive('polar', ['applyAndSet', function (applyAndSet) {
    return {
      type: 'svg',
      scope: true,
      template: '<g ng-transclude />',
      restrict: 'E',
      replace: true,
      transclude: true,
      controller: function _controller() {
        this.polarToCartesian = function (radius, angleInDegrees) {
          var angleInRadians = angleInDegrees * Math.PI / 180.0;
          var x = this.cx + radius * Math.cos(angleInRadians);
          var y = this.cy + radius * Math.sin(angleInRadians);
          return {'x':x, 'y':y};
        }     
      },
      link: function _linker(scope, $element, $attrs, ctrl) {
        $attrs.$observe('n', applyAndSet('n', parseInt, 1, ctrl, scope));
        $attrs.$observe('cx', applyAndSet('cx', parseInt, 0, ctrl));
        $attrs.$observe('cy', applyAndSet('cy', parseInt, 0, ctrl));
        $attrs.$observe('da', applyAndSet('da', parseInt, 0, ctrl));
      }
    }
  }])

  .directive('arc', ['applyAndSet', function (applyAndSet) {
    return {
      type: 'svg',
      templateUrl: 'views/partials/arc.svg',
      restrict: 'E',
      replace: true,
      require: '^polar',
      scope: {
        classes: '@',
        icon: '@'
      },
      link: function _linker(scope, $element, $attrs, ctrl) {
        // filler
        scope.p = [];
        scope.tRot = scope.isReflex = 0;
        _.each(_.range(5), function __init(i) { scope.p[i] = {'x':0,'y':0}; });

        // observers
        $attrs.$observe('a', applyAndSet('a', parseInt, 0, scope));
        $attrs.$observe('rPad', applyAndSet('rPad', parseInt, 5, scope));
        $attrs.$observe('inner', applyAndSet('inner', parseFloat, 10, scope));
        $attrs.$observe('outer', applyAndSet('outer', parseFloat, 20, scope));

        // watchers
        scope.$watch(
          function __watcher() {
            return [scope.a, scope.inner, scope.outer, scope.rPad];
          },
          function __changed() {
            scope.a = scope.a % ctrl.n;
            var sweep = 360.0 / ctrl.n,
                a1 = scope.a * sweep + scope.rPad,
                a2 = (scope.a+1) * sweep - scope.rPad,
                rm = (scope.inner+scope.outer)/2.0,
                am = (a1+a2)/2.0;
            scope.p[0] = ctrl.polarToCartesian(scope.outer, a1);
            scope.p[1] = ctrl.polarToCartesian(scope.outer, a2);
            scope.p[2] = ctrl.polarToCartesian(scope.inner, a2);
            scope.p[3] = ctrl.polarToCartesian(scope.inner, a1);
            scope.p[4] = ctrl.polarToCartesian(rm, am);
            scope.tRot = am + 90;
            scope.isReflex = sweep > 180 ? 1 : 0;
          }, true);
      }
    }
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
