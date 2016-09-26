
do (_, angular) ->

    angular.module('controller').controller 'AboutCtrl',

        _.ai '            @$scope, @$rootScope, @$window, @$routeParams', class
            constructor: (@$scope, @$rootScope, @$window, @$routeParams) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'more'

                current_tab = @$routeParams.tab or 'index'

                angular.extend @$scope, {current_tab}



