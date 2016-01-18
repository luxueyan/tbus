
do (angular) ->

    angular.module('controller').controller 'ReturnResultsCtrl',

        _.ai '            @$scope, @$routeParams', class
            constructor: (@$scope, @$routeParams) ->

                angular.extend @$scope, {
                    result: @$routeParams.result
                    action: @$routeParams.action
                }
