sap.ui.define([
  "sap/ui/core/mvc/XMLView"
], async function(XMLView) {
  "use strict";
  // Note: the HTML page 'Product.html' loads this module via data-sap-ui-on-init

  // this test page is not below "resources", but "test-resources"
  // usually this redirect is NOT needed - but possible if useful
  sap.ui.loader.config({paths: {"sap/ui/core/mvctest": "../../../../../../test-resources/sap/ui/core/samples/mvc/"}});

  // define View and place it onto the page
  (await XMLView.create({
	  id : "id1",
	  viewName : "sap.ui.core.mvctest.views.Product"
  })).placeAt("content");
});