
do (_, angular) ->

    angular.module('controller').controller 'SettingsCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$window, @$location, @$cookies', class
            constructor: (@api, @user, @$scope, @$rootScope, @$window, @$location, @$cookies) ->

                @$window.scrollTo 0, 0

                @$cookies.put 'invite_back_path', 'dashboard/settings'


            logout: ->

                @api.logout().then =>

                    @$location.path '/'
                    @$scope.$on '$locationChangeSuccess', =>
                        @$window.location.reload()
