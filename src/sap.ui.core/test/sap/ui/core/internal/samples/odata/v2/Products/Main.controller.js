/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller"
], function (Log, Controller) {
	"use strict";
	var sClassName = "sap.ui.core.internal.samples.odata.v2.Products.Main.controller";

	return Controller.extend("sap.ui.core.internal.samples.odata.v2.Products.Main", {
		_requestCodelists : function () {
			var oMetaModel = this.getView().getModel().getMetaModel(),
				oCurrenciesCodelistPromise = oMetaModel.fetchCodeList("CurrencyCodes"),
				oUnitsCodelistPromise = oMetaModel.fetchCodeList("UnitsOfMeasure");

			Log.info("SAP__Currencies requested; Promise fulfilled: "
				+ oCurrenciesCodelistPromise.isFulfilled(), undefined, sClassName);
			oCurrenciesCodelistPromise.then(function (mCodelist) {
				Log.info("SAP__Currencies request resolved", undefined, sClassName);
			});
			Log.info("SAP__UnitsOfMeasure requested; Promise fulfilled: "
				+ oUnitsCodelistPromise.isFulfilled(), undefined, sClassName);
			oUnitsCodelistPromise.then(function (mCodelist) {
				Log.info("SAP__UnitsOfMeasure request resolved", undefined, sClassName);
			});
		},

		onInit : function () {
			this._requestCodelists();
		},

		onResetChanges : function () {
			this._requestCodelists();
			this.getView().getModel().resetChanges();
		}
	});
});