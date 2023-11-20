sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/ui/core/library",
	"sap/ui/core/mvc/XMLView"
], function(
	UIComponent,
	JSONModel,
	App,
	library,
	XMLView
) {
	"use strict";

	return UIComponent.extend("sap.ui.rta.test.rtaOpenUI5Only.Component", {
		metadata: {
			manifest: "json"
		},

		init(...aArgs) {
			this._bShowAdaptButton = !!this.getComponentData().showAdaptButton;
			UIComponent.prototype.init.apply(this, aArgs);
		},

		createContent() {
			var oModel = new JSONModel({
				showAdaptButton: this._bShowAdaptButton
			});
			var oApp = new App();
			XMLView.create({
				id: "idMain1",
				viewName: "sap.ui.rta.test.rtaOpenUI5Only.Root"
			}).then(function(oView) {
				if (this._bShowAdaptButton) {
					oView.addStyleClass("sapUiRtaMarginTopForToolbar");
				}
				oView.setModel(oModel, "view");
				oApp.addPage(oView);
			}.bind(this));
			return oApp;
		}
	});
});
