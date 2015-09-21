sap.ui.define([
	"sap/ui/base/Object"
], function (Object) {
	"use strict";

	return Object.extend("sap.ui.demo.wt.controller.HelloDialog", {

		_getDialog: function () {
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("sap.ui.demo.wt.view.HelloDialog", this);
			}
			return this._oDialog;
		},

		open: function (oView) {

			var oDialog = this._getDialog();

			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);

			// open dialog
			oDialog.open();
		},

		onCloseDialog: function () {
			this._getDialog().close();
		}
	});

});
