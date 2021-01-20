sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var DataExtension = Extension.extend("card.test.editor.extension.getData.DataExtension");

	// should return a promise
	DataExtension.prototype.getData = function () {
		// Get information about trainings, trainers, and locations, then combine them in a way that it suitable for the card.
		return Promise.all([
			this.getAvailableTrainings(),
			this.getTrainers(),
			this.getTrainingLocations()
		]).then(function (aData) {
			var aAvailableTrainings = aData[0],
				aTrainers = aData[1],
				aLocations = aData[2];

			var aPreparedData = aAvailableTrainings.map(function (oTraining, i) {
				return {
					title: oTraining.training,
					trainer: aTrainers[i].name,
					location: aLocations[i].location
				};
			});

			// what we assembled here will be used as data in the card
			return {
				"values": aPreparedData
			};
		});
	};

	// Returns static info for trainings. In real scenario this would be a request to a backend service.
	DataExtension.prototype.getAvailableTrainings = function () {
		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				resolve([
					{ training: "Scrum" },
					{ training: "Quality Management" },
					{ training: "Test Driven Development" },
					{ training: "Integration Cards Training" }
				]);
			}, 2000);
		});
	};

	// Gets the trainers names.
	DataExtension.prototype.getTrainers = function () {
		var oCard = this.getCard(),
			oParameters = oCard.getCombinedParameters();

		return oCard.request({
			"url": "{{destinations.northwind}}/Employees",
			"parameters": {
				"$format": "json",
				"$top": oParameters.maxItems
			}
		}).then(function (aData) {
			return aData.value.map(function (oTrainer) {
				return {
					name: oTrainer.FirstName + " " + oTrainer.LastName
				};
			});
		});
	};

	// Requests XML data, then serializes it to an Object
	DataExtension.prototype.getTrainingLocations = function () {
		return this.getCard().request({
			"url": "locations.xml",
			"dataType": "xml"
		}).then(function (oXMLDocument) {
			var aLocations = oXMLDocument.querySelectorAll("Location");

			return Array.prototype.map.call(aLocations, function (oLoc) {
				return { location: oLoc.getAttribute("value") };
			});
		});
	};

	return DataExtension;
});
