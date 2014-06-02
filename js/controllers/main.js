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
    $scope.planItems = realtimeDocument.getModel().getRoot().get('planItems');
    $scope.newPlanItem = '';

    /**
     * Add a new plan item to the list, resets the new item text.
     */
    $scope.addPlanItem = function () {
      if (this.newPlanItem) {
        realtimeDocument.getModel().beginCompoundOperation();
        var planItem = realtimeDocument.getModel().create(app.PlanItem, this.newPlanItem);
        this.newPlanItem = '';
        this.planItems.push(plan);
        realtimeDocument.getModel().endCompoundOperation();
      }
    };

    //begin editing 
    $scope.editPlanItem = function (planItem) {
      $scope.editedPlanItem = planItem;
    };

    //cancel editing
    $scope.donePlanItemEditing = function () {
      $scope.editedPlanItem = null;
    };

    //delete a plan item removing it from the list.
    $scope.removePlanItem = function (planItem) {
      this.planItems.removeValue(planItem);
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