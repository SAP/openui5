sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/ui/core/Fragment"
	], function(Controller, JSONModel, Fragment) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectHeaderTitleSel.C", {

		onInit : function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			oModel.setDefaultBindingMode("OneWay");
			this.getView().setModel(oModel);
		},

		onExit : function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},

		_getResponsivePopover: function () {
			if (!this._oPopover) {
				return Fragment.load({
					type: "XML",
					name: "sap.m.sample.ObjectHeaderTitleSel.Popover",
					controller: this
				}).then(function (oPopover) {
					this._oPopover = oPopover;
				}.bind(this));
			}
			return this._oPopover;
		},

		handleItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("listItem"),
				oObjectHeader = this.byId("idObjectHeader");

			oObjectHeader.setTitle(oItem.getTitle());
			oObjectHeader.setBindingContext(oItem.getBindingContext());
			this._oPopover.close();
		},

		handleTitleSelectorPress: function (oEvent) {
			var oPopoverFragment = this._getResponsivePopover(),
				oSourceControl = oEvent.getSource(),
				oControlDomRef = oEvent.getParameter("domRef");

			if (oPopoverFragment instanceof Promise) {
				oPopoverFragment.then(function(oPopover) {
					this._oPopover.setModel(oSourceControl.getModel());
					this._oPopover.openBy(oControlDomRef);
				}.bind(this));
			} else {
				oPopoverFragment.setModel(oSourceControl.getModel());
				oPopoverFragment.openBy(oControlDomRef);
			}
		}

	});

});