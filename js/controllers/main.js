'use strict';

angular.module('planning').controller('MainController', ['$scope', '$routeParams', 'realtimeDocument',
  /**
   * Controller for editing the plan items
   *
   * @param {angular.Scope} $scope
   * @param {angular.$routeParams} $routeParams
   * @param document
   * @constructor
   */
  function ($scope, $routeParams, realtimeDocument) {
    $scope.fileId = $routeParams.fileId;

    $scope.realtimeDocument = realtimeDocument;
    $scope.planCategories = realtimeDocument.getModel().getRoot().get('planCategories');

    //read the current user
    $scope.currentUser = null;
    var collaborators = realtimeDocument.getCollaborators();
    for(var i in collaborators) {
      if(collaborators[i].isMe === true) $scope.currentUser = collaborators[i];
    }

    //make sure that all plan items include our user id
    realtimeDocument.getModel().beginCompoundOperation();
    for(var i = 0; i < $scope.planCategories.length; i++) {
      var cat = $scope.planCategories.get(i);
      for(var k = 0; k < cat.items.length;k++) {
        var item = cat.items.get(k);
        if(item.distribution.has($scope.currentUser.userId) !== true) {
          var distributionData = realtimeDocument.getModel().create(app.PlanItemDistribution);
          item.distribution.set($scope.currentUser.userId, distributionData);
        }
      }
    }
    realtimeDocument.getModel().endCompoundOperation();

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

        console.log( item.distribution.items());

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
    $scope.editItem = function (item) {
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
    
    //cCheck if there are redoable changes.
    $scope.canRedo = function () {
      return realtimeDocument.getModel().canRedo;
    };
  }]
);