sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/base/Log"
], function (UIComponent, JSONModel, Device, Log) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.walkthrough.Component", {

		metadata: {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},

		init: function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// set data model
			var oData = {
				recipient: {
					name: "World"
				}
			};
			var oModel = new JSONModel(oData);
			this.setModel(oModel);

			// open support window (only for demonstration purpose)
			if (Device.system.desktop) {
				setTimeout(function () {
					Log.info("opening support window");
					sap.ui.require(["sap/ui/core/support/Support"], function (Support) {
						var oSupport = Support.getStub("APPLICATION");
						oSupport.openSupportTool();
					});
				}, 3000);
			}
		}
	});

});