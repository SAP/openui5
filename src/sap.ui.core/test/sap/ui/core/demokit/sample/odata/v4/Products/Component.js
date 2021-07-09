/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on products from the zui5_epm_sample
 * OData service.
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

	return UIComponent.extend("sap.ui.core.sample.odata.v4.Products.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var bRealOData = TestUtils.isRealOData(),
				sBaseUrl = bRealOData
					? "/sap/opu/odata4/sap/zui5_testv4/default/iwbep/common/0001/"
					: "test-resources/sap/ui/core/demokit/sample/odata/v4/Products/data/",
				oLayout = new HBox({
					renderType : "Bare"
				}),
				oModel = this.getModel();

			View.create({
				async : true,
				models : {
					undefined : oModel,
					ui : new JSONModel({
						sCode : "",
						bCodeVisible : false,
						iMessages : 0,
						bRealOData : bRealOData,
						sCurrencyUrl : bRealOData
							? sBaseUrl
								+ "Currencies?$select=CurrencyCode,DecimalPlaces,Text,ISOCode"
							: sBaseUrl + "Currencies.json",
						sUnitUrl : TestUtils.isRealOData()
							? sBaseUrl
								+ "UnitsOfMeasure?$select=ExternalCode,DecimalPlaces,Text,ISOCode"
							: sBaseUrl + "UnitsOfMeasure.json"
					})
				},
				preprocessors : {
					xml : {
						models : {
							meta : oModel.getMetaModel()
						}
					}
				},
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.Products.Main"
			}).then(function (oView) {
				oLayout.addItem(oView);
			});

			return oLayout;
		}
	});
});
