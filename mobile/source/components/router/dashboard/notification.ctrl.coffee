
do (_, angular) ->

    angular.module('controller').controller 'NotificationCtrl',

        _.ai '            @data, @api, @$scope, @$window', class
            constructor: (@data, @api, @$scope, @$window) ->

                @$window.scrollTo 0, 0

                notification_list = _.clone @data.results

                list = []
                list.remain = notification_list
                list.length = 0

                @add_more(list)

                @$scope.data = list


            read: (notification) ->

                notification.show_content = not notification.show_content

                if notification.status is 'NEW'
                    notification.status = 'READ'
                    @api.mark_as_read_notification(notification.id)


            has_more: (list) ->

                list.remain?.length > 0


            add_more: (list) ->

                PAGE_SIZE = 4 * 1000

                while list.remain.length and PAGE_SIZE--
                    list.push list.remain.shift()
