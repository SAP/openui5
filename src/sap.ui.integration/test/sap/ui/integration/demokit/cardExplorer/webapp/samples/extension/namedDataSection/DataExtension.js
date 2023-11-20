sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition"], function (Extension, ActionDefinition) {
	"use strict";

	var DataExtension = Extension.extend("card.explorer.extension.namedDataSection.DataExtension");

	DataExtension.prototype.onCardReady = function () {
		this.getCard().addActionDefinition(new ActionDefinition({
			type: "Custom",
			text: "Change Cities",
			enabled: true,
			press: function () {
				this._updateData();
			}.bind(this)
		}));

		// Load initial data
		this._updateData();
	};

	DataExtension.prototype._updateData = function () {
		var oData = this._getRandomCities(),
			oCard = this.getCard();

		oCard.showLoadingPlaceholders();

		setTimeout(function () {
			oCard.getModel("cities").setProperty("/", oData);
			oCard.hideLoadingPlaceholders();
		}, 2000); // simulate loading delay
	};

	DataExtension.prototype._getRandomCities = function () {
		var aCities = [
				{"name": "Berlin"},
				{"name": "New York"},
				{"name": "Shanghai"},
				{"name": "Bangalore"},
				{"name": "Paris"},
				{"name": "London"},
				{"name": "Moscow"},
				{"name": "Sofia"},
				{"name": "Johannesburg"}
			],
			iCounter,
			iRandomIndex,
			iRandomCount = Math.floor(Math.random() * aCities.length) + 1,
			aRandomCities = [];

		for (iCounter = 0; iCounter < iRandomCount; iCounter++) {
			iRandomIndex = Math.floor(Math.random() * aCities.length);
			aRandomCities.push(aCities[iRandomIndex]);
		}

		return {
			"items": aRandomCities,
			"totalCount": aCities.length
		};
	};

	return DataExtension;
});
