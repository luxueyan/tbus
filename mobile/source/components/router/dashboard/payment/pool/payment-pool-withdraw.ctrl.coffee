
do (_, angular) ->

    angular.module('controller').controller 'WithdrawCtrl',

        _.ai '            @user, @api, @$location, @$scope, @$rootScope, @$window, @$q, @$uibModal, @popup_payment_state, @popup_payment_password', class
            constructor: (@user, @api, @$location, @$scope, @$rootScope, @$window, @$q, @$uibModal, @popup_payment_state, @popup_payment_password) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                @submit_sending = false

                @bank_account_list = _.clone @user.bank_account_list

                bank_account = _.find @bank_account_list, (item) -> item.defaultAccount is true

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


                    .then (data) => @api.payment_pool_withdraw(account, amount, @$scope.store.password)

                    .then @api.process_response

                    .then (data) =>
                        @api.user_fetching_promise = null
                        @user.has_logged_in = false
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

                        if key in _.split 'WITHDRAW_FAILED'
                            detail = _.get data, 'error[0].value', ''
                            msg = if detail then "#{ detail }" else ''

                        @$scope.action_result = { success: false, msg: msg }

                        # @$window.alert msg

                    .finally =>
                        @submit_sending = false
                )






    EXTEND_API = (api) ->

        api.__proto__.payment_pool_withdraw = (cardNo, amount, paymentPassword) ->

            @$http
                .post '/api/v2/baofoo/withdraw/MYSELF',
                    {cardNo, amount, paymentPassword}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
