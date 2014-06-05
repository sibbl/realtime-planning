'use strict';

var CONFIG = {
  clientId: '350332239258-l5s0gou7bvn7lja9qqe5c2don3gqu9p1.apps.googleusercontent.com',
  apiKey: 'IzaSyBLVWSlLULk3ng3U5D1G-YhUSt_tltGR14',
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.install'
  ]
};

var app = {};

app.module = angular.module('planning', []);

//type for plan categories
app.PlanCategory = function () {
};

//type for plan items
app.PlanItem = function () {
};

//type for distribution
app.PlanItemDistribution = function() {
};

//Initializer for constructing via the realtime API
app.PlanCategory.prototype.initialize = function (title) {
  var model = gapi.drive.realtime.custom.getModel(this);

  this.title = model.createString(title);
  this.items = model.createList();
};

app.PlanItem.prototype.initialize = function (title) {
  var model = gapi.drive.realtime.custom.getModel(this);

  this.title = model.createString(title);
  this.distribution = model.createMap();
};

app.PlanItemDistribution.prototype.initialize = function () {
  var model = gapi.drive.realtime.custom.getModel(this);

  this.consumeCount = model.createString("0");
  this.provideCount = model.createString("0");
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
  $rootScope.$on('planCategories.token_refresh_required', function () {
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

  //PlanCategory class
  app.PlanCategory.prototype.title = gapi.drive.realtime.custom.collaborativeField('title');
  app.PlanCategory.prototype.items = gapi.drive.realtime.custom.collaborativeField('items');
  gapi.drive.realtime.custom.registerType(app.PlanCategory, 'planCategory');
  gapi.drive.realtime.custom.setInitializer(app.PlanCategory, app.PlanCategory.prototype.initialize);
  //register our PlanItem class
  app.PlanItem.prototype.title = gapi.drive.realtime.custom.collaborativeField('title');
  app.PlanItem.prototype.distribution = gapi.drive.realtime.custom.collaborativeField('distribution');
  gapi.drive.realtime.custom.registerType(app.PlanItem, 'planItem');
  gapi.drive.realtime.custom.setInitializer(app.PlanItem, app.PlanItem.prototype.initialize);
  //register our PlanItemDistribution class
  app.PlanItemDistribution.prototype.consumeCount = gapi.drive.realtime.custom.collaborativeField('consumeCount');
  app.PlanItemDistribution.prototype.provideCount = gapi.drive.realtime.custom.collaborativeField('provideCount');
  gapi.drive.realtime.custom.registerType(app.PlanItemDistribution, 'planItemDistribution');
  gapi.drive.realtime.custom.setInitializer(app.PlanItemDistribution, app.PlanItemDistribution.prototype.initialize);

  $(document).ready(function () {
    angular.bootstrap(document, ['planning']);
  });
});
