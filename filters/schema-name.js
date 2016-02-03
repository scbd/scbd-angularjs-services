define(['app'], function(app) {

  //============================================================
  //
  //
  //
  //============================================================
  app.filter("schemaName", [function() {

      return function( schema ) {
        //return mapSchema(schema);

        if(!schema)
          return schema;
        if(schema.toLowerCase()=="focalpoint"				) return "ABS National Focal Point";
        if(schema.toLowerCase()=="authority"				) return "Competent National Authority";
        if(schema.toLowerCase()=="contact"					) return "Contact";
        if(schema.toLowerCase()=="database"					) return "National Website or Database";
        if(schema.toLowerCase()=="resource"					) return "Virtual Library Resource";
        if(schema.toLowerCase()=="organization"				) return "Organization";
        if(schema.toLowerCase()=="measure" 					) return "Legislative, Administrative or Policy Measures";
        if(schema.toLowerCase()=="abscheckpoint"			) return "Checkpoint";
        if(schema.toLowerCase()=="abscheckpointcommunique"	) return "Checkpoint Communiqué";
        if(schema.toLowerCase()=="abspermit"				) return "Internationally Recognized Certificate of Compliance";
              if(schema.toLowerCase()=="meetingdocument"			) return "Meeting Documents";
              if(schema.toLowerCase()=="pressrelease"				) return "Press Releases";
        if(schema.toLowerCase()=="news"						) return "News";
        if(schema.toLowerCase()=="absnationalreport"		) return "National Report";
        if(schema.toLowerCase()=="modelcontractualclause"	) return "Model Contractual Clauses, Codes of Conduct, Guidelines, Best Practices and/or Standards";
        if(schema.toLowerCase()=="communityprotocol"		) return "Community protocols and procedures and customary laws";
        if(schema.toLowerCase()=="meeting"					) return "Meetings";
        if(schema.toLowerCase()=="notification"				) return "Notifications";
        // return schema;
      };
  }]);
});
