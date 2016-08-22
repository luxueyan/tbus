
do (_, angular) ->

    angular.module('controller').controller 'DashboardSubhomeCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$window, @$location', class
            constructor: (@api, @user, @$scope, @$rootScope, @$window, @$location) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                @$scope.now = Date.now()

                (@api.get_refer_count_and_reward()
                    .then ({totalCoupons}) =>
                        @$scope.invite_coupon_length = totalCoupons
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

                @$scope.default_bank_account = do (list = @user.bank_account_list) ->
                        _.find list, (item) -> item.defaultAccount is true



