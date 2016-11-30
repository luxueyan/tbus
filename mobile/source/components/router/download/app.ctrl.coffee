
do (_, angular, Math) ->

    angular.module('controller').controller 'DownloadAppCtrl',

        _.ai '            wx, @api, @$location, @$scope, @$rootScope, @$window, @baseURI', class
            constructor: (wx, @api, @$location, @$scope, @$rootScope, @$window, @baseURI) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'dashboard'

                @wechat = {
                    inside: /MicroMessenger/.test @$window.navigator.userAgent
                    ready: false
                    wx
                }

                @init_wechat() if @wechat.inside


            init_wechat: ->

                API_LIST = _.split '
                    onMenuShareAppMessage
                    onMenuShareTimeline
                    onMenuShareQQ
                    onMenuShareQZone
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
                            link: @baseURI + 'download-app'
                            imgUrl: @baseURI + SOCIAL_IMG
                            success: _.noop
                            cancel: _.noop
                        }

