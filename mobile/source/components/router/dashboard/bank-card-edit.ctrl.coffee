
do (_, angular) ->

    angular.module('controller').controller 'BankCardEditCtrl',

        _.ai '            @banks, @user, @api, @$scope, @$rootScope, @$window, @$interval, @popup_payment_state', class
            constructor: (@banks, @user, @api, @$scope, @$rootScope, @$window, @$interval, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                angular.extend @$scope, {
                    store: {}
                }

                @submit_sending = false

                @captcha = {timer: null, count: 60, count_default: 60, has_sent: false, buffering: false}

                if !@user.has_bank_card or !@user.has_payment_password
                    @popup_payment_state {
                        user: @user
                        page: 'bank-card-edit'
                    }

                EXTEND_API @api


            send_mobile_captcha: (mobile) ->

                (@api.payment_pool_replace_card_sent_captcha(mobile)

                    .then =>
                        @captcha.timer = @$interval =>
                            @captcha.count -= 1

                            if @captcha.count < 1
                                @$interval.cancel @captcha.timer
                                @captcha.count = @captcha.count_default
                                @captcha.buffering = false
                        , 1000

                        @captcha.has_sent = @captcha.buffering = true

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                            return

                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        @$window.alert @$scope.msg[key] or key
                )


            bind_card: ({bank, cardNo, smsCaptcha}) ->

                @submit_sending = true

                bind_card_data = {
                    userId: @user.info.id,
                    mobile: @user.info.mobile,
                    name: @user.info.name,
                    idCardNumber: @user.info.idNumber,
                    bankCode: bank.bankCode,
                    accountNumber: cardNo,
                    smsCaptcha: smsCaptcha
                }

                (@api.payment_pool_replace_card(bind_card_data)

                    .then @api.process_response

                    .then (data) =>
                        @$window.alert @$scope.msg.SUCCEED
                        @api.user_fetching_promise = null
                        @user.has_logged_in = false
                        @$window.history.back()

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                            return

                        @submit_sending = false

                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        msg = @$scope.msg[key] or key

                        if key in _.split 'REGISTER_FAILED CHECK_CARD_FAILED BIND_CARD_FAILED'
                            detail = _.get data, 'error[0].value', ''
                            msg += if detail then "，#{ detail }" else ''

                        @$window.alert msg
                )


            does_not_exist_bank: (value) ->
                _.every @user.bank_account_list, (item) -> item.account.account isnt value








    EXTEND_API = (api) ->

        api.__proto__.payment_pool_replace_card_sent_captcha = (mobile) ->

            @$http
                .post '/api/v2/smsCaptcha',
                    {mobile, smsType: 'CREDITMARKET_CAPTCHA'}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_replace_card = (data) ->

            @$http
                .post '/api/v2/user/checkBankcard', data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
