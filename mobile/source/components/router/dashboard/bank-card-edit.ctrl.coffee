
do (_, angular) ->

    angular.module('controller').controller 'BankCardEditCtrl',

        _.ai '            @user, @api, @$scope, @$window, @$location, @$routeParams', class
            constructor: (@user, @api, @$scope, @$window, @$location, @$routeParams) ->

                @$window.scrollTo 0, 0

                @$scope.bank_account = do (list = _.clone @user.bank_account_list) =>
                    _.find list, (item) => item.id is @$routeParams.id


            unbind: (account) ->

                (@api.payment_pool_unbind_card(account)

                    .then @api.process_response

                    .then (response) =>
                        @$window.alert response.data

                    .catch (response) =>
                        @$window.alert _.get response, 'error[0].message', 'something happened...'

                    .finally =>
                        @$location
                            .path 'dashboard/bank-card'
                            .search t: _.now()

                        @$scope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location.href = new_path
                )


            set_default: (account) ->

                (@api.payment_pool_set_default_card(account)

                    .then @api.process_response

                    .then (response) =>
                        @$window.alert response.data

                    .catch (response) =>
                        @$window.alert _.get response, 'error[0].message', 'something happened...'

                    .finally =>
                        @$location
                            .path 'dashboard/bank-card'
                            .search t: _.now()

                        @$scope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location.href = new_path
                )
