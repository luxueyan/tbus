
do (angular) ->

    angular.module('controller').controller 'WithdrawCtrl',

        _.ai '            @user, @api, @$location, @$scope, @$window, @$q, @mg_alert, @$routeParams, @popup_payment_state', class
            constructor: (@user, @api, @$location, @$scope, @$window, @$q, @mg_alert, @$routeParams, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                angular.extend @$scope, {
                    bank_account: _.clone @user.bank_account
                    available_amount: @user.fund.availableAmount
                    total_amount: @user.fund.availableAmount + @user.fund.frozenAmount
                }

                @submit_sending = false

                @api.get_available_bank_list().then (data) =>
                    @$scope.bank_account.bank_code = @$scope.bank_account.bank
                    @$scope.bank_account.bank = data[@$scope.bank_account.bank]

                do ({amount, bank} = @$routeParams) =>

                    if +amount
                        @$scope.amount = +amount

                    if bank
                        @$scope.bank_account = _.find @user.bank_account_list, id: bank

                if !@user.has_bank_card or !@user.has_payment_password
                    @popup_payment_state {
                        user: @user
                        page: 'withdraw'
                        page_path: 'dashboard/withdraw'
                        back_path: 'dashboard'
                    }


            pick_up_bank: (event, amount = 0) ->

                do event.preventDefault

                @$location
                    .path "dashboard/bank-card/#{ amount }"
                    .search back: "dashboard/withdraw/#{ amount }"


            submit: (amount = @$scope.amount or 0, password) ->

                @submit_sending = true

                (@api.payment_pool_check_password(password)

                    .then (data) =>
                        return @$q.reject(data) unless data.success is true
                        return data

                    .catch (data) =>
                        @$q.reject error: [message: 'INCORRECT_PASSWORD']


                    .then (data) => @api.payment_pool_withdraw(amount, password)

                    .then (data) =>
                        return @$q.reject(data) unless data.success is true
                        return data

                    .then (data) =>
                        @mg_alert @$scope.msg.SUCCEED
                            .result.finally =>
                                @$location.path 'dashboard'

                        @$scope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location = new_path

                    .catch (data) =>
                        @submit_sending = false
                        key = _.get data, 'error[0].message'
                        @mg_alert @$scope.msg[key] or key

                    .finally =>
                        42
                )
