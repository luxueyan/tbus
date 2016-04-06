
do (_, angular) ->

    angular.module('controller').controller 'LoginCtrl',

        _.ai '            @api, @$scope, @$rootScope, @$window, @$timeout, @$location, @$routeParams, @$q, @popup_payment_state', class
            constructor: (@api, @$scope, @$rootScope, @$window, @$timeout, @$location, @$routeParams, @$q, @popup_payment_state) ->

                {next, mobile, bind_social_weixin} = @$routeParams

                @next_path = next
                @step = if mobile then 'two' else 'one'

                @submit_sending = false
                @flashing_error_message = false

                @bind_weixin = !!bind_social_weixin and
                               /MicroMessenger/.test @$window.navigator.userAgent

                angular.extend @$scope, {
                    store: {mobile}
                    page_path: @$location.path()[1..]
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

                if @step is 'one'

                    (@api.check_mobile(mobile)

                        .then @api.process_response

                        .then (data) =>
                            {next, referral} = @$routeParams

                            @$location
                                .path 'register'
                                .search _.compact {mobile, next, referral}

                        .catch (data) =>
                            {next} = @$routeParams

                            @$location
                                .path 'login'
                                .search _.compact {mobile, next}
                    )

                    return

                (@api.login(mobile, password)

                    .then @api.process_response

                    .then (data, {bind_social_weixin} = @$routeParams) =>
                        if @bind_weixin
                            @api.bind_social 'WEIXIN', bind_social_weixin

                        return data

                    .then (data) =>
                        @$scope.is_login_successful = true

                        @$rootScope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location.href = new_path

                        @api.fetch_current_user()

                            .then (user) =>
                                return user if user.has_bank_card and user.has_payment_password
                                return @$q.reject(user)

                            .then =>
                                unless @next_path
                                    @$location
                                        .path 'dashboard'
                                        .search t: _.now()
                                else
                                    @$location
                                        .path @next_path
                                        .search {}

                            .catch (user) =>
                                @popup_payment_state {
                                    user
                                    page: 'login'
                                    next_path: @next_path || 'dashboard'
                                }

                        return

                    .catch (data) =>
                        result = _.get data, 'error_description.result'

                        if result in _.split 'TOO_MANY_ATTEMPT USER_DISABLED'
                            @$window.alert @$scope.msg[result]
                        else
                            do @error_message_flash

                        @submit_sending = false
                )



