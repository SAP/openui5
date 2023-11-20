sap.ui.define(["sap/ui/model/type/Unit", "sap/ui/model/type/Currency", "sap/ui/core/mvc/XMLView"], function (UnitType, CurrencyType, XMLView) {
	"use strict";
	return {
		"customCurrencies": {
			"BTC": {
				"decimals": 1,
				"symbol": "Ƀ"
			},
			"DOL": {
				"decimals": 3,
				"symbol": "$"
			},
			"EU": {
				"decimals": 2,
				"symbol": "€"
			},
			"EURO": {
				"decimals": 4,
				"symbol": "€"
			}
		},
		"customUnits": {
			"gigabyte": {
				"decimals": 1,
				"displayName": "GigaByte",
				"unitPattern-count-other": "{0} GB"
			},
			"packs": {
				"decimals": 2,
				"displayName": "Packs",
				"unitPattern-count-other": "{0} pks"
			}
		}
	};
});