
do (_, angular) ->

    angular.module('controller').controller 'FundsCtrl',

        _.ai '            @data, @$scope, @$window, @$routeParams, map_funds_summary', class
            constructor: (@data, @$scope, @$window, @$routeParams, map_funds_summary) ->

                @$window.scrollTo 0, 0

                @$scope.list = @data.results.map map_funds_summary







    angular.module('factory').factory 'map_funds_summary', -> (item) ->
        sign = (IN: '+', OUT: '-')[item.operation] or ''

        return {
            sign: sign
            type: item.type
            amount: item.amount
            date: item.recordTime
            operation: item.operation
            description: item.description
            status: item.status

            sign_css_class: switch sign
                when '+' then 'green'
                when '-' then 'red'
                else          'gray'
        }
