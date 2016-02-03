define(['app'], function(app) {
  //============================================================
  //
  //
  //
  //============================================================
  app.filter("markdown", ["$window", "htmlUtility", function($window, html) {
      return function(srcText) {
          return srcText;
          if (!$window.marked) //if markdown is not install then return escaped html! to be safe!
              return "<div style='word-break: break-all; word-wrap: break-word; white-space: pre-wrap;'>" + html.encode(srcText) + "</div>";
          return $window.marked(srcText, {
              sanitize: true
          });
      };
  }]);
});
