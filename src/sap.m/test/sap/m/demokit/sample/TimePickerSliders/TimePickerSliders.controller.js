sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/core/Fragment'],
	function(Controller, Fragment) {
		"use strict";

		var TPSController = Controller.extend("sap.m.sample.TimePickerSliders.TimePickerSliders", {

			onExit : function () {
				if (this._oDialog) {
					this._oDialog.destroy();
				}
			},

			handleOpenDialog: function (oEvent) {

				// create popover
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment("fragment", "sap.m.sample.TimePickerSliders.TimePickerSlidersDialog", this);
					this.getView().addDependent(this._oDialog);
				}

				this._oDialog.open();
			},

			handleOKPress: function () {
				var oText = this.byId("T1");
				var oTP = Fragment.byId("fragment", "TPS2");
				var sValue = oTP.getValue();

				this._oDialog.close();

				oText.setText("TimePickerSliders " + oTP.getId() + ": " + sValue);
			}
		});

		return TPSController;

	});
