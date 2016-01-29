
do (_, angular) ->

    angular.module('controller').controller 'DashboardCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$window, @$location', class
            constructor: (@api, @user, @$scope, @$rootScope, @$window, @$location) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                @$scope.fund = {
                    available: @user.fund.availableAmount
                    total: @user.fund.availableAmount + @user.fund.dueInAmount + @user.fund.frozenAmount
                    daily: @user.statistics.yesterdayIncome
                    total_interest: @user.statistics.investInterestAmount
                    outstanding_interest: @user.fund.outstandingInterest
                }

                (@api
                    .fetch_user_coupons()

                    .then (data) =>

                        all_coupon_list = _.clone data

                        available_coupon_list =
                            _(all_coupon_list)
                                .filter (item) ->
                                    item.status in _.split 'INITIATED PLACED'
                                .value()

                        @$scope.available_coupon_length = available_coupon_list.length
                )

                (@api
                    .get_user_investments()
                    .then (data) =>
                        @$scope.investments_length = data.length
                )

                (@api.get_user_repayments()
                    .then (response) =>
                        @$scope.next_month_undue_repayment =
                            do (list = _.get(response, 'data.results')) ->
                                _.sum list, 'amount'
                )

                # prefetch following API calls for getting out from cache directly later on

                @api.get_user_funds()


            logout: ->

                @api.logout().then =>

                    @$location
                        .path '/'
                        .search t: _.now()

                    @$scope.$on '$locationChangeStart', (event, new_path) =>
                        event.preventDefault()
                        @$window.location.href = new_path
