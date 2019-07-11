sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.ActionSheet.controller.ActionSheet", {
		handleOpen : function (oEvent) {
			var oButton = oEvent.getSource();

			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"sap.m.sample.ActionSheet.view.ActionSheet",
					this
				);
				this.getView().addDependent(this._actionSheet);
			}

			this._actionSheet.openBy(oButton);
		},

		actionSelected : function(oEvent){
			MessageToast.show("Selected action is '" + oEvent.getSource().getText() + "'");
		}
	});
});