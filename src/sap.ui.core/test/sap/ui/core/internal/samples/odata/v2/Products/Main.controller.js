/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (Log, Controller, JSONModel, TestUtils) {
	"use strict";

	return Controller.extend("sap.ui.core.internal.samples.odata.v2.Products.Main", {
		onInit : function () {
			const bRealOData = TestUtils.isRealOData();
			const sServicePrefix = "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/";
			const sURLPrefix = "test-resources/sap/ui/core/qunit/odata/v2/data/";
			this.getView().setModel(new JSONModel({
				realOData : bRealOData,
				currenciesURL : bRealOData
					? sServicePrefix + "SAP__Currencies?$format=json"
					: sURLPrefix + "SAP__Currencies.json",
				unitsOfMeasureURL : bRealOData
					? sServicePrefix + "SAP__UnitsOfMeasure?$format=json"
					: sURLPrefix + "SAP__UnitsOfMeasure.json"
			}), "ui");
		},

		onResetChanges : function () {
			this.getView().getModel().resetChanges();
		}
	});
});