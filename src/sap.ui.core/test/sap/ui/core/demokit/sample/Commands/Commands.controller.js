sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/base/Log"
], function (Controller, MessageToast, Log) {

	"use strict";

	return Controller.extend("sap.ui.core.sample.Commands.Commands", {
		onInit: function () {
			function addData() {
				oViewModel.setProperty("/value", "HelloWorld!");
				oViewModel.setProperty("/countries", [
					{
						"key": "DZ",
						"text": "Algeria"
					},
					{
						"key": "AR",
						"text": "Argentina"
					}
				]);
			}

			function fnMockData() {
				oViewModel = this.getView().getModel("viewModel");
				addData();
				this.getView().detachModelContextChange(fnMockData);
			}
			var oViewModel = this.getView().getModel("viewModel");
			if (oViewModel) {
				addData();
			} else {
				this.getView().attachModelContextChange(fnMockData.bind(this));
			}
		},
		onSave: function () {
			var oViewModel = this.getView().getModel("viewModel");
			Log.info(
				JSON.stringify(oViewModel.getData(), null, 2)
			);
			MessageToast.show("CTRL+S: save triggered on controller");
		},

		onPopoverOpen: function(oEvent) {
			this.byId("popover").openBy(oEvent.getSource());
		},

		onCommandPopoverOpen: function(oEvent) {
			this.byId("popoverCommand").openBy(oEvent.getSource());
		}
	});
});