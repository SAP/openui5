sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/core/Fragment'],
	function(Controller, Fragment) {
		"use strict";

		return Controller.extend("sap.m.sample.TimePickerSliders.TimePickerSliders", {

			handleOpenDialog: function () {
				var oView = this.getView();

				// create popover
				if (!this._pDialog) {
					this._pDialog = Fragment.load({
						id: oView.getId(),
						name: "sap.m.sample.TimePickerSliders.TimePickerSlidersDialog",
						controller: this
					}).then(function(oDialog){
						oView.addDependent(oDialog);

						oDialog.attachAfterOpen(function () {
							var oTP = this.byId("TPS2");
							this._sOldValue = oTP.getValue();
						}.bind(this));
						return oDialog;
					}.bind(this));
				}
				this._pDialog.then(function(oDialog) {
					oDialog.open();
				});
			},

			handleOKPress: function () {
				var oText = this.byId("T1"),
					oTP = this.byId("TPS2");

				this.byId("selectTimeDialog").close();
				oTP.collapseAll();

				oText.setText("TimePickerSliders " + oTP.getId() + ": " + oTP.getValue());
			},

			handleCancelPress: function () {
				var oTP = this.byId("TPS2");

				oTP.setValue(this._sOldValue);

				this.byId("selectTimeDialog").close();
			}
		});

	});
