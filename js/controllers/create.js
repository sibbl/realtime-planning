'use strict';

angular.module('planning').controller('CreateController', ['$scope', '$location', 'storage',
  /**
   * Controller for creating a new plan
   *
   * @param {angular.Scope} $scope
   * @param {angular.$location} $location
   * @param {!object} storage
   * @constructor
   */
  function ($scope, $location, storage) {
    $scope.message = 'Please wait';
    storage.requireAuth().then(function () {
      storage.createDocument('New plan').then(function (file) {
        $location.url('/plans/' + file.id + '/');
      });
    }, function () {
      $location.url('/install?target=' + encodeURIComponent($location.url()));
    });
  }]
);
