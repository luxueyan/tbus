
do (_ ,angular) ->

    angular.module('controller').controller 'LoanInfoCtrl',

        _.ai '            @loan, @$scope, @$window, map_loan_summary', class
            constructor: (@loan, @$scope, @$window, map_loan_summary) ->

                @$window.scrollTo 0, 0

                @$scope.loan = map_loan_summary @loan
