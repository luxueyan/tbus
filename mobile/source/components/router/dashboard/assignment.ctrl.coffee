
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

                EXTEND_API @api


            fetch_analyse: (rate) ->
                @$scope.creditDealAmount = @$scope.item.amount * rate


            submit: ({rate}) ->

                @submit_sending = true

                {id, title} = @$scope.item

                post_data = {
                    investId: id
                    creditDealRate: rate
                    creditAssignTitle: title
                }

                (@api.payment_pool_creditAssign_create(post_data)

                    .then (data) =>
                        unless data is 'SUCCESSFUL'
                            @$q.reject error: [message: data]

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

        api.__proto__.payment_pool_creditAssign_create = ({investId, creditDealRate, creditAssignTitle}) ->

            @$http
                .post "/api/v2/creditassign/create/MYSELF/#{ investId }/#{ creditDealRate }", { creditAssignTitle }

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
