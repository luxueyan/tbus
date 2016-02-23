
do (_, angular) ->

    angular.module('controller').controller 'CouponCtrl',

        _.ai '            @data, @api, @$q, @$scope, @$window, @mg_alert, @$routeParams, @$location', class
            constructor: (@data, @api, @$q, @$scope, @$window, @mg_alert, @$routeParams, @$location) ->

                @$window.scrollTo 0, 0

                input = +@$routeParams.input

                picking = 'amount' of @$routeParams

                @$scope.picking = picking

                @back_path = @$routeParams.back

                list =
                    _(_.clone @data)
                        .each (coupon) ->
                            expire = coupon.couponPackage.timeExpire

                            if expire and expire < Date.now() and coupon.status in _.split 'INITIATED PLACED USED'
                                coupon.status = 'EXPIRED'

                            if input > 0 and input < coupon.couponPackage.minimumInvest
                                coupon.status = 'DISABLED'

                        .value()

                (if picking
                    @$scope.list = list

                else
                    @$scope.tabs = do (list, {filter} = {}) ->

                        filter = (status_list) ->
                            _.filter list, (item) -> _.includes status_list, item.status

                        return [
                            {} = type: 'placed', data: filter _.split 'PLACED'
                            # {} = type: 'used', data: filter _.split 'USED'
                            {} = type: 'redeemed', data: filter _.split 'REDEEMED'
                            {} = type: 'expired', data: filter _.split 'EXPIRED'
                        ]
                )

                return

                status_list = _.split 'INITIATED PLACED USED REDEEMED EXPIRED CANCELLED DISABLED'

                coupon_group_object_by_status =
                    _(coupon_list)
                        .each (coupon) ->
                            expire = coupon.couponPackage.timeExpire

                            if expire and expire < Date.now() and coupon.status in _.split 'INITIATED PLACED USED'
                                coupon.status = 'EXPIRED'

                            if input > 0 and input < coupon.couponPackage.minimumInvest
                                coupon.status = 'DISABLED'

                        .groupBy 'status'
                        .value()

                coupon_list =
                    _(status_list)
                        .map (status) ->
                            return coupon_group_object_by_status[status]
                        .flatten()
                        .compact()
                        .value()

                list = []
                list.remain = coupon_list
                list.length = 0

                @add_more(list)

                @$scope.data = list


            select: (id) ->

                @$location
                    .path @back_path + '/' + id
                    .search back: null


            redeem: (id) ->

                (@api.redeem_coupon(id)

                    .then (data) =>
                        do if data is true then @$q.resolve else @$q.reject

                    .then (data) =>
                        @mg_alert @$scope.msg.SUCCEED
                            .result

                    .catch (data) =>
                        @mg_alert @$scope.msg.FAILED

                    .finally =>
                        do @$window.location.reload
                )


            has_more: (list) ->

                list.remain?.length > 0


            add_more: (list) ->

                PAGE_SIZE = 4 * 1000

                while list.remain.length and PAGE_SIZE--
                    list.push list.remain.shift()








    angular.module('directive').directive 'couponSummary', ->

        restrict: 'AE'
        templateUrl: 'ngt-coupon-summary.tmpl'

        scope:
            list: '='
            picking: '='
            self: '='

