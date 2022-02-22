sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/FilterType',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/format/DateFormat',
	'sap/m/DynamicDateUtil',
	'sap/ui/core/library',
	'sap/ui/Device'
], function(
	Controller,
	Filter,
	FilterOperator,
	FilterType,
	JSONModel,
	DateFormat,
	DynamicDateUtil,
	coreLibrary,
	Device
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;


	function getIcrementedDateFromToday(iDays, iMonths, iYears) {
		var oResultingDate = new Date();

		oResultingDate.setFullYear(oResultingDate.getFullYear() + iYears);
		oResultingDate.setMonth(oResultingDate.getMonth() + iMonths);
		oResultingDate.setDate(oResultingDate.getDate() + iDays);

		return oResultingDate;
	}

	var aPayments = [
		{
			TransactionType: "ATM withdrawal",
			PerfomDateTime: getIcrementedDateFromToday(-1, 0 ,0),
			Amount: 100.00,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "payment on POS terminal",
			PerfomDateTime: getIcrementedDateFromToday(-2, 0 ,0),
			Amount: 18.00,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "payment on POS terminal",
			PerfomDateTime: getIcrementedDateFromToday(-3, 0 ,0),
			Amount: 54.05,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "payment on POS terminal",
			PerfomDateTime: getIcrementedDateFromToday(-4, 0 ,0),
			Amount: 30.00,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "payment on POS terminal",
			PerfomDateTime: getIcrementedDateFromToday(-5, 0 ,0),
			Amount: 105.50,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "payment on POS terminal",
			PerfomDateTime: getIcrementedDateFromToday(-3, 0 ,0),
			Amount: 74.35,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "payment on POS terminal",
			PerfomDateTime: getIcrementedDateFromToday(-3, -1 ,0),
			Amount: 9.50,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "payment on POS terminal",
			PerfomDateTime: getIcrementedDateFromToday(-1, -1 ,0),
			Amount: 3.90,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "ATM withdrawal",
			PerfomDateTime: getIcrementedDateFromToday(-5, -2 ,0),
			Amount: 200.00,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "payment on POS terminal",
			PerfomDateTime: getIcrementedDateFromToday(-4, -2 ,0),
			Amount: 153.80,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "payment on POS terminal",
			PerfomDateTime: getIcrementedDateFromToday(-9, 0 ,0),
			Amount: 5.30,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "payment on POS terminal",
			PerfomDateTime: getIcrementedDateFromToday(-8, 0 ,0),
			Amount: 1.60,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "payment on POS terminal",
			PerfomDateTime: getIcrementedDateFromToday(0, -1 ,-1),
			Amount: 95.60,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "ATM withdrawal",
			PerfomDateTime: getIcrementedDateFromToday(0, 0 ,0),
			Amount: 400.00,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "ATM withdrawal",
			PerfomDateTime: new Date(2021, 5, 9, 15, 15, 0),
			Amount: 50.00,
			CurrencyCode: "EUR"
		},
		{
			TransactionType: "payment on POS terminal",
			PerfomDateTime: new Date(2021, 5, 8, 10, 15, 0),
			Amount: 22.34,
			CurrencyCode: "EUR"
		}
	];

	var DynamicDateRangeController = Controller.extend("sap.m.sample.DynamicDateRange.DynamicDateRange", {

		onInit: function() {
			var oModel = new JSONModel({
					payments: aPayments
				}),
				oEnvModel = new JSONModel({
					filterInputWidth: !Device.system.phone ? '300px' : "auto"
				}),
				oView = this.getView();

			oView.setModel(oModel);
			oView.setModel(oEnvModel, "env");
		},

		onChange: function(oEvent) {
			var oDynamicDateRange = oEvent.oSource,
				bValid = oEvent.getParameter("valid"),
				oTableItemsBinding, oValue, oTable, oFilter;

			if (bValid) {
				oTable = this.getView().byId("payments-table");
				oTableItemsBinding = oTable.getBinding("items");
				oValue = oEvent.getParameter("value");
				oFilter = this._createFilter(oValue);
				oTableItemsBinding.filter(oFilter, FilterType.Application);
				oDynamicDateRange.setValueState(ValueState.None);
			} else {
				oDynamicDateRange.setValueState(ValueState.Error);
			}
		},

		_dateFormatter: function(oDate) {
			return DateFormat.getDateTimeInstance({pattern: "MMMM dd YY, hh:mm:ss"}).format(oDate);
		},

		_createFilter: function(oValue) {
			if (oValue) {
				var aDates = DynamicDateUtil.toDates(oValue);
				if (oValue.operator === "FROM" || oValue.operator === "FROMDATETIME") {
					return new Filter("PerfomDateTime", FilterOperator.GT, aDates[0]);
				} else if (oValue.operator === "TO" || oValue.operator === "TODATETIME") {
					return new Filter("PerfomDateTime", FilterOperator.LT, aDates[0]);
				}
				return new Filter("PerfomDateTime", FilterOperator.BT, aDates[0], aDates[1]);
			} else {
				// Reset the curretnly applied filters
				return [];
			}
		}
	});


	return DynamicDateRangeController;

});