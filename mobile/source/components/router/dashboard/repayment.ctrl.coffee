
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

