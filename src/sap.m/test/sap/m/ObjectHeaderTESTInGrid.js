sap.ui.define([
  "sap/ui/core/IconPool",
  "sap/m/ObjectAttribute",
  "sap/m/ObjectHeader",
  "sap/ui/core/library",
  "sap/m/ObjectStatus",
  "sap/m/ObjectMarker",
  "sap/m/library",
  "sap/m/App",
  "sap/m/Page",
  "sap/ui/Device"
], function(IconPool, ObjectAttribute, ObjectHeader, coreLibrary, ObjectStatus, ObjectMarker, mobileLibrary, App, Page, Device) {
  "use strict";

  // shortcut for sap.m.ObjectMarkerType
  const ObjectMarkerType = mobileLibrary.ObjectMarkerType;

  // shortcut for sap.ui.core.ValueState
  const ValueState = coreLibrary.ValueState;

  Device.system.phone ? "sapUiSmallMargin" : "sapUiMediumMargin";

  var attrs = [ new ObjectAttribute({
	  text : "Object AttributeA"
  }), new ObjectAttribute({
	  text : "Object AttributeB Attribute Langer text text test text"
  }), new ObjectAttribute({
	  text : "Object AttributeC April 9, 2013"
  }) ];
  var attrs2 = [ new ObjectAttribute({
	  text : "Attribute2",
	  active : true,
	  press : function() {
		  attrs2[0].setText("Ñagçyfox Attribute2");
	  }
  }), new ObjectAttribute({
	  text : "Created by: John Doe Ñagçyfox",
	  active : true,
	  press : function() {
		  attrs2[0].setText("Ñagçyfox Contract #D1234567890");
	  }
  }) ];

  var oh1 = new ObjectHeader(
		  "oh1", {
			  intro : "Introtext: On behalf of M Smith",
			  title : "Title Text, longer Title Text",
			  number : "3.624,00",
			  numberUnit : "Euro",
			  numberState : ValueState.Success,
			  statuses : [ new ObjectStatus({
				  text : "Object Status",
				  icon : IconPool.getIconURI("inbox"),
				  state : ValueState.Success
			  }), new ObjectStatus({
				  icon : IconPool.getIconURI("inbox"),
				  state : ValueState.Error
			  }) ],
			  markers: [
				  new ObjectMarker({type: ObjectMarkerType.Favorite}),
				  new ObjectMarker({type: ObjectMarkerType.Flagged})
			  ]
		  });

  var oh1Icon = new ObjectHeader("oh1-with-icon",{
			  icon : IconPool.getIconURI("attachment"),
			  intro : "Introtext: On behalf of John Smith",
			  title : "Title Text longer and longer 214211232132132132142112321321321321421",
			  number : "4.654,00",
			  numberUnit : "Euro",
			  numberState : ValueState.Success,
			  statuses : [ new ObjectStatus({
				  text : "Lorem ipsum dolor sit amet",
				  icon : IconPool.getIconURI("inbox"),
				  state : ValueState.Success
			  }) ]
		  });

  new ObjectHeader(
		  "oh1-with-icon-no-number",	{
			  icon : IconPool.getIconURI("attachment"),
			  intro : "On behalf of John Smith Ñagçyfox",
			  title : "123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421123213213213214211232132132132142112321321321321421",
			  statuses : [ new ObjectStatus({
				  text : "Lorem ipsum dolor sit amet",
				  icon : IconPool.getIconURI("inbox"),
				  state : ValueState.Success
			  })]
		  });

  var oh4PressHandler = function(oEvent) {

	  if (oh4.getIcon()) {
		  oh4.setIcon(null);
	  } else {
		  oh4.setIcon(IconPool.getIconURI("attachment"));
	  }
  };

  var oh4 = new ObjectHeader("oh4", {
	  intro : "On behalf of John Smith Ñagçyfox",
	  title : "Title is Active Ñagçyfox Lorem ipsum dolor sit amet.",
	  titleActive : true,
	  titlePress : oh4PressHandler,
	  number : "3.628.000",
	  numberUnit : "EUR",
	  numberState : ValueState.None,
	  attributes : attrs,
	  statuses : [ new ObjectStatus({
		  text : "Ñgçy Positive Text Ñgçy",
		  state : ValueState.Success
	  }), new ObjectStatus({
		  text : "Negative Text Ñgçy Negative",
		  state : ValueState.Error
	  }) ],
	  icon : IconPool.getIconURI("attachment"),
	  iconActive : true,
	  iconPress : oh4PressHandler
  });

  // put all the testing object header objects on the testing page
  var app = new App("myApp", {initialPage:"page1"});
  var page1 = new Page("page1", {
	  title:"Page 1"
  });

  page1.addContent(oh1);
  page1.addContent(oh1Icon);
  page1.addContent(oh4);
  app.addPage(page1);

  app.placeAt('body');
});