
do (_, angular) ->

    angular.module('controller').controller 'CouponCtrl',

        _.ai '            @api, @$q, @$scope, @$rootScope, @$window, @$routeParams, @$location, @popup_captcha', class
            constructor: (@api, @$q, @$scope, @$rootScope, @$window, @$routeParams, @$location, @popup_captcha) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                @submit_sending = false

                current_tab = @$routeParams.tab or 'placed'

                query_set = {
                    status: current_tab.toUpperCase()
                }

                if query_set.status is 'REDEEMED'
                    query_set.status = _.split 'REDEEMED USED'

                angular.extend @$scope, {
                    current_tab
                    query_set
                }

                @query(query_set)

                EXTEND_API @api


            goto_tab: (new_tab) ->

                @$location
                    .replace()
                    .path @$location.path()
                    .search tab: new_tab


            query: (query_set, options = {}) ->

                if options.on_next_page
                    query_set.pageNo++
                else
                    query_set.pageNo = 1
                    @$scope.list = []

                @$scope.loading = true

                (@api.get_user_coupons(query_set, false)

                    .then @api.TAKE_RESPONSE_DATA

                    .then ({results, totalSize}) =>

                        @$scope.list = @$scope.list.concat results

                        angular.extend @$scope.list, {totalSize}

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()

                    .finally =>
                        @$scope.loading = false
                )


            infinite_scroll: (distance) =>

                return if distance >= 0

                @$scope.$evalAsync =>
                    @query(@$scope.query_set, {on_next_page: true})
                        .then => @$scope.$broadcast('scrollpointShouldReset')


            redeem: (item) ->

                return if item.redeem_sending

                (@popup_captcha()

                    .then ({captcha_token, captcha_answer}) =>
                        item.redeem_sending = true
                        @api.redeem_coupon({ placementId: item.id }, { captcha_token, captcha_answer })

                    .then (data) =>
                        do if data is true then @$q.resolve else @$q.reject

                    .then (data) =>
                        @$window.alert @$scope.msg.SUCCEED
                        @$window.location.reload()

                    .catch (data) =>
                        return if data is 'cancel'

                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                            return

                        key = _.get(data, 'error[0].message')
                        @$window.alert(@$scope.msg[key] or @$scope.msg.FAILED)

                    .finally =>
                        item.redeem_sending = false
                )






    EXTEND_API = (api) ->

        api.__proto__.redeem_coupon = (data, params) ->

            @$http
                .post '/api/v2/coupon/MYSELF/redeemCouponIgnoreApprovalWithCaptcha', data, {params}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
