sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/m/App",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/DateTimePicker",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/ToggleButton",
	"sap/ui/core/Element",
	"sap/ui/core/library",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/library",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/DateTime",
	"sap/ui/core/date/UI5Date"
], function(
	Localization,
	App,
	Bar,
	Button,
	DateTimePicker,
	Input,
	Label,
	Page,
	ToggleButton,
	Element,
	coreLibrary,
	DateTypeRange,
	unifiedLibrary,
	CalendarLegend,
	CalendarLegendItem,
	JSONModel,
	DateTime,
	UI5Date
) {
	"use strict";

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = unifiedLibrary.CalendarDayType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var app = new App("myApp");

	function createFooter(){
		return new Bar({
			contentMiddle: [new Button({
				text: "DateTimePicker",
				press: function(){
					app.to("page1");
				}
			})]
		});
	}

	var iEvent = 0;

	function handleChange(oEvent){
		var oDTP = oEvent.getSource();
		var oInput = Element.getElementById("I2");
		var sValue = oEvent.getParameter("value");
		var bValid = oEvent.getParameter("valid");
		iEvent++;
		oInput.setValue("Change - Event " + iEvent + ": DateTimePicker " + oDTP.getId() + ":" + sValue + " ;valid: " + bValid);
		if (bValid) {
			oDTP.setValueState(ValueState.None);
		} else {
			oDTP.setValueState(ValueState.Error);
		}
	}

	app.attachParseError(
			function(oEvent) {
				var oElement = oEvent.getParameter("element");
				var oValue = oEvent.getParameter('newValue');

				var oInput = Element.getElementById("I2");
				oInput.setValue( "ParseError: Entered value: " + oValue);

				if (oElement.setValueState) {
					oElement.setValueState(ValueState.Error);
				}
			});

	app.attachValidationSuccess(
			function(oEvent) {
				var oElement = oEvent.getParameter("element");
				var oValue = oEvent.getParameter('newValue');

				var oInput = Element.getElementById("I2");
				oInput.setValue( "ValidationSuccess: Entered value: " + oValue);

				if (oElement.setValueState) {
					oElement.setValueState(ValueState.None);
				}
			});

	var handleFieldGroupValidation = function (oEvent) {
		var oDTP = oEvent.getSource();
		var oInput = Element.getElementById("I2");
		oInput.setValue("ValidateFieldGroup - Event: DateTimePicker " + oDTP.getId());
	};

	var oLegend;

	function toggleSpecialDates(oEvent) {
		var bPressed = oEvent.getParameter("pressed");
		var oDTP = Element.getElementById("DTP2");
		if (!oLegend) {
			oLegend = new CalendarLegend("Legend1", {
				items: [
					new CalendarLegendItem("T1", {type: CalendarDayType.Type01, text: "Typ 1"}),
					new CalendarLegendItem("T2", {type: CalendarDayType.Type02, text: "Typ 2"}),
					new CalendarLegendItem("T3", {type: CalendarDayType.Type03, text: "Typ 3"}),
					new CalendarLegendItem("T4", {type: CalendarDayType.Type04, text: "Typ 4"}),
					new CalendarLegendItem("T5", {type: CalendarDayType.Type05, text: "Typ 5"}),
					new CalendarLegendItem("T6", {type: CalendarDayType.Type06, text: "Typ 6"}),
					new CalendarLegendItem("T7", {type: CalendarDayType.Type07, text: "Typ 7"}),
					new CalendarLegendItem("T8", {type: CalendarDayType.Type08, text: "Typ 8"}),
					new CalendarLegendItem("T9", {type: CalendarDayType.Type09, text: "Typ 9"}),
					new CalendarLegendItem("T10", {type: CalendarDayType.Type10, text: "Typ 10"})
				]
			});
			oDTP.setLegend(oLegend);
		}
		if (bPressed) {
			for (var i = 0; i < 10; i++) {
				var oDate = UI5Date.getInstance(oDTP.getDateValue());
				oDate.setDate(oDate.getDate() + i);
				var sType = "Type" + (i < 9 ? "0" + (i + 1) : "10");
				var oSpecialDate = new DateTypeRange({startDate: oDate, type: sType});
				oDTP.addSpecialDate(oSpecialDate);
			}
		} else {
			oDTP.destroySpecialDates();
		}
	}

	var oModel = new JSONModel();
	oModel.setData({
		dateValue: UI5Date.getInstance()
	});
	app.setModel(oModel);

	var page1 = new Page("page1", {
		title:"Mobile DateTimePicker",
		titleLevel: TitleLevel.H1,
		content : [
			new Label({text: "initial DateTimePicker", labelFor: "DTP1"}),
			new DateTimePicker("DTP1", { fieldGroupIds: ["group1"], change: handleChange, validateFieldGroup: handleFieldGroupValidation }),
			new Label({text: "initial DateTimePicker initialFocusedDateValue UI5Date.getInstance(2017, 5, 13, 11, 12, 13)", labelFor: "DTP1_v0"}),
			new DateTimePicker("DTP1_v0", { fieldGroupIds: ["group1"], change: handleChange, validateFieldGroup: handleFieldGroupValidation, initialFocusedDateValue: UI5Date.getInstance(2017, 5, 13, 11, 12, 13) }),
			new Label({text: "DateTimePicker with given Value, Formatter, and with shortcuts for current date and current time", labelFor: "DTP2"}),
			new DateTimePicker("DTP2", { value: "2016-02-16,12-50-30", valueFormat: "yyyy-MM-dd,HH-mm-ss", displayFormat: "long/short", showCurrentDateButton: true, showCurrentTimeButton: true, fieldGroupIds: ["group1"], change: handleChange, validateFieldGroup: handleFieldGroupValidation }),
			new ToggleButton("TB1", { text: "specialDates", press: toggleSpecialDates}),
			new Label({text: "DateTimePicker with given DateValue and Formatter", labelFor: "DTP3", width: "100%"}),
			new DateTimePicker("DTP3", { dateValue: UI5Date.getInstance(2016, 1, 16, 12, 50, 30), displayFormat: "short", change: handleChange }),
			new Label({text: "readonly DateTimePicker with given DateValue and Formatter", labelFor: "DTP4"}),
			new DateTimePicker("DTP4", { dateValue: UI5Date.getInstance(2016, 1, 16, 12, 50, 30), displayFormat: "yyyy-MM-dd, HH:mm:ss", editable: false, change: handleChange }),
			new Label({text: "disabled DateTimePicker with given DateValue and Formatter", labelFor: "DTP5"}),
			new DateTimePicker("DTP5", { dateValue: UI5Date.getInstance(2016, 1, 16, 12, 50, 30), displayFormat: "yyyy-MM-dd, HH:mm:ss", enabled: false, change: handleChange }),
			new Label({text: "DateTimePicker using DataBinding", labelFor: "DTP6"}),
			new DateTimePicker("DTP6", {
				value: {
					path: "/dateValue",
					type: new DateTime({style: "medium", strictParsing: true})}/*,
				change: handleChange*/ }),
			new Label({text: "Data Model for DateTimePicker using DataBinding", labelFor: "I1"}),
			new Input("I1", {
				value: {
					path: "/dateValue",
					type: new DateTime({style: "long"})},
				editable: false}),
			new Label({text: "islamic DateTimePicker with secondary gregorianic", labelFor: "DTP7"}),
			new DateTimePicker("DTP7", { displayFormatType: "Islamic", secondaryCalendarType: "Gregorian", change: handleChange }),
			new Label({text: "DateTimePicker with minDate=2016-01-01 and maxDate=2016-12-31", labelFor: "DP8"}),
			new DateTimePicker("DP8", { minDate: UI5Date.getInstance(2016, 0, 1, 0, 0, 0), maxDate: UI5Date.getInstance(2016, 11, 31, 23, 59, 59), change: handleChange }),
			new Label({text: "DateTimePicker events display", labelFor: "I2"}),
			new Input("I2", {value: "Content of events DateTimePicker", editable: false}),
			new Label({text: "DateTimePicker with minutesStep: 3, secondsStep: 5", labelFor: "DP9"}),
			new DateTimePicker("DP9", { minutesStep: 3, secondsStep: 5 })
		],
		footer: createFooter()
	});

	app.addPage(page1);

	app.placeAt("body");
});
