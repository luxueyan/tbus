
do (_, angular) ->

    angular.module('controller').controller 'RepaymentCtrl',

        _.ai '            @data, @$scope, @$rootScope, @$window, @$routeParams', class
            constructor: (@data, @$scope, @$rootScope, @$window, @$routeParams) ->

                @$window.scrollTo 0, 0

                invest_item = do (list = @$rootScope.invest_list) =>
                    _.find list, (item) => @$routeParams.id is item.id

                @$scope.repayment_loan = {
                    item: invest_item

                    type: do ({status} = invest_item) -> switch

                        when status in _.split 'SETTLED OVERDUE BREACH'
                            'repaying'
                        when status in _.split 'CLEARED'
                            'done'
                }

                @$scope.data = @data.map (item) ->
                    repayment = item.repayment.repayment # wtf

                    return {
                        status: item.repayment.status
                        amount: repayment.amount

                        date: repayment.dueDate

                        type: do ({amountInterest, amountPrincipal} = repayment) -> switch

                            when amountInterest > 0 and amountPrincipal > 0
                                'both'
                            when amountInterest > 0
                                'interest'
                            when amountPrincipal > 0
                                'principal'
                    }
