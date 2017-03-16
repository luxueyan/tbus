
do (_, angular) ->

    angular.module('controller').controller 'DashboardRedeemCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$window, @$routeParams, @$q', class
            constructor: (@api, @$scope, @$rootScope, @$window, @$routeParams, @$q) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                item = do (list = @$rootScope.invest_list) =>
                    _.find list, (item) => @$routeParams.id is item.id

                return @$window.history.back() unless item

                angular.extend @$scope, { item }

                EXTEND_API @api


            submit: (item) ->

                @submit_sending = true

                post_data = {
                    investId: item.id
                    currentPeriod: item.raw.currentPeriod
                }

                (@api.redeem_cycle_product(post_data)

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

                        @$window.alert "赎回失败，#{ msg }"

                        @submit_sending = false
                )





    EXTEND_API = (api) ->

        api.__proto__.redeem_cycle_product = (data) ->

            @$http
                .post '/api/v2/invest/redeem', data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
