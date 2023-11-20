/*!
 * ${copyright}
 */

/**
 * Application component to display information on Product entities from the ZUI5_GWSAMPLE_BASIC
 * OData service.
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (UIComponent, JSONModel, TestUtils) {
	"use strict";

	return UIComponent.extend("sap.ui.core.internal.samples.odata.v2.Products.Component", {
		metadata : {
			manifest : "json"
		},

		init : function () {
			var bRealOData = TestUtils.isRealOData(),
				sServicePrefix = "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/",
				sURLPrefix = "test-resources/sap/ui/core/qunit/odata/v2/data/";

			UIComponent.prototype.init.apply(this, arguments);

			this.setModel(new JSONModel({
				realOData : bRealOData,
				currenciesURL : bRealOData
					? sServicePrefix + "SAP__Currencies?$format=json"
					: sURLPrefix + "SAP__Currencies.json",
				unitsOfMeasureURL : bRealOData
					? sServicePrefix + "SAP__UnitsOfMeasure?$format=json"
					: sURLPrefix + "SAP__UnitsOfMeasure.json"
			}), "ui");
		}
	});
});