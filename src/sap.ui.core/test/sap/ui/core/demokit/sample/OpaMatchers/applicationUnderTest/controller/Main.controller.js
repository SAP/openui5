sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/Popover',
	"sap/m/Button"
], function (Controller, Popover, Button) {
	"use strict";

	return Controller.extend("appUnderTest.controller.Main", {

		onInit: function () {
			var that = this;
			this._oPopover = new Popover({
				title: "My Popover",
				contentWidth: "200px",
				contentHeight: "100px",
				content: [
					new Button({text: "Alert text"})
				]
			});
			this._oPopover.addStyleClass(".sapUiContentPadding");

			window.setTimeout(function () {
				that.byId("changingButton").setText("Changed text");
			},5000);
		},

		togglePopover: function (oEvent) {
			if (this._oPopover.isOpen()) {
				oEvent.oSource.setText("Open the popover");
				this._oPopover.close();
			} else {
				oEvent.oSource.setText("Close the popover");
				this._oPopover.openBy(oEvent.oSource);
			}
		}

	});

});
