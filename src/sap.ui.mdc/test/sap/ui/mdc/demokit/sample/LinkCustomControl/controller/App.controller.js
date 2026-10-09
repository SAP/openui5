/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/Link"
], function(Controller, Link) {
	"use strict";

	return Controller.extend("mdc.sample.controller.App", {

		onInit: function() {
			// Create MDC Link programmatically - NOT placed inside an mdc:Field.
			// The delegate provides navigation targets based on the payload "process" key.
			this._oLink = new Link(this.getView().createId("navigationLink"), {
				delegate: {
					name: "mdc/sample/delegate/CustomLinkDelegate",
					payload: { process: "order" }
				},
				enablePersonalization: false
			});

			// Add as dependent so it inherits the view's models
			this.getView().addDependent(this._oLink);
		},

		/**
		 * Opens the MDC Link popover from a button press.
		 * Updates the delegate payload to reflect which process step was pressed,
		 * then opens the popover anchored to the pressed button.
		 */
		onButtonPress: function(oEvent) {
			const oButton = oEvent.getSource();
			const sProcess = this._getProcessForButton(oButton);

			// Update the delegate payload to change which data is displayed
			this._oLink.getDelegate().payload.process = sProcess;

			// Bust item cache so fetchLinkItems runs fresh for each button press
			this._oLink._aLinkItems = [];
			this._oLink._sItemsContextPath = null;

			// Open the popover anchored to the pressed button
			this._oLink.open(oButton, oEvent);
		},

		/**
		 * Maps button IDs to process data keys in the JSON model.
		 */
		_getProcessForButton: function(oButton) {
			const sViewId = this.getView().getId();
			switch (oButton.getId()) {
				case sViewId + "--IDButtonOrder":
					return "order";
				case sViewId + "--IDButtonPayment":
					return "payment";
				case sViewId + "--IDButtonShipment":
					return "shipment";
				default:
					return "unknown";
			}
		},

		onExit: function() {
			if (this._oLink) {
				this._oLink.destroy();
			}
		}
	});
});
