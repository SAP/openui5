sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/ui/core/library"
], function(
	UIComponent,
	JSONModel,
	App,
	library
) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = library.mvc.ViewType;

	return UIComponent.extend("sap.ui.rta.test.rtaOpenUI5Only.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			this._bShowAdaptButton = !!this.getComponentData().showAdaptButton;
			UIComponent.prototype.init.apply(this, arguments);
		},

		createContent: function() {
			var oModel = new JSONModel({
				showAdaptButton: this._bShowAdaptButton
			});

			var oView = sap.ui.view(this.createId("idMain1"), {
				viewName: "sap.ui.rta.test.rtaOpenUI5Only.Root",
				type: ViewType.XML,
				async: true
			});

			if (this._bShowAdaptButton) {
				oView.addStyleClass("sapUiRtaMarginTopForToolbar");
			}

			oView.setModel(oModel, "view");

			var oApp = new App();
			oApp.addPage(oView);
			return oApp;
		}
	});
});
