
do (_, angular) ->

    angular.module('controller').controller 'FeatureCtrl',

        _.ai '            @api, @$scope, @$window, @$routeParams', class
            constructor: (@api, @$scope, @$window, @$routeParams) ->

                @$window.scrollTo 0, 0

                {feature} = @$routeParams

                angular.extend @$scope, {
                    feature: feature or 'safety'
                }
