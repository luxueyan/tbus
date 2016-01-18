
do (_, angular) ->

    angular.module('controller').controller 'AnnouncementCtrl',

        _.ai '            @data, @$scope, @$window', class
            constructor: (@data, @$scope, @$window) ->

                @$window.scrollTo 0, 0

                list = []
                list.remain = _.sortByOrder @data, 'pubDate', 'desc'
                list.length = 0

                @add_more(list)

                @$scope.data = list


            has_more: (list) ->

                list.remain?.length > 0


            add_more: (list) ->

                PAGE_SIZE = 4

                while list.remain.length and PAGE_SIZE--
                    list.push list.remain.shift()
