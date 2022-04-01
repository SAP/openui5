sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition", "sap/base/Log"], function (Extension, ActionDefinition, Log) {
	"use strict";

	// function that adjusts the data
	function combineDataFromMultipleDataSources(aSources) {
		return aSources[0].concat(aSources[1]).concat(aSources[2]);
	}

	return Extension.extend("sap.f.cardsdemo.testLib.SharedExtension", {
		init: function () {
			Extension.prototype.init.apply(this, arguments);

			this.setFormatters({
				toUpperCase: function (title) {
					return title.toUpperCase();
				},
				distance: function (city1, city2) {
					return "distance from " + city1 + " to " + city2 + " is 5km";
				}
			});

			this.attachAction(function (oEvent) {
				Log.error("Action handled in the Extension:" + JSON.stringify(oEvent.getParameters().parameters) + " card city: " + this.getCard().getCombinedParameters().city);
			}.bind(this));
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
		getData: function () {
			var oCard = this.getCard();

			var p1 = new Promise(function (resolve, reject) {
				setTimeout(function () {
					var cities = [],
						city = oCard.getCombinedParameters().city;

					if (city === "Berlin") {
						cities.push({ city: "Tokyo", description: "I'm from hardcoded array" });
					} else {
						cities.push({ city: "Berlin", description: "I'm from hardcoded array" });
					}
					resolve(cities);
				}, 2000);
			});

			var pGetDataFromStaticFile = oCard.request({
				"url": "./cities.json"
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

			return Promise
					.all([p1, pGetDataFromStaticFile, pGetDataFromDestination])
					.then(combineDataFromMultipleDataSources);
		}
	});
});
