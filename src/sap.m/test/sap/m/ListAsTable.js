sap.ui.define([
  "sap/m/App",
  "sap/ui/model/json/JSONModel",
  "sap/m/Input",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/m/Page"
], function(App, JSONModel, Input, List, StandardListItem, Page) {
  "use strict";
  // Note: the HTML page 'ListAsTable.html' loads this module via data-sap-ui-on-init

  // create a mobile App
  var app = new App("myApp");

  var oJSON = { Accounts: [{ Id: "400000", Text: "Material Consumption"},
						   { Id: "400100", Text: "Travel Expense"},
						   { Id: "400200", Text: "Marketing Expense"} ]
			  };

  var oJSONModel = new JSONModel();
  oJSONModel.setData(oJSON);


  new Input({
	  value: "{Id}",
  });

  var oList = new List({
	  growing: true,
	  mode: "SingleSelect",
	  headerText: "The List",
  })

  var oListItem1 = new StandardListItem({
		  title: "Title1",
		  selected: true,
	  }),
	  oListItem2 = new StandardListItem({
		  title: "Title2",
		  selected: true
	  })

  oList.addItem(oListItem1).addItem(oListItem2);


  var page = new Page({
	  title: "The Page",
	  content : oList
  });

  app.addPage(page).placeAt("content");
});