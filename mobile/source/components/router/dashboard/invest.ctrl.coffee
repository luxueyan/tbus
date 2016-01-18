
do (_, angular) ->

    angular.module('controller').controller 'InvestCtrl',

        _.ai '            @data, @$scope, @$rootScope, @$window, @$location', class
            constructor: (@data, @$scope, @$rootScope, @$window, @$location) ->

                @$window.scrollTo 0, 0

                @$scope.page_path = @$location.path()[1..]

                (list = @data.map (item) ->

                    repayment = do ({repayments} = item, {filter, sum, status} = {}) ->
                        return {} if _.isEmpty repayments

                        repayed_num = _.filter(repayments, status: 'REPAYED').length

                        filter = _.partial _.filter, repayments
                        sum = (item, key = 'amountInterest') -> _.fixed_in_2(_.sum item, (item) -> item.repayment[key])
                        status = (item) -> item.status is 'REPAYED'

                        return {
                            repayed:     sum filter status
                            unrepay:     sum filter _.negate status
                            progress:    "#{ repayed_num }/#{ repayments.length }"
                            interest:    sum repayments, 'amountInterest'
                            outstanding: sum filter _.negate status
                            end_date:    new Date(_.get _.last(repayments), 'repayment.dueDate')
                        }

                    return {
                        id: item.id
                        rate: parseFloat (item.rate / 100).toFixed(2)
                        title: item.loanTitle
                        status: item.status
                        percent: (item.investPercent * 100) | 0

                        amount: item.amount
                        amount_repayed: repayment.repayed or 0
                        amount_unrepay: repayment.unrepay or 0
                        amount_interest: repayment.interest or 0
                        amount_outstanding: repayment.outstanding or 0

                        total_days: item.duration.totalDays
                        total_months: item.duration.totalMonths
                        oddment_days: item.duration.days

                        loan_id: item.loanId
                        method: item.repayMethod
                        is_show_repayment: item.status not in _.split 'FINISHED PROPOSED FROZEN'
                        progress: repayment.progress

                        end_date: repayment.end_date
                        submit_time: item.submitTime

                        gome_goods_pick: item.gomeGoodsPick
                    }
                )

                @$rootScope.invest_list = list

                (@$scope.tabs = do (list, {filter} = {}) ->

                    filter = (status_list) ->
                        _.filter list, (item) -> _.includes status_list, item.status

                    return [
                        {} = type: 'raising', data: filter _.split 'FINISHED PROPOSED FROZEN'
                        {} = type: 'repaying', data: filter _.split 'SETTLED OVERDUE BREACH'
                        {} = type: 'done', data: filter _.split 'CLEARED'
                    ]
                )

                return

                @$scope.list = do ->
                    inhand_list = _.filter list, (item) ->
                        item.status in _.split 'FINISHED PROPOSED FROZEN'

                    holding_list = _.filter list, (item) ->
                        item.status in _.split 'SETTLED OVERDUE BREACH'

                    cleared_list = _.filter list, (item) ->
                         item.status in ['CLEARED']

                    result = inhand_list.concat holding_list, cleared_list









    angular.module('directive').directive 'investSummary', ->

        restrict: 'AE'
        templateUrl: 'components/templates/ngt-invest-summary.tmpl.html'

        scope:
            item: '='
            type: '='
