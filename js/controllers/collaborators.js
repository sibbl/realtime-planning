'use strict';

angular.module('planning').controller('CollaboratorsController', ['$scope', 'config',
  /**
   * Controller for displaying the list of current collaborators. Expects
   * to inherit the document from a parent scope.
   *
   * @param {angular.Scope} $scope
   * @param {object} config
   * @constructor
   */
  function ($scope, config) {
    var appId = config.clientId.split('.').shift();

    var collaboratorListener = function () {
      $scope.$apply(function () {
        $scope.collaborators = $scope.realtimeDocument.getCollaborators();
      });
    };
    $scope.collaborators = $scope.realtimeDocument.getCollaborators();

    $scope.realtimeDocument.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, collaboratorListener);
    $scope.realtimeDocument.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, collaboratorListener);

    $scope.$on('$destroy', function () {
      var doc = $scope.realtimeDocument;
      if (doc) {
        doc.removeEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, collaboratorListener);
        doc.removeEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, collaboratorListener);
      }
    });

    $scope.share = function () {
      var fileId = this.fileId;
      var client = new gapi.drive.share.ShareClient(appId);
      client.setItemIds([fileId]);
      client.showSettingsDialog();
    };

  }]
);
