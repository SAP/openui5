sap.ui.define([
	"sap/m/Bar",
	"sap/m/Button",
	"sap/ui/core/Configuration",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/library",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/m/Page",
	"sap/m/Label",
	"sap/m/DateRangeSelection",
	"sap/m/Text",
	"sap/m/ToggleButton",
	"sap/m/App",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/Element"
], function(
	Bar,
	Button,
	Configuration,
	oCore,
	coreLibrary,
	DateTypeRange,
	unifiedLibrary,
	CalendarLegend,
	CalendarLegendItem,
	Page,
	Label,
	DateRangeSelection,
	MText,
	ToggleButton,
	App,
	UI5Date,
	Element
) {
	"use strict";

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = unifiedLibrary.CalendarDayType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	function createFooter(){
		return new Bar({
			contentMiddle: [new Button({
				text: "DateRangeSelection",
				press: function(){
					app.to("page1");
				}
			})]
		});
	}

	var iEvent = 0;

	function handleChange(oEvent) {
		var oDRS = oEvent.getSource(),
			sFrom = oEvent.getParameter("from"),
			sTo = oEvent.getParameter("to"),
			bValid = oEvent.getParameter("valid");

		iEvent++;

		var oText = Element.registry.get("TextEvent");
		oText.setText("Event " + iEvent + "\nId: " + oEvent.getSource().getId() + "\nFrom: " + sFrom + "\nTo: " + sTo + "\nvalid: " + bValid);
		if (bValid) {
			oDRS.setValueState(ValueState.None);
		} else {
			oDRS.setValueState(ValueState.Error);
		}
	}

	var oLegend;

	function toggleSpecialDates(oEvent) {
		var bPressed = oEvent.getParameter("pressed"),
			oDRS = Element.registry.get("DRS2");

		if (!DateTypeRange) {
			oCore.loadLibrary("sap.ui.unified");
		}
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
			oDRS.setLegend(oLegend);
		}
		if (bPressed) {
			for (var i = 0; i < 10; i++) {
				var oDate = UI5Date.getInstance(oDRS.getDateValue());
				oDate.setDate(oDate.getDate() + i);
				var sType = "Type" + (i < 9 ? "0" + (i + 1) : "10");
				var oSpecialDate = new DateTypeRange({startDate: oDate, type: sType});
				oDRS.addSpecialDate(oSpecialDate);
			}
		} else {
			oDRS.destroySpecialDates();
		}
	}

	//Preparing input UTC dates for testing purposes:
	//From: February 16, 2014  0:00 UTC
	var dateFrom = UI5Date.getInstance();
	dateFrom.setUTCDate(16);
	dateFrom.setUTCMonth(1);
	dateFrom.setUTCFullYear(2014);

	//To: February 27, 2014  0:00 UTC
	var dateTo = UI5Date.getInstance();
	dateTo.setUTCDate(27);
	dateTo.setUTCMonth(1);
	dateTo.setUTCFullYear(2014);

	var page1 = new Page("page1", {
		title:"Mobile DateRangeSelection",
		content : [
			new Label({text: "DRS1 - Initial DateRangeSelection control:", labelFor: "DRS1"}),
			new DateRangeSelection("DRS1", { displayFormat: "dd.MM.yyyy", change: handleChange}),

			new MText({width: "100%"}),new MText({width: "100%"}), // 2 empty lines

			new Label({text: "DRS2 - DateRangeSelection control with given range and with shortcut for today:", labelFor: "DRS2"}),
			new DateRangeSelection("DRS2", { delimiter: "#", displayFormat: "yyyy/MM/dd", dateValue: dateFrom, secondDateValue: dateTo, showCurrentDateButton: true, change: handleChange}),
			new ToggleButton("TB1", { text: "specialDates", press: toggleSpecialDates}),

			new Label({text: "DRS3 - DateRangeSelection control with placeholder from CLDR:", labelFor: "DRS3", width: "100%"}),
			new DateRangeSelection("DRS3", { delimiter: "", displayFormat: "short", change: handleChange}),

			new Label({text: "islamic DateRangeSelection with secondary gregorianic", labelFor: "DRS4"}),
			new DateRangeSelection("DRS4", { displayFormatType: "Islamic", secondaryCalendarType: "Gregorian", change: handleChange }),

			new Label({text: "DateRangeSelection with minDate=2016-01-01 and maxDate=2016-12-31", labelFor: "DRS7"}),
			new DateRangeSelection("DRS7", { minDate: UI5Date.getInstance("2016", "0", "01"), maxDate: UI5Date.getInstance("2016", "11", "31"), change: handleChange }),

			new Label({text: "DateRangeSelection with displayFormat=\"yyyy-MM\"", labelFor: "DRS8"}),
			new DateRangeSelection("DRS8", { displayFormat: "yyyy-MM", change: handleChange}),

			new Label({text: "DateRangeSelection with displayFormat=\"yyyy-MM\"", labelFor: "DRS9"}),
			new DateRangeSelection("DRS9", { displayFormat: "yyyy-MM", change: handleChange, dateValue: UI5Date.getInstance("2019", "5", "1"), secondDateValue: UI5Date.getInstance("2019", "10", "1")}),

			new Label({text: "DateRangeSelection with displayFormat=\"yyyy\"", labelFor: "DRS10"}),
			new DateRangeSelection("DRS10", { displayFormat: "yyyy", change: handleChange }),

			new Label({text: "DateRangeSelection with displayFormat=\"yyyy\"", labelFor: "DRS11"}),
			new DateRangeSelection("DRS11", { displayFormat: "yyyy", change: handleChange, dateValue: UI5Date.getInstance("2019", "5", "1"), secondDateValue: UI5Date.getInstance("2023", "10", "1")}),

			new MText({width: "100%"}), new MText({width: "100%"}),
			new MText({width: "100%"}), new MText({width: "100%"}), // 6 empty lines
			new MText({width: "100%"}), new MText({width: "100%"}),

			new Label({text: "Change event", labelFor: "TextEvent"}),
			new MText("TextEvent", {width: "100%"}),

			new MText({width: "100%"}),new MText({width: "100%"}), // 2 empty lines

			new Label({text: "DRS5 - Error DateRangeSelection:", labelFor: "DRS5"}),
			new DateRangeSelection("DRS5", { displayFormat: "dd.MM.yyyy", valueState: "Error"}),

			new MText({width: "100%"}),new MText({width: "100%"}), // 2 empty lines

			new Label({text: "DRS6 - Warning DateRangeSelection:", labelFor: "DRS6"}),
			new DateRangeSelection("DRS6", { displayFormat: "dd.MM.yyyy",  valueState: "Warning"}),
			new DateRangeSelection("DRS12"),
			new Button("btnEtcGMT-12", {
				text: "Etc/GMT-12",
				press: handleTimezoneButtonPress
			}),
			new Button("btnUTC", {
				text: "UTC",
				press: handleTimezoneButtonPress
			}),
			new Button("btnEtcGMT12", {
				text: "Etc/GMT+12",
				press: handleTimezoneButtonPress
			})
		],
		footer: createFooter()
	});

	var app = new App("myApp");
	app.addPage(page1);
	app.placeAt("body");

	function handleTimezoneButtonPress(e) {
		Configuration.setTimezone(e.getSource().getText());
		Element.registry.get("DRS12").setValue("");
	}
});
