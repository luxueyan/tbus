
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

                        @query(query_set, query_set.product)


            query: (query_set, key_suffix) ->

                if key_suffix
                    key_suffix = key_suffix.toLowerCase()
                    loading = "loading_#{ key_suffix }"
                    list = "list_#{ key_suffix }"

                else
                    loading = 'loading'
                    list = 'list'

                @$scope[loading] = true

                (@api.get_loan_list_by_config(query_set, false)

                    .then ({results}) =>

                        @$scope[list] =
                            _(results)
                                .compact()
                                .map @map_loan_summary
                                .value()

                    .finally =>
                        @$scope[loading] = false
                )


