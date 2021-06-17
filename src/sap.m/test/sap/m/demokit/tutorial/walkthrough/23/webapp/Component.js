sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"./controller/HelloDialog"
], function (UIComponent, JSONModel, HelloDialog) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.walkthrough.Component", {

		metadata : {
			manifest: "json",
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
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

			// set dialog
			this.rootControlLoaded().then(function() {
				this._helloDialog = new HelloDialog(this.getRootControl());
			}.bind(this));
		},

		exit : function () {
			if (this._helloDialog) {
				this._helloDialog.destroy();
				delete this._helloDialog;
			}
		},

		openHelloDialog : function () {
			this._helloDialog.open();
		}

	});

});