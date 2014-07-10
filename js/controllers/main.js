'use strict';

angular.module('planning').controller('MainController', ['$scope', '$routeParams', 'realtimeDocument', 'config',
  /**
   * Controller for editing the plan items
   *
   * @param {angular.Scope} $scope
   * @param {angular.$routeParams} $routeParams
   * @param document
   * @constructor
   */
  function ($scope, $routeParams, realtimeDocument, config) {
    $scope.itemsPerRow = 4;

    $scope.fileId = $routeParams.fileId;
    $scope.realtimeDocument = realtimeDocument;
    var appId = config.clientId.split('.').shift();

    //get and watch collaborators
    var collaboratorListener = function () {
      $scope.$apply(function () {
        $scope.collaborators = $scope.realtimeDocument.getCollaborators();
      });
    };
    $scope.collaborators = $scope.realtimeDocument.getCollaborators();

    console.log("collaborators", $scope.collaborators);

    //read the current user
    $scope.currentUser = null;
    for(var i in $scope.collaborators) {
      if($scope.collaborators[i].isMe === true) $scope.currentUser = $scope.collaborators[i];
    }

    //returns a collaboration user
    $scope.getUser = function(userId) {
      for(var i in $scope.collaborators) {
        if($scope.collaborators[i].userId === userId) return $scope.collaborators[i];
      }
      return null;
    }

    //refresh collaborator list when someone leaves or joins the document
    $scope.realtimeDocument.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, collaboratorListener);
    $scope.realtimeDocument.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, collaboratorListener);

    //remove listeners when leaving the website
    $scope.$on('$destroy', function () {
      var doc = $scope.realtimeDocument;
      if (doc) {
        doc.removeEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, collaboratorListener);
        doc.removeEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, collaboratorListener);
      }
    });

    $scope.share = function () {
      var fileId = this.fileId;
      var client = new gapi.drive.share.ShareClient(appId.split("-").shift());
      client.setItemIds([fileId]);
      client.showSettingsDialog();
    };


    //get categories
    $scope.planCategories = realtimeDocument.getModel().getRoot().get('planCategories');

    //categories range helper for building rows
    $scope.planCategoriesRange = function() {
      var range = [];
      for( var i = 0; i < $scope.planCategories.length; i = i + $scope.itemsPerRow )
          range.push(i);
      return range;
    }

    //make sure that all plan items include our user id
    if($scope.currentUser.userId != null) {
      realtimeDocument.getModel().beginCompoundOperation();
      for(var i = 0; i < $scope.planCategories.length; i++) {
        var cat = $scope.planCategories.get(i);
        for(var k = 0; k < cat.items.length;k++) {
          var item = cat.items.get(k);
          if(item.distribution.has($scope.currentUser.userId) !== true) {
            var distributionData = $scope.realtimeDocument.getModel().create(app.PlanItemDistribution);
            item.distribution.set($scope.currentUser.userId, distributionData);
          }
        }
      }
      realtimeDocument.getModel().endCompoundOperation();
    }

    //create empty string models, which are bound to input fields in the UI
    $scope.newCategoryTitle = '';
    $scope.newItemTitle = '';

    //add new category
    $scope.addCategory = function () {
      if (this.newCategoryTitle) {
        realtimeDocument.getModel().beginCompoundOperation();
        var category = realtimeDocument.getModel().create(app.PlanCategory, this.newCategoryTitle);
        this.newCategoryTitle = '';
        this.planCategories.push(category);
        realtimeDocument.getModel().endCompoundOperation();
      }
    };

    //delete a category by removing it from the list
    $scope.removeCategory = function (category) {
      this.planCategories.removeValue(category);
    };

    //add new plan item
    $scope.addItem = function (categoryIndex) {
      if (this.newItemTitle) {
        realtimeDocument.getModel().beginCompoundOperation();
        var item = realtimeDocument.getModel().create(app.PlanItem, this.newItemTitle);

        var distributionData = realtimeDocument.getModel().create(app.PlanItemDistribution);
        item.distribution.set($scope.currentUser.userId, distributionData);

        this.newItemTitle = '';
        this.planCategories.get(categoryIndex).items.push(item);
        realtimeDocument.getModel().endCompoundOperation();
      }
    };

    //delete a plan item by removing it from its parent category
    $scope.removeItem = function (categoryIndex,item) {
      this.planCategories.get(categoryIndex).items.removeValue(item);
    };

    //begin editing of any item
    $scope.startEditing = function (item) {
      $scope.editedItem = item;
    };

    //cancel editing of any item
    $scope.doneEditing = function () {
      $scope.editedItem = null;
    };
    
    //undo local changes
    $scope.undo = function () {
      realtimeDocument.getModel().undo();
    };
    
    //check if there are undoable changes.
    $scope.canUndo = function () {
      return realtimeDocument.getModel().canUndo;
    };

    //undo local changes
    $scope.redo = function () {
      realtimeDocument.getModel().redo();
    };
    
    //check if there are redoable changes.
    $scope.canRedo = function () {
      return realtimeDocument.getModel().canRedo;
    };

    $scope.increaseNumber = function(modelItem) {
      if($scope.currentUser.userId == null) return;
      modelItem.text = (parseInt(modelItem.text)+1).toString();
    }
    $scope.decreaseNumber = function(modelItem) {
      if($scope.currentUser.userId == null) return;
      modelItem.text = (Math.max(parseInt(modelItem.text)-1,0)).toString();
    }
  }]
);