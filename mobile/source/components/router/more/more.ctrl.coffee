
do (_, angular) ->

    angular.module('controller').controller 'MoreCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$window, @$location', class
            constructor: (@api, @user, @$scope, @$rootScope, @$window, @$location) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'more'


            logout: ->

                @api.logout().then =>

                    @$scope.$on '$locationChangeSuccess', =>
                        @$window.location.reload()

                    @$location
                        .path '/'
                        .search t: _.now()
