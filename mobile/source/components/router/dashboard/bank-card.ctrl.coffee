
do (_, angular) ->

    angular.module('controller').controller 'BankCardCtrl',

        _.ai '            @user, @$scope, @$rootScope, @$window, @popup_payment_state', class
            constructor: (@user, @$scope, @$rootScope, @$window, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                bank_account = do (list = _.clone @user.bank_account_list) ->
                    _.find list, (item) -> item.defaultAccount is true

                angular.extend @$scope, { bank_account }

                if !@user.has_bank_card or !@user.has_payment_password
                    @popup_payment_state {
                        user: @user
                        page: 'bank-card'
                    }
