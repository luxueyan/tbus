
do (_, angular) ->

    angular.module('controller').controller 'ActivityCtrl',

        _.ai '            @$scope, @$window', class
            constructor: (@$scope, @$window) ->

                @$window.scrollTo 0, 0

