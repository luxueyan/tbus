
do (_, angular) ->

    angular.module('controller').controller 'ListCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$window, @map_loan_summary, @map_assignment_summary, @$routeParams', class
            constructor: (@api, @$scope, @$rootScope, @$window, @map_loan_summary, @map_assignment_summary, @$routeParams) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'list'

                current_tab = @$routeParams.tab or 'loan'

                query_set = {}

                if current_tab is 'loan'
                    query_set.product = 'GDSY'

                angular.extend @$scope, {
                    current_tab
                    query_set
                }

                @query(query_set)


            query: (query_set, options = {}) ->

                if @$scope.current_tab is 'loan'

                    if options.on_next_page
                        query_set.currentPage++
                    else
                        query_set.currentPage = 1
                        @$scope.list = []

                    @$scope.loading = true

                    (@api.get_loan_list_by_config(query_set)

                        .then ({results, totalSize}) =>

                            @$scope.list = @$scope.list.concat results.map(@map_loan_summary)

                            angular.extend @$scope.list, {totalSize}

                        .finally =>
                            @$scope.loading = false
                    )

                else if @$scope.current_tab is 'assignment'

                    if options.on_next_page
                        query_set.currentPage++
                    else
                        query_set.currentPage = 0
                        @$scope.list = []

                    @$scope.loading = true

                    (@api.get_assignment_list(query_set)

                        .then ({results, totalSize}) =>

                            @$scope.list = @$scope.list.concat(
                                _(results.map(@map_assignment_summary))
                                    .sortBy (item) ->
                                        ['OPENED', 'FINISHED'].indexOf(item.status)
                                    .value()
                            )

                            angular.extend @$scope.list, {totalSize}

                        .finally =>
                            @$scope.loading = false
                    )


            infinite_scroll: (distance) =>

                return if distance >= 0

                @$scope.$evalAsync =>
                    @query(@$scope.query_set, {on_next_page: true})
                        .then => @$scope.$broadcast('scrollpointShouldReset')

