define(['app'], function(app) {
  //============================================================
  //
  //
  //
  //============================================================
  app.filter("languageLongName", [function() {

      return function(language) {

          if (language == "ar") return "Arabic";
          if (language == "en") return "English";
          if (language == "es") return "Spanish";
          if (language == "fr") return "French";
          if (language == "ru") return "Russian";
          if (language == "zh") return "Chinese";

          return language;
      };
  }]);
});
