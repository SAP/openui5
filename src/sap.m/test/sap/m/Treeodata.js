sap.ui.define([
  "sap/ui/core/util/MockServer",
  "sap/ui/model/odata/v2/ODataModel",
  "sap/m/StandardTreeItem",
  "sap/m/Tree",
  "sap/m/App",
  "sap/m/Label",
  "sap/m/Page"
], function(MockServer, ODataModel, StandardTreeItem, Tree, App, Label, Page) {
  "use strict";

  var sServiceURI = "/odataFake/";
  var sMetaDataURI = "mockdata/";

  // configure respond to requests delay
  MockServer.config({
	  autoRespond : true,
	  autoRespondAfter : 1000
  });

  // create mockserver
  var oMockServer = new MockServer({
	  rootUri : sServiceURI
  });

  // start mockserver
  oMockServer.simulate(sMetaDataURI + "treemetadata.xml", sMetaDataURI);
  oMockServer.start();

  var oTemplate = new StandardTreeItem({
	  title: "{odata>Description}"
  });

  var oTree = new Tree({
	  headerText: "OData in Tree Structure"
  });

  var oModel = new ODataModel(sServiceURI);
  oTree.setModel(oModel, "odata");

  oTree.bindItems({
	  path: "odata>/Nodes",
	  template: oTemplate,
	  parameters: {
		  countMode: 'Inline'
	  }
  });


  function onChange (oEvent) {
	  oBinding.detachChange(onChange);
	  oTree.expand([0,1]);
  }

  var oBinding = oTree.getBinding("items");
  oBinding.attachChange(onChange);

  //oTree.expand([0,1]);


  //***************
  var oApp = new App();
  new Label({text:"*********************Tree*********************"});

  var oPage = new Page("TreeTest", {
	  title : "Test Page for sap.m.Tree - odata",
	  content : [oTree]
  });

  oApp.addPage(oPage).placeAt("body");
});