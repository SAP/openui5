sap.ui.define([
  "sap/ui/model/json/JSONModel"
], function(JSONModel) {
  "use strict";
  // Note: the HTML page 'dragBetweenLists.html' loads this module via data-sap-ui-on-init

  var oData = {
	  names: [
		  {firstName: "Peter", lastName: "Mueller"},
		  {firstName: "Petra", lastName: "Maier"},
		  {firstName: "Thomas", lastName: "Smith"},
		  {firstName: "John", lastName: "Williams"},
		  {firstName: "Maria", lastName: "Jones"}
	  ],
	  selectedNames: []
  };

  // create a Model with this data
  var oModel = new JSONModel();
  oModel.setData(oData);

  // create the UI
  const XMLView = sap.ui.requireSync("sap/ui/core/mvc/XMLView");
  XMLView.create({
	  viewName:"mvc.betweenLists"
  }).then((oView) => {
	  oView.setModel(oModel).placeAt("content");
  });
});