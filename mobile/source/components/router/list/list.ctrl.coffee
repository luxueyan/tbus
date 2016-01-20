
do (_, angular) ->

    angular.module('controller').controller 'ListCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$location, @$window, map_loan_summary, @$routeParams', class
            constructor: (@api, @user, @$scope, @$rootScope, @$location, @$window, map_loan_summary, @$routeParams) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'list'

                filter_type = @$routeParams.type

                angular.extend @$scope, {
                    filter_type
                    page_path: @$location.path()[1..]
                    loading: true
                }

                # mock data (TODO: use real data instead )
                (@api.get_loan_list_by_config('', 20, false)

                    .then ({results}) =>

                        @$scope.list =
                            _(results)
                                .compact()
                                .map map_loan_summary
                                .value()

                        _.split('LHB DCB SBLC').forEach (product) =>
                            @$scope.list[product] = @$scope.list


                    .finally =>
                        @$scope.loading = false
                )

