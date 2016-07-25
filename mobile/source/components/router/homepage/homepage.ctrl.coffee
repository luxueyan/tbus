
do (_, angular) ->

    angular.module('controller').controller 'HomepageCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$window, map_loan_summary', class
            constructor: (@api, @$scope, @$rootScope, @$window, map_loan_summary) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'landing'

                @$scope.loading = true

                (@api.get_loan_list_by_config({pageSize: 1})

                    .then ({results, totalSize}) =>

                        @$scope.list =
                            _(results)
                                .map map_loan_summary
                                .value()

                    .finally =>
                        @$scope.loading = false
                )

