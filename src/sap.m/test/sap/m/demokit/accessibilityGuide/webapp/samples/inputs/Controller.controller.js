sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/VBox",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function(Controller, Popover, Button, VBox, Text, Toolbar, ToolbarSpacer) {
	"use strict";

	return Controller.extend("sap.m.sample.inputs.Controller", {

		onInit: function (oEvent) {
			// This is another way to set the label of a control
			var oMultiInput = this.getView().byId("multiInput");
			var oLabel = this.getView().byId("labelMultiInput");

			oLabel.setLabelFor(oMultiInput);
		}

	});
});
