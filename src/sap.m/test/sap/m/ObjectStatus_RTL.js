sap.ui.define([
  "sap/m/ObjectAttribute",
  "sap/ui/core/IconPool",
  "sap/m/ObjectStatus",
  "sap/ui/core/library",
  "sap/m/App",
  "sap/m/Page",
  "sap/m/Label",
  "sap/m/library"
], function(ObjectAttribute, IconPool, ObjectStatus, coreLibrary, App, Page, Label, mobileLibrary) {
  "use strict";

  // shortcut for sap.m.LabelDesign
  const LabelDesign = mobileLibrary.LabelDesign;

  // shortcut for sap.ui.core.TextDirection
  const TextDirection = coreLibrary.TextDirection;

  //array - [{key: k, values: [v1,v2,v3]}, {key: k2, values: [v4,v5,v6]}]
  var genCombinator = function() {
	  function clone(obj) {
		  var temp;

		  if (obj == null || typeof(obj) != 'object')
			  return obj;

		  temp = obj.constructor();

		  for (var key in obj) {
			  if (obj.hasOwnProperty(key)) {
				  temp[key] = clone(obj[key]);
			  }
		  }
		  return temp;
	  }

	  var aResult = [{}];
	  var mergeWithValues = function(key, aValues) {
		  var mergeResult = [];
		  var newObj;

		  for  (j = 0; j < aResult.length; j++) {
			  for (k = 0; k < aValues.length; k++) {
				  newObj = clone(aResult[j]);
				  newObj[key] = aValues[k];
				  mergeResult.push(newObj);
			  }
		  }

		  for (l = 0; l < mergeResult.length; l++) {
			  aResult.push(mergeResult[l]);
		  }
	  };

	  for (i = 0; i < arguments.length; i++) {
		  mergeWithValues(arguments[i].key, arguments[i].values);
	  }

	  return aResult;
  };

  var getStatuses = function() {
	  var aJSONStatuses = genCombinator({key: "title", values: ["english", "עברית"]},
			  {key: "text", values: ["three words english", "עברית", "0881 234 567"]},
			  {key: "textDirection", values: [TextDirection.LTR,
				  TextDirection.RTL,
				  TextDirection.Inherit
			  ]});

	  var result = [];
	  for (i = 0; i < aJSONStatuses.length; i++) {
		  if (aJSONStatuses[i].text && aJSONStatuses[i].textDirection) {
			  aJSONStatuses[i].icon = IconPool.getIconURI("inbox");
			  result.push(new ObjectStatus(aJSONStatuses[i]));
		  }
	  }

	  return result;
  };

  var app = new App();
  var page = new Page({title: "ObjectStatus Test"});
  app.setInitialPage(page.getId());
  page.setEnableScrolling(true);
  app.addPage(page);

  var importantCases = [6, 24];
  var txt1;
  var aStatuses = getStatuses();
  for (p = 0; p < aStatuses.length; p++) {
	  if (importantCases.indexOf(p) === -1) {
		  txt1 = new Label({text: p + " - textDirection: " + aStatuses[p].getTextDirection()});
	  } else {
		  txt1 = new Label({text:p + " - textDirection: " + aStatuses[p].getTextDirection(), design: LabelDesign.Bold});
	  }
	  page.addContent(txt1);
	  page.addContent(aStatuses[p]);
  }

  app.placeAt('body');
});