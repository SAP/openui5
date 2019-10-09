sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/ui/core/Fragment"
], function(Controller, JSONModel, Fragment) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectHeaderResponsiveIII.Page", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onExit : function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},

		_getPopover : function () {
			if (!this._oPopover) {
				return Fragment.load({
					type: "XML",
					name: "sap.m.sample.ObjectHeaderResponsiveIII.Popover",
					controller: this
				});
			} else {
				return this._oPopover;
			}
		},

		handleTitlePress : function (oEvent) {
			var domRef = oEvent.getParameter("domRef"),
				oPopoverFragment = this._getPopover();

			if (oPopoverFragment instanceof Promise) {
				oPopoverFragment.then(function(oPopover) {
					this._oPopover = oPopover;
					this.getView().addDependent(this._oPopover);
					oPopover.openBy(domRef);
				}.bind(this));
			} else {
				oPopoverFragment.openBy(domRef);
			}
		}
	});

});