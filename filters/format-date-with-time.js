define(['app','moment'], function(app,moment) {
    //============================================================
    //
    //
    //
    //============================================================
    app.filter("formatDateWithTime", function() {
        return function(date, formart) {
            if (formart === undefined)
                formart = 'DD MMM YYYY hh:mm';
            return moment(date).format(formart);
        };
    });
});
