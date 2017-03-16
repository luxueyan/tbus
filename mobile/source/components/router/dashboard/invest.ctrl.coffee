
do (_, angular) ->

    angular.module('controller').controller 'InvestCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$window, @$location, @$routeParams, @map_invest_summary, @map_assignment_summary', class
            constructor: (@api, @$scope, @$rootScope, @$window, @$location, @$routeParams, @map_invest_summary, @map_assignment_summary) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                {tab1, tab2} = @$routeParams
                tab1 = tab1 or 'online'
                tab2 = tab2 or 'INHAND'

                query_set = {}

                if tab1 is 'online'
                    type_status_map = {
                        INHAND : _.split 'FINISHED PROPOSED FROZEN SETTLED OVERDUE BREACH'
                        ASSIGN: _.split 'OPEN FINISHED'
                        CLEARED: _.split 'CLEARED'
                    }
                    query_set.status = type_status_map[tab2]

                else if tab1 is 'offline'
                    type_status_map = {
                        INHAND : 'INTERESTED'
                        CLEARED: 'REDEMPTION'
                    }
                    query_set.status = type_status_map[tab2]

                angular.extend @$scope, {
                    tab1
                    tab2
                    query_set
                }

                @query(query_set)


            goto_tab: (params) ->

                @$location
                    .replace()
                    .path(@$location.path())
                    .search(params)


            query: (query_set, options = {}) ->

                if options.on_next_page
                    query_set.page++
                else
                    query_set.page = 1
                    @$scope.list = []

                @$scope.loading = true

                if @$scope.tab2 is 'ASSIGN'

                    (@api.get_user_creditassign_list(query_set)

                        .then ({results, totalSize}) =>

                            @$scope.list = @$scope.list.concat results.map(@map_assignment_summary)

                            angular.extend @$scope.list, {totalSize}

                        .catch (data) =>
                            if _.get(data, 'error') is 'access_denied'
                                @$window.alert @$scope.msg.ACCESS_DENIED
                                @$window.location.reload()

                        .finally =>
                            @$scope.loading = false
                    )

                else if @$scope.tab1 is 'online'

                    (@api.get_user_investments(query_set)

                        .then ({dates, result}) =>

                            {results, totalSize} = result

                            @$scope.list = @$scope.list.concat results.map(@map_invest_summary)

                            angular.extend @$scope.list, {totalSize}

                            @$rootScope.invest_list = @$scope.list

                        .catch (data) =>
                            if _.get(data, 'error') is 'access_denied'
                                @$window.alert @$scope.msg.ACCESS_DENIED
                                @$window.location.reload()

                        .finally =>
                            @$scope.loading = false
                    )

                else if @$scope.tab1 is 'offline'

                    (@api.get_user_offline_list(query_set)

                        .then @api.process_response
                        .then @api.TAKE_RESPONSE_DATA

                        .then ({results, totalSize}) =>
                            @$scope.list = @$scope.list.concat results
                            angular.extend @$scope.list, {totalSize}

                        .catch (data) =>
                            if _.get(data, 'error') is 'access_denied'
                                @$window.alert @$scope.msg.ACCESS_DENIED
                                @$window.location.reload()

                        .finally =>
                            @$scope.loading = false
                    )

                else
                    @$scope.loading = false


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
            raw: item
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

            settled_date: item.loan.loanRequest.valueDate
            end_date: item.loan.loanRequest.dueDate || repayment.end_date
            submit_time: item.submitTime
            repayments: item.repayments

            have_begun_to_settled: item.loan.serverDate > item.loan.loanRequest.valueDate

            is_cycle_product: item.loan.loanRequest.cycleProduct
        }







    angular.module('directive').directive 'investSummary', ->

        restrict: 'AE'
        templateUrl: 'components/templates/ngt-invest-summary.tmpl.html'

        scope:
            item: '='
            tab1: '='
            tab2: '='


        controller: _.ai '@$window, @$location, @$scope, @$rootScope, @view_pdf', class
            constructor: (@$window, @$location, @$scope, @$rootScope, @view_pdf) ->
                42

            goto: (url) ->
                @$window.location.href = url;

        controllerAs: 'self'

