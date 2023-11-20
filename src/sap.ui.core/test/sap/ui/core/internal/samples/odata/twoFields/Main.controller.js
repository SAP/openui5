sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	// ensure that all used types are loaded in advance
	"sap/ui/model/odata/type/Currency",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/odata/type/Unit"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.internal.samples.odata.twoFields", {
		onInit : function () {
			this.onRebind();
		},

		onRebind : function () {
			var oCommonBindingInfo, // binding info common to unit, value, full fields
				oInitModel = this.getView().getModel("init"),
				bCurrency = oInitModel.getProperty("/isCurrency"),
				oModel;

			 oModel = new JSONModel({
				customCurrencies : {
					"EUR": {
						"StandardCode" : "EUR",
						"UnitSpecificScale" : 2
					},
					"EUR3" : {
						"StandardCode" : "",
						"UnitSpecificScale" : 3
					},
					"JPY" : {
						"StandardCode" : "JPY",
						"UnitSpecificScale" : 0
					},
					"USD" : {
						"StandardCode" : "USD",
						"UnitSpecificScale" : 2
					},
					"USDN" :{
						"StandardCode" : "",
						"UnitSpecificScale" : 5
					}
				},
				customUnits : {
					"KG" : {
						"Text" : "Kilogram",
						"UnitSpecificScale" : 0
					},
					"DEG" : {
						"Text" : "Degree",
						"UnitSpecificScale" : 1
					},
					"M/L" : {
						"Text" : "Mole per Liter",
						"UnitSpecificScale" : 3
					}
				},
				value : oInitModel.getProperty("/initialValue/content"),
				valueEditable : oInitModel.getProperty("/initialValue/editable"),
				valueEnabled : oInitModel.getProperty("/initialValue/enabled"),
				unit : oInitModel.getProperty("/initialUnit/content"),
				unitEditable : oInitModel.getProperty("/initialUnit/editable"),
				unitEnabled : oInitModel.getProperty("/initialUnit/enabled")
			});

			oCommonBindingInfo = {
				mode : "TwoWay",
				parts : [{
					constraints : {
						minimum : "0",
						scale : "variable"
					},
					path : "/value",
					type : "sap.ui.model.odata.type.Decimal"
				},
				"/unit",
				{
					mode : "OneTime",
					path : bCurrency ? "/customCurrencies" : "/customUnits"
				}],
				type : "sap.ui.model.odata.type." + (bCurrency ? "Currency" : "Unit")
			};
			this.getView().setModel();

			this.byId("value").bindValue(Object.assign(
				{formatOptions : {showMeasure : false}},
				oCommonBindingInfo));
			this.byId("unit").bindValue(Object.assign(
				{formatOptions : {showNumber : false}},
				oCommonBindingInfo));
			this.byId("unitLabel").setText(bCurrency ? "Currency" : "Unit");
			this.byId("full").bindValue(oCommonBindingInfo);

			this.getView().setModel(oModel);
		}
	});
});