'use strict';

var CONFIG = {
  clientId: 'our-client-id',
  apiKey: 'our-api-key',
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.install'
  ]
};

var app = {};

app.module = angular.module('planning', []);

//simple type for plan items
app.PlanItem = function () {
};

//Initializer for constructing via the realtime API
app.PlanItem.prototype.initialize = function (title, providers, consumers) {
  var model = gapi.drive.realtime.custom.getModel(this);

  //TODO: implement our model
  this.title = model.createString(title);
  this.providers = model.createList(providers);
  this.consumers = model.createList(consumers);
};


//loads the document. Used to inject the collaborative document into the main controller.
app.loadFile = function ($route, storage) {
  var id = $route.current.params.fileId;
  var userId = $route.current.params.user;
  return storage.requireAuth(true, userId).then(function () {
    return storage.getDocument(id);
  });
};
app.loadFile.$inject = ['$route', 'storage'];

/**
 * Initialize our application routes
 */
app.module.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider
      .when('/plans/:fileId/:filter', {
        templateUrl: 'views/main.html',
        controller: 'MainController',
        resolve: {
          realtimeDocument: app.loadFile
        }
      })
      .when('/create', {
        templateUrl: 'views/loading.html',
        controller: 'CreateController'
      })
      .when('/install', {
        templateUrl: 'views/install.html',
        controller: 'InstallController'
      })
      .otherwise({
        redirectTo: '/install'
      });
  }]
);

//set up config
app.module.value('config', CONFIG);

//set up handlers for various authorization issues that may arise if the access token is revoked or expired.
app.module.run(['$rootScope', '$location', 'storage', function ($rootScope, $location, storage) {
  //error loading the document, likely due revoked access. Redirect back to home/install page
  $rootScope.$on('$routeChangeError', function () {
    $location.url('/install?target=' + encodeURIComponent($location.url()));
  });

  //token expired, refresh
  $rootScope.$on('planItems.token_refresh_required', function () {
    storage.requireAuth(true).then(function () {
      //no-op
    }, function () {
      $location.url('/install?target=' + encodeURIComponent($location.url()));
    });
  });
}]);

//bootstrap the app
gapi.load('auth:client:drive-share:drive-realtime', function () {
  gapi.auth.init();

  //monkey patch collaborative string for ng-model compatibility
  Object.defineProperty(gapi.drive.realtime.CollaborativeString.prototype, 'text', {
    set: gapi.drive.realtime.CollaborativeString.prototype.setText,
    get: gapi.drive.realtime.CollaborativeString.prototype.getText
  });

  //register our PlanItem class
  app.PlanItem.prototype.title = gapi.drive.realtime.custom.collaborativeField('title');
  app.PlanItem.prototype.providers = gapi.drive.realtime.custom.collaborativeField('providers');
  app.PlanItem.prototype.consumers = gapi.drive.realtime.custom.collaborativeField('consumers');
  gapi.drive.realtime.custom.registerType(app.PlanItem, 'planItem');
  gapi.drive.realtime.custom.setInitializer(app.PlanItem, app.PlanItem.prototype.initialize);

  $(document).ready(function () {
    angular.bootstrap(document, ['planning']);
  });
});
