(function(window, angular, undefined) {
    'use strict';
    var app = angular.module('scbdServices', []);

    app.factory('apiToken', ["$q", "$rootScope", "$window", "$document", function($q, $rootScope, $window, $document) {

        var pToken;

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

            pToken = null;

            var defer = $q.defer();

            var receiveMessage = function(event) {
                if (event.origin != 'https://accounts.cbd.int')
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
            }), 'https://accounts.cbd.int');

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

                authenticationFrame.contentWindow.postMessage(JSON.stringify(msg), 'https://accounts.cbd.int');
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

            currentUser = user || undefined;
            $rootScope.user = user || anonymous();
        }

        return {
            getUser: getUser,
            signIn: signIn,
            signOut: signOut,
        };

    }]);
    app.factory('authenticationHttpIntercepter', ["$q", "apiToken", function($q, apiToken) {

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
            }
        };
    }]);

    app.factory('realmHttpIntercepter', ["realm", function(realm) {

		return {
			request: function(config) {

				var trusted = /^https:\/\/api.cbd.int\//i .test(config.url) ||
						      /^https:\/\/localhost[:\/]/i.test(config.url) ||
							  /^\/\w+/i                   .test(config.url);

                if(trusted && realm) {
                    config.headers = angular.extend(config.headers || {}, { realm : realm.value });
                }

                return config;
			}
		};
	}]);

    app.factory("IWorkflows", ["$http", function($http) {

        //===========================
        //
        //===========================
        function create(type, version, data) {

            var body = {
                type: type,
                version: version,
                data: data
            };

            return $http.post("/api/v2013/workflows", body).then(function(resp) {
                return resp.data;
            });
        }

        //===========================
        //
        //===========================
        function get(id) {
            return $http.get("/api/v2013/workflows/" + id).then(
                function(resp) {
                    return resp.data;
                });
        };

        //===========================
        //
        //===========================
        function updateActivity(id, activityName, data) {
            return $http.put("/api/v2013/workflows/" + id + "/activities/" + activityName, data).then(
                function(resp) {
                    return resp.data;
                });
        }
        //===========================
        //
        //===========================
        function cancel(id, data) {
            return $http.delete("/api/v2013/workflows/" + id, {
                params: data
            }).then(
                function(resp) {
                    return resp.data;
                });
        }
        //===========================
        //
        //===========================
        function cancelActivity(id, activityName, data) {
            return $http.delete("/api/v2013/workflows/" + id + "/activities/" + activityName, data).then(
                function(resp) {
                    return resp.data;
                });
        };

        //===========================
        //
        //===========================
        function query(query, count, length, skip, sort) {
            return $http.get("/api/v2013/workflows/", {
                params: {
                    q: JSON.stringify(query),
                    l: length,
                    s: sort,
                    sk: skip,
                    c: count
                }
            }).then(function(resp) {
                return resp.data;
            });
        }
        return {
            create: create,
            get: get,
            updateActivity: updateActivity,
            cancel: cancel,
            cancelActivity: cancelActivity,
            query: query,
        };
    }]);

    app.factory("IUserNotifications", ["$http", function($http) {

        //===========================
        //
        //===========================
        function create(type, assignedTo, data) {

            var body = {
                type: type,
                assignedTo: assignedTo,
                data: data
            };

            return $http.post("/api/v2015/user-notifications", body).then(function(resp) {
                return resp.data;
            });
        }

        //===========================
        //
        //===========================
        function get(id) {
            return $http.get("/api/v2015/user-notifications/" + id, {
                ignoreLoadingBar: true
            }).then(
                function(resp) {
                    return resp.data;
                });
        }

        //===========================
        //
        //===========================
        function update(id, data) {
            return $http.put("/api/v2015/user-notifications/" + id, data).then(
                function(resp) {
                    return resp.data;
                });
        }

        //===========================
        //
        //===========================
        function deleteNotification(id) {
            return $http.delete("/api/v2015/user-notifications/" + id).then(
                function(resp) {
                    return resp.data;
                });
        }

        //===========================
        //
        //===========================
        function query(query, pageNumber, pageLength, count) {
            return $http.get("/api/v2015/user-notifications/", {
                params: {
                    q: JSON.stringify(query),
                    sk: pageNumber,
                    l: pageLength,
                    c: count
                },
                cache: false,
                ignoreLoadingBar: true
            }).then(function(resp) {
                return resp.data;
            });
        }
        return {
            create: create,
            get: get,
            update: update,
            delete: deleteNotification,
            query: query,
        };
    }]);


    app.factory("IStorage", ["$http", "$q", "authentication", "realm", function($http, $q, authentication, defaultRealm) {
        //		return new function()
        //		{
        var serviceUrls = { // Add Https if not .local
            documentQueryUrl: function() {
                return "/api/v2013/documents/";
            },
            documentUrl: function() {
                return "/api/v2013/documents/:identifier";
            },
            validateUrl: function() {
                return "/api/v2013/documents/x/validate";
            },
            draftUrl: function() {
                return "/api/v2013/documents/:identifier/versions/draft";
            },
            attachmentUrl: function() {
                return "/api/v2013/documents/:identifier/attachments/:filename";
            },
            securityUrl: function() {
                return "/api/v2013/documents/:identifier/securities/:operation";
            },
            draftSecurityUrl: function() {
                return "/api/v2013/documents/:identifier/versions/draft/securities/:operation";
            },
            draftLockUrl: function() {
                return "/api/v2013/documents/:identifier/versions/draft/locks/:lockID";
            },
            documentVersionUrl: function() {
                return "/api/v2013/documents/:identifier/versions";
            },

            documentBodyQueryUrl: function() {
                return "/api/v2013/documents/query/body";
            },
            documentFacetsQueryUrl: function() {
                return "/api/v2013/documents/query/facets";
            },
        };

        //==================================================
        //
        // Documents
        //
        //==================================================
        this.documents = {

            //===========================
            //
            //===========================
            "query": function(query, collection, params) {
                params = angular.extend({}, params || {});
                params.collection = collection;
                params.$filter = query;

                if (query && !collection)
                    params.collection = "my";

                var useCache = !!params.cache;

                var oTrans = transformPath(serviceUrls.documentQueryUrl(), params);

                return $http.get(oTrans.url, {
                    params: oTrans.params,
                    cache: useCache
                });

                //TODO: return result.data;
            },

            //===========================
            //
            //===========================
            "get": function(identifier, params) {
                params = clone(params || {});
                params.identifier = identifier;

                var useCache = !!params.cache;

                var oTrans = transformPath(serviceUrls.documentUrl(), params);

                return $http.get(oTrans.url, {
                    params: oTrans.params,
                    cache: useCache
                });

                //TODO: return result.data;

            },

            //===========================
            //
            //===========================
            "exists": function(identifier, params) {
                params = clone(params || {});
                params.identifier = identifier;

                var useCache = !!params.cache;

                var oTrans = transformPath(serviceUrls.documentUrl(), params);

                return $http.head(oTrans.url, {
                    params: oTrans.params,
                    cache: useCache
                }).then(function() {

                    return true;

                }).catch(function(error) {

                    if (error.status != "404")
                        throw "Error";

                    return false;
                });
            },

            //===========================
            //
            //===========================
            "put": function(identifier, data, params) {
                params = clone(params || {});
                params.identifier = identifier;

                if (!params.schema && data && data.header && data.header.schema)
                    params.schema = data.header.schema;

                var oTrans = transformPath(serviceUrls.documentUrl(), params);

                return $http.put(oTrans.url, data, {
                    "params": oTrans.params
                }).then(function(result) {
                    return result.data;
                });
            },

            //===========================
            //
            //===========================
            "delete": function(identifier, params) {
                params = clone(params || {});
                params.identifier = identifier;

                var oTrans = transformPath(serviceUrls.documentUrl(), params);

                return $http.delete(oTrans.url, {
                    "params": oTrans.params
                });
            },

            //===========================
            //
            //===========================
            "validate": function(document, params) {
                params = clone(params || {});

                if (!params.schema && document && document.header && document.header.schema)
                    params.schema = document.header.schema;

                var oTrans = transformPath(serviceUrls.validateUrl(), params);

                return $http.put(oTrans.url, document, {
                    "params": oTrans.params
                });

                //TODO: return result.data;
            },

            //===========================
            //
            //===========================
            "security": {
                canCreate: function(identifier, schema, metadata) {
                    return canDo(serviceUrls.securityUrl(), "create", identifier, schema, metadata);
                },

                canUpdate: function(identifier, schema, metadata) {
                    return canDo(serviceUrls.securityUrl(), "update", identifier, schema, metadata);
                },

                canDelete: function(identifier, schema, metadata) {
                    return canDo(serviceUrls.securityUrl(), "delete", identifier, schema, metadata);
                }
            }
        };

        //==================================================
        //
        // Drafts
        //
        //==================================================
        this.drafts = {

            //===========================
            //
            //===========================
            "query": function(query, params) {
                params = clone(params || {});
                params.collection = "mydraft";
                params.$filter = query;

                var useCache = !!params.cache;

                var oTrans = transformPath(serviceUrls.documentQueryUrl(), params);

                return $http.get(oTrans.url, {
                    params: oTrans.params,
                    cache: useCache
                });

                //TODO: return result.data;
            },


            //===========================
            //
            //===========================
            "get": function(identifier, params) {
                params = clone(params || {});
                params.identifier = identifier;

                var useCache = !!params.cache;

                if (!params.cache)
                    params.cache = true;

                var oTrans = transformPath(serviceUrls.draftUrl(), params);

                return $http.get(oTrans.url, {
                    params: oTrans.params,
                    cache: useCache
                });

                //TODO: return result.data;
            },

            //===========================
            //
            //===========================
            "exists": function(identifier, params) {
                params = clone(params || {});
                params.identifier = identifier;

                var useCache = !!params.cache;

                var oTrans = transformPath(serviceUrls.draftUrl(), params);

                return $http.head(oTrans.url, {
                    params: oTrans.params,
                    cache: useCache
                }).then(function() {

                    return true;

                }).catch(function(error) {

                    if (error.status != "404")
                        throw "Error";

                    return false;
                });
            },

            //===========================
            //
            //===========================
            "put": function(identifier, data, params) {
                params = clone(params || {});
                params.identifier = identifier;

                if (!params.schema && data && data.header && data.header.schema)
                    params.schema = data.header.schema;

                var oTrans = transformPath(serviceUrls.draftUrl(), params);

                return $http.put(oTrans.url, data, {
                    "params": oTrans.params
                }).then(function(result) {
                    return result.data;
                });
            },

            //===========================
            //
            //===========================
            "delete": function(identifier, params) {
                params = clone(params || {});
                params.identifier = identifier;

                var oTrans = transformPath(serviceUrls.draftUrl(), params);

                return $http.delete(oTrans.url, {
                    "params": oTrans.params
                });

                //TODO: return result.data;
            },

            //===========================
            //
            //===========================
            "security": {
                canCreate: function(identifier, schema, metadata) {
                    return canDo(serviceUrls.draftSecurityUrl(), "create", identifier, schema, metadata);
                },

                canUpdate: function(identifier, schema, metadata) {
                    return canDo(serviceUrls.draftSecurityUrl(), "update", identifier, schema, metadata);
                },

                canDelete: function(identifier, schema, metadata) {
                    return canDo(serviceUrls.draftSecurityUrl(), "delete", identifier, schema, metadata);
                }
            },

            "locks": {

                //===========================
                //
                //===========================
                "get": function(identifier, params) {
                    params = clone(params || {});
                    params.identifier = identifier;

                    var useCache = !!params.cache;

                    var oTrans = transformPath(serviceUrls.draftLockUrl(), params);

                    return $http.get(oTrans.url, {
                        params: oTrans.params,
                        cache: useCache
                    });

                    //TODO: return result.data;

                },
                //===========================
                //
                //===========================
                "exists": function(identifier, params) {
                    params = clone(params || {});
                    params.identifier = identifier;

                    var useCache = !!params.cache;

                    var oTrans = transformPath(serviceUrls.draftLockUrl(), params);

                    return $http.head(oTrans.url, {
                        params: oTrans.params,
                        cache: useCache
                    }).then(function() {

                        return true;

                    }).catch(function(error) {

                        if (error.status != "404")
                            throw "Error";

                        return false;
                    });
                },

                //===========================
                //
                //===========================
                "put": function(identifier, params) {
                    params = clone(params || {});
                    params.identifier = identifier;

                    var oTrans = transformPath(serviceUrls.draftLockUrl(), params);
                    var data = null;
                    return $http.put(oTrans.url, data, {
                        "params": oTrans.params
                    }).then(function(result) {
                        return result.data;
                    });
                },

                //===========================
                //
                // Not tested
                //
                //===========================
                "delete": function(identifier, lockID) {
                    var params = {
                        identifier: identifier,
                        lockID: lockID
                    };

                    var oTrans = transformPath(serviceUrls.draftLockUrl(), params);

                    return $http.delete(oTrans.url).then(function(success) {
                        return success.data;
                    });
                }
            }
        };

        this.attachments = {

            //===========================
            //
            // Not tested
            //
            //===========================
            "put": function(identifier, file, params) {
                params = params || {};
                params.identifier = identifier;
                params.filename = file.name;

                var contentType = params.contentType || getMimeTypes(file.name, file.type || "application/octet-stream");

                params.contentType = undefined;

                var oTrans = transformPath(serviceUrls.attachmentUrl(), params);

                return $http.put(oTrans.url, file, {
                    "headers": {
                        "Content-Type": contentType
                    },
                    "params": oTrans.params
                }).then(
                    function(success) {
                        return angular.extend(success.data || {}, {
                            "url": oTrans.url
                        });
                    },
                    function(error) {
                        error.data = angular.extend(error.data || {}, {
                            "url": oTrans.url
                        });
                        throw error;
                    });
            },

            "getMimeType": function(file) {
                return getMimeTypes(file.name, file.type || "application/octet-stream");
            }
        };

        //==================================================
        //
        // Documents
        //
        //==================================================
        this.documentVersions = {

            //===========================
            //
            //===========================
            "get": function(identifier, params) {
                params = clone(params || {});
                params.identifier = identifier;

                var useCache = !!params.cache;


                var oTrans = transformPath(serviceUrls.documentVersionUrl(), params);

                return $http.get(oTrans.url, {
                    params: oTrans.params,
                    cache: useCache
                });

                //TODO: return result.data;

            }
        };

        //==================================================
        //
        // Document Query
        //
        //==================================================
        this.documentQuery = {

            //===========================
            //
            //===========================
            "body": function(filter, query, params) {
                params = angular.extend({}, params || {});
                params.query = query;
                params.$filter = filter;

                var useCache = !!params.cache;

                var oTrans = transformPath(serviceUrls.documentBodyQueryUrl(), params);

                return $http.get(oTrans.url, {
                    params: oTrans.params,
                    cache: useCache
                });

                //TODO: return result.data;
            },

            //===========================
            //
            //===========================
            "facets": function(filter, params) {
                params = angular.extend({}, params || {});
                params.$filter = filter;

                var useCache = !!params.cache;

                var oTrans = transformPath(serviceUrls.documentFacetsQueryUrl(), params);

                return $http.get(oTrans.url, {
                    params: oTrans.params,
                    cache: useCache
                });

                //TODO: return result.data;
            }

        };




        //==================================================
        //
        //
        //==================================================
        var getMimeTypes = function(filename, defaultMimeType) {
            var sMimeType = defaultMimeType || "application/octet-stream";

            if (filename && sMimeType == "application/octet-stream") {
                var sExt = "";
                var iIndex = filename.lastIndexOf(".");

                if (iIndex >= 0)
                    sExt = filename.substring(iIndex).toLowerCase();

                if (sExt == ".json") sMimeType = "application/json";
                if (sExt == ".geojson") sMimeType = "application/json";
                if (sExt == ".xml") sMimeType = "application/xml";
            }

            return sMimeType;
        };

        //==================================================
        //
        //
        //==================================================
        var clone = function(obj) {

            if (obj === null)
                return null;

            if (obj === undefined)
                return undefined;

            return angular.fromJson(angular.toJson(obj));
        };

        //===========================
        //
        // Replace :xyz in path with value in params
        // query part will be done by $http
        //
        //===========================
        var transformPath = function(url, params) {
            var oRegex = /\:\w+/g;
            var oMatch = null;
            var qMatches = [];
            var oNewParams = {};

            while ((oMatch = oRegex.exec(url)) !== null) {
                oMatch.key = oMatch[0].substring(1);
                oMatch.value = oMatch[0];
                qMatches.splice(0, 0, oMatch);
            }

            for (var key in params || {}) {
                var bExist = false;

                for (var i in qMatches) {
                    if (qMatches[i].key != key)
                        continue;

                    bExist = true;
                    qMatches[i].value = params[key].toString();
                }

                if (!bExist)
                    oNewParams[key] = params[key];
            }

            for (var j in qMatches) {
                url = replaceAt(url, qMatches[j].index, qMatches[j][0].length, encodeURIComponent(qMatches[j].value));
            }

            return {
                "url": url,
                "params": oNewParams
            };
        };

        //===========================
        //
        // Calls storage security
        //
        //===========================
        var canDo = function(patternPath, operation, identifier, schema, metadata) {

            metadata = angular.extend({}, {
                "schema": schema
            }, metadata || {});

            return $q.when(authentication.getUser()).then(function(user) {

                if (!metadata.government && user.government)
                    metadata = angular.extend(metadata, {
                        "government": user.government
                    });

                if (!metadata.realm && defaultRealm)
                    metadata = angular.extend(metadata, {
                        "realm": defaultRealm.value
                    });

                var params = {
                    "identifier": identifier || "x",
                    "operation": operation,
                    "metadata": metadata
                };

                var oTrans = transformPath(patternPath, params);

                return $http.get(oTrans.url, {
                    "params": oTrans.params
                })

            }).then(function(res) {

                return res.data.isAllowed;
            });
        };

        //===========================
        //
        // Replace :xyz in path with value in params
        // query part will be done by $http
        //
        //===========================
        var replaceAt = function(str, index, len, newText) {
            return str.substring(0, index) + newText + str.substring(index + len);
        };

        return this;
        //		}();
    }]);

    app.factory('Thesaurus', [function() {
		return {
			buildTree : function(terms) {
				var oTerms    = [];
				var oTermsMap = {};

				Enumerable.from(terms).forEach(function(value) {
					var oTerm = {
						identifier  : value.identifier,
						title       : value.title,
						description : value.description
					}

					oTerms.push(oTerm);
					oTermsMap[oTerm.identifier] = oTerm;
				});

				for (var i = 0; i < oTerms.length; ++i) {
					var oRefTerm = terms [i];
					var oBroader = oTerms[i];

					if (oRefTerm.narrowerTerms && oRefTerm.narrowerTerms.length > 0) {
						angular.forEach(oRefTerm.narrowerTerms, function(identifier) {
							var oNarrower = oTermsMap[identifier];

							if (oNarrower) {
								oBroader.narrowerTerms = oBroader.narrowerTerms || [];
								oNarrower.broaderTerms = oNarrower.broaderTerms || [];

								oBroader.narrowerTerms.push(oNarrower);
								oNarrower.broaderTerms.push(oBroader);
							}
						});
					}
				}

				return Enumerable.from(oTerms).where("o=>!o.broaderTerms").toArray();
			}
		}
	}]);

	app.factory('localization', ["$browser", function($browser) {
		return {
			locale: function(newLocale) {

				var internal_SetLocale = function(newLocale) {

					if (!/^[a-z]{2,3}$/.test(newLocale))
						throw "invalid locale";

					var oExpire = new Date();

					oExpire.setFullYear(oExpire.getFullYear() + 1);

					document.cookie = "Preferences=Locale=" + escape(newLocale) + "; path=/; expires="+oExpire.toGMTString();
				}

				if (newLocale)
					internal_SetLocale(newLocale);

				var sPreferences = $browser.cookies().Preferences;
				var sLocale      = "en";
				var oLocaleRegex = /;?Locale=([a-z]{2,3});?/

				if (sPreferences && oLocaleRegex.test(sPreferences))
					sLocale = $browser.cookies().Preferences.replace(oLocaleRegex, "$1");
				else
					internal_SetLocale(sLocale);

				return sLocale;
			}
		}
	}]);

    app.filter('localize', function(Localizer) {
      return function(input) {
        return Localizer.phrase(input);
      };
    });
    
	app.factory('guid', function() {
		function S4() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		}
		return function() {
			return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()).toUpperCase();
		}
	});

})(window, window.angular);
