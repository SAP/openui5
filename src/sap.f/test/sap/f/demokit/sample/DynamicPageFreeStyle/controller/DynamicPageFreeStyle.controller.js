sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, Fragment) {
	"use strict";

	return Controller.extend("sap.f.sample.DynamicPageFreeStyle.controller.DynamicPageFreeStyle", {
		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
			this.sShrinkRatio = "1:1.6:1.6";
		},
		getPage : function() {
			return this.byId("dynamicPageId");
		},
		onToggleFooter: function () {
			this.getPage().setShowFooter(!this.getPage().getShowFooter());
		},
		toggleAreaPriority: function () {
			var oTitle = this.getPage().getTitle(),
				sDefaultShrinkRatio = oTitle.getMetadata().getProperty("areaShrinkRatio").getDefaultValue(),
				sNewShrinkRatio = oTitle.getAreaShrinkRatio() === sDefaultShrinkRatio ? "1.6:1:1.6" : sDefaultShrinkRatio;
			oTitle.setAreaShrinkRatio(sNewShrinkRatio);
		},
		onPressOpenPopover: function (oEvent) {
			var oView = this.getView(),
				oSourceControl = oEvent.getSource();

			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.f.sample.DynamicPageFreeStyle.view.Card"
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}

			this._pPopover.then(function (oPopover) {
				oPopover.openBy(oSourceControl);
			});
		}
	});
});