sap.ui.define([
  "sap/m/App",
  "sap/m/FlexBox",
  "sap/m/Button",
  "sap/m/FlexItemData",
  "sap/m/Page"
], function(App, FlexBox, Button, FlexItemData, Page) {
  "use strict";
  // Note: the HTML page 'FlexItemData.html' loads this module via data-sap-ui-on-init

  var app = new App("myApp", {initialPage:"page1"});

  // Create dialogs
  var oFlexBox = new FlexBox();
  oFlexBox.addItem(new Button({
	  text: "My Button",
	  layoutData: new FlexItemData({
		  alignSelf: "End",
		  growFactor: 20
	  })
  }));

  var page1 = new Page("page1", {
	  title:"Mobile FlexItemData Control",
	  content:[
		  oFlexBox
	  ]
  });

  app.addPage(page1).placeAt("content");
});