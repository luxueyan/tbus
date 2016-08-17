
do (_, angular) ->

    angular.module('controller').controller 'AssignmentCtrl',

        _.ai '            @loan, @assignment, @user, @api, @$timeout, @$scope, @$location, @$window, map_loan_summary, map_assignment_summary', class
            constructor: (@loan, @assignment, @user, @api, @$timeout, @$scope, @$location, @$window, map_loan_summary, map_assignment_summary) ->

                @$window.scrollTo 0, 0

                angular.extend @$scope, {
                    loan: map_loan_summary @loan
                    assignment: map_assignment_summary @assignment.creditassign
                    investors: @assignment.invests.results
                    due_date: @assignment.dueDate
                }


            submit: (event) ->

                good_to_go = true

                if @assignment.creditassign.userId == @user.info?.id
                    good_to_go = false
                    @$window.alert "不可以投自己转让的债权标"

                else if @loan.loanRequest.userId == @user.info?.id
                    good_to_go = false
                    @$window.alert "不可以投自己借款的债转标"

                unless good_to_go
                    return event.preventDefault()  # submitting via AJAX

                @$location.path "assignment/#{ @$scope.assignment.id }/invest"




    angular.module('directive').directive 'assignmentSummary', ->

        restrict: 'AE'
        templateUrl: 'components/templates/ngt-assignment-summary.tmpl.html'

        scope:
            loan: '='









    angular.module('factory').factory 'map_assignment_summary', -> (item) ->

        CHART_OPTIONS = ->
            size: 50
            scaleColor: false
            barColor: '#E8383D'
            trackColor: '#DFDFDF'

        item.status = 'OPENED' if item.status is 'OPEN'

        result = _.pick item, _.split 'id title status balance method'

        invest_percent_int = ((1 - item.balance / item.creditAmount) * 100) | 0
        invest_percent_int = 100 if item.status in _.split 'SETTLED FINISHED'

        return _.merge result, {

            raw: item

            loan_id: item.loanId

            invest_percent_int

            balance_myriad: (item.balance / 10000)
            rate: (item.actualRate * 100).toFixed(2)

            time_open_left: item.timeOpen - Date.now()
            time_close_left: item.timeOpen + item.timeOut * 3600 * 1000 - Date.now()
            time_open: item.timeOpen
            time_close: item.timeOpen + (item.timeOut * 3600 * 1000)

            due_date: new Date( +moment(item.timeOpen).add(item.remainPeriod - 1, 'd'))

            status: item.status
            method: item.repaymentMethod

            amount: item.creditAmount
            amount_myriad: (item.creditAmount / 10000)

            trade_rate: item.creditDealRate * 100
            total_days: item.remainPeriod

            chart_options: _.merge CHART_OPTIONS(), do (data = {}) ->
                data.barColor = '#0076CB' unless item.status is 'OPENED'
                return data
        }
