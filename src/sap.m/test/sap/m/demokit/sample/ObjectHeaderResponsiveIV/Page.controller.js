sap.ui.define([
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/ui/core/Fragment"
], function(MessageBox, Controller, JSONModel, Fragment) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectHeaderResponsiveIV.Page", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onPress: function () {
			MessageBox.alert("Link was clicked!");
		},

		handleTitlePress : function (oEvent) {
			var oDomRef = oEvent.getParameter("domRef"),
				oView = this.getView();

			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					type: "XML",
					name: "sap.m.sample.ObjectHeaderResponsiveIV.Popover",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
			this._pPopover.then(function(oPopover) {
				oPopover.openBy(oDomRef);
			});
		}
	});

});