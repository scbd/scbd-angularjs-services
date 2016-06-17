define(['app', 'moment'], function (app, moment) {



  //============================================================
  //
  //
  //
  //============================================================
  app.filter('nospace', function () {
    return function (value) {
      return (!value) ? '' : value.replace(/[\s]/g, '');
    };
  });

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("yesno", function () {
    return function (boolValue) {
      return boolValue ? "Yes" : "No";
    };
  });

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("formatDate", ["$filter", function ($filter) {
    return function (date, formart) {
      if (formart === undefined)
        formart = 'DD MMM YYYY';

      return $filter("moment")(date, 'format',formart);
    };
  }]);

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("formatDateWithTime", ["$filter", function ($filter) {
    return function (date, formart) {
      if (formart === undefined)
        formart = 'DD MMM YYYY HH:mm';

      return $filter("moment")(date, 'format',formart);
    };
  }]);

  //============================================================
  //
  //
  //
  //============================================================
  app.filter('moment', [function() {

        return function(datetime, method, arg1, arg2, arg3) {
            return moment(datetime)[method](arg1, arg2, arg3);
        };
  }]);

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("formatDateWithUtc", function () {
    return function (date, formart) {
      if (formart === undefined)
        formart = 'DD MMM YYYY';
      return moment.utc(date).format(formart);
    };
  });
  //============================================================
  //
  //
  //
  //============================================================
  app.filter("stringToJSON", function () {
    return function (strValue) {
      return JSON.parse(strValue);
    };
  });

  app.filter('range', function () {
    return function (input, total) {
      total = parseInt(total);
      for (var i = 0; i < total; i++)
        input.push(i);
      return input;
    };
  });

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("languageLongName", [function () {

    return function (language) {

      if (language == "ar") return "Arabic";
      if (language == "en") return "English";
      if (language == "es") return "Spanish";
      if (language == "fr") return "French";
      if (language == "ru") return "Russian";
      if (language == "zh") return "Chinese";

      return language;
    };
  }]);
  //============================================================
  //
  //
  //
  //============================================================
  app.filter("orderPromiseBy", ["$q", "$filter", function ($q, $filter) {
    return function (promise, expression, reverse) {
      return $q.when(promise).then(function (collection) {
        return $filter("orderBy")(collection, expression, reverse);
      });
    };
  }]);

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("markdown", ["$window", "htmlUtility", function ($window, html) {
    return function (srcText) {
      return srcText;
      if (!$window.marked) //if markdown is not install then return escaped html! to be safe!
        return "<div style='word-break: break-all; word-wrap: break-word; white-space: pre-wrap;'>" + html.encode(srcText) + "</div>";
      return $window.marked(srcText, {
        sanitize: true
      });
    };
  }]);

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("truncate", function () {
    return function (text, maxSize, suffix) {

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

  app.filter('groupBy', ["underscore", "$parse", function (_, $parse) {
    var cacheMap = {};
    return _.memoize(function (items, field) {
      var getter = $parse(field);
      return _.groupBy(items, function (item) {
        return getter(item);
      });
    });
  }]);
  app.filter('to_trusted', function ($sce) {
    return function (html) {
      return $sce.trustAsHtml(html);
    };
  });

  app.filter("toTrusted", function ($sce) {
    return function (value) {
      return $sce.trustAsHtml(value);
    };
  });

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("term", ["$http", '$filter', function ($http, $filter) {
    var cacheMap = {};

    return function (term, locale) {

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
      }).then(function (result) {

        cacheMap[term.identifier] = result.data;

        return $filter("lstring")(cacheMap[term.identifier].title, locale);

      }).catch(function () {

        cacheMap[term.identifier] = term.identifier;

        return term.identifier;

      });
    };
  }]);


  app.filter("lstring", function () {
    return function (ltext, locale) {
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
    };
  });

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("schemaName", [function() {
		return function( schema ) {
			if(!schema)return schema;
			if(schema.toLowerCase()=="focalpoint"				            ) return "ABS National Focal Point";
			if(schema.toLowerCase()=="authority"				            ) return "Competent National Authority";
			if(schema.toLowerCase()=="contact"					            ) return "Contact";
			if(schema.toLowerCase()=="database"					            ) return "National Website or Database";
			if(schema.toLowerCase()=="resource"					            ) return "Virtual Library Resource";
			if(schema.toLowerCase()=="organization"				          ) return "Organization";
			if(schema.toLowerCase()=="measure" 					            ) return "Legislative, Administrative or Policy Measure";
			if(schema.toLowerCase()=="abscheckpoint"			          ) return "Checkpoint";
			if(schema.toLowerCase()=="abscheckpointcommunique"	    ) return "Checkpoint Communiqué";
			if(schema.toLowerCase()=="abspermit"				            ) return "Internationally Recognized Certificate of Compliance";
      if(schema.toLowerCase()=="meetingdocument"			        ) return "Meeting Document";
      if(schema.toLowerCase()=="pressrelease"				          ) return "Press Release";
			if(schema.toLowerCase()=="news"						              ) return "News";
			if(schema.toLowerCase()=="new"						              ) return "What's New";
      if(schema.toLowerCase()=="statement"			              ) return "Statement";
			if(schema.toLowerCase()=="absnationalreport"		        ) return "Interim National Report on the Implementation of the Nagoya Protocol";
			if(schema.toLowerCase()=="modelcontractualclause"	      ) return "Model Contractual Clauses, Codes of Conduct, Guidelines, Best Practices and/or Standard";
			if(schema.toLowerCase()=="communityprotocol"		        ) return "Community Protocol and Procedures and Customary Law";
			if(schema.toLowerCase()=="meeting"					            ) return "Meeting";
			if(schema.toLowerCase()=="notification"				          ) return "Notification";
			if(schema.toLowerCase()=="capacitybuildinginitiative"   ) return "Capacity-building Initiative";
			if(schema.toLowerCase()=="capacitybuildingresource"     ) return "Capacity-building Resource";
			if(schema.toLowerCase()=="endorsement"				          ) return "Endorsement";
		};
	}]);
});
