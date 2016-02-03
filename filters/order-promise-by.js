define(['app'], function(app) {
  //============================================================
  //
  //
  //
  //============================================================
  app.filter("orderPromiseBy", ["$q", "$filter", function($q, $filter) {
      return function(promise, expression, reverse) {
          return $q.when(promise).then(function(collection) {
              return $filter("orderBy")(collection, expression, reverse);
          });
      };
  }]);
});
