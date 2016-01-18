
do (_, angular) ->

    angular.module('controller').controller 'WithdrawCtrl',

        _.ai '            @user, @api, @$cookies, @baseURI, @$scope, @$window', class
            constructor: (@user, @api, @$cookies, @baseURI, @$scope, @$window) ->

                @$window.scrollTo 0, 0

                angular.extend @$scope, {
                    available_amount: @user.fund.availableAmount
                    total_amount: @user.fund.availableAmount + @user.fund.frozenAmount
                    bank_account: @user.bank_account
                }


            submit: ->

                @$cookies.put 'return_url', @baseURI + 'dashboard/funds', path: '/'
