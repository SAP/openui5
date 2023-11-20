sap.ui.define(["sap/ui/integration/services/Data", "sap/ui/base/EventProvider"], function (Data, EventProvider) {
	"use strict";

	var iCw = 20;

	var aRevenues = [
		{
			"Week": "CW14",
			"Revenue": 431000.22,
			"Cost": 230000.00
		},
		{
			"Week": "CW15",
			"Revenue": 494000.30,
			"Cost": 238000.00
		},
		{
			"Week": "CW16",
			"Revenue": 491000.17,
			"Cost": 221000.00
		},
		{
			"Week": "CW17",
			"Revenue": 536000.34,
			"Cost": 280000.00
		},
		{
			"Week": "CW18",
			"Revenue": 675000.00,
			"Cost": 230000.00
		},
		{
			"Week": "CW19",
			"Revenue": 680000.00,
			"Cost": 250000.00,
			"Target": 600000.00
		},
		{
			"Week": "CW20",
			"Revenue": 659000.14,
			"Cost": 325000.00
		}
	];

	function getNextWeek() {
		iCw++;
		return "CW" + iCw;
	}

	function getRevenueChange() {
		var sign = Math.random() < 0.5 ? -1 : 1;

		return sign * Math.random() * 100000;
	}

	function updateRevenues() {
		aRevenues.forEach(function (oRevenue) {
			oRevenue["Week"] = getNextWeek();
			oRevenue["Revenue"] += getRevenueChange();
			oRevenue["Cost"] += getRevenueChange();
		});
	}

	/**
	 * Example implementation of a sap.ui.integration.services.Data
	 */
	var RandomSalesOrdersService = Data.extend();

	RandomSalesOrdersService.prototype.getData = function () {
		updateRevenues();
		return Promise.resolve(aRevenues);
	};

	return RandomSalesOrdersService;
});
