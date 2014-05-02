'use strict';

angular
  .module('robozzleApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'robozzleObjects',
    'robozzleCanvas',
    'robozzleMain'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
