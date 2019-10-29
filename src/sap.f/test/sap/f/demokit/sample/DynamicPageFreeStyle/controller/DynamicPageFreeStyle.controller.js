sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/f/library"
], function (Controller, JSONModel, library) {
	"use strict";

	// shortcut for sap.f.DynamicPageTitleArea
	var DynamicPageTitleArea = library.DynamicPageTitleArea;

	return Controller.extend("sap.f.sample.DynamicPageFreeStyle.controller.DynamicPageFreeStyle", {
		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},
		getPage : function() {
			return this.byId("dynamicPageId");
		},
		onToggleFooter: function () {
			this.getPage().setShowFooter(!this.getPage().getShowFooter());
		},
		toggleAreaPriority: function () {
			var oTitle = this.getPage().getTitle(),
				sNewPrimaryArea = oTitle.getPrimaryArea() === DynamicPageTitleArea.Begin ? DynamicPageTitleArea.Middle : DynamicPageTitleArea.Begin;
			oTitle.setPrimaryArea(sNewPrimaryArea);
		},
		onPressOpenPopover: function (oEvent) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("sap.f.sample.DynamicPageFreeStyle.view.Card", this);
				this.getView().addDependent(this._oPopover);
			}

			this._oPopover.openBy(oEvent.getSource());
		},
		onExit: function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		}
	});
});