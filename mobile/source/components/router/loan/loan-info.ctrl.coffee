
do (_, angular) ->

    angular.module('controller').controller 'LoanInfoCtrl',

        _.ai '            @loan, @api, @$scope, @$window, @$location, map_loan_summary, @$routeParams', class
            constructor: (@loan, @api, @$scope, @$window, @$location, map_loan_summary, @$routeParams) ->

                @$window.scrollTo 0, 0

                current_tab = @$routeParams.tab or 'security'

                angular.extend @$scope, {
                    current_tab
                    loan: map_loan_summary @loan
                }

                EXTEND_API @api

                if current_tab is 'profit'

                    @$scope.loading_repayments = true

                    (@api.get_loan_repayments(@loan.id)

                        .then (response) =>

                            if angular.isArray response.data
                                repayments = _.pluck response.data, 'repayment'
                            else
                                repayments = _.get response, 'data.repayments'

                            @$scope.repayments = repayments.map (repayment) ->

                                return {
                                    due_date: new Date(repayment.dueDate)
                                    amount: repayment.amount
                                    amount_interest: repayment.amountInterest
                                    amount_principal: repayment.amountPrincipal
                                    amount_outstanding: repayment.amountOutstanding
                                }

                        .finally =>
                            @$scope.loading_repayments = false
                    )


            goto_tab: (new_tab) ->

                @$location
                    .replace()
                    .path @$location.path()
                    .search tab: new_tab









    EXTEND_API = (api) ->

        api.__proto__.get_loan_repayments = (id) ->

            @$http
                .get "/api/v2/loan/#{ id }/repayments"

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
