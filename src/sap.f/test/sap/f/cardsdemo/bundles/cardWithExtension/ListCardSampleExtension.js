sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition", "sap/base/Log"], function (Extension, ActionDefinition, Log) {
	"use strict";

	// function that adjusts the data
	function combineDataFromMultipleDataSources(aSources) {
		return aSources[0].concat(aSources[1]).concat(aSources[2]).concat(aSources[3]);
	}

	return Extension.extend("cardWithExtension.ListCardSampleExtension", {
		init: function () {
			Extension.prototype.init.apply(this, arguments);

			this.setFormatters({
				titleToUpperCase: function (title) {
					return title.toUpperCase();
				},
				descriptionToUpperCase: function (sDescr) {
					return sDescr.toUpperCase();
				}
			});

			this.attachAction(function (oEvent) {
				Log.error("Action handled in the Extension:" + JSON.stringify(oEvent.getParameters().parameters));
			});
		},
		onCardReady: function () {
			this.getCard().addActionDefinition(new ActionDefinition({
				type: 'Navigation',
				parameters: {
					url: "http://www.sap.com",
					target: "_blank"
				},
				text: 'AutoOpen - SAP website - Extension',
				press: function () {
					// handle press here
				}
			}));
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
				"url": sap.ui.require.toUrl("cardWithExtension/cities.json")
			});

			var pGetDataFromDestination = oCard.request({
				"url": "{{destinations.myDestination}}/Products",
				"parameters": {
					"$format": "json",
					"$top": "3"
				}
			}).then(function(oData) {
				var aValues = oData.value;
				return [
					{ city: aValues[0].ProductName, description: "I'm from destination"},
					{ city: aValues[1].ProductName, description: "I'm from destination"},
					{ city: aValues[2].ProductName, description: "I'm from destination"}
				];
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
					.all([p1, pGetDataFromStaticFile, pGetDataFromDestination, pGetDataFromDataSource])
					.then(combineDataFromMultipleDataSources);
		}
	});
});
