'use strict';
angular.module('planning').directive('onBlur',
  //directive that executes an expression when the element is blurred
  function () {
    return function (scope, element, attributes) {
      element.bind('blur', function () {
        if (!element.is(':hidden')) {
          scope.$apply(attributes.onBlur);
        }
      });
      element.bind('keypress', function (event) {
        if (event.which === 13) {
          scope.$apply(attributes.onBlur);
        }
      });
    };
  }
);