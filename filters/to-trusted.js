define(['app'], function(app) {
    //============================================================
    //
    //
    //
    //============================================================
    app.filter("toTrusted", function($sce) {
        return function(value) {
            return $sce.trustAsHtml(value);
        };
    });
    app.filter('to_trusted', function($sce) {
        return function(html) {
            return $sce.trustAsHtml(html);
        };
    });
});
