
do (_, angular) ->

    angular.module('controller').controller 'LoginCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$window, @$timeout, @$location, @$routeParams, @$q, @popup_payment_state', class
            constructor: (@api, @$scope, @$rootScope, @$window, @$timeout, @$location, @$routeParams, @$q, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                {next, mobile, bind_social_weixin} = @$routeParams

                @next_path = next
                @submit_sending = false
                @flashing_error_message = false

                @bind_weixin = !!bind_social_weixin and
                               /MicroMessenger/.test @$window.navigator.userAgent

                angular.extend @$scope, {
                    store: {mobile}
                }


            error_message_flash: ->
                @flashing_error_message = true
                @$timeout.cancel @timer

                @timer = @$timeout (=>
                    @flashing_error_message = false
                ), 2000


            login: ({mobile, password} = {}) ->

                @submit_sending = true
                @flashing_error_message = false

                (@api.login(mobile, password)

                    .then @api.process_response

                    .then (data, {bind_social_weixin} = @$routeParams) =>
                        if @bind_weixin
                            @api.bind_social 'WEIXIN', bind_social_weixin

                        return data

                    .then (data) =>
                        @$scope.is_login_successful = true

                        # @$rootScope.$on '$locationChangeSuccess', =>
                        #     @$window.location.reload()

                        (@api.fetch_current_user()

                            .then (user) =>
                                if user.has_bank_card and user.has_payment_password

                                    unless @next_path
                                        @$location
                                            .path 'dashboard'
                                            .search t: _.now()
                                    else
                                        @$location
                                            .path @next_path
                                            .search {}

                                else
                                    @popup_payment_state {
                                        user
                                        page: 'login'
                                    }
                        )


                    .catch (data) =>
                        return if data is 'cancel'

                        result = _.get data, 'error_description.result'

                        if result in _.split 'TOO_MANY_ATTEMPT USER_DISABLED'
                            @$window.alert @$scope.msg[result]
                        else if result is 'FAILED'
                            do @error_message_flash
                        else
                            @$window.alert @$scope.msg.UNKNOWN

                    .finally =>
                        @submit_sending = false
                )



