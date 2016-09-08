
do (_, angular) ->

    angular.module('controller').controller 'DashboardSubhomeCtrl',

        _.ai '            @user, @$scope, @$rootScope, @$window, @$location', class
            constructor: (@user, @$scope, @$rootScope, @$window, @$location) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                @$scope.now = Date.now()

                @$scope.default_bank_account = do (list = @user.bank_account_list) ->
                    item = _.find list, (item) -> item.defaultAccount is true
                    return (if item then item else _(list).first())

