sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/unified/library",
	"sap/ui/unified/DateTypeRange"
], function(Controller, JSONModel, Core, CoreLibrary, UnifiedLibrary, DateTypeRange) {
	"use strict";
	var CalendarDayType = UnifiedLibrary.CalendarDayType,
		ValueState = CoreLibrary.ValueState;

	return Controller.extend("sap.m.sample.DatePicker.Group", {

		onInit: function () {
			// create model
			var oModel = new JSONModel();
			oModel.setData({
				dateValue: new Date()
			});
			this.getView().setModel(oModel);

			this.byId("DP3").setDateValue(new Date());
			this.byId("DP8").setInitialFocusedDateValue(new Date(2017, 5, 13));
			this.byId("DP6").setMinDate(new Date(2016, 0, 1));
			this.byId("DP6").setMaxDate(new Date(2016, 11, 31));
			this.byId("DP6").setDateValue(new Date(2016, 1, 16));
			this.byId("DP7").addSpecialDate(new DateTypeRange({
				startDate: new Date(2015, 10, 5),
				endDate: new Date(2015, 10, 25),
				type: CalendarDayType.NonWorking
			}));

			this.byId("DP9").setMinDate(new Date(2016, 0, 1));
			this.byId("DP9").setMaxDate(new Date(2019, 11, 31));

			this._iEvent = 0;

			// for the data binding example do not use the change event for check but the data binding parsing events
			Core.attachParseError(
					function(oEvent) {
						var oElement = oEvent.getParameter("element");

						if (oElement.setValueState) {
							oElement.setValueState(ValueState.Error);
						}
					});

			Core.attachValidationSuccess(
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
