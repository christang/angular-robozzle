'use strict';

angular
  .module('robozzleApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'mouseUI',
    'ui.slider'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/demo1', {
        templateUrl: 'views/demo1.html',
        controller: 'DemoCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
