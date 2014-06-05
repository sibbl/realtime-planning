'use strict';
angular.module('planning').directive('onlyDigits', function () {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function (scope, element, attrs, ngModel) {
      console.log('link');
      if (!ngModel) return;
      ngModel.$parsers.unshift(function (inputValue) {
        var digits = inputValue.split('').filter(function (s) { return (!isNaN(s) && s != ' '); }).join('');
        ngModel.$viewValue = digits;
        ngModel.$render();
        if(digits == '') digits = '0'; //return 0, if empty
        return digits;
      });
    }
  };
});