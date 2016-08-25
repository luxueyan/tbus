
do (_, angular) ->

    angular.module('controller').controller 'PasswordChangeCtrl',

        _.ai '            @user, @api, @$scope, @$rootScope, @$location, @$window, @$interval, @$q', class
            constructor: (@user, @api, @$scope, @$rootScope, @$location, @$window, @$interval, @$q) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                angular.extend @$scope, {
                    store: {
                        mobile: @user.info.mobile
                    }
                }


            send_password_reset: ({mobile, password_old, password}) ->

                @new_password_sending = true

                (@api.change_password(mobile, password_old, password)

                    .then @api.process_response

                    .then (data) =>
                        # @$window.alert @$scope.msg.SUCCEED

                    # .then => @api.login(mobile, password)

                    # .then =>
                    #     @$location.path 'dashboard'

                        @api.flush_user_info()
                        @$scope.action_result = { success: true }

                        # @$location.path '/login'

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                            return

                        error = _.get data, 'error[0].message'
                        @$window.alert error

                    .finally =>
                        @new_password_sending = false
                )
