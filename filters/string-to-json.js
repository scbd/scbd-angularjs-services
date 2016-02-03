define(['app'], function(app) {
    //============================================================
    //
    //
    //
    //============================================================
    app.filter("stringToJSON", function() {
        return function(strValue) {
            return JSON.parse(strValue);
        };
    });
});
