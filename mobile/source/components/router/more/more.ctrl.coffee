
do (_, angular) ->

    angular.module('controller').controller 'MoreCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$window, @$location', class
            constructor: (@api, @user, @$scope, @$rootScope, @$window, @$location) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'more'


            logout: ->

                @api.logout().then =>

                    @$location
                        .path '/'
                        .search t: _.now()

                    @$scope.$on '$locationChangeStart', (event, new_path) =>
                        event.preventDefault()
                        @$window.location.href = new_path
