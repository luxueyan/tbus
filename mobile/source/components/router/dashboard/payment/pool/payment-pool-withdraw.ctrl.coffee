
do (_, angular) ->

    angular.module('controller').controller 'WithdrawCtrl',

        _.ai '            @user, @api, @$location, @$scope, @$rootScope, @$window, @$q, @$uibModal, @popup_payment_state, @popup_payment_password, @ensure_open_channel', class
            constructor: (@user, @api, @$location, @$scope, @$rootScope, @$window, @$q, @$uibModal, @popup_payment_state, @popup_payment_password, @ensure_open_channel) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                @submit_sending = false

                bank_account = do (list = _.clone @user.bank_account_list) ->
                    item = _.find list, (item) -> item.defaultAccount is true
                    return (if item then item else _(list).first())

                angular.extend @$scope, {
                    bank_account
                    store: {bank_account}
                }

                if !@user.has_bank_card or !@user.has_payment_password
                    @popup_payment_state {
                        user: @user
                        page: 'withdraw'
                    }

                EXTEND_API @api


            calculate_withdraw_fee: (amount) ->

                return (
                    @api.calculate_withdraw_fee(amount)

                        .then ({totalFee, withdrawAmount}) =>
                            @$scope.totalFee = totalFee

                            if withdrawAmount > 0
                                @$q.resolve()
                            else
                                @$q.reject()
                )


            submit: ({bank_account, amount}) ->

                account = _.get bank_account, 'account.account'

                @submit_sending = true

                (@popup_payment_password()

                    .then (data) =>
                        @$scope.store.password = data
                        @api.payment_pool_check_password(@$scope.store.password)

                    .then @api.process_response

                    .catch (data) =>
                        return @$q.reject(data) if data is 'cancel'
                        return @$q.reject(data) if _.get(data, 'error') is 'access_denied'

                        @$q.reject error: [message: 'INCORRECT_PASSWORD']

                    .then => @ensure_open_channel()

                    .then (data) =>
                        post_data = {
                            # cardNo: account
                            amount
                            paymentPassword: @$scope.store.password
                        }

                        @api.payment_pool_withdraw(post_data)

                    .then @api.process_response

                    .then (data) =>
                        @api.flush_user_info()
                        @$scope.action_result = { success: true }

                        # @$window.alert @$scope.msg.SUCCEED

                        # @$scope.$on '$locationChangeSuccess', =>
                        #     @$window.location.reload()

                        # @$window.history.back()

                    .catch (data) =>
                        return if data is 'cancel'

                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                            return

                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        msg = @$scope.msg[key] or key

                        @$scope.action_result = { success: false, msg: msg }

                        # @$window.alert msg

                    .finally =>
                        @submit_sending = false
                )






    EXTEND_API = (api) ->

        api.__proto__.calculate_withdraw_fee = (amount) ->

            @$http
                .get "/api/v2/user/MYSELF/calculateWithdrawFee/#{ amount }"

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_withdraw = (data) ->

            @$http
                .post '/api/v2/payment/router/withdraw/MYSELF', data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
