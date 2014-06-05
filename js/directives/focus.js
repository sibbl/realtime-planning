'use strict';
angular.module('planning').directive('focus', ['$timeout',
  //directive that places focus on the element it is applied to when the expression it binds to evaluates to true.
  function ($timeout) {
    return function (scope, elem, attrs) {
      scope.$watch(attrs.focus, function (value) {
        if (value) {
          $timeout(function () {
            elem[0].focus();
          }, 0, false);
        }
      });
    };
  }]
);