
do (_, angular) ->

    angular.module('controller').controller 'FeatureCtrl',

        _.ai '            @$scope, @$window, @$routeParams', class
            constructor: (@$scope, @$window, @$routeParams) ->

                @$window.scrollTo 0, 0

                {feature} = @$routeParams

                angular.extend @$scope, {
                    feature: feature or 'safety'
                }

