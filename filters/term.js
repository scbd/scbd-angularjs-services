define(['app'], function(app) {

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("term", ["$http", '$filter', function($http, $filter) {
      var cacheMap = {};

      return function(term, locale) {

          if (!term)
              return "";

          if (term && angular.isString(term))
              term = {
                  identifier: term
              };

          locale = locale || "en";

          if (term.customValue)
              return $filter("lstring")(term.customValue, locale);

          if (cacheMap[term.identifier])
              return $filter("lstring")(cacheMap[term.identifier].title, locale);

          cacheMap[term.identifier] = $http.get("/api/v2013/thesaurus/terms?termCode=" + encodeURIComponent(term.identifier), {
              cache: true
          }).then(function(result) {

              cacheMap[term.identifier] = result.data;

              return $filter("lstring")(cacheMap[term.identifier].title, locale);

          }).catch(function() {

              cacheMap[term.identifier] = term.identifier;

              return term.identifier;

          });
      };
  }]);

});
