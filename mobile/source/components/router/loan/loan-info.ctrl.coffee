
do (_ ,angular) ->

    angular.module('controller').controller 'LoanInfoCtrl',

        _.ai '            @loan, @$scope, @$window, map_loan_summary, @$routeParams', class
            constructor: (@loan, @$scope, @$window, map_loan_summary, @$routeParams) ->

                @$window.scrollTo 0, 0

                @$scope.tab = @$routeParams.tab or 'security'

                @$scope.loan = map_loan_summary @loan
