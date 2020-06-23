sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var oExtension = new Extension();

	// should return a promise
	oExtension.getData = function () {
		// Get information about trainings and the trainers and combine them in a way to be suitable for the card.
		return Promise.all([this.getAvailableTrainings(), this.getTrainers()])
				.then(function (aData) {
					var aAvailableTrainings = aData[0],
						aTrainers = aData[1];

					var aPreparedData = aAvailableTrainings.map(function (oTraining, i) {
						return {
							title: oTraining.training,
							trainer: aTrainers[i].name
						};
					});

					// what we assembled here will be used as data in the card
					return aPreparedData;
				});
	};

	// Returns static info for trainings. In real scenario this would be a request to a backend service.
	oExtension.getAvailableTrainings = function () {
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
	oExtension.getTrainers = function () {
		var oCard = this.getCard(),
			oParameters = oCard.getCombinedParameters();

		return oCard.request({
			"url": "{{destinations.NorthwindDestination}}/Employees",
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

	return oExtension;
});
