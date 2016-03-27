
do (_, angular) ->

    angular.module('controller').controller 'RechargeCtrl',

        _.ai '            @user, @api, @$location, @$scope, @$window, @$routeParams, @$q, @$uibModal, @popup_payment_state', class
            constructor: (@user, @api, @$location, @$scope, @$window, @$routeParams, @$q, @$uibModal, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                @next_path = @$routeParams.next
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
                        page: 'recharge'
                    }

                EXTEND_API @api


            submit: ({bank_account, amount, password}) ->

                account = _.get bank_account, 'account.account'

                @submit_sending = true

                (@api.payment_pool_check_password(password)

                    .then @api.process_response

                    .catch (data) =>
                        @$q.reject error: [message: 'INCORRECT_PASSWORD']


                    .then (data) => @api.payment_pool_recharge(account, amount, password)

                    .then @api.process_response

                    .then (data) =>
                        @$window.alert @$scope.msg.SUCCEED
                        @$location.path @next_path or 'dashboard'

                        @$scope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location.replace new_path

                    .catch (data) =>
                        @submit_sending = false

                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        msg = @$scope.msg[key] or key

                        if key in _.split 'DEPOSIT_FAILED'
                            detail = _.get data, 'error[0].value', ''
                            msg += if detail then "，#{ detail }" else ''

                        @$window.alert msg
                )


            select_bank: (event, store) ->

                do event.preventDefault

                prompt = @$uibModal.open {
                    size: 'lg'
                    backdrop: 'static'
                    windowClass: 'modal-full-page'
                    openedClass: 'modal-full-page-wrap'
                    animation: false
                    templateUrl: 'ngt-dashboard-payment-recharge-select-bank.tmpl'

                    controller: _.ai '$scope',
                        (             $scope) =>
                            angular.extend $scope, {
                                bank_account_list: @bank_account_list

                                select: (bank_account) =>
                                    store.bank_account = bank_account
                                    @$scope.bank_account = bank_account
                            }
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once

                return prompt.result








    EXTEND_API = (api) ->

        api.__proto__.payment_pool_recharge = (cardNo, amount, paymentPassword) ->

            @$http
                .post '/api/v2/hundsun/recharge/MYSELF',
                    {cardNo, amount, paymentPassword}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
