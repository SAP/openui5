sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/format/DateFormat',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/FilterType',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/library',
	'sap/ui/Device',
	'./CustomPreviousXWeekend',
	'./CustomPreviousXWorkWeek',
	'./CustomLastChristmas',
	'sap/ui/core/date/UI5Date'
], function(
	Controller,
	DateFormat,
	Filter,
	FilterOperator,
	FilterType,
	JSONModel,
	coreLibrary,
	Device,
	CustomPreviousXWeekend,
	CustomPreviousXWorkWeek,
	CustomLastChristmas,
	UI5Date
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	const iCurrentYear = UI5Date.getInstance().getFullYear();

	function getIcrementedDateFromToday(iDays, iMonths, iYears) {
		const oResultingDate = UI5Date.getInstance();

		oResultingDate.setFullYear(oResultingDate.getFullYear() + iYears);
		oResultingDate.setMonth(oResultingDate.getMonth() + iMonths);
		oResultingDate.setUTCDate(oResultingDate.getUTCDate() + iDays);

		return oResultingDate;
	}

	function getChristmasDay(iYear) {
		const oCurrentDate = UI5Date.getInstance();
		const iCurrentHour = oCurrentDate.getHours();
		const iCurrentMinute = oCurrentDate.getMinutes();
		const iCurrentSeconds = oCurrentDate.getSeconds();

		return UI5Date.getInstance(iYear, 11, 25, iCurrentHour, iCurrentMinute, iCurrentSeconds);
	}

	const aOrders = [
		{
			productType: "Water",
			orderTime: getIcrementedDateFromToday(-1, 0 ,0),
			productPrice: 1.00,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Cake",
			orderTime: getIcrementedDateFromToday(-2, 0 ,0),
			productPrice: 18.00,
			productQuantity: 1,
			currency: "EUR"
		},
		{
			productType: "Orange Juice",
			orderTime: getIcrementedDateFromToday(-3, 0 ,0),
			productPrice: 5.05,
			productQuantity: 4,
			currency: "EUR"
		},
		{
			productType: "Apple Juice",
			orderTime: getIcrementedDateFromToday(-4, 0 ,0),
			productPrice: 3.00,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Beer",
			orderTime: getIcrementedDateFromToday(-5, 0 ,0),
			productPrice: 5.50,
			productQuantity: 3,
			currency: "EUR"
		},
		{
			productType: "Wine",
			orderTime: getIcrementedDateFromToday(-3, 0 ,0),
			productPrice: 7.30,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Sandwich",
			orderTime: getIcrementedDateFromToday(-3, -1 ,0),
			productPrice: 9.50,
			productQuantity: 1,
			currency: "EUR"
		},
		{
			productType: "Toast",
			orderTime: getIcrementedDateFromToday(-1, -1 ,0),
			productPrice: 3.90,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Coffee",
			orderTime: getIcrementedDateFromToday(-5, -2 ,0),
			productPrice: 2.00,
			productQuantity: 5,
			currency: "EUR"
		},
		{
			productType: "Strawberry Smoothie",
			orderTime: getIcrementedDateFromToday(-4, -2 ,0),
			productPrice: 5.80,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Water",
			orderTime: getIcrementedDateFromToday(-9, 0 ,0),
			productPrice: 1.30,
			productQuantity: 1,
			currency: "EUR"
		},
		{
			productType: "Beer",
			orderTime: getIcrementedDateFromToday(-8, 0 ,0),
			productPrice: 4.60,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Soda",
			orderTime: getIcrementedDateFromToday(0, -1 ,-1),
			productPrice: 1.60,
			productQuantity: 4,
			currency: "EUR"
		},
		{
			productType: "Soda",
			orderTime: getIcrementedDateFromToday(0, 0 ,0),
			productPrice: 4.00,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Orange Juice",
			orderTime: UI5Date.getInstance(2021, 5, 9, 15, 15, 0),
			productPrice: 5.00,
			productQuantity: 1,
			currency: "EUR"
		},
		{
			productType: "Burger",
			orderTime: UI5Date.getInstance(2021, 5, 8, 10, 15, 0),
			productPrice: 12.40,
			productQuantity: 3,
			currency: "EUR"
		},
		{
			productType: "Pizza",
			orderTime: UI5Date.getInstance(2021, 5, 8, 10, 15, 0),
			productPrice: 5.30,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Toast",
			orderTime: getIcrementedDateFromToday(-1, -1 ,0),
			productPrice: 3.90,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Coffee",
			orderTime: getIcrementedDateFromToday(-4, -2 ,0),
			productPrice: 2.00,
			productQuantity: 5,
			currency: "EUR"
		},
		{
			productType: "Strawberry Smoothie",
			orderTime: getIcrementedDateFromToday(-1, -2 ,0),
			productPrice: 5.80,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Water",
			orderTime: getIcrementedDateFromToday(-3, 0 ,0),
			productPrice: 1.30,
			productQuantity: 1,
			currency: "EUR"
		},
		{
			productType: "Beer",
			orderTime: getIcrementedDateFromToday(-3, 0 ,0),
			productPrice: 5.60,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Toast",
			orderTime: getIcrementedDateFromToday(-4, -1 ,0),
			productPrice: 5.90,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Coffee",
			orderTime: getIcrementedDateFromToday(-12, -2 ,0),
			productPrice: 2.00,
			productQuantity: 5,
			currency: "EUR"
		},
		{
			productType: "Strawberry Smoothie",
			orderTime: getIcrementedDateFromToday(-12, -2 ,0),
			productPrice: 7.80,
			productQuantity: 2,
			currency: "EUR"
		},
		{
			productType: "Water",
			orderTime: getIcrementedDateFromToday(-3, 0 ,0),
			productPrice: 1.30,
			productQuantity: 1,
			currency: "EUR"
		},
		{
			productType: "Wine",
			orderTime: UI5Date.getInstance(2021, 5, 8, 10, 15, 0),
			productPrice: 5.34,
			productQuantity: 1,
			currency: "EUR"
		},
		{
			productType: "Turkey",
			orderTime: getChristmasDay(iCurrentYear - 1),
			productPrice: 20.00,
			productQuantity: 1,
			currency: "EUR"
		}
	];

	const DynamicDateRangeController = Controller.extend(".sample.DynamicDateRangeWithCustomOptions.DynamicDateRangeWithCustomOptions", {

		onInit: function() {
			aOrders.forEach(function(x) {
				x.totalPrice = x.productQuantity * x.productPrice;
			});
			const oView = this.getView();
			const oDynamicDateRange = oView.byId("dynamic-range");
			oDynamicDateRange.addGroup("Custom", "Custom Options");
			const oCustomPreviousXWeekendOption = new CustomPreviousXWeekend({
				key: "X To Last Weekend",
				valueTypes: ["int"]
			});
			const oCustomPreviousXWorkWeekOption = new CustomPreviousXWorkWeek({
				key: "X To Last Work Week",
				valueTypes: ["int"]
			});
			const oCustomLastChristmasOption = new CustomLastChristmas({
				key: "Last Christmas",
				valueTypes: ['date']
			});
			oDynamicDateRange.addAggregation("customOptions", oCustomPreviousXWeekendOption);
			oDynamicDateRange.addAggregation("customOptions", oCustomPreviousXWorkWeekOption);
			oDynamicDateRange.addAggregation("customOptions", oCustomLastChristmasOption);

			const oModel = new JSONModel({
					orders: aOrders
				});

			const oEnvModel = new JSONModel({
					filterInputWidth: !Device.system.phone ? '300px' : "auto"
				});

			oView.setModel(oModel);
			oView.setModel(oEnvModel, "env");
		},

		onChange: function(oEvent) {
			const oDynamicDateRange = oEvent.getSource(),
				bValid = oEvent.getParameter("valid");
				let oTableItemsBinding, oValue, oTable, oFilter;

			if (bValid) {
				oTable = this.getView().byId("orders-table");
				oTableItemsBinding = oTable.getBinding("items");
				oValue = oEvent.getParameter("value");
				oFilter = this._createFilter(oValue, oEvent.getSource());
				oTableItemsBinding.filter(oFilter, FilterType.Application);
				oDynamicDateRange.setValueState(ValueState.None);
			} else {
				oDynamicDateRange.setValueState(ValueState.Error);
			}
		},

		_createFilter: function(oValue, oDynamicDateRange) {
			if (oValue) {
				const aDates = oDynamicDateRange.toDates(oValue);
				if (oValue.operator === "FROM" || oValue.operator === "FROMDATETIME") {
					return new Filter("PerfomDateTime", FilterOperator.GT, aDates[0]);
				} else if (oValue.operator === "TO" || oValue.operator === "TODATETIME") {
					return new Filter("PerfomDateTime", FilterOperator.LT, aDates[0]);
				}
				return new Filter("orderTime", FilterOperator.BT, aDates[0], aDates[1]);
			} else {
				// Reset the curretnly applied filters
				return [];
			}
		},

		_dateFormatter: function(oDate) {
			return DateFormat.getDateTimeInstance({pattern: "MMMM dd YY, hh:mm:ss"}).format(oDate);
		}
	});


	return DynamicDateRangeController;

});