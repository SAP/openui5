sap.ui.define([], function() {
	"use strict";

	return {

		fRunningTotal: 0,

		isAlive: function(bFlaskBroken) {
			return !bFlaskBroken;
		},

		addToRunningTotal: function(sCoffeeType) {
			this.fRunningTotal += this.getCoffeePriceList()[sCoffeeType];
		},

		getRunningTotal: function() {
			return this.fRunningTotal;
		},

		getCoffeePriceList: function() {
			return {
				"Moca Frappachino": 8.34,
				"Milky Coffeeola": 17.00,
				"Espresso-max": 6.00,
				"Sweet Dark Mixola": 12.00,
				"Demonic Jolt": 6.66,
				"Heavenly Blend": 333.77
			};
		}
	};
}, true);