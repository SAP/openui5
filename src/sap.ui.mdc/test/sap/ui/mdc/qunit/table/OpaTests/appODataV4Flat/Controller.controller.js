sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(
	/** @type sap.ui.core.mvc.Controller */ Controller) {
	"use strict";

	return Controller.extend("sap.ui.mdc.table.OpaTests.appODataV4Flat.Controller", {
		onInit: function() {
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