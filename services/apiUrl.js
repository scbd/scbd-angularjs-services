define(['app'], function(app) {

    app.factory('apiUrl', ["$q", "$location", function($q, $location) {


            function devApiUrl() {

                if (isDevelopmentURL())
                    return 'https://api.cbddev.xyz';
            }

            function devAccountsUrl() {
                if (isDevelopmentURL())
                    return 'https://accounts.cbddev.xyz';
            }

            function isDevelopmentURL() {
                var knownDevUrls = [
                    /^https:\/\/accounts.cbddev.xyz\//i,
                    /^https:\/\/absch.cbddev.xyz\//i,
                    /^https:\/\/chm.cbddev.xyz\//i,
                    /^http:\/\/localhost[:\/]/i,
                    /^\/\w+/i
                ];

                var url = $location.$$absUrl;

                for (var i = 0; i < knownDevUrls.length; i++) {
                    if (url.match(knownDevUrls[i])) {
                        return true;
                    }
                }
                return false;
            }

            return {
                devApiUrl       : devApiUrl,
                devAccountsUrl  : devAccountsUrl
            };
    }]);
});
