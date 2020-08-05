/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/support/apps/uiFlexibilityDiagnostics/helper/Extractor"
], function (Controller, Extractor) {
	"use strict";

	/**
	 * Controller for displaying detail of the flexibility support frame
	 *
	 * @constructor
	 * @alias sap.ui.fl.support.Flexibility
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.52
	 */
	return Controller.extend("sap.ui.fl.support.diagnostics.Flexibility", {

		refreshApps: function () {
			this.getView().getViewData().plugin.onRefresh();
		},

		extractAppData: function (oEvent) {
			var oSelectedItem = oEvent.getSource();
			var oBindingContext = oSelectedItem.getBindingContext("flexApps");
			var oData = oBindingContext.getProperty("data");
			Extractor.createDownloadFile(oData);
		}
	});
});