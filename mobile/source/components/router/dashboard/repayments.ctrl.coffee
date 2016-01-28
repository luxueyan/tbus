
do (_, angular) ->

    angular.module('controller').controller 'RepaymentsCtrl',

        _.ai '            @api, @$scope, @$window', class
            constructor: (@api, @$scope, @$window) ->

                @$window.scrollTo 0, 0

                @$scope.loading = true

                (@api.get_user_repayments()

                    .then (response) =>

                        list = _.get(response, 'data.results')

                        _.each list, (item)->
                            item.due_date = new Date(_.get(item, 'repayment.repayment.dueDate'))

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

