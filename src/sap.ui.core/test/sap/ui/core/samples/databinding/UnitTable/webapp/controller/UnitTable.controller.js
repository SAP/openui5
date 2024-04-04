sap.ui.define([
	"sap/base/util/fetch",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (fetch, Controller, JSONModel) {
	"use strict";
	return Controller.extend("sap.ui.core.samples.unittable.controller.UnitTable", {
		onInit: function () {
			var sUrl = sap.ui.require.toUrl("sap/ui/core/samples/unittable/data/UnitTable.meters.json"),
				pLoadResource = fetch(sUrl, {
					headers: {"Accept": fetch.ContentTypes.JSON}
				}),
				that = this;

			pLoadResource.then(function (oResponse) {
				oResponse.json().then(function (oResult) {
					//data transformation
					var aMeters = [],
						aMonths = [],
						oMonths = {},
						oObj = {};

					for (var sKey in oResult) {
						var oResultObj = oResult[sKey],
							sMeterName = oResultObj.name;

						oObj = {
							decimals: oResultObj.decimals,
							unit: oResultObj.unit,
							name: sMeterName
						};
						for (var sDataKey in oResultObj.data) {
							var oData = oResultObj.data[sDataKey],
								sMonthKey = oData.name.toLowerCase();

							oObj[sMonthKey] = oData.value;
							oMonths[oData.name] = oMonths[oData.name] || {};
							oMonths[oData.name][sMeterName.toLowerCase().replace(/\s/g, '')] = {
								value: oData.value,
								decimals: oResultObj.decimals,
								unit: oResultObj.unit
							};
						}
						aMeters.push(oObj);
					}
					for (var sMonth in oMonths) {
						var oMonthObj = oMonths[sMonth];

						oMonthObj.name = sMonth;
						aMonths.push(oMonthObj);
					}
					that.getView().setModel(new JSONModel({data:aMeters,size:aMeters.length}), "meters");
					that.getView().setModel(new JSONModel({data:aMonths,size:aMonths.length}), "months");
				});
			});
		}
	});
});
