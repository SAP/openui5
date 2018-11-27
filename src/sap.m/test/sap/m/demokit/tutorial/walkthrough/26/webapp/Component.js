sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"./controller/HelloDialog"
], function (UIComponent, JSONModel, HelloDialog) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.walkthrough.Component", {

		metadata : {
			manifest: "json"
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// set data model
			var oData = {
				recipient : {
					name : "World"
				}
			};
			var oModel = new JSONModel(oData);
			this.setModel(oModel);

			// debug code to show an alert for missing destination or CORS issues in the tutorial (see step 26 for details)
			this.getModel("invoice").attachEventOnce("metadataFailed", function (oEvent) {
				/*eslint-disable no-alert */
				alert("Request to the OData remote service failed.\nRead the Walkthrough Tutorial Step 26 to understand why you don't see any data here.");
				/*eslint-enable no-alert */
			});

			// set dialog
			this._helloDialog = new HelloDialog(this.getRootControl());
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