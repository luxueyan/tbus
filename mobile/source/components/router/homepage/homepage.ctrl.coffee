
do (_, angular) ->

    angular.module('controller').controller 'HomepageCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$window, map_loan_summary', class
            constructor: (@api, @user, @$scope, @$rootScope, @$window, map_loan_summary) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'landing'

                @$scope.loading = true

                (@api.get_loan_list()

                    .then (data) =>

                        {open, scheduled, finished, settled} = data

                        @$scope.list =
                            _([open, scheduled, finished, settled])
                                .flatten()
                                .compact()
                                .filter (item) ->
                                    item.loanRequest.productKey == 'GDSY'
                                .take 1
                                .map map_loan_summary
                                .value()

                    .finally =>
                        @$scope.loading = false
                )

