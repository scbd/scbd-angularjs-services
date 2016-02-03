define(['app'], function(app) {

    //============================================================
    //
    //
    //
    //============================================================
    app.filter('nospace', noSpace);
    app.filter('noSpace', noSpace);
    function noSpace() {
        return function(value) {
            return (!value) ? '' : value.replace(/[\s]/g, '');
        };
    }
});
