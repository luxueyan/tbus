
do (_, angular) ->

    angular.module('controller').controller 'HomepageCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$window, @map_loan_summary', class
            constructor: (@api, @user, @$scope, @$rootScope, @$window, @map_loan_summary) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'landing'

                EXTEND_API @api

                @query()


            query: ->

                @$scope.loading = true

                (@api.get_homepage_loans()

                    .then @api.process_response
                    .then @api.TAKE_RESPONSE_DATA

                    .then (data) =>
                        @$scope.list =
                            _.groupBy(
                                data.map(@map_loan_summary),
                                'product_key'
                            )

                    .finally =>
                        @$scope.loading = false
                )

                ###
                (@api.get_loan_list()

                    .then (data) =>

                        _.forOwn(data, (value, key) ->
                            data[key] = _.sortByOrder(value, ['timeOpen'], ['desc'])
                        )

                        {open, scheduled, finished, settled} = data

                        open_CPTJ = []
                        open_NEW = []
                        open_others = []
                        others_CPTJ = []
                        others_others = []
                        _.each(
                            open,
                            (item) ->
                                key = item.loanRequest.productKey
                                if key == 'CPTJ'
                                    open_CPTJ.push(item)
                                else if key == 'NEW'
                                    open_NEW.push(item)
                                else
                                    open_others.push(item)
                        )

                        _.each(
                            _.flatten([scheduled, finished, settled]),
                            (item) ->
                                key = item.loanRequest.productKey
                                if key == 'CPTJ'
                                    others_CPTJ.push(item)
                                else
                                    others_others.push(item)
                        )

                        @$scope.list =
                            _([open_CPTJ, open_NEW, others_CPTJ, others_others])
                                .flatten()
                                .take(1)
                                .map(map_loan_summary)
                                .value()

                    .finally =>
                        @$scope.loading = false
                )
                ###





    EXTEND_API = (api) ->

        api.__proto__.get_homepage_loans = ->

            @$http
                .get '/api/v3/loans/getMobileHomepageLoans'

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR

