/*!
 * ${copyright}
 */

/**
 * @version @version@
 */
sap.ui.define([
	"sap/m/HBox",
	"sap/ui/core/library",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (HBox, library, UIComponent, View, JSONModel, TestUtils) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = library.mvc.ViewType;

	return UIComponent.extend("sap.ui.core.sample.odata.v4.ServerDrivenPaging.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var oLayout = new HBox({
					renderType : "Bare"
				}),
				oModel = this.getModel();

			View.create({
				async : true,
				models : {
					undefined : oModel,
					ui : new JSONModel({
						bRealOData : TestUtils.isRealOData()
					})
				},
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.ServerDrivenPaging.Main"
			}).then(function (oView) {
				oLayout.addItem(oView);
			});

			return oLayout;
		}
	});
});