'use strict';

var svgModule = angular.module('robozzleApp');
 
svgModule

  .directive('proxy', function _factory() {
    return {
      restrict: 'A',
      controller: function _controller($scope, $element, $attrs) {
        this.register = function _register(node) {
          var first = true;
          $scope.$watchCollection(
            function _onChangeOf() {
              return $attrs;
            },
            function _update(newValues, oldValues) {
              function _addObserver(o) {
                $attrs.$observe(o, function _onChange(attrVal) {
                  node.setAttribute(o, attrVal);
                });
              }

              var newKeys = _.keys(newValues),
                  observables = _.filter(newKeys, function _isObservable(v) {
                return v[0] !== '$' && v !== 'id' && v !== 'proxy';
              });

              if (first) {
                _.each(observables, _addObserver);
                first = false;
              } else {
                var oldKeys = _.keys(oldValues);
                _.each(_.difference(observables, oldKeys), _addObserver);
              }
            });
        };
      }
    };
  })

  ;

// todo: 
// The following method:
//   $template = directiveTemplateContents(directiveValue);
// adds template contents by wrapping it in a div and taking
// its contents. Is this good for svg contents?

angular.forEach(['g', 'text'], function _map(svgElem) {
  
  svgModule
  
    .directive(svgElem, function _factory() {
      return {
        restrict: 'E',
        require: 'proxy',
        link: function _linker(scope, $element, $attrs, proxyCtrl) {
          var namespace = 'http://www.w3.org/2000/svg',
              node = document.createElementNS(namespace, svgElem);
          angular.element(node).append($element[0].childNodes);
          $element.replaceWith(node);
          proxyCtrl.register(node);
        }
      };
    });
  
});
