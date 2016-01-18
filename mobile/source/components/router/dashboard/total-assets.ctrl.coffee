
do (_, angular) ->

    angular.module('controller').controller 'TotalAssetsCtrl',

        _.ai '            @user, @$scope, @$window', class
            constructor: (@user, @$scope, @$window) ->

                @$window.scrollTo 0, 0

                due = @user.fund.dueInAmount
                frozen = @user.fund.frozenAmount
                available = @user.fund.availableAmount

                total = _.sum [due, frozen, available]

                outstanding_principal = @user.fund.outstandingPrincipal
                outstanding_interest = @user.fund.outstandingInterest
                invest_frozen = @user.fund.investFrozenAmount
                withdraw_frozen = frozen - invest_frozen

                @$scope.fund = _.rearg(_.mapValues, 1, 0) _.fixed_in_2, {
                    available
                    total

                    outstanding_principal
                    outstanding_interest
                    invest_frozen
                    withdraw_frozen
                }
