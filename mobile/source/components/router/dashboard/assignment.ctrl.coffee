
do (_, angular) ->

    angular.module('controller').controller 'DashboardAssignmentCtrl',

        _.ai '            @loan, @api, @$scope, @$rootScope, @$window, map_loan_summary', class
            constructor: (@loan, @api, @$scope, @$rootScope, @$window, map_loan_summary) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                angular.extend @$scope, {
                    loan: map_loan_summary @loan
                }

