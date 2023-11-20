/*******************************************************************************
 * Note: This file intentionally contains errors for illustration purposes!    *
 *  The Troubleshooting Tutorial in the official UI5 documentation will show   *
 *  how to analyze and debug them with the support tools delivered by UI5.     *
 ******************************************************************************/
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"./model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.HeapOfShards.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});