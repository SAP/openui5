sap.ui.define([
  "sap/m/Page",
  "sap/m/Text",
  "sap/f/Card",
  "sap/m/App"
], function(Page, Text, Card, App) {
  // Note: the HTML page 'index.html' loads this module via data-sap-ui-on-init

  'use strict';
  var oPage = new Page({
	  title: "sap.f.Card",
	  content: [
		  new Text({
			  width: "100%",
			  text: "Use a browser where web security is turned of to see data"
		  }),
		  new Card("card6x6withlistcard", {
			  rows: 6,
			  cols: 6,
			  manifest: "test.cardcontent.listcardmail"
		  }),
		  new Card("card4x4withlistcard", {
			  rows: 4,
			  cols: 4,
			  manifest: "test.cardcontent.listcardmail"
		  })
	  ]
  });

  var oApp = new App();
  oApp.addPage(oPage).placeAt("body");
});