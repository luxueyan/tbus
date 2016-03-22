
do (_, angular) ->

    angular.module('controller').controller 'HomepageCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$window, @map_loan_summary', class
            constructor: (@api, @$scope, @$rootScope, @$window, @map_loan_summary) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'landing'

                angular.extend @$scope, {
                    page_path: './'
                    carousel_height: do (width = @$window.document.body.clientWidth) ->
                        # width * 300 / 640 # aspect ratio of banner image
                }

                [
                    {
                        product: 'NEW'
                        pageSize: 1
                    }

                    {
                        product: 'HOT'
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

