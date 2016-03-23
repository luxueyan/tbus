
do (_, angular) ->

    angular.module('controller').controller 'CouponCtrl',

        _.ai '            @api, @$q, @$scope, @$window, @$routeParams, @$location', class
            constructor: (@api, @$q, @$scope, @$window, @$routeParams, @$location) ->

                @$window.scrollTo 0, 0

                @$scope.picking = 'amount' of @$routeParams
                @back_path = @$routeParams.back

                {amount, months, loan_id, input} = @$routeParams

                (if !!amount and !!months and !!loan_id
                    input = +input
                    @$scope.loading = true

                    (@api.fetch_coupon_list(amount, months, loan_id)

                        .then @api.TAKE_RESPONSE_DATA

                        .then (data) =>

                            @$scope.list =
                                _(data)
                                    .filter disabled: false
                                    .pluck 'placement'

                                    .each (coupon) ->
                                        if 0 < input < coupon.couponPackage.minimumInvest
                                            coupon.status = 'DISABLED'

                                    .value()

                        .finally =>
                            @$scope.loading = false
                    )

                else
                    current_tab = @$routeParams.tab or 'placed'

                    query_set = {
                        status: current_tab.toUpperCase()
                    }

                    angular.extend @$scope, {
                        current_tab
                        query_set
                    }

                    @query(query_set)
                )

                EXTEND_API @api


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


            select: (id) ->

                @$location
                    .path @back_path + '/' + id
                    .search back: null


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
