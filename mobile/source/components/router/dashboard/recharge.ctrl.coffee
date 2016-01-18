
do (_, angular) ->

    angular.module('controller').controller 'RechargeCtrl',

        _.ai '            @user, @api, @baseURI, @$location, @$scope, @$window, @mg_alert, @$routeParams', class
            constructor: (@user, @api, @baseURI, @$location, @$scope, @$window, @mg_alert, @$routeParams) ->

                @$window.scrollTo 0, 0

                @next_path = @$routeParams.next

                angular.extend @$scope, {
                    bank_account: @user.bank_account
                    available_amount: @user.fund.availableAmount
                }

                @submit_sending = false


            submit: (amount) ->

                @submit_sending = true

                (@api.payment_ump_non_password_recharge(amount)

                    .then (data) =>
                        unless data.success is true
                            @$q.reject data

                    .then (data) =>
                        @mg_alert @$scope.msg.success

                        if @next_path
                            @$location
                                .path @next_path
                                .search 'next', null
                        else
                            @$location.path '/dashboard/funds'

                        @$scope.$on '$locationChangeSuccess', =>
                            @$window.location.reload()

                    .catch (data) =>
                        message = _.get data, 'error[0].message'

                        if message
                            @mg_alert message
                                .result.finally =>
                                    @$location.path '/dashboard'
                        else
                            # something wrong on server side

                    .finally =>
                        @submit_sending = false
                )