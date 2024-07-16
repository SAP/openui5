sap.ui.define([
  "sap/ui/thirdparty/jquery",
  "sap/ui/core/mvc/XMLView"
], function(jQuery0) {
  "use strict";
  // Note: the HTML page 'DynamicPageKPI.html' loads this module via data-sap-ui-on-init

  (function (jQuery) {
	  sap.ui.xmlview({viewContent:jQuery0('#view1').html()}).placeAt("content");
  }(jQuery0))
});