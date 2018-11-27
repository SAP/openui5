sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"./controller/HelloDialog",
	"sap/base/Log"
], function (UIComponent, JSONModel, HelloDialog, Log) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.walkthrough.Component", {

		metadata: {
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

			// set dialog
			this._helloDialog = new HelloDialog(this.getRootControl());

			// open support window (only for demonstration purpose)
			if (sap.ui.Device.system.desktop) {
				setTimeout(function () {
					Log.info("opening support window");
					sap.ui.require(["sap/ui/core/support/Support"], function (Support) {
						var oSupport = Support.getStub("APPLICATION");
						oSupport.openSupportTool();
					});
				}, 3000);
			}
		},

		exit : function () {
			this._helloDialog.destroy();
			delete this._helloDialog;
		},

		openHelloDialog : function () {
			this._helloDialog.open();
		}

	});

});