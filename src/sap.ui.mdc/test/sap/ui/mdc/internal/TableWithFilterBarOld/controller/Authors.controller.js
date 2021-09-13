sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"

], function (Controller, UIComponent) {

	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.Authors", {

		onAddButtonPress: function (oEvent) {
			UIComponent.getRouterFor(this).navTo("authordetails", {
				authorId: "add"
			});
		},

		onFiltersChanged: function(oEvent) {
			var oText = this.getView().byId("statusTextExpanded");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersTextExpanded);
			}

			oText = this.getView().byId("statusTextCollapsed");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersText);
			}
		},

		onRowPress: function (oEvent) {
			var oContext = oEvent.getParameter("bindingContext") || oEvent.getSource().getBindingContext();

			UIComponent.getRouterFor(this).navTo("authordetails", {
				authorId: oContext.getProperty("ID")
			});
		}

	});
});
