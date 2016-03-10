
do (_, angular, moment) ->

    angular.module('controller').controller 'FundsCtrl',

        _.ai '            @api, @$scope, @$window, @$routeParams, @map_funds_summary', class
            constructor: (@api, @$scope, @$window, @$routeParams, @map_funds_summary) ->

                @$window.scrollTo 0, 0

                query_set = {}

                angular.extend @$scope, {
                    back_path: @$routeParams.back
                    query_set
                }

                @query(query_set)


            query: (query_set, options = {}) ->

                if options.is_next_page
                    query_set.page++
                else
                    query_set.page = 1
                    @$scope.list = []

                @$scope.loading = true

                (@api.get_user_funds(query_set, false)

                    .then ({results, totalSize}) =>

                        Array::push.apply(@$scope.list, results.map(@map_funds_summary))

                        angular.extend @$scope.list, {totalSize}

                    .finally =>
                        @$scope.loading = false
                )


            infinite_scroll: (distance) =>

                return if distance >= 0

                @$scope.$evalAsync =>
                    @query(@$scope.query_set, {is_next_page: true})
                        .then => @$scope.$broadcast('scrollpointShouldReset')


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
