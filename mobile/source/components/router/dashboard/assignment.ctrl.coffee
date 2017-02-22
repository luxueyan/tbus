
do (_, angular) ->

    angular.module('controller').controller 'DashboardAssignmentCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$window, @$routeParams, @$q', class
            constructor: (@api, @$scope, @$rootScope, @$window, @$routeParams, @$q) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                item = do (list = @$rootScope.invest_list) =>
                    _.find list, (item) => @$routeParams.id is item.id

                return @$window.history.back() unless item

                angular.extend @$scope, {
                    item
                    store: {}
                }

                ###
                (@$scope.valuation = do ->

                    {amount, rate, settled_date} = item

                    hold_day = parseInt( (Date.now() - settled_date) / (24 * 60 * 60 * 1000) )
                    valuation = amount + amount * (rate / 100) * hold_day / 365

                    return valuation
                )
                ###

                EXTEND_API @api

                (@api.prepareAssign_step1({investId: item.id})

                    .then @api.process_response

                    .then (response) =>
                        {bidValuation, maxTimeOut} = _.get(response, 'data', {})

                        angular.extend @$scope, {
                            bidValuation
                            minAmount: (bidValuation * 0.95).toFixed(2)
                            maxAmount: (bidValuation * 1.05).toFixed(2)
                            maxTimeOut
                        }

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                            return

                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        msg = @$scope.msg[key] or key
                        @$window.alert msg
                )


            fetch_analyse: (amount) ->

                ###
                @$scope.creditDealAmount = @$scope.valuation * rate
                @$scope.fee = @$scope.valuation * rate * 0.001
                ###

                post_data = {
                    investId: @$scope.item.id
                    creditAssignAmount: amount
                }

                (@api.prepareAssign_step2(post_data)

                    .then @api.process_response

                    .then (response) =>
                        {
                            creditAssignRate
                            assigneeYieldRate
                            creditAssignFee

                        } = _.get(response, 'data', {})

                        angular.extend @$scope, {
                            creditAssignRate
                            assigneeYieldRate
                            creditAssignFee
                        }

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                            return

                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        msg = @$scope.msg[key] or key
                        @$window.alert msg
                )


            submit: ->

                @submit_sending = true

                {item, creditAssignRate} = @$scope
                {id, title} = item

                post_data = {
                    investId: id
                    creditDealRate: creditAssignRate
                    creditDealAmount: @$scope.store.amount
                    creditAssignTitle: '转让-' + title
                }

                (@api.payment_pool_creditAssign_create_v2(post_data)

                    .then @api.process_response

                    .then (data) =>
                        @api.flush_user_info()

                        @$window.alert @$scope.msg.SUCCESSFUL
                        @$window.history.back()

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                            return

                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        msg = @$scope.msg[key] or key

                        @$window.alert "债转创建失败，#{ msg }"

                        @submit_sending = false
                )





    EXTEND_API = (api) ->

        api.__proto__.prepareAssign_step1 = (data) ->

            @$http
                .get '/api/v2/creditassign/prepareAssign/step1',
                    params: data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.prepareAssign_step2 = (data) ->

            @$http
                .get '/api/v2/creditassign/prepareAssign/step2',
                    params: data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_creditAssign_create = ({investId, creditDealRate, creditAssignTitle}) ->

            @$http
                .post "/api/v2/creditassign/create/MYSELF/#{ investId }/#{ creditDealRate }", { creditAssignTitle }

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.payment_pool_creditAssign_create_v2 = ({investId, creditDealRate, creditDealAmount,  creditAssignTitle}) ->

            @$http
                .post "/api/v2/creditassign/createNew/MYSELF/#{ investId }",
                    { creditDealRate, creditDealAmount, creditAssignTitle }

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
