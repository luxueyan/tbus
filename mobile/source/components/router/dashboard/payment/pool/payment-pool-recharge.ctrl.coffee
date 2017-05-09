
do (_, angular) ->

    angular.module('controller').controller 'RechargeCtrl',

        _.ai '            @user, @api, @$location, @$scope, @$rootScope, @$window, @$routeParams, @$q, @$uibModal, @popup_payment_state, @popup_payment_password, @ensure_open_channel', class
            constructor: (@user, @api, @$location, @$scope, @$rootScope, @$window, @$routeParams, @$q, @$uibModal, @popup_payment_state, @popup_payment_password, @ensure_open_channel) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                @is_POS = @$routeParams.tab == 'POS'

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
                        page: 'recharge'
                    }

                EXTEND_API @api


            submit: ({bank_account, amount}) ->
                if amount <= 0
                    @$window.alert '单笔充值要大于0元'
                    return

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
                        if @is_POS
                            post_data = {
                                depositAmount: amount
                                paymentPasswd: @$scope.store.password
                            }

                            return (
                                @api.payment_pos_recharge(post_data)

                                    .then @api.process_response

                                    .then (data) =>
                                        @api.flush_user_info()
                                        @$scope.POS_data = { order_id: _.get(data, 'data') }
                            )

                        else
                            post_data = {
                                userId: @user.info.id
                                clientIp: @user.clientIp
                                txn_amt: amount
                                paymentPasswd: @$scope.store.password
                            }

                            return (
                                @api.payment_pool_recharge(post_data)

                                    .then @api.process_response

                                    .then (data) =>
                                        @api.flush_user_info()
                                        @$scope.action_result = { success: true }
                            )


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

        api.__proto__.payment_pool_recharge = (data) ->

            @$http
                .post '/api/v2/payment/router/charge', data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pos_recharge = (data) ->

            @$http
                .post '/api/v2/POS/MYSELF/deposit', data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR






    angular.module('factory').factory 'popup_payment_password', _.ai '$uibModal', ($uibModal) ->

        ->

            prompt = $uibModal.open {
                size: 'lg'
                animation: false
                backdrop: 'static'
                windowClass: 'modal-payment-password'
                template: '''
                    <div class="modal-header">
                        <span class="pull-right" ng-click="$dismiss('cancel')">
                            <param class="glyphicon glyphicon-remove">
                        </span>
                        <h4 class="modal-title">请输入支付密码</h4>
                    </div>

                    <div class="modal-body">
                        <div class="form-group form-group-number-password"
                             data-mask="{{ '******'.slice(0, (password ? password.length : 0)) }}"
                        >
                            <input type="tel"
                                   class="form-control"
                                   maxlength="6"
                                   ng-model="password"
                                   ng-change="password.length == 6 && $close(password)"
                            >
                        </div>
                    </div>

                    <div class="modal-footer text-right">
                        <a href="dashboard/payment/password">忘记密码？</a>
                    </div>
                '''
            }

            once = @$scope.$on '$locationChangeStart', ->
                prompt?.dismiss('cancel')
                do once

            return prompt.result
