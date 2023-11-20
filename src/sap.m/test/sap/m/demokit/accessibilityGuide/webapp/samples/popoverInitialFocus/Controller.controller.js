sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/VBox",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Link"
], function(Controller, Popover, Button, VBox, Text, Toolbar, ToolbarSpacer, Link) {
	"use strict";

	return Controller.extend("sap.m.sample.popoverInitialFocus.Controller", {
		// Handler for the case with default initial focus behaviour
		fnOpenPopoverWithDefaultInitialFocus: function (oEvent) {
			this.getDefaultPopover().openBy(oEvent.oSource);
		},

		// Handler for the case with custom initial focus behaviour
		fnOpenPopoverWithCustomInitialFocus: function (oEvent) {
			this.getCustomPopover().openBy(oEvent.oSource);
		},

		// Creating the Popover with default initial focus
		getDefaultPopover: function (sSourceId) {
			if (!this._oDefaultPopover) {
				this._oDefaultPopover = this.createPopover();
				this._oDefaultPopover.setTitle("Popover with default initial focus");
				this._oDefaultPopover.setFooter(new Toolbar({
					content: [
						new ToolbarSpacer(),
						new Button({
							press: function () { this.getDefaultPopover().close(); }.bind(this),
							text: "Close"
						})
					]
				}));
			}
			return this._oDefaultPopover;
		},

		// Creating the Popover with custom initial focus
		getCustomPopover: function (sSourceId) {
			if (!this._oCustomPopover) {
				this._oCustomPopover = this.createPopover();
				this._oCustomPopover.setTitle("Popover with custom initial focus");
				this._oCustomPopover.setFooter(new Toolbar({
					content: [
						new ToolbarSpacer(),
						new Button({
							id: "closeButton",
							press: function () { this.getCustomPopover().close(); }.bind(this),
							text: "Close"
						})
					]
				}));

				// Setting the initial focus to the 'Close' button in the footer.
				this._oCustomPopover.setInitialFocus("closeButton");
			}
			return this._oCustomPopover;
		},

		createPopover: function () {
			return new Popover({
				content: [
					new VBox({
						items: [
							new Text({
								text: "The link below is the first focusable element in the Popover's content."
							}).addStyleClass("sapUiSmallMarginTopBottom"),
							new Text({
								text: "It will be focused by default unless other control is provided to the 'initialFocus' association of the Popover."
							}).addStyleClass("sapUiSmallMarginBottom"),
							new Link({
								text: "Link"
							})
						]
					})
				],
				contentWidth: "30%"
			}).addStyleClass("sapUiResponsivePadding--content sapUiResponsivePadding--header");
		}
	});
});
