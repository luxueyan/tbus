
do (angular) ->

    angular.module('directive').directive 'gyroFooter', ->

        restrict: 'AE'
        replace: true
        transclude: true
        templateUrl: 'components/footer/footer.tmpl.html'

        scope: {}

        controller: _.ai '@$element, @$location, @$scope, @$rootScope', class
            constructor: (@$element, @$location, @$scope, @$rootScope) ->

                Object.defineProperties @$scope, {
                    state: get: => @$rootScope.state
                }

                @$rootScope.$on '$routeChangeStart', (event, next, current) =>
                    @$rootScope.state = ''


        controllerAs: 'self'
