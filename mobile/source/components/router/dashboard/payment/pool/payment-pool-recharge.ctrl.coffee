
do (angular) ->

    angular.module('controller').controller 'RechargeCtrl',

        _.ai '            @user, @api, @$location, @$scope, @$window, @$routeParams, @$q, @popup_payment_state', class
            constructor: (@user, @api, @$location, @$scope, @$window, @$routeParams, @$q, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                @back_path = @$routeParams.back
                @next_path = @$routeParams.next
                @submit_sending = false

                # if +@$routeParams.amount > 0
                #     @$scope.amount = @$routeParams.amount // 100 * 100 + 100

                @$scope.store = {}

                (do ({amount, bank_id} = @$routeParams) =>

                    @$scope.bank_account = do (list = _.clone @user.bank_account_list) ->
                        if bank_id
                            return _.find list, (item) -> item.id is bank_id
                        else
                            return _.find list, (item) -> item.defaultAccount is true

                    if @$scope.bank_account
                        @$scope.store.account = _.get @$scope.bank_account, 'account.account'

                    if +amount
                        @$scope.store.amount = +amount
                )

                if !@user.has_bank_card or !@user.has_payment_password
                    @popup_payment_state {
                        user: @user
                        page: 'recharge'
                        page_path: 'dashboard/recharge'
                        back_path: 'dashboard'
                    }

                EXTEND_API @api


            pick_up_bank: (event, amount = 0) ->

                do event.preventDefault

                @$location
                    .path "dashboard/bank-card/#{ amount }"
                    .search back: "dashboard/recharge/#{ amount }"


            submit: ({account, amount, password}) ->

                @submit_sending = true

                (@api.payment_pool_check_password(password)

                    .then @api.process_response

                    .catch (data) =>
                        @$q.reject error: [message: 'INCORRECT_PASSWORD']


                    .then (data) => @api.payment_pool_recharge(account, amount, password)

                    .then @api.process_response

                    .then (data) =>
                        @$window.alert @$scope.msg.SUCCEED
                        @$location.path 'dashboard'

                        @$scope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location = new_path

                    .catch (data) =>
                        @submit_sending = false

                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        msg = @$scope.msg[key] or key

                        if key in _.split 'DEPOSIT_FAILED'
                            detail = _.get data, 'error[0].value', ''
                            msg += if detail then "，#{ detail }" else ''

                        @$window.alert msg
                )








    EXTEND_API = (api) ->

        api.__proto__.payment_pool_recharge = (cardNo, amount, paymentPassword) ->

            @$http
                .post '/api/v2/hundsun/recharge/MYSELF',
                    {cardNo, amount, paymentPassword}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
