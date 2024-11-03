sap.ui.define([
  "sap/ui/core/mvc/XMLView"
], async function(XMLView) {
  "use strict";
  // Note: the HTML page 'ToolPageWithSubHeader.html' loads this module via data-sap-ui-on-init

  (await XMLView.create({
	  definition: document.getElementById('myXml').textContent
  })).placeAt("content");
});