
do (_, angular) ->

    angular.module('controller').controller 'PaymentPoolBindCardCtrl',

        _.ai '            @banks, @user, @api, @$scope, @$rootScope, @$window, @$q, @$location, @$interval, @$routeParams, @$uibModal, @toast', class
            constructor: (@banks, @user, @api, @$scope, @$rootScope, @$window, @$q, @$location, @$interval, @$routeParams, @$uibModal, @toast) ->

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

                @captcha.sending = true

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
                        @$window.alert @$scope.msg[key] or @$scope.msg.PRE_BIND_CARD_FAILED

                    .finally =>
                        @captcha.sending = false
                )


            bind_card: ({user_name, id_number, bank, cardNo, cardPhone, smsCaptcha, password}) ->

                @submit_sending = true

                (@$q.resolve(!!@user.has_payment_password)

                    .then (has_payment_password) =>
                        if has_payment_password
                            return

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

                        if msg.indexOf('TRADE_FAILED') > -1
                            msg = msg.replace('TRADE_FAILED', @$scope.msg['TRADE_FAILED'])

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


            agreement: (name) ->

                api_path = '/api/v2/cms/category/DECLARATION/name/' + name

                prompt = @$uibModal.open {
                    size: 'lg'
                    backdrop: 'static'
                    windowClass: 'center'
                    animation: true
                    templateUrl: 'ngt-payment-agreement.tmpl'

                    resolve: {
                        content: _.ai '$http', ($http) ->
                            $http
                                .get api_path, {cache: true}
                                .then (response) -> _.get response.data, '[0].content'
                    }

                    controller: _.ai '$scope, content',
                        (             $scope, content) ->
                            angular.extend $scope, {content}
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once

                return prompt.result


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
                                select: (bank) =>
                                    store.bank = bank
                                    if bank?.bankCode in ['PSBC', 'SHB']
                                        @toast('此银行需要开通银联在线支付')
                            }
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once

                return prompt.result







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








    angular.module('directive').directive 'idNumber',

        _.ai 'checkChinaID', (checkChinaID) ->

            restrict: 'A'
            require: 'ngModel'

            link: (scope, element, attr, ngModel) ->

                ngModel.$parsers.push (value) ->
                    ('' + value).trim().toUpperCase()

                ngModel.$validators.id_number = checkChinaID
