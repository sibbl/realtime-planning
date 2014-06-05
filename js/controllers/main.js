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

    //begin editing of a category
    $scope.editCategory = function (category) {
      $scope.editedCategory = category;
    };

    //cancel editing of acategory
    $scope.doneCategoryEditing = function () {
      $scope.editedCategory = null;
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
        this.newItemTitle = '';
        this.planCategories.get(categoryIndex).items.push(item);
        realtimeDocument.getModel().endCompoundOperation();
      }
    };

    //begin editing of a plan item
    $scope.editItem = function (item) {
      $scope.editedItem = item;
    };

    //cancel editing of plan item
    $scope.doneItemEditing = function () {
      $scope.editedItem = null;
    };

    //delete a plan item by removing it from its parent category
    $scope.removeItem = function (categoryIndex,item) {
      this.planCategories.get(categoryIndex).items.removeValue(item);
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