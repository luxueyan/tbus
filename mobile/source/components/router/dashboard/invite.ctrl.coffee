
do (_, angular, Math) ->

    angular.module('controller').controller 'InviteCtrl',

        _.ai '            wx, @user, @api, @$location, @$scope, @$cookies, @$window, @baseURI, @$routeParams', class
            constructor: (wx, @user, @api, @$location, @$scope, @$cookies, @$window, @baseURI, @$routeParams) ->

                @$window.scrollTo 0, 0

                @back_path = @$routeParams.back or @$cookies.get 'invite_back_path'
                @back_path = @$window.decodeURIComponent @back_path
                @$cookies.remove 'invite_back_path'

                Object.defineProperties @$scope,
                    share_link: {
                        get: =>
                            result = @$location.absUrl().split('/')[0..2]
                            result.push 'register?refm=' + @user.info.invite_code
                            return result.join '/'
                    }

                @wechat = {
                    inside: /MicroMessenger/.test @$window.navigator.userAgent
                    ready: false
                    wx
                }

                @init_wechat() if @wechat.inside

                EXTEND_API @api

                @$scope.loading_banner = true

                (@api.get_invite_banner()

                    .then (data) =>
                        @$scope.banner = src: _.get data, '[0].content'

                    .finally =>
                        @$scope.loading_banner = false
                )

                @$scope.loading_have_invited = true

                (@api.get_refer_count_and_reward()

                    .then (data) =>
                        @$scope.have_invited = data

                    .finally =>
                        @$scope.loading_have_invited = false
                )


            init_wechat: ->

                API_LIST = _.split '
                    onMenuShareAppMessage
                    onMenuShareTimeline
                    onMenuShareQQ
                '

                @wechat.wx.ready =>
                    @on_wechat_ready API_LIST

                    @$scope.$evalAsync =>
                        @wechat.ready = true

                config = {
                    timestamp: _.now() // 1000
                    nonceStr: Math.random().toString(36)[2...16]
                    url: @$location.absUrl().split('#')[0]
                }

                @api.exchange_wechat_signature(config).then (data) =>

                    {timestamp, nonceStr, appId, signature} = data
                    data = {timestamp, nonceStr, appId, signature}

                    return unless +timestamp is +config.timestamp and
                                  nonceStr is config.nonceStr

                    @wechat.wx.config _.merge data, {
                        debug: false

                        jsApiList: API_LIST
                    }


            on_wechat_ready: (api_list) ->

                @$scope.$evalAsync =>

                    {SOCIAL_TITLE, SOCIAL_DESC, SOCIAL_IMG} = @$scope.msg

                    _.each api_list, (api) =>

                        @wechat.wx[api] {
                            title: SOCIAL_TITLE
                            desc: SOCIAL_DESC
                            link: @$scope.share_link
                            imgUrl: @baseURI + SOCIAL_IMG
                            success: _.noop
                            cancel: _.noop
                        }








    EXTEND_API = (api) ->

        api.__proto__.get_invite_banner = (cache = true) ->

            @$http
                .get '/api/v2/cms/category/IMAGE/name/%E9%82%80%E8%AF%B7%E5%A5%BD%E5%8F%8B', {cache}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


        api.__proto__.get_refer_count_and_reward = (cache = false) ->

            @$http
                .get '/api/v2/reward/getReferUserCountAndReward/MYSELF', {cache}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
