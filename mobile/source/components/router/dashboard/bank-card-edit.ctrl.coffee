
do (_, angular) ->

    angular.module('controller').controller 'BankCardEditCtrl',

        _.ai '            @user, @api, @$scope, @$window, @$location, @$routeParams', class
            constructor: (@user, @api, @$scope, @$window, @$location, @$routeParams) ->

                @$window.scrollTo 0, 0

                @submit_sending = false

                @$scope.bank_account = do (list = _.clone @user.bank_account_list) =>
                    _.find list, (item) => item.id is @$routeParams.id

                EXTEND_API @api


            unbind: (account) ->

                @submit_sending = true

                (@api.payment_pool_unbind_card(account)

                    .then @api.process_response

                    .then (data) =>
                        @$window.alert @$scope.msg.CANCEL_CARD_SUCCEED

                    .catch (data) =>
                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        msg = @$scope.msg[key] or key

                        if key in _.split 'CANCEL_CARD_FAILED'
                            detail = _.get data, 'error[0].value', ''
                            msg += if detail then "，#{ detail }" else ''

                        @$window.alert msg

                    .finally =>
                        @$location.path 'dashboard/bank-card'

                        @$scope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location.href = new_path
                )


            set_default: (account) ->

                @submit_sending = true

                (@api.payment_pool_set_default_card(account)

                    .then @api.process_response

                    .then (data) =>
                        @$window.alert @$scope.msg.SET_DEFAULT_ACCOUNT_SUCCEED

                    .catch (data) =>
                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        @$window.alert @$scope.msg[key] or key

                    .finally =>
                        @$location.path 'dashboard/bank-card'

                        @$scope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location.href = new_path
                )








    EXTEND_API = (api) ->

        api.__proto__.payment_pool_unbind_card = (cardNo) ->

            @$http
                .post '/api/v2/hundsun/cancelCard/MYSELF', {cardNo}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_set_default_card = (cardNo) ->

            @$http
                .post '/api/v2/hundsun/setDefaultAccount/MYSELF', {cardNo}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
