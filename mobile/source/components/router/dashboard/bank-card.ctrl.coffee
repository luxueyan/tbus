
do (_, angular) ->

    angular.module('controller').controller 'BankCardCtrl',

        _.ai '            @user, @api, @$scope, @$rootScope, @$window, @popup_payment_state', class
            constructor: (@user, @api, @$scope, @$rootScope, @$window, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                bank_account = do (list = _.clone @user.bank_account_list) ->
                    _.find list, (item) -> item.defaultAccount is true

                angular.extend @$scope, { bank_account }

                if !@user.has_bank_card or !@user.has_payment_password
                    @popup_payment_state {
                        user: @user
                        page: 'bank-card'
                    }

                EXTEND_API @api


            unbind: (account) ->

                return if @submit_sending

                @submit_sending = true

                post_data = {
                    userId: @user.info.id
                    accountNumber: account
                }

                (@api.payment_pool_unbind_card(post_data)

                    .then @api.process_response

                    .then (data) =>
                        @$window.alert @$scope.msg.CANCEL_CARD_SUCCEED

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            return

                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        msg = @$scope.msg[key] or key

                        if key in _.split 'CANCEL_CARD_FAILED'
                            detail = _.get data, 'error[0].value', ''
                            msg += if detail then "，#{ detail }" else ''

                        @$window.alert msg

                    .finally =>
                        @$window.location.reload()
                )






    EXTEND_API = (api) ->

        api.__proto__.payment_pool_unbind_card = (data) ->

            @$http
                .post '/api/v2/baofoo/cancelBindCard', data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


