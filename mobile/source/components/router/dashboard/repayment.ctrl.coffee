
do (_, angular) ->

    angular.module('controller').controller 'RepaymentCtrl',

        _.ai '            @api, @$scope, @$window', class
            constructor: (@api, @$scope, @$window) ->

                @$window.scrollTo 0, 0

                @$scope.loading = true

                (@api.get_user_repayments()

                    .then (response) =>

                        list = _.get(response, 'data.results')

                        (_.each list, (item)->
                            repayment = item.repayment.repayment

                            do ({dueDate, amountInterest, amountPrincipal} = repayment) ->

                                item.due_date = new Date(dueDate)

                                item.type = switch
                                    when amountInterest > 0 and amountPrincipal > 0
                                        'both'
                                    when amountInterest > 0
                                        'interest'
                                    when amountPrincipal > 0
                                        'principal'
                        )

                        sum = (list, key) -> _.sum list, (item) -> item.repayment.repayment[key]

                        angular.extend @$scope, {
                            list
                            amount:           sum list, 'amount'
                            amount_principal: sum list, 'amountPrincipal'
                            amount_interest:  sum list, 'amountInterest'
                        }


                    .finally =>
                        @$scope.loading = false
                )

                return

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
