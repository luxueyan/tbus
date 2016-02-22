
do (_, angular) ->

    angular.module('controller').controller 'BankCardCtrl',

        _.ai '            @user, @api, @$scope, @$window, @$q, @$location, @$routeParams', class
            constructor: (@user, @api, @$scope, @$window, @$q, @$location, @$routeParams) ->

                @$window.scrollTo 0, 0

                @back_path = @$routeParams.back

                @$scope.picking = 'amount' of @$routeParams

                @$scope.bank_account = _.clone @user.bank_account

                return unless @$scope.bank_account
                @api.get_available_bank_list().then (data) =>
                    @$scope.bank_account.bank_code = @$scope.bank_account.bank
                    @$scope.bank_account.bank = data[@$scope.bank_account.bank]


            select: (bank) ->

                @$location
                    .path "#{ @back_path }/#{ bank }"
                    .search back: null


            edit: (bank) ->

                @$location
                    .path "dashboard/bank-card/edit/#{ bank }"
                    .search back: null
