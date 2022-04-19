sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";
	return Controller.extend("sap.uxap.sample.ObjectPageResetSelectedSection.controller.ObjectPageResetSelectedSection", {
		onInit: function () {
			var oJsonModel = new JSONModel(sap.ui.require.toUrl("sap/uxap/sample/SharedJSONData/HRData.json"));
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		},
		onListItemPress: function() {
			this._navTo("page2");
		},
		onNavigate: function(oEvent) {
			var oDestinationPage = oEvent.getParameter("to"),
				oPage2 = this.getView().byId("page2"),
				bResetSelectedSection = this.getView().byId("resetCheck").getSelected();

			if (oDestinationPage === oPage2 && bResetSelectedSection) {
				this.getView().byId("ObjectPageLayout").setSelectedSection(null);
			}
		},
		onBackButtonPress: function() {
			this._navTo("page1");
		},
		_navTo: function(sPageId) {
			var oNavContainer = this.getView().byId("navigationContainer"),
				oPage = this.getView().byId(sPageId);

			oNavContainer.to(oPage);
		}
	});
});
