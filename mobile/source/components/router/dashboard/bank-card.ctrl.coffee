
do (_, angular) ->

    angular.module('controller').controller 'BankCardCtrl',

        _.ai '            @user, @$scope, @$window', class
            constructor: (@user, @$scope, @$window) ->

                @$window.scrollTo 0, 0

                angular.extend @$scope, {
                    bank_account_list: _.clone @user.bank_account_list
                }
