sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.sample.DynamicPageWithStickySubheader.controller.DynamicPageWithStickySubheader", {
		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},
		getPage : function() {
			return this.byId("dynamicPageId");
		},
		onToggleFooter: function () {
			this.getPage().setShowFooter(!this.getPage().getShowFooter());
		},
		onGenericTagPress: function (oEvent) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("sap.f.sample.DynamicPageWithStickySubheader.view.Card", this);
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