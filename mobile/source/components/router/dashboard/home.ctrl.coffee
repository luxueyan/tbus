
do (_, angular) ->

    angular.module('controller').controller 'DashboardCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$window', class
            constructor: (@api, @user, @$scope, @$rootScope, @$window) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                @$scope.fund = {
                    available: @user.fund.availableAmount
                    total: @user.fund.availableAmount + @user.fund.dueInAmount + @user.fund.frozenAmount
                    total_interest: @user.statistics.investInterestAmount
                    outstanding_interest: @user.fund.outstandingInterest
                }

                (@api.get_user_coupons()
                    .then @api.TAKE_RESPONSE_DATA
                    .then ({totalSize}) =>
                        @$scope.available_coupon_length = totalSize

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                )

                (@api.get_user_investments()
                    .then ({totalSize}) =>
                        @$scope.investments_length = totalSize
                )

                (@api.get_user_repayments()
                    .then (response) =>
                        @$scope.next_month_undue_repayment =
                            do (list = _.get(response, 'data.results')) ->
                                _.sum list, 'amount'
                )

                @$scope.default_bank_account = do (list = @user.bank_account_list) ->
                        _.find list, (item) -> item.defaultAccount is true

