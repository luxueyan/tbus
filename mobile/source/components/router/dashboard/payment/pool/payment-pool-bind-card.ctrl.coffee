
do (_, angular) ->

    angular.module('controller').controller 'PaymentPoolBindCardCtrl',

        _.ai '            @banks, @user, @api, @$scope, @$rootScope, @$window, @$q, @$location, @$interval, @$routeParams, @$uibModal, @popup_payment_state', class
            constructor: (@banks, @user, @api, @$scope, @$rootScope, @$window, @$q, @$location, @$interval, @$routeParams, @$uibModal, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                angular.extend @$scope, {
                    store: {}
                }

                @back_path = @$routeParams.back
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

                        @$rootScope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location.href = new_path

                        @user.has_bank_card = true

                        unless @user.has_payment_password
                            @popup_payment_state {
                                user: @user
                                page: 'bind-card'
                                page_path: 'dashboard/payment/bind-card'
                            }
                            return

                        else
                            @$location.path 'dashboard/bank-card'


                    .catch (data) =>
                        @submit_sending = false
                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        @$window.alert @$scope.msg[key] or key
                )


            does_not_exist: (value) ->
                _.every @user.bank_account_list, (item) -> item.account.account isnt value


            select_bank: (event, store) ->

                do event.preventDefault

                self = @

                @$uibModal.open {
                    size: 'lg'
                    backdrop: 'static'
                    windowClass: 'modal-full-page'
                    openedClass: 'modal-full-page-wrap'
                    animation: false
                    templateUrl: 'ngt-select-bank.tmpl'

                    controller: _.ai '$scope',
                        (             $scope) ->
                            angular.extend $scope, {
                                banks: self.banks
                                select: (bank) ->
                                    store.bank = bank
                            }
                }








    EXTEND_API = (api) ->

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
