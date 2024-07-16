sap.ui.define([
  "sap/ui/core/mvc/XMLView",
  "sap/m/App",
  "sap/m/Page",
  "sap/ui/thirdparty/jquery"
], async function(XMLView, App, Page, jQuery) {
  "use strict";
  var oApp = new App(),
	  myView = await XMLView.create({definition: jQuery('#view1').html()});

  oApp.addPage(new Page({
	  title: "Old Header",
	  content: [myView]
  })).placeAt("content");
});