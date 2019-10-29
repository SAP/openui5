sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast"
], function (Controller, JSONModel, Fragment, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.QuickView.QuickView", {

		onInit: function () {
			// load JSON sample data
			var oCompanyModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickView/model/CompanyData.json")),
				oEmployeeModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickView/model/EmployeeData.json")),
				oGenericModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickView/model/GenericData.json")),
				oGenericModelNoHeader = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickView/model/GenericDataNoHeader.json"));

			this.getView()
				.setModel(oCompanyModel, "CompanyModel")
				.setModel(oEmployeeModel, "EmployeeModel")
				.setModel(oGenericModel, "GenericModel")
				.setModel(oGenericModelNoHeader, "GenericModelNoHeader");
		},

		onAfterRendering: function () {
			var oButton = this.byId('showQuickView');
			oButton.$().attr('aria-haspopup', true);

			oButton = this.byId('employeeQuickView');
			oButton.$().attr('aria-haspopup', true);

			oButton = this.byId('genericQuickView');
			oButton.$().attr('aria-haspopup', true);
		},

		openQuickView: function (oEvent, oModel) {
			var oButton = oEvent.getSource();

			if (!this._oQuickView) {
				Fragment.load({
					name: "sap.m.sample.QuickView.QuickView",
					controller: this
				}).then(function (oQuickView) {
					this._oQuickView = oQuickView;
					this._configQuickView(oModel);
					this._oQuickView.openBy(oButton);
				}.bind(this));
			} else {
				this._configQuickView(oModel);
				this._oQuickView.openBy(oButton);
			}
		},

		_configQuickView: function (oModel) {
			this.getView().addDependent(this._oQuickView);
			this._oQuickView.close();
			this._oQuickView.setModel(oModel);
		},

		handleCompanyQuickViewPress: function (oEvent) {
			var oModel = this.getView().getModel("CompanyModel");
			this.openQuickView(oEvent, oModel);
		},

		handleEmployeeQuickViewPress: function (oEvent) {
			var oModel = this.getView().getModel("EmployeeModel");
			this.openQuickView(oEvent, oModel);
		},

		handleGenericQuickViewPress: function (oEvent) {
			var oModel = this.getView().getModel("GenericModel");
			this.openQuickView(oEvent, oModel);
		},

		handleGenericNoHeaderQuickViewPress: function (oEvent) {
			var oModel = this.getView().getModel("GenericModelNoHeader");
			this.openQuickView(oEvent, oModel);
		},

		onNavigate: function (oEvent) {
			var oNavOrigin = oEvent.getParameter("navOrigin");
			if (oNavOrigin) {
				MessageToast.show('Link "' + oNavOrigin.getText() + '" was clicked');
			} else {
				MessageToast.show('Back button was clicked');
			}
		},

		onExit: function () {
			if (this._oQuickView) {
				this._oQuickView.destroy();
			}
		}

	});
});