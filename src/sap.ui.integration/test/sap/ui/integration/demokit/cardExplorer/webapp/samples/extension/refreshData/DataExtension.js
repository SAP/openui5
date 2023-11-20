sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition"],
	function (Extension, ActionDefinition) {
		"use strict";

		var DataExtension = Extension.extend("card.explorer.extension.refreshData.DataExtension");

		DataExtension.prototype.onCardReady = function () {
			this.getCard().addActionDefinition(new ActionDefinition({
				type: "Custom",
				text: "Refresh Data",
				press: function () {
					this.getCard().refreshData();
				}.bind(this)
			}));
		};

		DataExtension.prototype.getData = function () {
			return Promise.resolve(this._getRandomProducts());
		};

		DataExtension.prototype._getRandomProducts = function () {
			var aProducts = [
					{"name": "Notebook Basic 15"},
					{"name": "Flat Future"},
					{"name": "Multi Color"},
					{"name": "Notebook Professional 15"},
					{"name": "Laser Professional Eco"},
					{"name": "ITelO Vault Net"},
					{"name": "Ultra Jet Super Color"},
					{"name": "Comfort Easy"},
					{"name": "Ergo Screen E-I"}
				],
				i,
				iRandomIndex,
				aRandomProducts = [];

			for (i = 0; i < 4; i++) {
				iRandomIndex = Math.floor(Math.random() * aProducts.length);
				aRandomProducts.push(aProducts[iRandomIndex]);
			}

			return {
				"items": aRandomProducts
			};
		};

		return DataExtension;
	});
