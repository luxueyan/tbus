
do (_) ->

    _.mixin

        # Angular Inject
        ai: (params, func, result = params.replace(/@|,/g, '')) ->
            _.split(result).concat func

        split: (string) ->
            string.trim().match(/\S+/g) or []

        fixed: (digits, num) ->
            (+num or 0).toFixed digits

        fixed_in_2: (num) ->
            _.fixed 2, num

        $compact: _.compact
        compact: (collection) ->
            return _.$compact collection unless _.isPlainObject collection

            filter_list = [_.isUndefined, _.isNull, _.isNaN, _.partial(_.isEqual, '')]

            _.omit collection, (value) ->
                _(filter_list).some (func) -> func(value)
