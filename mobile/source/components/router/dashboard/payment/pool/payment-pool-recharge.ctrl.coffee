
do (angular) ->

    angular.module('controller').controller 'RechargeCtrl',

        _.ai '            @user, @api, @baseURI, @$location, @$scope, @$window, @$routeParams', class
            constructor: (@user, @api, @baseURI, @$location, @$scope, @$window, @$routeParams) ->

                @$window.scrollTo 0, 0

                @back_path = @$routeParams.back
                @next_path = @$routeParams.next

                @$scope.bank_account = _.clone @user.bank_account

                angular.extend @$scope, {
                    bank_account: _.clone @user.bank_account
                    available_amount: @user.fund.availableAmount
                    return_url: @baseURI + 'dashboard'
                }

                if +@$routeParams.amount > 0
                    @$scope.amount = @$routeParams.amount // 100 * 100 + 100

                @api.get_available_bank_list().then (data) =>
                    @$scope.bank_account.bank_code = @$scope.bank_account.bank
                    @$scope.bank_account.bank = data[@$scope.bank_account.bank]
