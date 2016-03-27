
do (_, angular) ->

    angular.module('controller').controller 'InvestCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$window, @$location, @$routeParams, @map_invest_summary', class
            constructor: (@api, @$scope, @$rootScope, @$window, @$location, @$routeParams, @map_invest_summary) ->

                @$window.scrollTo 0, 0

                current_tab = @$routeParams.tab or 'raising'

                type_status_map = {
                    raising : _.split 'FINISHED PROPOSED FROZEN'
                    repaying: _.split 'SETTLED OVERDUE BREACH'
                    done    : _.split 'CLEARED'
                }

                query_set = {
                    status: type_status_map[current_tab]
                }

                angular.extend @$scope, {
                    current_tab
                    query_set
                }

                @query(query_set)


            goto_tab: (new_tab) ->

                @$location
                    .replace()
                    .path @$location.path()
                    .search tab: new_tab


            query: (query_set, options = {}) ->

                if options.on_next_page
                    query_set.page++
                else
                    query_set.page = 1
                    @$scope.list = []

                @$scope.loading = true

                (@api.get_user_investments(query_set, true)

                    .then ({results, totalSize}) =>

                        @$scope.list = @$scope.list.concat results.map(@map_invest_summary)

                        angular.extend @$scope.list, {totalSize}

                        @$rootScope.invest_list = @$scope.list

                    .finally =>
                        @$scope.loading = false
                )


            infinite_scroll: (distance) =>

                return if distance >= 0

                @$scope.$evalAsync =>
                    @query(@$scope.query_set, {on_next_page: true})
                        .then => @$scope.$broadcast('scrollpointShouldReset')







    angular.module('factory').factory 'map_invest_summary', -> (item) ->

        repayment = do ({repayments} = item, {filter, sum, status} = {}) ->
            return {} if _.isEmpty repayments

            repayed_num = _.filter(repayments, status: 'REPAYED').length

            filter = _.partial _.filter, repayments
            sum = (item, key = 'amount') -> _.fixed_in_2(_.sum item, (item) -> item.repayment[key])
            status = (item) -> item.status is 'REPAYED'

            return {
                repayed:     sum filter status
                unrepay:     sum filter _.negate status
                progress:    "#{ repayed_num }/#{ repayments.length }"
                interest:    sum repayments, 'amountInterest'
                outstanding: sum filter(_.negate status), 'amountInterest'
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
            is_show_repayment: item.status in _.split 'SETTLED CLEARED OVERDUE BREACH'
            progress: repayment.progress

            end_date: repayment.end_date
            submit_time: item.submitTime
            repayments: item.repayments
        }







    angular.module('directive').directive 'investSummary', ->

        restrict: 'AE'
        templateUrl: 'components/templates/ngt-invest-summary.tmpl.html'

        scope:
            item: '='
            type: '='
