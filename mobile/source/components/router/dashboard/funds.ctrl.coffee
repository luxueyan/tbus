
do (_, angular, moment) ->

    angular.module('controller').controller 'FundsCtrl',

        _.ai '            @api, @$scope, @$window, @$routeParams, @map_funds_summary', class
            constructor: (@api, @$scope, @$window, @$routeParams, @map_funds_summary) ->

                @$window.scrollTo 0, 0

                query_set = {}

                angular.extend @$scope, {
                    query_set
                }

                EXTEND_API @api

                @query(query_set)


            query: (query_set, options = {}) ->

                if options.on_next_page
                    query_set.page++
                else
                    query_set.page = 1
                    @$scope.list = []

                @$scope.loading = true

                (@api.get_user_funds(query_set, false)

                    .then ({results, totalSize}) =>

                        @$scope.list = @$scope.list.concat results.map(@map_funds_summary)

                        angular.extend @$scope.list, {totalSize}

                    .finally =>
                        @$scope.loading = false
                )


            infinite_scroll: (distance) =>

                return if distance >= 0

                @$scope.$evalAsync =>
                    @query(@$scope.query_set, {on_next_page: true})
                        .then => @$scope.$broadcast('scrollpointShouldReset')


            convert_start_date: (num, unit) ->

                date = moment().subtract(num, unit)

                return moment(date.format 'YYYY-MM-DD').unix() * 1000






    EXTEND_API = (api) ->

        api.__proto__.get_user_funds = (query_set = {}, cache = false) ->

            convert_to_day = (date) ->
                moment(date.format 'YYYY-MM-DD').unix() * 1000

            _.defaults query_set, {
                type: ''
                status: 'SUCCESSFUL'
                operation: _.split 'IN OUT FREEZE'
                startDate: convert_to_day moment().subtract 10, 'y'
                endDate: convert_to_day moment().add 1, 'd'
                page: 1
                pageSize: 10
            }

            @$http
                .get '/api/v2/user/MYSELF/funds/query',
                    params: _.compact query_set
                    cache: cache

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR







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
