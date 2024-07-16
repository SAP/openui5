sap.ui.define([
  "sap/ui/core/mvc/XMLView",
  "sap/ui/table/TreeTable",
  "sap/ui/table/Table",
  "sap/ui/performance/Measurement"
], async function(XMLView, TreeTable, Table, Measurement) {
  "use strict";
  // Note: the HTML page 'TreeTableODataV2.html' loads this module via data-sap-ui-on-init

  Measurement.setActive(true);

  Measurement.registerMethod("Table._createRows", Table.prototype, "_createRows", ["JS"]);
  Measurement.registerMethod("TreeTable._updateTableContent", TreeTable.prototype, "_updateTableContent", ["JS"]);
  Measurement.registerMethod("Table._syncColumnHeaders", Table.prototype, "_syncColumnHeaders", ["JS"]);
  Measurement.registerMethod("Table._updateRowHeader", Table.prototype, "_updateRowHeader", ["JS"]);

  (await XMLView.create({
	  viewName: "sap.ui.table.mvc.TreeTableODataV2"
  })).placeAt("content");
});