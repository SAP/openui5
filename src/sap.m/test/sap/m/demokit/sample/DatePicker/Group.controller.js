sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/library",
	"sap/ui/unified/library",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/core/date/UI5Date"
], function(Controller, JSONModel, CoreLibrary, UnifiedLibrary, DateTypeRange, UI5Date) {
	"use strict";
	var CalendarDayType = UnifiedLibrary.CalendarDayType,
		ValueState = CoreLibrary.ValueState;

	return Controller.extend("sap.m.sample.DatePicker.Group", {

		onInit: function () {
			// create model
			var oModel = new JSONModel();

			oModel.setData({
				valueDP2: UI5Date.getInstance(2014, 2, 26),
				valueDP4: UI5Date.getInstance(),
				valueDP5: UI5Date.getInstance(2015, 10, 23),
				valueDP6: UI5Date.getInstance(2016, 1, 16),
				valueDP7: UI5Date.getInstance(2015, 10, 23),
				valueDP10: UI5Date.getInstance(2015, 10, 23),
				valueDP11: UI5Date.getInstance(2015, 10, 23)
			});
			this.getView().setModel(oModel);

			this.byId("DP8").setInitialFocusedDateValue(UI5Date.getInstance(2017, 5, 13));
			this.byId("DP6").setMinDate(UI5Date.getInstance(2016, 0, 1));
			this.byId("DP6").setMaxDate(UI5Date.getInstance(2016, 11, 31));
			this.byId("DP7").addSpecialDate(new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 10, 5),
				endDate: UI5Date.getInstance(2015, 10, 25),
				type: CalendarDayType.NonWorking
			}));

			this.byId("DP9").setMinDate(UI5Date.getInstance(2016, 0, 1));
			this.byId("DP9").setMaxDate(UI5Date.getInstance(2019, 11, 31));

			this._iEvent = 0;

			// for the data binding example do not use the change event for check but the data binding parsing events
			this.getView().attachParseError(
					function(oEvent) {
						var oElement = oEvent.getParameter("element");

						if (oElement.setValueState) {
							oElement.setValueState(ValueState.Error);
						}
					});

			this.getView().attachValidationSuccess(
					function(oEvent) {
						var oElement = oEvent.getParameter("element");

						if (oElement.setValueState) {
							oElement.setValueState(ValueState.None);
						}
					});
		},

		handleChange: function (oEvent) {
			var oText = this.byId("textResult"),
				oDP = oEvent.getSource(),
				sValue = oEvent.getParameter("value"),
				bValid = oEvent.getParameter("valid");

			this._iEvent++;
			oText.setText("Change - Event " + this._iEvent + ": DatePicker " + oDP.getId() + ":" + sValue);

			if (bValid) {
				oDP.setValueState(ValueState.None);
			} else {
				oDP.setValueState(ValueState.Error);
			}
		},

		handleBtnPress: function (oEvent) {
			var oText = this.byId("textResult2"),
				oDP = this.byId("DP9");

			oText.setText("Value is: " + ((oDP.isValidValue()) ? "valid" : "not valid"));
		}
	});

});
