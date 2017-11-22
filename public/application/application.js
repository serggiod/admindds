angular
    .module('legapp', ['ngRoute', 'mgcrea.ngStrap', 'textAngular'])
    .config(function($routeProvider, $httpProvider) {
        if (!$httpProvider.defaults.headers.get) $httpProvider.defaults.headers.get = {};
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

        $routeProvider
            .when('/', {
                redirectTo: '/boletin'
            })
            .when('/boletin', {
                templateUrl: 'views/boletinView.html',
                controller: 'boletinController'
            })
            .otherwise({ redirectTo: '/boletin' });
    });