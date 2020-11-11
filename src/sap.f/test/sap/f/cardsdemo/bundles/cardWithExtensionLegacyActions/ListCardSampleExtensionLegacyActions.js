sap.ui.define(["sap/ui/integration/Extension", "sap/base/Log"], function (Extension, Log) {
	"use strict";

	// function that adjusts the data
	function combineDataFromMultipleDataSources(aSources) {
		return aSources[0].concat(aSources[1]).concat(aSources[2]).concat(aSources[3]);
	}

	return Extension.extend("cardWithExtensionLegacyActions.ListCardSampleExtensionLegacyActions", {
		init: function () {
			Extension.prototype.init.apply(this, arguments);

			this.setActions([
				{
					type: 'Navigation',
					url: "http://www.sap.com",
					target: "_blank",
					text: 'AutoOpen - SAP website - Extension'
				}
			]);

			this.attachAction(function (oEvent) {
				Log.error("Action handled in the Extension:" + JSON.stringify(oEvent.getParameters().parameters));
			});
		},
		getData: function (arg1, arg2, arg3, arg4) {
			var oCard = this.getCard();

			var p1 = new Promise(function (resolve, reject) {
				setTimeout(function () {
					resolve([
						{ city: "Berlin", description: "I'm from hardcoded array" },
						{ city: "Tokyo", description: "I'm from hardcoded array" }
					]);
				}, 2000);
			});

			var pGetDataFromStaticFile = oCard.request({
				"url": sap.ui.require.toUrl("cardWithExtensionLegacyActions/cities.json")
			});

			var pGetDataFromDataSource = oCard.request({
				"url": oCard.getManifestEntry("/sap.app/dataSources/products/uri") + "/Products",
				"parameters": {
					"$format": "json",
					"$top": "2"
				}
			}).then(function(oData) {
				var aValues = oData.value;
				return [
					{ city: aValues[0].ProductName, description: "I'm from data source"},
					{ city: aValues[1].ProductName, description: "I'm from data source"}
				];
			});

			return Promise
					.all([p1, pGetDataFromStaticFile, pGetDataFromDataSource])
					.then(combineDataFromMultipleDataSources);
		}
	});
});
