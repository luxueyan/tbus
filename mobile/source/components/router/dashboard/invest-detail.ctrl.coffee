
do (_, angular, moment) ->

    angular.module('controller').controller 'InvestDetailCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$location, @$window, @$routeParams', class
            constructor: (@api, @$scope, @$rootScope, @$location, @$window, @$routeParams) ->

                @$window.scrollTo 0, 0

                item = do (list = @$rootScope.invest_list) =>
                    _.find list, (item) => @$routeParams.id is item.id

                return @$location.path 'dashboard/invest' unless item

                angular.extend @$scope, {
                    item
                    page_path: @$location.path()[1..]

                    type: do ({status} = item) -> switch

                        when status in _.split 'FINISHED PROPOSED FROZEN'
                            'raising'
                        when status in _.split 'SETTLED OVERDUE BREACH'
                            'repaying'
                        when status in _.split 'CLEARED'
                            'done'
                }

                unless _.isEmpty item.repayments
                    @$scope.repayments = item.repayments.map (item) ->
                        repayment = item.repayment

                        return {
                            due_date: new Date(repayment.dueDate)
                            amount: repayment.amount
                            amount_outstanding: repayment.amountOutstanding
                            status: item.status
                        }

                    @$scope.next_repayment_days = do (list = item.repayments) ->

                        next_repayment = _.find list, (item) -> item.status is 'UNDUE'
                        return unless next_repayment

                        next_repayment_date = _.get next_repayment, 'repayment.dueDate'
                        today_date = moment().format('YYYY-MM-DD')
                        return moment(next_repayment_date).diff(moment(today_date), 'days')

                if item.status in _.split 'SETTLED CLEARED OVERDUE BREACH'
                    @api.get_invest_contract(item.id).then (url) =>
                        @$scope.contract_url = url

                EXTEND_API @api

                @$scope.loading_dynamic = true

                (@api.get_user_invest_dynamic(item.id)

                    .then ({results}) =>
                        @$scope.dynamic_list = results

                    .finally =>
                        @$scope.loading_dynamic = false
                )






    EXTEND_API = (api) ->

        api.__proto__.get_user_invest_dynamic = (id) ->

            @$http
                .get "/api/v2/user/MYSELF/investDynamic/#{ id }"

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
