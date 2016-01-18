
do (_, angular) ->

    angular.module('controller').controller 'ListCtrl',

        _.ai '            @api, @user, @$scope, @$location, @$window, map_loan_summary, @$routeParams', class
            constructor: (@api, @user, @$scope, @$location, @$window, map_loan_summary, @$routeParams) ->

                @$window.scrollTo 0, 0

                filter_type = @$routeParams.type

                angular.extend @$scope, {
                    filter_type
                    page_path: @$location.path()[1..]
                    loading: true
                }

                (@api.get_loan_list_by_config(filter_type, 20, false)

                    .then ({results}) =>

                        @$scope.list =
                            _(results)
                                .compact()
                                .map map_loan_summary
                                .value()

                    .finally =>
                        @$scope.loading = false
                )

