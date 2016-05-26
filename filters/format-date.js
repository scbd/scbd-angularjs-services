define(['app','moment'], function(app,moment) {

    //============================================================
    //
    //
    //
    //============================================================
    app.filter("formatDate", function() {
        return function(date, formart) {
            if (formart === undefined)
                formart = 'DD MMM YYYY';
            return moment(date).format(formart);
        };
    });
});
