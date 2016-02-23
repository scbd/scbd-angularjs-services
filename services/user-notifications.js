define(['app'], function(app) {
    'use strict';

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

            return $http.post("https://api.cbd.int/api/v2015/user-notifications", body).then(function(resp) {
                return resp.data;
            });
        }

        //===========================
        //
        //===========================
        function get(id) {
            return $http.get("https://api.cbd.int/api/v2015/user-notifications" + id, {
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
            return $http.put("https://api.cbd.int/api/v2015/user-notifications" + id, data).then(
                function(resp) {
                    return resp.data;
                });
        }

        //===========================
        //
        //===========================
        function deleteNotification(id) {
            return $http.delete("https://api.cbd.int/api/v2015/user-notifications" + id).then(
                function(resp) {
                    return resp.data;
                });
        }

        //===========================
        //
        //===========================
        function query(query, pageNumber, pageLength, count) {
            return $http.get("https://api.cbd.int/api/v2015/user-notifications", {
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

});
