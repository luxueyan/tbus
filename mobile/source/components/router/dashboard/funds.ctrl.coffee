
do (_, angular, moment) ->

    angular.module('controller').controller 'FundsCtrl',

        _.ai '            @api, @$scope, @$window, @$routeParams, @map_funds_summary', class
            constructor: (@api, @$scope, @$window, @$routeParams, @map_funds_summary) ->

                @$window.scrollTo 0, 0

                query_set = {}

                angular.extend @$scope, {
                    query_set
                }

                @query(query_set)


            query: (query_set) ->

                @$scope.loading = true

                (@api.get_user_funds(query_set, false)

                    .then ({results}) =>

                        @$scope.list = results.map @map_funds_summary

                    .finally =>
                        @$scope.loading = false
                )


            convert_start_date: (num, unit) ->

                date = moment().subtract(num, unit)

                return moment(date.format 'YYYY-MM-DD').unix() * 1000







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
