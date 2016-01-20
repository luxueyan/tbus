
do (_ ,angular, moment, Math, Date) ->

    angular.module('controller').controller 'LoanCtrl',

        _.ai '            @user, @loan, @api, @$scope, @$window, map_loan_summary, @$routeParams, @$timeout, @$uibModal', class
            constructor: (@user, @loan, @api, @$scope, @$window, map_loan_summary, @$routeParams, @$timeout, @$uibModal) ->

                @$window.scrollTo 0, 0

                angular.extend @$scope, {
                    back_path: @$routeParams.back
                    loan: map_loan_summary @loan
                }

                @api.get_loan_investors(@loan.id).then (data) =>

                    @$scope.investors = data.map (item) ->

                        item.userLoginName = item.userLoginName.trim()

                        prefix = new RegExp decodeURI '^%E6%89%8B%E6%9C%BA%E7%94%A8%E6%88%B7'
                        name = item.userLoginName.replace prefix, ''

                        prefix = /^[a-zA-Z]{4}_/
                        name = name.replace prefix, ''

                        if name isnt item.userLoginName
                            item.name = name.replace /(\d{2})(\d+)(\d{2})$/, '$1*******$3'
                        else
                            [empty, head, tail] = name.split /^(..)/

                            item.name = head + tail.replace /./g, '*'
                            item.name = "#{ head[0] }*" if name.length < 3

                        return item


                time_open_left = @loan.timeOpen - Date.now()

                if time_open_left > 0

                    @$timeout =>
                        if @$routeParams.id is @loan.id
                            @$window.location.reload()
                    , time_open_left + 500, false

                else if @loan.status is 'SCHEDULED'

                    @$window.location.reload()


            agreement: (segment) ->

                prompt = @$uibModal.open {
                    size: 'lg'
                    backdrop: 'static'
                    windowClass: 'center ngt-invest-agreement'
                    animation: true
                    templateUrl: 'ngt-invest-agreement.tmpl'

                    resolve: {
                        content: _.ai '$http', ($http) ->
                            $http
                                .get "/api/v2/cms/category/DECLARATION/name/#{ segment }", {cache: true}
                                .then (response) -> _.get response.data, '[0].content'
                    }

                    controller: _.ai '$scope, content',
                        (             $scope, content) ->
                            angular.extend $scope, {content}
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once









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

        (finished_date = do (item, {days, time_settled, due_date} = {}) ->
            days = item.duration.totalDays
            time_settled = item.timeSettled

            unless time_settled
                # 借款成立日
                due_date = item.timeout * 60 * 60 * 1000 + item.timeOpen
                time_settled = due_date + 1 * 24 * 60 * 60 * 1000

            return new Date +moment(time_settled).add(days, 'd')
        )

        do ({stepAmount, minAmount} = loanRequest.investRule) ->
            loanRequest.investRule.minAmount = Math.max stepAmount, minAmount

        result = _.pick item, _.split 'id title status amount method'

        return _.merge result, {

            raw: item

            rate
            basic_rate
            deduction_rate
            invest_percent_int
            finished_date

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
