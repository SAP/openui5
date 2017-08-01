sap.ui.define(['sap/ui/core/Fragment','sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(Fragment, Controller, MessageToast) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.ActionSheet.C", {
		handleOpen : function (oEvent) {
			var oButton = oEvent.getSource();

			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"sap.m.sample.ActionSheet.ActionSheet",
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

	return CController;

});