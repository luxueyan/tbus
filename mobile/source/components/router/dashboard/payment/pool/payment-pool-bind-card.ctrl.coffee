
do (_, angular) ->

    angular.module('controller').controller 'PaymentPoolBindCardCtrl',

        _.ai '            @banks, @user, @api, @$scope, @$rootScope, @$window, @$q, @$location, @$interval, @$routeParams, @$uibModal, @popup_payment_state', class
            constructor: (@banks, @user, @api, @$scope, @$rootScope, @$window, @$q, @$location, @$interval, @$routeParams, @$uibModal, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                angular.extend @$scope, {
                    store: {}
                }

                @next_path = @$routeParams.next or 'dashboard'

                @submit_sending = false

                @captcha = {timer: null, count: 60, count_default: 60, has_sent: false, buffering: false}

                EXTEND_API @api


            send_mobile_captcha: (mobile) ->

                (@api.payment_pool_bind_card_sent_captcha(mobile)

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


            bind_card: ({id_number, user_name, cardNo, bank, cardPhone, smsCaptcha}) ->

                @submit_sending = true

                (@$q.resolve(!!@user.has_payment_account)

                    .then (has_payment_account) =>
                        return if has_payment_account

                        (@api.payment_pool_register(id_number, user_name)

                            .then @api.process_response

                            .then (data) =>
                                @user.info.name = user_name
                                @user.info.idNumber = id_number
                                @user.has_payment_account = true
                        )

                    .then => @api.payment_pool_check_card(id_number, user_name, cardNo, bank.bankCode, cardPhone)

                    .then @api.process_response

                    .then => @api.payment_pool_bind_card(cardNo, bank.bankCode, cardPhone, smsCaptcha)

                    .then @api.process_response

                    .then (data) =>
                        @$window.alert @$scope.msg.SUCCEED

                        @$rootScope.$on '$locationChangeSuccess', =>
                            @$window.location.reload()

                        @user.has_bank_card = true

                        unless @user.has_payment_password
                            @popup_payment_state {
                                user: @user
                                page: 'bind-card'
                            }
                            return

                        else
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


            does_not_exist_bank: (value) ->
                _.every @user.bank_account_list, (item) -> item.account.account isnt value


            select_bank: (event, store) ->

                do event.preventDefault

                prompt = @$uibModal.open {
                    size: 'lg'
                    backdrop: 'static'
                    windowClass: 'modal-full-page'
                    openedClass: 'modal-full-page-wrap'
                    animation: false
                    templateUrl: 'ngt-dashboard-payment-bind-card-select-bank.tmpl'

                    controller: _.ai '$scope',
                        (             $scope) =>
                            angular.extend $scope, {
                                banks: @banks
                                select: (bank) ->
                                    store.bank = bank
                            }
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once

                return prompt.result








    EXTEND_API = (api) ->

        api.__proto__.check_id_number = (idNumber) ->

            @$http
                .post '/api/v2/users/check/id_number', {idNumber}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_bind_card_sent_captcha = (mobile) ->

            @$http
                .get "/api/v2/hundsun/checkCard/sendSmsCaptcha/#{ mobile }"

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_register = (idNumber, name) ->

            @$http
                .post '/api/v2/hundsun/register/MYSELF',
                    {idNumber, name}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_check_card = (idNumber, name, cardNo, bankCode, cardPhone) ->

            @$http
                .post '/api/v2/hundsun/checkCard/MYSELF',
                    {idNumber, name, cardNo, bankCode, cardPhone}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_bind_card = (cardNo, bankCode, cardPhone, smsCaptcha) ->

            @$http
                .post '/api/v2/hundsun/bindCard/MYSELF',
                    {cardNo, bankCode, cardPhone, smsCaptcha}

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
