
do (_, angular) ->

    angular.module('controller').controller 'BankCardCtrl',

        _.ai '            @user, @$scope, @$window, @$location, @$routeParams', class
            constructor: (@user, @$scope, @$window, @$location, @$routeParams) ->

                @$window.scrollTo 0, 0

                @back_path = @$routeParams.back

                angular.extend @$scope, {
                    bank_account_list: _.clone @user.bank_account_list
                }
