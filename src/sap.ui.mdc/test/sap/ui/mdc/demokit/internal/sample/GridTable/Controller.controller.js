sap.ui.define([
	"sap/ui/mdc/sample/controller/Controller.controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.GridTable.Controller", {

		extractData: function(oContext, oColumn) {
			return oContext.getProperty(oColumn.getDataProperty());
		},

		onCopyPress: function() {
			this.byId("copyProviderPlugin").copySelectionData();
		}

	});
});
