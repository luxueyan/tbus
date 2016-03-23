
do (_, angular) ->

    angular.module('controller').controller 'PasswordChangeCtrl',

        _.ai '            @user, @api, @$scope, @$location, @$window, @$interval, @$q', class
            constructor: (@user, @api, @$scope, @$location, @$window, @$interval, @$q) ->

                angular.extend @$scope, {
                    store: {
                        mobile: @user.info.mobile
                    }
                    page_path: @$location.path()[1..]
                }


            send_password_reset: ({mobile, password_old, password}) ->

                @new_password_sending = true

                (@api.change_password(mobile, password_old, password)

                    .then (data) =>
                        return @$q.reject data unless data.success is true
                        return data

                    .then (data) =>
                        @$window.alert @$scope.msg.SUCCEED

                    .then => @api.login(mobile, password)

                    .then =>
                        @$location.path 'dashboard'

                    .catch (data) =>
                        error = _.get data, 'error[0].message'
                        @$window.alert error

                    .finally =>
                        @new_password_sending = false
                )
