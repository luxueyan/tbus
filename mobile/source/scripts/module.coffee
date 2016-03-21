
do (angular) ->

    custom = '
        filter
        factory
        service
        provider
        directive
        controller

    '.split ' '

    for name in custom
        angular.module name, []

    @modules = custom.concat '
        ngRoute
        ngCookies
        ngResource
        ngSanitize
        ngMessages
        ngAnimate
        ngTouch

        ui.validate
        ui.bootstrap

        timer
        easypiechart
        monospaced.qrcode

        angulartics
        angulartics.baidu
        ui.mask

    '.split ' '
