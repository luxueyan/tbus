
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

        ui.bootstrap
        ui.validate
        ui.scrollpoint
        ui.mask

        timer
        easypiechart
        monospaced.qrcode

        angulartics
        angulartics.baidu

    '.split ' '
