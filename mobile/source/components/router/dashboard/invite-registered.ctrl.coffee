
do (_, angular) ->

    angular.module('controller').controller 'InviteRegisteredCtrl',

        _.ai '            @user, @$location, @$scope, @$window', class
            constructor: (@user, @$location, @$scope, @$window) ->

                @$window.scrollTo 0, 0
