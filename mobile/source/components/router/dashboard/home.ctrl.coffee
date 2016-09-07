
do (_, angular) ->

    angular.module('controller').controller 'DashboardCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$window, @$location', class
            constructor: (@api, @user, @$scope, @$rootScope, @$window, @$location) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                @$scope.now = Date.now()

                @$scope.fund = {
                    available: @user.fund.availableAmount
                    total: @user.fund.availableAmount + @user.fund.dueInAmount + @user.fund.frozenAmount
                    total_interest: @user.statistics.investInterestAmount
                    outstanding_interest: @user.fund.outstandingInterest
                }

                (@api.get_refer_count_and_reward()
                    .then ({count}) =>
                        @$scope.has_invited_count = count
                )

                (@api.get_user_coupons()
                    .then @api.TAKE_RESPONSE_DATA
                    .then ({totalSize}) =>
                        @$scope.available_coupon_length = totalSize

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                )


