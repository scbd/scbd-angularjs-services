define(['app','moment'], function(app,moment) {
    //============================================================
    //
    //
    //
    //============================================================
    app.filter("formatDateWithTime", function() {
        return function(date, formart) {
            if (formart === undefined)
                formart = 'MM/DD/YYYY hh:mm';
            return moment.utc(date).format(formart);
        };
    });
});
