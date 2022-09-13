sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"sap/ui/model/resource/ResourceModel"
], function(
	Controller,
	Log,
	ResourceModel
) {
	"use strict";

	return Controller.extend("sap.ui.mdc.filterbar.sample.FilterBarTest", {

		onFiltersChanged: function(oEvent) {
			var oText = this.getView().byId("statusTextExpanded");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersTextExpanded);
			}

			oText = this.getView().byId("statusTextCollapsed");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersText);
			}
		}
	});
});