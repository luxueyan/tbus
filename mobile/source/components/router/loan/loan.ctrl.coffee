
do (_, angular, moment, Math, Date) ->

    angular.module('controller').controller 'LoanCtrl',

        _.ai '            @loan, @api, @$scope, @$window, map_loan_summary, @$routeParams, @$timeout', class
            constructor: (@loan, @api, @$scope, @$window, map_loan_summary, @$routeParams, @$timeout) ->

                @$window.scrollTo 0, 0

                angular.extend @$scope, {
                    loan: map_loan_summary @loan
                    loading_investors: true
                }

                (@api.get_loan_investors(@loan.id)

                    .then (data) =>
                        @$scope.investors = data

                    .finally =>
                        @$scope.loading_investors = false
                )


                time_open_left = @loan.timeOpen - Date.now()

                if time_open_left > 0

                    @$timeout =>
                        if @$routeParams.id is @loan.id
                            @$window.location.reload()
                    , time_open_left + 500, false

                else if @loan.status is 'SCHEDULED'

                    @$window.location.reload()










    angular.module('directive').directive 'loanSummary', ->

        restrict: 'AE'
        templateUrl: 'components/templates/ngt-loan-summary.tmpl.html'

        scope:
            loan: '='
            layout: '='









    angular.module('factory').factory 'map_loan_summary', -> (item) ->

        CHART_OPTIONS = ->
            size: 64
            lineWidth: 4
            scaleColor: false
            barColor: '#FFC777'
            trackColor: '#EBEDF2'

        loanRequest = item.loanRequest

        rate = parseFloat (item.rate / 100).toFixed(2)
        deduction_rate = parseFloat (loanRequest.deductionRate / 100).toFixed(2)
        basic_rate = rate - deduction_rate

        invest_percent_int = Math.max 1, (item.investPercent * 100) | 0
        invest_percent_int = 0 if item.investPercent is 0

        invest_percent_int = 100 if item.status in _.split 'SETTLED FINISHED'

        balance = item.balance
        balance = 0 if item.status not in _.split 'OPENED SCHEDULED'
        balance_myriad = (balance / 10000) | 0 && (balance / 10000)

        # (finished_date = do (item, {days, time_settled, due_date} = {}) ->
        #     days = item.duration.totalDays
        #     time_settled = item.timeSettled

        #     unless time_settled
        #         # 借款成立日
        #         due_date = item.timeout * 60 * 60 * 1000 + item.timeOpen
        #         time_settled = due_date + 1 * 24 * 60 * 60 * 1000

        #     return new Date +moment(time_settled).add(days, 'd')
        # )

        # do ({stepAmount, minAmount} = loanRequest.investRule) ->
        #     loanRequest.investRule.minAmount = Math.max stepAmount, minAmount

        result = _.pick item, _.split 'id title status amount method'

        if item.status in _.split 'SCHEDULED OPENED FINISHED'
            result.estimated_value_date = new Date +moment().add(3, 'd')

        return _.merge result, {

            raw: item

            rate
            basic_rate
            deduction_rate
            invest_percent_int
            # finished_date

            time_open: item.timeOpen
            time_close: item.timeLeft + Date.now()

            corporate_name: item.corporationShortName
            product_key: loanRequest.productKey
            product_type: loanRequest.productKey?.trim().match(/^\w+/)?[0] or 'UNKNOWN'
            value_date: loanRequest.valueDate

            balance
            balance_myriad

            amount_myriad: (item.amount / 10000) | 0
            total_days: item.duration.totalDays
            total_months: item.duration.totalMonths

            chart_options: _.merge CHART_OPTIONS(), do (data = {}) ->
                data.barColor = '#FFC777' unless item.status is 'OPENED'
                return data
        }
