sap.ui.define([
	"sap/ui/base/Object"
], function (Object) {
	"use strict";

	return Object.extend("sap.ui.demo.wt.controller.HelloDialog", {

		_getDialog : function (oView) {
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("sap.ui.demo.wt.view.HelloDialog", this);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		open : function (oView) {
			this._getDialog(oView).open();
		},

		onCloseDialog : function () {
			this._getDialog().close();
		}
	});

});