sap.ui.define([
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Fragment, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ResponsivePopover.controller.ResponsivePopover", {

		onInit : function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		handleResponsivePopoverPress: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.ResponsivePopover.view.Popover",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					oPopover.bindElement("/ProductCollection/0");
					return oPopover;
				});
			}
			this._pPopover.then(function(oPopover) {
				oPopover.openBy(oButton);
			});
		},
		handleResponsivePopoverFooterPress: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._pPopoverFooter) {
				this._pPopoverFooter = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.ResponsivePopover.view.PopoverFooter",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					oPopover.bindElement("/ProductCollection/0");
					return oPopover;
				});
			}
			this._pPopoverFooter.then(function (oPopover) {
				oPopover.openBy(oButton);
			});
		},

		handleCloseButton: function (oEvent) {
			// note: We don't need to chain to the _pPopover promise, since this event-handler
			// is only called from within the loaded dialog itself.
			this.byId("myPopover").close();
		},

		handleCloseFooterButton: function (oEvent) {
			// note: We don't need to chain to the _pPopover promise, since this event-handler
			// is only called from within the loaded dialog itself.
			this.byId("myFooterPopover").close();
		}
	});
});