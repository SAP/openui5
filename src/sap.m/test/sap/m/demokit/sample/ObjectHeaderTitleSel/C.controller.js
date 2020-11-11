sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/ui/core/Fragment"
	], function(Controller, JSONModel, Fragment) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectHeaderTitleSel.C", {

		onInit : function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			oModel.setDefaultBindingMode("OneWay");
			this.getView().setModel(oModel);
		},

		handleItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("listItem"),
				oObjectHeader = this.byId("idObjectHeader");

			oObjectHeader.setTitle(oItem.getTitle());
			oObjectHeader.setBindingContext(oItem.getBindingContext());

			// note: We don't need to chain to the _pPopover promise, since this event-handler
			// is only called from within the loaded dialog itself.
			this.byId("myPopover").close();
		},

		handleTitleSelectorPress: function (oEvent) {
			var oSourceControl = oEvent.getSource(),
				oControlDomRef = oEvent.getParameter("domRef"),
				oView = this.getView();

			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					type: "XML",
					name: "sap.m.sample.ObjectHeaderTitleSel.Popover",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
			this._pPopover.then(function(oPopover) {
				oPopover.setModel(oSourceControl.getModel());
				oPopover.openBy(oControlDomRef);
			});
		}

	});

});