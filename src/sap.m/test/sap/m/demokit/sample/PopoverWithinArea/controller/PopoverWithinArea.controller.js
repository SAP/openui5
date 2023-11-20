sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/ui/core/Popup"
	], function(MessageToast, Fragment, Controller, JSONModel, Popup) {
	"use strict";

	return Controller.extend("sap.m.sample.PopoverWithinArea.controller.PopoverWithinArea", {

		onInit : function (evt) {
			// Set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		handlePopoverPress: function (oEvent) {
			// Set the element that will serve as 'within area' for all popups
			Popup.setWithinArea(this.byId("withinArea"));

			var oButton = oEvent.getSource(),
				oView = this.getView();

			// Create popover
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.PopoverWithinArea.view.PopoverWithinArea",
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

		handleListPopoverPress: function (oEvent) {
			// Set the element that will serve as 'within area' for all popups
			Popup.setWithinArea(this.byId("withinArea"));

			var oButton = oEvent.getSource(),
				oView = this.getView();

			// Create popover
			if (!this._pListPopover) {
				this._pListPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.PopoverWithinArea.view.ListPopoverWithinArea",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					oPopover.bindElement("/ProductCollection/0");
					return oPopover;
				});
			}
			this._pListPopover.then(function(oPopover) {
				oPopover.openBy(oButton);
			});
		},

		handleInnerPopoverPress: function (oEvent) {
			// Set the element that will serve as 'within area' for all popups
			Popup.setWithinArea(this.byId("withinArea"));

			var oButton = oEvent.getSource(),
				oView = this.getView();

			// Create popover
			if (!this._pInnerPopover) {
				this._pInnerPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.PopoverWithinArea.view.InnerPopoverWithinArea",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					oPopover.bindElement("/ProductCollection/0");
					return oPopover;
				});
			}
			this._pInnerPopover.then(function(oPopover) {
				oPopover.openBy(oButton);
			});
		},

		handleAfterClose: function (oEvent) {
			Popup.setWithinArea(null);
		}
	});
});