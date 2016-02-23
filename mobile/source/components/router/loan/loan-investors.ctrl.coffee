
do (_, angular) ->

    angular.module('controller').controller 'LoanInvestorsCtrl',

        _.ai '            @investors, @$scope, @$window', class
            constructor: (@investors, @$scope, @$window) ->

                @$window.scrollTo 0, 0

                @$scope.investors = @investors
