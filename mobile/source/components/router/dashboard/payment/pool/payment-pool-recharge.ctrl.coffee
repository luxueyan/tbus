
do (angular) ->

    angular.module('controller').controller 'RechargeCtrl',

        _.ai '            @user, @api, @baseURI, @$location, @$scope, @$window, @$routeParams, @popup_payment_state', class
            constructor: (@user, @api, @baseURI, @$location, @$scope, @$window, @$routeParams, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                @back_path = @$routeParams.back
                @next_path = @$routeParams.next

                @$scope.bank_account = _.clone @user.bank_account

                angular.extend @$scope, {
                    bank_account: _.clone @user.bank_account
                    available_amount: @user.fund.availableAmount
                    return_url: @baseURI + 'dashboard'
                }

                # if +@$routeParams.amount > 0
                #     @$scope.amount = @$routeParams.amount // 100 * 100 + 100

                @api.get_available_bank_list().then (data) =>
                    @$scope.bank_account.bank_code = @$scope.bank_account.bank
                    @$scope.bank_account.bank = data[@$scope.bank_account.bank]

                do ({amount, bank} = @$routeParams) =>

                    if +amount
                        @$scope.amount = +amount

                    if bank
                        @$scope.bank_account = _.find @user.bank_account_list, id: bank

                if !@user.has_bank_card or !@user.has_payment_password
                    @popup_payment_state {
                        user: @user
                        page: 'recharge'
                        page_path: 'dashboard/recharge'
                        back_path: 'dashboard'
                    }


            pick_up_bank: (event, amount = 0) ->

                do event.preventDefault

                @$location
                    .path "dashboard/bank-card/#{ amount }"
                    .search back: "dashboard/recharge/#{ amount }"
