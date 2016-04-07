define(['app', './apiUrl'], function(app) {

    app.factory('apiToken', ["$q", "$rootScope", "$window", "$document", "apiUrl", function($q, $rootScope, $window, $document, apiUrl) {

        var domain = document.location.hostname.replace(/^[^\.]+\./, '');

        var pToken;
        var ACCOUNTS_URL = apiUrl.devAccountsUrl() || 'https://accounts.'+domain;

        //============================================================
        //
        //
        //============================================================
        function getToken() {

            var authenticationFrame = $document.find('#authenticationFrame')[0];

            if (!authenticationFrame) {
                pToken = pToken || null;
            }

            if (pToken !== undefined) {
                return $q.when(pToken || null);
            }

            pToken = null

            var defer = $q.defer();

            var receiveMessage = function(event) {
                if (event.origin != ACCOUNTS_URL)
                    return;

                var message = JSON.parse(event.data);

                if (message.type == 'authenticationToken') {
                    defer.resolve(message.authenticationToken || null);

                    if (message.authenticationEmail)
                        $rootScope.lastLoginEmail = message.authenticationEmail;
                    //                        console.log('signin called');
                    //                    $rootScope.$broadcast('signIn', null);

                } else {
                    defer.reject('unsupported message type');
                }
            };

            $window.addEventListener('message', receiveMessage);

            pToken = defer.promise.then(function(t) {

                pToken = t;

                return t;

            }).catch(function(error) {

                pToken = null;

                console.error(error);

                throw error;

            }).finally(function() {

                $window.removeEventListener('message', receiveMessage);

            });

            authenticationFrame.contentWindow.postMessage(JSON.stringify({
                type: 'getAuthenticationToken'
            }), ACCOUNTS_URL);

            return pToken;
        }

        //============================================================
        //
        //
        //============================================================
        function setToken(token, email) { // remoteUpdate:=true

            pToken = token || undefined;

            var authenticationFrame = $document.find('#authenticationFrame')[0];

            if (authenticationFrame) {

                var msg = {
                    type: "setAuthenticationToken",
                    authenticationToken: token,
                    authenticationEmail: email
                };

                authenticationFrame.contentWindow.postMessage(JSON.stringify(msg), ACCOUNTS_URL);
            }

            if (email) {
                $rootScope.lastLoginEmail = email;
            }
        }

        return {
            get: getToken,
            set: setToken
        };
    }]);
    app.factory('authentication', ["$http", "$rootScope", "$q", "apiToken", function($http, $rootScope, $q, apiToken) {

        var currentUser = null;

        //============================================================
        //
        //
        //============================================================
        function anonymous() {
            return {
                userID: 1,
                name: 'anonymous',
                email: 'anonymous@domain',
                government: null,
                userGroups: null,
                isAuthenticated: false,
                isOffline: true,
                roles: []
            };
        }

        //============================================================
        //
        //
        //============================================================
        function getUser() {

            if (currentUser)
                return $q.when(currentUser);

            return $q.when(apiToken.get()).then(function(token) {

                if (!token) {
                    return anonymous();
                }

                return $http.get('/api/v2013/authentication/user', {
                    headers: {
                        Authorization: "Ticket " + token
                    }
                }).then(function(r) {
                    return r.data;
                });

            }).catch(function() {

                return anonymous();

            }).then(function(user) {

                setUser(user);

                return user;
            });
        }

        //============================================================
        //
        //
        //============================================================
        function signIn(email, password) {

            return $http.post("/api/v2013/authentication/token", {

                "email": email,
                "password": password

            }).then(function(res) {

                var token = res.data;

                return $q.all([token, $http.get('/api/v2013/authentication/user', {
                    headers: {
                        Authorization: "Ticket " + token.authenticationToken
                    }
                })]);

            }).then(function(res) {

                var token = res[0];
                var user = res[1].data;

                email = (email || "").toLowerCase();

                apiToken.set(token.authenticationToken, email);
                setUser(user);

                $rootScope.$broadcast('signIn', user);

                return user;

            }).catch(function(error) {

                throw {
                    error: error.data,
                    errorCode: error.status
                };

            });
        }

        //============================================================
        //
        //
        //============================================================
        function signOut() {

            apiToken.set(null);

            setUser(null);

            return $q.when(getUser()).then(function(user) {

                $rootScope.$broadcast('signOut', user);

                return user;
            });
        }

        //============================================================
        //
        //
        //============================================================
        function setUser(user) {
            if (user && user.isAuthenticated && !user.isEmailVerified) {
                $rootScope.$broadcast('event:auth-emailVerification', {
                    message: 'Email verification pending. Please verify you email before submitting any data.'
                });
            }

            currentUser = user || undefined;
            $rootScope.user = user || anonymous();
        }

        //============================================================
        //
        //
        //============================================================
        function isEmailVerified() {
            var user = getUser();
            return (user && user.isAuthenticated && user.isEmailVerified) ;

        }

        return {
            getUser: getUser,
            signIn: signIn,
            signOut: signOut,
            isEmailVerified:isEmailVerified
        };

    }]);

    app.factory('authenticationHttpIntercepter', ["$q", "apiToken",
     function($q, apiToken) {

        return {
            request: function(config) {

                var trusted = /^https:\/\/api.cbd.int\//i.test(config.url) ||
                    /^https:\/\/localhost[:\/]/i.test(config.url) ||
                    /^\/\w+/i.test(config.url);

                var hasAuthorization = (config.headers || {}).hasOwnProperty('Authorization') ||
                    (config.headers || {}).hasOwnProperty('authorization');

                if (!trusted || hasAuthorization) // no need to alter config
                    return config;

                //Add token to http headers

                return $q.when(apiToken.get()).then(function(token) {

                    if (token) {
                        config.headers = angular.extend(config.headers || {}, {
                            Authorization: "Ticket " + token
                        });
                    }

                    return config;
                });
            },
            responseError: function(rejection) {

                if (rejection.data && rejection.data.statusCode == 401) {

                    if (rejection.data.message.indexOf('Email verification pending') >= 0) {
                        $rootScope.$broadcast('event:auth-emailVerification', rejection.data);
                    }

                }
                // otherwise, default behaviour
                return $q.reject(rejection);
            }
        };
    }]);

    app.factory('realmHttpIntercepter', ["realm", function(realm) {

        return {
            request: function(config) {



                if((config.headers || {}).hasOwnProperty('realm'))
                    return config;

                var trusted = /^https:\/\/api.cbd.int\//i.test(config.url) ||
                /^https:\/\/eunomia.cbd.int\//i.test(config.url) ||
                    /^https:\/\/localhost[:\/]/i.test(config.url) ||
                    /^\/\w+/i.test(config.url);

                if (trusted && realm) {
                    config.headers = angular.extend(config.headers || {}, {
                        realm: realm.value || realm
                    });
                }

                return config;
            }
        };
    }]);

    app.factory('apiURLHttpIntercepter', ["apiUrl", function(apiUrl) {

            return {
                request: function(config) {

                    if(config.url.startsWith('/api/')){
                        var devUrl = apiUrl.devApiUrl(config.url);
                        if(devUrl)
                            config.url =  devUrl + config.url;
                    }

                    return config;
                }
            };
        }
    ]);
    app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
        $httpProvider.interceptors.push('realmHttpIntercepter');
        $httpProvider.interceptors.push('apiURLHttpIntercepter');
    }]);

});
