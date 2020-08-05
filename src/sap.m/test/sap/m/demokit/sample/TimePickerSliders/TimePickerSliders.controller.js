sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/core/Fragment'],
	function(Controller, Fragment) {
		"use strict";

		return Controller.extend("sap.m.sample.TimePickerSliders.TimePickerSliders", {

			onExit : function () {
				if (this._oDialog) {
					this._oDialog.destroy();
				}
			},

			handleOpenDialog: function () {
				// create popover
				if (!this._oDialog) {
					Fragment.load({
						id: "fragment",
						name: "sap.m.sample.TimePickerSliders.TimePickerSlidersDialog",
						controller: this
					}).then(function(oDialog){
						this._oDialog = oDialog;
						this.getView().addDependent(this._oDialog);
						this._oDialog.attachAfterOpen(function () {
							var oTP = Fragment.byId("fragment", "TPS2");

							this._sOldValue = oTP.getValue();
						}.bind(this));
						this._oDialog.open();
					}.bind(this));
				} else {
					this._oDialog.open();
				}
			},

			handleOKPress: function () {
				var oText = this.byId("T1"),
					oTP = Fragment.byId("fragment", "TPS2");

				this._oDialog.close();

				oText.setText("TimePickerSliders " + oTP.getId() + ": " + oTP.getValue());
			},

			handleCancelPress: function () {
				var oTP = Fragment.byId("fragment", "TPS2");

				oTP.setValue(this._sOldValue);

				this._oDialog.close();
			}
		});

	});
