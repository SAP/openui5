sap.ui.define([
  "sap/ui/core/mvc/XMLView"
], async function(XMLView) {
  "use strict";
  (await XMLView.create({
	  viewName: "sap.ui.table.mvc.DragAndDrop"
  })).placeAt("content");
});