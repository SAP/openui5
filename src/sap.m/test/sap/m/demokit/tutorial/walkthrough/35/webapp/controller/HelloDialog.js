sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObject) {
	"use strict";

	return ManagedObject.extend("sap.ui.demo.walkthrough.controller.HelloDialog", {

		constructor : function (oView) {
			this._oView = oView;
		},

		exit : function () {
			delete this._oView;
		},

		open : function () {
			var oView = this._oView;
			var oDialog = oView.byId("helloDialog");

			// create dialog lazily
			if (!oDialog) {
				var oFragmentController = {
					onCloseDialog : function () {
						oDialog.close();
					}
				};
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.walkthrough.view.HelloDialog", oFragmentController);
				// connect dialog to the root view of this component (models, lifecycle)
				oView.addDependent(oDialog);
			}
			oDialog.open();
		}

	});

});