define(['app', 'socket.io', './authentication'], function (app, io) {

    app.factory('socketioService', ['$rootScope', '$http', '$q', 'realm', "authentication",
    function ($rootScope, $http, $q, realm, authentication) {
        return new function () {
            var apiServer = 'https://api.cbd.int/';
                apiServer = 'http://localhost:8000/';

            var socket;

            this.connect = function(authToken){
                var query = 'arguments=' + JSON.stringify({realm: realm.value||realm});

                if(authToken){
                    query += '&authorization=' + authToken;
                }
                socket = io(apiServer, { query: query });
                socket.connect(apiServer, query);

                socket.on('connect', onConnect);
            };

            this.disconnect = function(isLogoff){
                if(isLogoff)
                    socket.emit('logoff');
                socket.disconnect();
                socket.close();
            };


            function onConnect() {
                // console.log(socket);
                console.log("connected from the client side");

                subscribe('push-notification', function(msg){
                    console.log(msg);

                    if(isJSON(msg)){
                        var message = JSON.parse(msg);

                        if(message.type == 'userLogoff'){
                            authentication.signOut();
                        }
                        $rootScope.$broadcast('event:server-pushNotification', message);
                    }


                });
            }

            function subscribe(queue, callback){
                if(socket.connected){
                    socket.on(queue, callback);
                }
                else {
                    throw 'Server not connected';
                }
            }
            function isJSON(text){
                try{
                    JSON.parse(text);
                    return true;
                }
                catch (error){
                    return false;
                }
            }
        }
    }]);
});
