
do (_, angular) ->

    angular.module('controller').controller 'AboutCtrl',

        _.ai '            @$scope, @$rootScope, @$window, @$routeParams', class
            constructor: (@$scope, @$rootScope, @$window, @$routeParams) ->

                @$window.scrollTo 0, 0

                {from, tab} = @$routeParams

                is_from_app = from == 'app'

                @$rootScope.state = 'more' unless is_from_app

                current_tab = tab or 'index'

                angular.extend @$scope, {
                    is_from_app
                    current_tab
                }



