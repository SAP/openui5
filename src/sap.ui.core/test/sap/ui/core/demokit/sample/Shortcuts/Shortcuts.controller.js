sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/base/Log"

], function (Controller, MessageToast, Log) {

	"use strict";

	return Controller.extend("sap.ui.core.sample.Shortcuts.Shortcuts", {
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

		onPopoveropen: function(oEvent) {
			// create popover
			if (!this._oPopover) {
				this.getOwnerComponent().runAsOwner(function() {
					this._oPopover = sap.ui.xmlfragment("sap.ui.core.sample.Shortcuts.Popover", this);
					this.byId("page").addDependent(this._oPopover);
				}.bind(this));
			}
			this._oPopover.openBy(oEvent.getSource());
		},

		onShortcutPopoveropen: function(oEvent) {
			// create popover
			if (!this._oShortcutPopover) {
				this.getOwnerComponent().runAsOwner(function() {
					this._oShortcutPopover = sap.ui.xmlfragment("sap.ui.core.sample.Shortcuts.PopoverShortcuts", this);
					this.byId("page").addDependent(this._oShortcutPopover);
				}.bind(this));
			}
			this._oShortcutPopover.openBy(oEvent.getSource());
		}
	});
});