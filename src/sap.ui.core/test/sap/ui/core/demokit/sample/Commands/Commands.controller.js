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

		onDelete: function () {
			MessageToast.show("CTRL+D: Delete triggered on controller");
		},

		onToggleSave: function(oEvent)  {
			this.getView().byId("CE_SAVE").setEnabled(oEvent.getParameter("state"));
		},

		onToggleDelete: function(oEvent)  {
			this.getView().byId("CE_DELETE").setEnabled(oEvent.getParameter("state"));
		},

		onTogglePopoverSave: function(oEvent)  {
			this.getView().byId("CE_SAVE_POPOVER").setEnabled(oEvent.getParameter("state"));
		},

		onToggleSaveVisibility: function(oEvent)  {
			this.getView().byId("CE_SAVE").setVisible(oEvent.getParameter("state"));
		},

		onToggleDeleteVisibility: function(oEvent)  {
			this.getView().byId("CE_DELETE").setVisible(oEvent.getParameter("state"));
		},

		onTogglePopoverSaveVisibility: function(oEvent)  {
			this.getView().byId("CE_SAVE_POPOVER").setVisible(oEvent.getParameter("state"));
		},

		onPopoverOpen: function(oEvent) {
			this.byId("popover").openBy(oEvent.getSource());
		},

		onCommandPopoverOpen: function(oEvent) {
			this.byId("popoverCommand").openBy(oEvent.getSource());
		}
	});
});