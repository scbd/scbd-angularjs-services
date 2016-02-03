define(['app'], function(app) {
  //============================================================
  //
  //
  //
  //============================================================
  app.filter("truncate", function() {
      return function(text, maxSize, suffix) {

          if (!maxSize)
              return text;

          if (!suffix)
              suffix = "";

          if (!text)
              return "".su;

          if (text.length > maxSize)
              text = text.substr(0, maxSize) + suffix;

          return text;
      };
  });
});
