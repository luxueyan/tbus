
do (_, angular) ->

    angular.module('controller').controller 'ListCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$location, @$window, @map_loan_summary, @$routeParams', class
            constructor: (@api, @$scope, @$rootScope, @$location, @$window, @map_loan_summary, @$routeParams) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'list'

                filter_type = @$routeParams.type

                angular.extend @$scope, {
                    back_path: @$routeParams.back
                    filter_type
                    page_path: @$location.path()[1..]
                }

                if filter_type

                    query_set = {product: filter_type}

                    angular.extend @$scope, {query_set}

                    @query(query_set)

                else

                    [
                        {
                            product: 'LHB'
                            pageSize: 3
                        }

                        {
                            product: 'DCB'
                            pageSize: 3
                        }

                        {
                            product: 'SBTZ'
                            pageSize: 3
                        }

                    ].forEach (query_set) =>

                        @query(query_set, {key_suffix: query_set.product})


            query: (query_set, options = {}) ->

                if options.key_suffix
                    key_suffix = options.key_suffix.toLowerCase()
                    loading = "loading_#{ key_suffix }"
                    list = "list_#{ key_suffix }"

                else
                    loading = 'loading'
                    list = 'list'

                if options.on_next_page
                    query_set.currentPage++
                else
                    query_set.currentPage = 1
                    @$scope[list] = []

                @$scope[loading] = true

                (@api.get_loan_list_by_config(query_set, false)

                    .then ({results, totalSize}) =>

                        @$scope[list] = @$scope[list].concat results.map(@map_loan_summary)

                        angular.extend @$scope[list], {totalSize}

                    .finally =>
                        @$scope[loading] = false
                )


            infinite_scroll: (distance) =>

                return if distance >= 0

                @$scope.$evalAsync =>
                    @query(@$scope.query_set, {on_next_page: true})
                        .then => @$scope.$broadcast('scrollpointShouldReset')

