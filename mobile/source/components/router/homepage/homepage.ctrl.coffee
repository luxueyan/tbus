
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

                        list_ALL =
                            _([open, scheduled, finished, settled])
                                .flatten()
                                .compact()
                                .value()

                        list_CPTJ =
                            _(list_ALL)
                                .filter (item) ->
                                    item.loanRequest.productKey == 'CPTJ'
                                .value()

                        list_OTHERS =
                            _(list_ALL)
                                .filter (item) ->
                                    item.loanRequest.productKey != 'CPTJ'
                                .value()

                        @$scope.list =
                            _(list_CPTJ.concat(list_OTHERS))
                                .take 1
                                .map map_loan_summary
                                .value()

                    .finally =>
                        @$scope.loading = false
                )

