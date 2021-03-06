
do (_, angular, moment, Math, Date) ->

    angular.module('controller').controller 'LoanCtrl',

        _.ai '            @user, @loan, @api, @$scope, @$window, @$location, map_loan_summary, @$routeParams, @$timeout', class
            constructor: (@user, @loan, @api, @$scope, @$window, @$location, map_loan_summary, @$routeParams, @$timeout) ->

                @$window.scrollTo 0, 0

                angular.extend @$scope, {
                    loan: map_loan_summary @loan
                    page_path: @$location.path()[1..]
                }

                if @user.has_logged_in

                    @$scope.loading_investors = true

                    (@api.get_loan_investors(@loan.id)

                        .then (data) =>
                            @$scope.investors = data

                        .finally =>
                            @$scope.loading_investors = false
                    )


                # time_open_left = @loan.timeOpen - @loan.serverDate

                # if time_open_left > 0

                #     @$timeout =>
                #         if @$routeParams.id is @loan.id
                #             @$window.location.reload()
                #     , time_open_left, false

                # else if @loan.status is 'SCHEDULED'

                #     @$window.location.reload()










    angular.module('directive').directive 'loanSummary', ->

        restrict: 'AE'
        templateUrl: 'components/templates/ngt-loan-summary.tmpl.html'

        scope:
            loan: '='









    angular.module('factory').factory 'map_loan_summary', -> (item) ->

        CHART_OPTIONS = ->
            size: 50
            lineWidth: 4
            scaleColor: false
            lineCap: 'butt'
            barColor: '#1D6ED7'
            trackColor: '#DBDCDC'

        loanRequest = item.loanRequest

        rate = parseFloat (item.rate / 100).toFixed(2)
        # deduction_rate = parseFloat (loanRequest.deductionRate / 100).toFixed(2)
        # basic_rate = rate - deduction_rate

        invest_percent_int = item.investPercent * 100
        invest_percent_int = 0 if item.investPercent is 0

        invest_percent_int = 100 if item.status not in _.split 'OPENED SCHEDULED'

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

        # fix stepAmount
        do ({stepAmount} = loanRequest.investRule) ->
            loanRequest.investRule.stepAmount = Math.max stepAmount, 1

        result = _.pick item, _.split 'id title status amount method'

        (if item.status in _.split 'SCHEDULED OPENED FINISHED'
            result.estimated_settled_date = do ->
                if item.timeOpen
                    return new Date( +moment(item.timeOpen).add(Math.ceil(item.timeout / 24) + 1, 'd') )
                else
                    return new Date( +moment().add(3, 'd') )
        )

        (finished_date = do ->
            if item.timeFinished
                return new Date( item.timeFinished )
            else
                return new Date( +moment(item.timeOpen).add(Math.ceil(item.timeout / 24), 'd') )
        )

        value_date = (
            loanRequest.valueDate ||
            new Date( +moment(finished_date).add(1, 'd'))
        )

        due_date = (
            loanRequest.dueDate ||
            item.timeCleared ||
            new Date( +moment(finished_date).add(1 + item.duration.totalDays, 'd'))
        )

        arrival_date = new Date( +moment(due_date).add(3, 'd'))

        activity_info = loanRequest.activityInfo or ''
        sub_activity_info_length = if /^\w/.test(activity_info) then 5 else 4
        activity_info = activity_info.substr(0, sub_activity_info_length)

        return _.merge result, {

            raw: item

            rate
            # basic_rate
            # deduction_rate
            invest_percent_int
            finished_date

            time_open: item.timeOpen
            time_close: item.timeLeft + item.serverDate

            # corporate_name: item.corporationShortName
            product_key: loanRequest.productKey
            product_type: loanRequest.productKey?.trim().match(/^\w+/)?[0] or 'UNKNOWN'

            value_date
            due_date
            arrival_date

            balance
            balance_myriad

            amount_myriad: (item.amount / 10000)
            total_days: item.duration.totalDays
            total_months: item.duration.totalMonths

            chart_options: _.merge CHART_OPTIONS(), do (data = {}) ->
                data.barColor = '#9E9E9F' unless item.status in _.split 'OPENED FINISHED FAKESETTLED FAILED'
                return data

            activity_info
            is_cycle_product: loanRequest.cycleProduct
        }
