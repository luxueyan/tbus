
do (_, angular) ->

    angular.module('controller').controller 'BankCardCtrl',

        _.ai '            @user, @api, @$scope, @$window, @$q, @$location, @$timeout, @$routeParams', class
            constructor: (@user, @api, @$scope, @$window, @$q, @$location, @$timeout, @$routeParams) ->

                @$window.scrollTo 0, 0

                @$scope.bank_account = _.clone @user.bank_account

                return unless @$scope.bank_account
                @api.get_available_bank_list().then (data) =>
                    @$scope.bank_account.bank_code = @$scope.bank_account.bank
                    @$scope.bank_account.bank = data[@$scope.bank_account.bank]


            unbind: (account, password) ->

                (@api.payment_pool_unbind_card(account, password)

                    .then (data) =>
                        return @$q.reject(data) unless data.success is true
                        return data

                    .then (response) =>
                        @$window.alert response.data

                    .catch (response) =>
                        @$window.alert _.get response, 'error[0].message', 'something happened...'

                    .finally =>
                        @$location
                            .path 'dashboard'
                            .search t: _.now()

                        @$scope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location.href = new_path
                )
