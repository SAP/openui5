sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(
	/** @type sap.ui.core.mvc.Controller */ Controller) {
	"use strict";

	return Controller.extend("sap.ui.mdc.tableOpaTests.appUnderTestMDCTable.Controller", {

		onInit: function() {
			this.getView().bindElement("/ProductList");
		},

		onBeforeExport: function(oEvt) {
			const mExcelSettings = oEvt.getParameter("exportSettings");

			// Disable Worker as Mockserver is used
			mExcelSettings.worker = false;
			// Disable useBatch as the Mockserver doesn't support it
			mExcelSettings.dataSource.useBatch = false;
		}

	});
});