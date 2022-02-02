sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/LocaleData',
	'sap/ui/core/format/DateFormat',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/FilterType',
	'sap/ui/model/json/JSONModel',
	'sap/m/DynamicDateUtil',
	'sap/m/DynamicDateValueHelpUIType',
	'sap/m/StepInput',
	'sap/m/Label',
	'sap/m/CustomDynamicDateOption',
	'sap/ui/core/library',
	'sap/ui/Device',
	"sap/ui/core/Core"
], function(
	Controller,
	LocaleData,
	DateFormat,
	Filter,
	FilterOperator,
	FilterType,
	JSONModel,
	DynamicDateUtil,
	DynamicDateValueHelpUIType,
	StepInput,
	Label,
	CustomDynamicDateOption,
	coreLibrary,
	Device,
	oCore
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	function getIcrementedDateFromToday(iDays, iMonths, iYears) {
		var oResultingDate = new Date();

		oResultingDate.setFullYear(oResultingDate.getFullYear() + iYears);
		oResultingDate.setMonth(oResultingDate.getMonth() + iMonths);
		oResultingDate.setUTCDate(oResultingDate.getUTCDate() + iDays);

		return oResultingDate;
	}

	function createValueHelpUIHelper(oControl, fnControlsUpdated) {
		var oLabel = new Label({
			text: this.getKey(),
			width: "100%"
		});
		var oStepInput = new StepInput({ min: 1
		}).addStyleClass("sapUiSmallMarginTop");

		oControl.aControlsByParameters = {};
		oControl.aControlsByParameters[this.getKey()] = [];

		if (fnControlsUpdated instanceof Function) {
			oStepInput.attachChange(function() {
				fnControlsUpdated(this);
			}, this);
		}

		oControl.aControlsByParameters[this.getKey()].push(oStepInput);

		return [oLabel, oStepInput];
	}

	function validateValueHelpUIHelper(oControl) {
		var oStepInput = oControl.aInputControls[1];

		return oStepInput.getValue() > 0;
	}

	var aOrders = [
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
			orderTime: new Date(2021, 5, 9, 15, 15, 0),
			productPrice: 5.00,
			productQuantity: 1,
			currency: "EUR"
		},
		{
			productType: "Burger",
			orderTime: new Date(2021, 5, 8, 10, 15, 0),
			productPrice: 12.40,
			productQuantity: 3,
			currency: "EUR"
		},
		{
			productType: "Pizza",
			orderTime: new Date(2021, 5, 8, 10, 15, 0),
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
			orderTime: new Date(2021, 5, 8, 10, 15, 0),
			productPrice: 5.34,
			productQuantity: 1,
			currency: "EUR"
		}
	];

	var DynamicDateRangeController = Controller.extend(".sample.DynamicDateRangeWithCustomOptions.DynamicDateRangeWithCustomOptions", {

		onInit: function() {
			aOrders.forEach(function(x) {
				x.totalPrice = x.productQuantity * x.productPrice;
			});
			DynamicDateUtil.addOption(this.oCustomOptionForPreviousWeekend());
			DynamicDateUtil.addOption(this.oCustomOptionForPreviousWorkWeek());
			var oModel = new JSONModel({
					orders: aOrders,
					dynamicDateFilterKeys: DynamicDateUtil.getAllOptionKeys()
				}),
				oEnvModel = new JSONModel({
					filterInputWidth: !Device.system.phone ? '300px' : "auto"
				}),
				oView = this.getView();

			oView.setModel(oModel);
			oView.setModel(oEnvModel, "env");
		},

		onChange: function(oEvent) {
			var oDynamicDateRange = oEvent.getSource(),
				bValid = oEvent.getParameter("valid"),
				oTableItemsBinding, oValue, oTable, oFilter;

			if (bValid) {
				oTable = this.getView().byId("orders-table");
				oTableItemsBinding = oTable.getBinding("items");
				oValue = oEvent.getParameter("value");
				oFilter = this._createFilter(oValue);
				oTableItemsBinding.filter(oFilter, FilterType.Application);
				oDynamicDateRange.setValueState(ValueState.None);
			} else {
				oDynamicDateRange.setValueState(ValueState.Error);
			}
		},

		_createFilter: function(oValue) {
			if (oValue) {
				var aDates = DynamicDateUtil.toDates(oValue);
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
		},

		oCustomOptionForPreviousWeekend: function() {
			return new CustomDynamicDateOption({
				key: "X To Last Weekend",
				valueTypes: ["int"],
				getValueHelpUITypes: function() {
					return [new DynamicDateValueHelpUIType({ type: "int" })];
				},
				createValueHelpUI: createValueHelpUIHelper,
				format: function(oValue) {
					return oValue.values[0] + " To Last Weekend";
				},
				parse: function(sValue) {
					var oResult,
						sVal = sValue,
						iNumberEnd = sVal.indexOf(" ");
					if (iNumberEnd > -1) {
						oResult = {};
						oResult.operator = "XtoLastWeekend";
						oResult.values = [parseInt(sVal.slice(0, iNumberEnd))];
					}

					return oResult;
				},
				validateValueHelpUI: validateValueHelpUIHelper,
				toDates: function(oValue) {
					var oLocale = oCore.getConfiguration().getLocale();
					var oLocaleData = new LocaleData(oLocale);
					var iValue = oValue.values[0];
					var oSaturdayDate = new Date();
					var oSundayDate = new Date();
					var iDaysInWeek = 7;

					// Move to the exact week
					oSaturdayDate.setUTCDate(oSaturdayDate.getUTCDate() - iDaysInWeek * iValue);
					oSundayDate.setUTCDate(oSundayDate.getUTCDate() - iDaysInWeek * iValue);

					//Pick the week days
					oSaturdayDate.setUTCDate(oSaturdayDate.getUTCDate() + (oLocaleData.getWeekendStart() - oSaturdayDate.getUTCDay()));
					oSundayDate.setUTCDate(oSundayDate.getUTCDate() + (oLocaleData.getWeekendStart() + 1 - oSundayDate.getUTCDay()));

					return [oSaturdayDate, oSundayDate];
				}
			});
		},

		oCustomOptionForPreviousWorkWeek: function() {
			return new CustomDynamicDateOption({
				key: "X To Last Work Week",
				valueTypes: ["int"],
				getValueHelpUITypes: function() {
					return [new DynamicDateValueHelpUIType({ type: "int" })];
				},
				createValueHelpUI: createValueHelpUIHelper,
				format: function(oValue) {
					return oValue.values[0] + " To Last Work Week";
				},
				parse: function(sValue) {
					var oResult,
						sVal = sValue,
						iNumberEnd = sVal.indexOf(" ");
					if (iNumberEnd > -1) {
						oResult = {};
						oResult.operator = "XtoLastWorkWeek";
						oResult.values = [parseInt(sVal.slice(0, iNumberEnd))];
					}

					return oResult;
				},
				validateValueHelpUI: validateValueHelpUIHelper,
				toDates: function(oValue) {
					var oLocale = oCore.getConfiguration().getLocale();
					var oLocaleData = new LocaleData(oLocale);
					var iValue = oValue.values[0];
					var aResultDateRange = [new Date(), new Date()];
					var iDaysInWeek = 7;
					var iDaysInWorkWeek = 5;
					var iFirstWorkDay = oLocaleData.getWeekendEnd() + 1;

					// Initiate and set the date to the selected week.
					aResultDateRange[0].setUTCDate(aResultDateRange[0].getUTCDate() - iDaysInWeek * iValue);
					aResultDateRange[1].setUTCDate(aResultDateRange[1].getUTCDate() - iDaysInWeek * iValue);

					//Pick the week days
					aResultDateRange[0].setUTCDate(aResultDateRange[0].getUTCDate() + (iFirstWorkDay - aResultDateRange[0].getUTCDay()));
					aResultDateRange[1].setUTCDate(aResultDateRange[1].getUTCDate() + (iDaysInWorkWeek - 1 + iFirstWorkDay - aResultDateRange[1].getUTCDay()));

					return aResultDateRange;
				}
			});
		}
	});


	return DynamicDateRangeController;

});