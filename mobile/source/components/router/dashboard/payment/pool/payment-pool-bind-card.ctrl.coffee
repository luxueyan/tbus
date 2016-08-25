
do (_, angular) ->

    angular.module('controller').controller 'PaymentPoolBindCardCtrl',

        _.ai '            @banks, @user, @api, @$scope, @$rootScope, @$window, @$q, @$location, @$interval, @$routeParams', class
            constructor: (@banks, @user, @api, @$scope, @$rootScope, @$window, @$q, @$location, @$interval, @$routeParams) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                return @$location.path 'dashboard' if @user.has_bank_card

                angular.extend @$scope, {
                    store: {}
                }

                @next_path = @$routeParams.next or 'dashboard'

                @submit_sending = false

                @captcha = {timer: null, count: 60, count_default: 60, has_sent: false, buffering: false}

                EXTEND_API @api


            send_mobile_captcha: ({user_name, id_number, bank, cardNo, cardPhone}) ->

                post_data = {
                    realName: user_name
                    idNumber: id_number
                    accountNumber: cardNo
                    mobile: cardPhone
                    bankName: bank.bankCode
                }

                (@api.payment_pool_bind_card_sent_captcha(post_data)

                    .then @api.process_response

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


            bind_card: ({user_name, id_number, bank, cardNo, cardPhone, smsCaptcha, password}) ->

                @submit_sending = true

                (@$q.resolve(!!@user.has_payment_password)

                    .then (has_payment_password) =>
                        if has_payment_password
                            return (
                                @api.payment_pool_check_password(password)
                                    .then @api.process_response
                                    .catch (data) =>
                                        return @$q.reject(data) if _.get(data, 'error') is 'access_denied'

                                        @$q.reject error: [message: 'INCORRECT_PASSWORD']
                            )

                        else
                            return (
                                @api.payment_pool_password_set(password)
                                    .then @api.process_response
                                    .then (data) =>
                                        @user.has_payment_password = true
                            )

                    .then =>
                        post_data = {
                            realName: user_name
                            idNumber: id_number
                            accountNumber: cardNo
                            mobile: cardPhone
                            bankName: bank.bankCode
                            smsCode: smsCaptcha
                            userId: @user.info.id
                        }

                        @api.payment_pool_bind_card(post_data)

                    .then @api.process_response

                    .then (data) =>
                        @api.flush_user_info()

                        @$window.alert @$scope.msg.SUCCEED
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


            does_not_exist_id_number: (value) ->

                @api.check_id_number(value)

                    .then @api.process_response

                    .catch (data) =>
                        if data?.success is false
                            @$q.reject()
                        else
                            @$q.resolve()


            does_not_exist_bank: (value) ->
                _.every @user.bank_account_list, (item) -> item.account.account isnt value








    EXTEND_API = (api) ->

        api.__proto__.payment_pool_password_set = (password) ->

            @$http
                .post '/api/v2/user/MYSELF/setPaymentPassword',
                    {password}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.check_id_number = (idNumber) ->

            @$http
                .post '/api/v2/users/check/id_number', {idNumber}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_bind_card_sent_captcha = (data) ->

            @$http
                .post '/api/v2/baofoo/MYSELF/preBindCard', data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_bind_card = (data) ->

            @$http
                .post '/api/v2/baofoo/MYSELF/confirmBindCard', data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR








    angular.module('directive').directive 'idNumber',

        _.ai 'checkChinaID', (checkChinaID) ->

            restrict: 'A'
            require: 'ngModel'

            link: (scope, element, attr, ngModel) ->

                ngModel.$parsers.push (value) ->
                    ('' + value).trim().toUpperCase()

                ngModel.$validators.id_number = checkChinaID
