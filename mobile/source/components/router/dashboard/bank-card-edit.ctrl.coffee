
do (_, angular) ->

    angular.module('controller').controller 'BankCardEditCtrl',

        _.ai '            @user, @api, @$scope, @$window, @$location, @$routeParams', class
            constructor: (@user, @api, @$scope, @$window, @$location, @$routeParams) ->

                @$window.scrollTo 0, 0

                @submit_sending = false

                @$scope.bank_account = do (list = _.clone @user.bank_account_list) =>
                    _.find list, (item) => item.id is @$routeParams.id


            unbind: (account) ->

                @submit_sending = true

                (@api.payment_pool_unbind_card(account)

                    .then @api.process_response

                    .then (data) =>
                        @$window.alert @$scope.msg.SUCCEED_UNBIND

                    .catch (data) =>
                        key = _.get data, 'error[0].message', 'UNKNOWN_UNBIND'
                        @$window.alert @$scope.msg[key] or key

                    .finally =>
                        @$location
                            .path 'dashboard/bank-card'
                            .search t: _.now()

                        @$scope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location.href = new_path
                )


            set_default: (account) ->

                @submit_sending = true

                (@api.payment_pool_set_default_card(account)

                    .then @api.process_response

                    .then (data) =>
                        @$window.alert @$scope.msg.SUCCEED_SET_DEFAULT

                    .catch (data) =>
                        key = _.get data, 'error[0].message', 'UNKNOWN_SET_DEFAULT'
                        @$window.alert @$scope.msg[key] or key

                    .finally =>
                        @$location
                            .path 'dashboard/bank-card'
                            .search t: _.now()

                        @$scope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location.href = new_path
                )
