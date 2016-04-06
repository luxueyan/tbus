
do (_, angular) ->

    angular.module('controller').controller 'BankCardEditCtrl',

        _.ai '            @user, @api, @$scope, @$window, @$location, @$routeParams, @$uibModal', class
            constructor: (@user, @api, @$scope, @$window, @$location, @$routeParams, @$uibModal) ->

                @$window.scrollTo 0, 0

                @submit_sending = false

                bank_account = do (list = _.clone @user.bank_account_list) =>
                    _.find list, (item) => item.id is @$routeParams.id

                return @$window.history.back() unless bank_account

                angular.extend @$scope, {
                    bank_account
                }

                EXTEND_API @api


            unbind: (account) ->

                @submit_sending = true

                (@unbind_card_confirm()

                    .then =>
                        (@api.payment_pool_unbind_card(account)

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
                                @$scope.$on '$locationChangeSuccess', =>
                                    @$window.location.reload()

                                @$window.history.back()
                        )
                        return

                    .catch =>
                        @submit_sending = false
                )


            set_default: (account) ->

                @submit_sending = true

                (@api.payment_pool_set_default_card(account)

                    .then @api.process_response

                    .then (data) =>
                        @$window.alert @$scope.msg.SET_DEFAULT_ACCOUNT_SUCCEED

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            return

                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        @$window.alert @$scope.msg[key] or key

                    .finally =>
                        @$scope.$on '$locationChangeSuccess', =>
                            @$window.location.reload()

                        @$window.history.back()
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
