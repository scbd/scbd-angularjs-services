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
    if(schema.toLowerCase()=="focalpoint"				 ) return "National ABS Focal Point";
    if(schema.toLowerCase()=="authority"				 ) return "Competent National Authority";
    if(schema.toLowerCase()=="contact"					 ) return "Contact";
    if(schema.toLowerCase()=="database"					 ) return "National Website or Database";
    if(schema.toLowerCase()=="resource"					 ) return "Virtual Library Resource";
    if(schema.toLowerCase()=="organization"				 ) return "Organization";
    if(schema.toLowerCase()=="measure" 					 ) return "Legislative, Administrative or Policy Measures";
    if(schema.toLowerCase()=="abscheckpoint"			 ) return "Checkpoint";
    if(schema.toLowerCase()=="abscheckpointcommunique"	 ) return "Checkpoint Communiqué";
    if(schema.toLowerCase()=="abspermit"				 ) return "Internationally Recognized Certificate of Compliance";
    if(schema.toLowerCase()=="meetingdocument"			 ) return "Meeting Document";
    if(schema.toLowerCase()=="pressrelease"				 ) return "Press Release";
    if(schema.toLowerCase()=="news"						 ) return "News";
    if(schema.toLowerCase()=="new"						 ) return "What's New";
    if(schema.toLowerCase()=="statmente"				 ) return "Statement";
    if(schema.toLowerCase()=="absnationalreport"		 ) return "Interim National Report on the Implementation of the Nagoya Protocol";
    if(schema.toLowerCase()=="modelcontractualclause"	 ) return "Model Contractual Clauses, Codes of Conduct, Guidelines, Best Practices and/or Standards";
    if(schema.toLowerCase()=="communityprotocol"		 ) return "Community Protocol and Procedures and Customary Law";
    if(schema.toLowerCase()=="meeting"					 ) return "Meeting";
    if(schema.toLowerCase()=="notification"				 ) return "Notification";
    if(schema.toLowerCase()=="capacitybuildinginitiative") return "Capacity Building Initiative";
    if(schema.toLowerCase()=="capacitybuildingresource"  ) return "Capacity Building Resource";
    if(schema.toLowerCase()=="endorsement"				) return "Endorsements";
        // return schema;
      };
  }]);
});
