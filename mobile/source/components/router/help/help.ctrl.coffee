
do (_, angular) ->

    angular.module('controller').controller 'HelpCtrl',

        _.ai '            @$scope, @$rootScope, @$window', class
            constructor: (@$scope, @$rootScope, @$window) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'more'



