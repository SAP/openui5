/*!
 * ${copyright}
 */

/**
 * @version @version@
 */
sap.ui.define([
	"sap/m/HBox",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/ViewType",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (HBox, UIComponent, View, ViewType, JSONModel, TestUtils) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.v4.ServerDrivenPaging.Component", {
		metadata : {
			interfaces : ["sap.ui.core.IAsyncContentCreation"],
			manifest : "json"
		},

		createContent : function () {
			var oLayout = new HBox({
					renderType : "Bare"
				}),
				oModel = this.getModel();

			this.oUiModel = new JSONModel({
				bRealOData : TestUtils.isRealOData()
			});

			View.create({
				async : true,
				models : {
					undefined : oModel,
					ui : this.oUiModel
				},
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.ServerDrivenPaging.Main"
			}).then(function (oView) {
				oLayout.addItem(oView);
			});

			return oLayout;
		},

		exit : function () {
			this.oUiModel.destroy();
			this.getModel().restoreSandbox();
		}
	});
});
