define(['app'], function(app) {

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("lstring", function() {return lStringFunction;});
  app.filter("lString", function() {return lStringFunction;});

    function lStringFunction (ltext, locale) {
        if (!ltext)
            return "";

        if (angular.isString(ltext))
            return ltext;

        var sText;

        if (!sText && locale)
            sText = ltext[locale];

        if (!sText)
            sText = ltext.en;

        if (!sText) {
            for (var key in ltext) {
                sText = ltext[key];
                if (sText)
                    break;
            }
        }

        return sText || "";
    }

});
