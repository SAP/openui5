sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/wt/controller/HelloDialog"
], function (UIComponent, JSONModel, HelloDialog) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.wt.Component", {

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
			this.helloDialog = new HelloDialog();

			// open support window (only for demonstration purpose)
			if (sap.ui.Device.system.desktop) {
				setTimeout(function () {
					jQuery.sap.log.info("opening support window");
					jQuery.sap.require("sap.ui.core.support.Support");
					var oSupport = sap.ui.core.support.Support.getStub("APPLICATION");
					oSupport.openSupportTool();
				}, 3000);
			}
		}
	});

});
