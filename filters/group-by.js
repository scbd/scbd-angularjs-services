define(['app','moment'], function(app,moment) {
    //============================================================
    //
    //
    //
    //============================================================
    app.filter('groupBy', ["lodash", "$parse", function(_, $parse) {
        var cacheMap = {};
        return _.memoize(function(items, field) {
            var getter = $parse(field);
            return _.groupBy(items, function(item) {
                return getter(item);
            });
        });
    }]);
});
