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

	return Controller.extend("sap.m.sample.popover.Controller", {
		fnHandler: function (oEvent) {
			this.getPopover().openBy(oEvent.oSource);
		},

		getPopover: function () {
			if (!this._oPopover) {
				this._oPopover = new Popover({
					title: "Title text",
					content: [
						new VBox({
							items: [
								new Text({
									id: "popoverContentText",
									text: "This text will be read out by the screen reader, as it is internally connected to the Popover via the aria-labelledby attribute."
								}).addStyleClass("sapUiSmallMarginTopBottom")
							]
						})
					],
					ariaLabelledBy: [
						"popoverContentText"
					],
					contentWidth: "30%",
					footer: [
						new Toolbar({
							content: [
								new ToolbarSpacer(),
								new Button({
									id: "closeButton",
									press: function () { this.getPopover().close(); }.bind(this),
									text: "Close"
								})
							]
						})
					],
					initialFocus: "closeButton"
				}).addStyleClass("sapUiResponsivePadding--content sapUiResponsivePadding--header");

			}

			return this._oPopover;
		}
	});
});
