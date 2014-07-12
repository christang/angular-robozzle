'use strict';

angular.module('robozzleApp')

  .directive('mouseChord', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      link: function postLink(scope, $element, $attrs) {

        var handler = {}, origin = {};

        handler.anchor =
        handler.displacement =
        handler.release = angular.noop;

        function resetRegistered() {
          origin = {};
          $element.off();
        }

        function setHandler(type) {
          return function (newHandler) {
            if (newHandler) {
              handler[type] = $parse(newHandler);
            } else {
              handler[type] = angular.noop;
            }
          };
        }

        function reset() {
          var local = {
            '$dx': event.clientX - origin.x,
            '$dy': event.clientY - origin.y
          };
          resetRegistered();
          scope.$apply(function () {
            handler.release(scope, local);
          });
          $element.on('mousedown', begin);
        }

        function update(event) {
          var local = {
            '$dx': event.clientX - origin.x,
            '$dy': event.clientY - origin.y
          };
          scope.$apply(function () {
            handler.displacement(scope, local);
          });
        }

        function begin(event) {
          var local = {
            '$dx': 0,
            '$dy': 0
          };
          resetRegistered();
          origin = {x: event.clientX, y: event.clientY};
          scope.$apply(function () {
            handler.anchor(scope, local);
          });
          $element.on('mouseup', reset);
          $element.on('mousemove', update);
        }

        $attrs.$observe('onAnchor', setHandler('anchor'));
        $attrs.$observe('onDisplacement', setHandler('displacement'));
        $attrs.$observe('onRelease', setHandler('release'));
        $element.on('mousedown', begin);

      }
    };
  }]);
