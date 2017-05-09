
do (_, angular) ->

    angular.module('controller').controller 'BankCardCtrl',

        _.ai '            @user, @api, @$scope, @$rootScope, @$window, @$location, @$uibModal, @popup_payment_state', class
            constructor: (@user, @api, @$scope, @$rootScope, @$window, @$location, @$uibModal, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                bank_account = do (list = _.clone @user.bank_account_list) ->
                    item = _.find list, (item) -> item.defaultAccount is true
                    return (if item then item else _(list).first())

                angular.extend @$scope, { bank_account }

                @total = @user.fund.availableAmount + @user.fund.dueInAmount + @user.fund.frozenAmount

                if !@user.has_bank_card or !@user.has_payment_password
                    @popup_payment_state {
                        user: @user
                        page: 'bank-card'
                    }

                EXTEND_API @api


            unbind: (account) ->

                if @total > 0
                    @$window.alert @$scope.msg.UNBIND_CARD_NOT_ALLOWED
                    return

                return if @submit_sending

                (@unbind_card_confirm()

                    .then =>

                        @submit_sending = true

                        post_data = {
                            userId: @user.info.id
                            accountNumber: account
                        }

                        (@api.payment_pool_unbind_card(post_data)

                            .then @api.process_response

                            .then (data) =>
                                @api.flush_user_info()

                                @$window.alert @$scope.msg.CANCEL_CARD_SUCCEED

                                @$location.path 'dashboard/payment/bind-card'

                            .catch (data) =>
                                if _.get(data, 'error') is 'access_denied'
                                    @$window.alert @$scope.msg.ACCESS_DENIED
                                    @$window.location.reload()
                                    return

                                key = _.get data, 'error[0].message', 'UNKNOWN'
                                msg = @$scope.msg[key] or key

                                if key in _.split 'CANCEL_CARD_FAILED'
                                    detail = _.get data, 'error[0].value', ''
                                    msg += if detail then "，#{ detail }" else ''

                                @$window.alert msg

                            .finally =>
                                @submit_sending = false
                        )

                        return
                )


            unbind_card_confirm: ->

                prompt = @$uibModal.open {
                    size: 'sm'
                    keyboard: false
                    backdrop: 'static'
                    windowClass: 'center modal-confirm'
                    animation: true
                    templateUrl: 'ngt-unbind-card-confirm.tmpl'

                    controller: _.ai '$scope',
                        (             $scope) ->
                            angular.extend $scope, {}
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once

                return prompt.result






    EXTEND_API = (api) ->

        api.__proto__.payment_pool_unbind_card = (data) ->

            @$http
                .post '/api/v2/payment/router/cancelBindCard', data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


