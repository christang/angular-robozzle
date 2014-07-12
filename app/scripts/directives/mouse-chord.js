'use strict';

angular.module('robozzleApp')

  .directive('mouseChord', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      link: function postLink(scope, $element, $attrs) {

        var handler = angular.noop, origin = {};

        function resetRegistered() {
          origin = {};
          $element.off();
        }

        function setHandler(newHandler) {
          if (newHandler) {
            handler = $parse(newHandler);
          } else {
            handler = angular.noop;
          }
        }

        function reset() {
          resetRegistered();
          $element.on('mousedown', begin);
        }

        function update(event) {
          var local = {
            '$dx': event.clientX - origin.x,
            '$dy': event.clientY - origin.y 
          };
          scope.$apply(function () {
            handler(scope, local);
          });
        }

        function begin(event) {
          resetRegistered();
          origin = {x: event.clientX, y: event.clientY};
          $element.on('mouseup', reset);
          $element.on('mousemove', update);
        }

        $attrs.$observe('onDisplacement', setHandler);
        $element.on('mousedown', begin);

      }
    };
  }]);
