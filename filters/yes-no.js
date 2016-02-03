define(['app'], function(app) {

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("yesno", yesNo);
  app.filter("yesNo", yesNo);
    function yesNo () {
        return function(boolValue) {
            return boolValue ? "Yes" : "No";
        };
    }
});
