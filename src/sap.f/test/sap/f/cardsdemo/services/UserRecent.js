sap.ui.define([
	"sap/ui/integration/services/Data",
	"sap/ui/base/EventProvider"
], function (Data, EventProvider) {
	"use strict";

	//Provide meaningful initial data
	var oData = [
		{
			"title": "Create Purchse Orders",
			"description": "System P3Y - Create purchase orders",
			"info": "Still open",
			"category": "Supply",
			"icon": "sap-icon://credit-card"
		},
		{
			"title": "Manage Sales Orders",
			"description": "System U1Y - Create, approve and watch your sales orders",
			"info": "2 hours ago",
			"icon": "sap-icon://crm-sales",
			"category": "Sales"
		},
		{
			"title": "Approve Leave Requests",
			"description": "Teams: Gravity, Rudopi",
			"info": "3 days ago",
			"icon": "sap-icon://company-view",
			"category": "Employee"
		},
		{
			"title": "EMEA Revenue Projection 2019",
			"description": "Expected Revenue of Q4/19",
			"info": "6 days ago",
			"icon": "sap-icon://home-share",
			"category": "Analytics"
		},
		{
			"title": "Online Payslip",
			"description": "Your salary overview 09/18",
			"info": "4 weeks ago",
			"icon": "sap-icon://customer-financial-fact-sheet",
			"category": "Private"
		}
	];

	/**
	 * Example implementation of a sap.ui.integration.services.Data
	 */
	var UserRecent = Data.extend();

	/**
	 * All UserRecent instances share an EventProvider to notify all subscribers of the service.
	 */
	var _oEventProvider = new EventProvider();

	var _CallbackRefs = new WeakMap();

	UserRecent.prototype.attachDataChanged = function (fnHandler, oParams) {

		// Do something with the oParams (if needed).

		_CallbackRefs.set(fnHandler, function (oEvent) {
			fnHandler({
				data: oEvent.getParameter("data")
			});
		});

		_oEventProvider.attachEvent("dataChanged", _CallbackRefs.get(fnHandler));
	};

	UserRecent.prototype.detachDataChanged = function (fnHandler) {
		var fnHandlerWrapper = _CallbackRefs.get(fnHandler);
		if (fnHandlerWrapper) {
			_oEventProvider.detachEvent("dataChanged", fnHandlerWrapper);
			_CallbackRefs.set(fnHandler, null);
		}
	};

	UserRecent.prototype.addData = function (oAddedData) {
		oData.unshift(oAddedData);
		_oEventProvider.fireEvent("dataChanged", { data: oData });
	};

	UserRecent.prototype.getData = function () {
		return Promise.resolve(oData);
	};

	return UserRecent;
});
