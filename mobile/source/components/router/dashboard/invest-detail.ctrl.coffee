
do (_, angular) ->

    angular.module('controller').controller 'InvestDetailCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$location, @$window, @$routeParams', class
            constructor: (@api, @$scope, @$rootScope, @$location, @$window, @$routeParams) ->

                @$window.scrollTo 0, 0

                item = do (list = @$rootScope.invest_list) =>
                    _.find list, (item) => @$routeParams.id is item.id

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

                if item.status in _.split 'SETTLED CLEARED OVERDUE BREACH'
                    @api.get_invest_contract(item.id).then (url) =>
                        @$scope.contract_url = url
