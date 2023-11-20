sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, Fragment, JSONModel) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageWithLinksAndObjectStatus.controller.ObjectPageWithLinksAndObjectStatus", {
		onInit: function () {
			var oCompanyModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickView/model/CompanyData.json"));

			this.getView()
				.setModel(oCompanyModel, "CompanyModel");
		},
		onOrderDetailsPress: function () {
			var oView = this.getView();
			oView.byId("ObjectPageLayout").setSelectedSection(oView.byId("orderDetailsSection"));
		},
		onExternalApplicationLinkPress: function () {
			MessageToast.show("Navigate to external application.");
		},
		onAnotherPageLinkPress: function () {
			MessageToast.show("Navigate to another page in the same application (List of delivery items)");
		},
		openQuickView: function (oEvent, oModel) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._pQuickView) {
				Fragment.load({
					id: oView.getId(),
					name: "sap.uxap.sample.ObjectPageWithLinksAndObjectStatus.view.QuickView",
					controller: this
				}).then(function (oQuickView) {
					oView.addDependent(oQuickView);
					this._pQuickView = oQuickView;
					oQuickView.setModel(oModel);
					oQuickView.openBy(oButton);
				}.bind(this));
			} else {
				this._pQuickView.openBy(oButton);
			}
		},
		handleTitleSelectorPress: function (oEvent) {
			var oModel = this.getView().getModel("CompanyModel");
			this.openQuickView(oEvent, oModel);
		}
	});
});