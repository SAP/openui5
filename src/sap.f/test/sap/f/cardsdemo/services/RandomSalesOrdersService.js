sap.ui.define(["sap/ui/integration/services/Data", "sap/ui/base/EventProvider"], function (Data, EventProvider) {
	"use strict";

	function getRandomInt(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}

	//Provide meaningful initial data
	var aSalesOrders = [
		{
			"SO_ID": "0000000001",
			"title": "Sales Order 17",
			"state": "at risk",
			"semanticColor": "red",
			"url": "https://www.sap.com"
		},
		{
			"SO_ID": "0000000002",
			"title": "Sales Order 22",
			"state": "review",
			"semanticColor": "blue"
		},
		{
			"SO_ID": "0000000003",
			"title": "Sales Order 13",
			"state": "finalized",
			"semanticColor": "green",
			"url": "https://www.sap.com"
		},
		{
			"SO_ID": "0000000003",
			"title": "Sales Order 5",
			"state": "finalized",
			"semanticColor": "green",
			"url": "https://www.sap.com"
		},
		{
			"SO_ID": "0000000003",
			"title": "Sales Order 6",
			"state": "finalized",
			"semanticColor": "green",
			"url": "https://www.sap.com"
		}
	];

	/**
	 * Example implementation of a sap.ui.integration.services.Data
	 */
	var RandomSalesOrdersService = Data.extend();

	/**
	 * All RandomSalesOrdersService instances share an EventProvider to notify all subscribers of the service.
	 */
	var _oEventProvider = new EventProvider();

	var _CallbackRefs = new WeakMap();

	RandomSalesOrdersService.prototype.attachDataChanged = function (fnHandler, oParams) {

		// Do something with the oParams (if needed).

		_CallbackRefs.set(fnHandler, function (oEvent) {
			fnHandler({
				data: oEvent.getParameter("data")
			});
		});

		_oEventProvider.attachEvent("dataChanged", _CallbackRefs.get(fnHandler));
	};

	RandomSalesOrdersService.prototype.detachDataChanged = function (fnHandler) {
		var fnHandlerWrapper = _CallbackRefs.get(fnHandler);
		if (fnHandlerWrapper) {
			_oEventProvider.detachEvent("dataChanged", fnHandlerWrapper);
			_CallbackRefs.set(fnHandler, null);
		}
	};

	RandomSalesOrdersService.prototype.getData = function () {
		// Mock a case where the data is different every time getData is called.
		var oData = {
			"items": aSalesOrders.slice(getRandomInt(5))
		};
		return Promise.resolve(oData);
	};

	return RandomSalesOrdersService;
});
