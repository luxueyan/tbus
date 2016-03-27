
do (_, angular) ->

    angular.module('controller').controller 'CouponCtrl',

        _.ai '            @api, @$q, @$scope, @$window, @$routeParams, @$location', class
            constructor: (@api, @$q, @$scope, @$window, @$routeParams, @$location) ->

                @$window.scrollTo 0, 0

                current_tab = @$routeParams.tab or 'placed'

                query_set = {
                    status: current_tab.toUpperCase()
                }

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

                    .finally =>
                        @$scope.loading = false
                )


            infinite_scroll: (distance) =>

                return if distance >= 0

                @$scope.$evalAsync =>
                    @query(@$scope.query_set, {on_next_page: true})
                        .then => @$scope.$broadcast('scrollpointShouldReset')


            redeem: (id) ->

                (@api.redeem_coupon(id)

                    .then (data) =>
                        do if data is true then @$q.resolve else @$q.reject

                    .then (data) =>
                        @$window.alert @$scope.msg.SUCCEED

                    .catch (data) =>
                        @$window.alert @$scope.msg.FAILED

                    .finally =>
                        do @$window.location.reload
                )






    EXTEND_API = (api) ->

        api.__proto__.redeem_coupon = (placementId) ->

            @$http
                .post '/api/v2/coupon/MYSELF/redeemCouponIgnoreApproval', {placementId}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
