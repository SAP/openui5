sap.ui.define([
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/ScrollContainer",
	"sap/m/SelectList",
	"sap/m/ToggleButton",
	"sap/ui/core/CalendarType",
	"sap/ui/core/Core",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Item",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/library",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/CalendarTimeInterval",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/library"
], function(Button, Input, Label, MessageToast, ScrollContainer, SelectList, ToggleButton, CalendarType, oCore, DateFormat, Item, coreLibrary, Device, Form, FormContainer, FormElement, ResponsiveGridLayout, layoutLibrary, Calendar, CalendarLegend, CalendarLegendItem, CalendarTimeInterval, DateRange, DateTypeRange, unifiedLibrary) {
	"use strict";

	var BackgroundDesign = layoutLibrary.BackgroundDesign;
	var CalendarDayType = unifiedLibrary.CalendarDayType;
	var ValueState = coreLibrary.ValueState;

	var oFormatYyyyMMddHHmmss = DateFormat.getInstance({pattern: "yyyyMMddHHmmss", calendarType: CalendarType.Gregorian});

	var aSpecialDays = [
		["20150101", undefined, "Neujahr", 1],
		["20150106", undefined, "Heilige Drei Könige", 1],
		["20150214", undefined, "Valentinstag", 2],
		["20150216", undefined, "Rosenmontag", 2],
		["20150217", undefined, "Fastnacht", 2],
		["20150218", undefined, "Aschermittwoch", 2],
		["20150403", undefined, "Karfreitag", 1],
		["20150405", undefined, "Ostersonntag", 1],
		["20150406", undefined, "Ostermontag", 1],
		["20150501", undefined, "Maifeiertag", 1],
		["20150510", undefined, "Muttertag", 2],
		["20150514", undefined, "Christi Himmelfahrt", 1],
		["20150524", undefined, "Pfingstsonntag", 1],
		["20150525", undefined, "Pfingstmontag", 1],
		["20150604", undefined, "Fronleichnam", 1],
		["20150815", undefined, "Mariä Himmelfahrt", 2],
		["20151003", undefined, "Tag der Deutschen Einheit", 1],
		["20151004", undefined, "Erntedankfest", 2],
		["20151031", undefined, "Reformationstag", 2],
		["20151101", undefined, "Allerheiligen", 1],
		["20151115", undefined, "Volkstrauertag", 2],
		["20151118", undefined, "Buß- und Bettag", 2],
		["20151122", undefined, "Totensonntag", 2],
		["20151129", undefined, "1. Advent", 2],
		["20151206", undefined, "Nikolaus", 2],
		["20151206", undefined, "2. Advent", 2],
		["20151213", undefined, "3. Advent", 2],
		["20151220", undefined, "4. Advent", 2],
		["20151224", undefined, "Heiligabend", 2],
		["20151225", "20141226", "Weihnachten", 1],
		["20151231", undefined, "Silvester", 2],
		["20160101", undefined, "Neujahr", 1],
		["20160106", undefined, "Heilige Drei Könige", 1],
		["20150804", "20140810", "Urlaub", 3]
	];

	new CalendarTimeInterval("Cal1",{
		width: Device.system.phone ? "340px" : "608px",
		legend: "Legend1",
		select: function(oEvent){
			var oTF = oCore.byId("TF1");
			var oCalendar = oEvent.oSource;
			var aSelectedDates = oCalendar.getSelectedDates();
			var oDate;
			if (aSelectedDates.length > 0 ) {
				oDate = aSelectedDates[0].getStartDate();
				oTF.setValue(oFormatYyyyMMddHHmmss.format(oDate));
			} else {
				oTF.setValue("");
			}
		},
		cancel: function(oEvent){
			MessageToast.show("Cancel");
		},
		startDateChange: function(oEvent){
			var oTF = oCore.byId("TF2");
			var oCalendar = oEvent.oSource;
			var oDate = oCalendar.getStartDate();
			oTF.setValue(oFormatYyyyMMddHHmmss.format(oDate));
		}
	}).placeAt("sample1");

	var oForm = new Form("F1", {
		title: "Actions for CalendarTimeInterval",
		layout: new ResponsiveGridLayout("L1", {
			breakpointM: 350,
			labelSpanL: 6,
			labelSpanM: 6,
			backgroundDesign: BackgroundDesign.Transparent
		}),
		width: "100%"
	}).placeAt("event1");

	var oFormContainer = new FormContainer("F1C1");
	oForm.addFormContainer(oFormContainer);

	var oFormElement = new FormElement("F1E1", {
		fields: [
			new Button({
				text: "focus now",
				press: function(oEvent){
					oCore.byId("Cal1").focusDate(new Date());
				}
			}),
			new ToggleButton({
				text: "special days",
				press: function(oEvent){
					var bPressed = oEvent.getParameter("pressed");
					var oCal = oCore.byId("Cal1");
					if (bPressed) {
						var sType = "";
						for (var i = 0; i < aSpecialDays.length; i++) {
							var aSpecialDay = aSpecialDays[i];
							sType = "";
							if (aSpecialDay[3] < 10) {
								sType = "Type0" + aSpecialDay[3];
							} else {
								sType = "Type" + aSpecialDay[3];
							}
							oCal.addSpecialDate(new DateTypeRange({
								startDate: oFormatYyyyMMddHHmmss.parse(aSpecialDay[0]),
								endDate: oFormatYyyyMMddHHmmss.parse(aSpecialDay[1]),
								type: sType,
								tooltip: aSpecialDay[2]
							}));
						}

						var oDate;
						for ( i = 1; i <= 10; i++) {
							oDate = new Date();
							oDate.setHours(oDate.getHours() + i);
							sType = "";
							if (i < 10) {
								sType = "Type0" + i;
							} else {
								sType = "Type" + i;
							}
							oCal.addSpecialDate(new DateTypeRange({
								startDate: oDate,
								type: sType,
								tooltip: sType
							}));
						}

						oDate = new Date();
						oDate.setDate(oDate.getDate() + 1);
						var oDate2 = new Date();
						oDate2.setDate(oDate2.getDate() + 1);
						oDate2.setHours(oDate2.getHours() + 3);
						sType = "Type01";
						oCal.addSpecialDate(new DateTypeRange({
							startDate: oDate,
							endDate: oDate2,
							type: sType,
							tooltip: "Test"
						}));
					} else {
						oCal.destroySpecialDates();
					}
				}
			})
		]
	});
	oFormContainer.addFormElement(oFormElement);

	oFormElement = new FormElement("F1E2", {
		label: "selected date",
		fields: [
			new Input("TF1",{
				editable: true,
				width: "10rem",
				placeholder: "yyyyMMddHHmmss",
				change: function(oEvent){
					var sValue = oEvent.getParameter('newValue');
					var oCalendar = oCore.byId("Cal1");
					if (sValue.length == 8 && !isNaN(sValue)){
						var oDate = oFormatYyyyMMddHHmmss.parse(sValue);
						var aSelectedDates = oCalendar.getSelectedDates();
						var oDateRange;
						if (aSelectedDates.length == 0 ) {
							oDateRange = new DateRange({startDate: oDate});
							oCalendar.addSelectedDate(oDateRange);
						} else {
							oDateRange = aSelectedDates[0];
							oDateRange.setStartDate(oDate);
						}
					} else if (!sValue){
						oCalendar.destroySelectedDates();
					}
				}
			})
		]
	});
	oFormContainer.addFormElement(oFormElement);

	oFormElement = new FormElement("F1E3", {
		label: "start date",
		fields: [
			new Input("TF2", {
				editable: true,
				width: "10rem",
				placeholder: "yyyyMMddHHmmss",
				change: function(oEvent){
					var oTF = oEvent.oSource;
					var sValue = oEvent.getParameter('newValue');
					var oCalendar = oCore.byId("Cal1");
					var oDate = oFormatYyyyMMddHHmmss.parse(sValue);
					if (oDate){
						oCalendar.setStartDate(oDate);
						oTF.setValueState(ValueState.None);
					} else {
						oTF.setValueState(ValueState.Error);
					}
				}
			})
		]
	});
	oFormContainer.addFormElement(oFormElement);

	oFormElement = new FormElement("F1E4", {
		label: "minimum date",
		fields: [
			new Input("TF-min",{
				editable: true,
				width: "10rem",
				placeholder: "yyyyMMddHHmmss",
				change: function(oEvent){
					var sValue = oEvent.getParameter('newValue');
					var oCalendar = oCore.byId("Cal1");
					var oDate;
					if (sValue.length == 14 && !isNaN(sValue)){
						oDate = oFormatYyyyMMddHHmmss.parse(sValue);
					}
					oCalendar.setMinDate(oDate);
				}
			})
		]
	});
	oFormContainer.addFormElement(oFormElement);

	oFormElement = new FormElement("F1E5", {
		label: "maximum date",
		fields: [
			new Input("TF-max",{
				editable: true,
				width: "10rem",
				placeholder: "yyyyMMddHHmmss",
				change: function(oEvent){
					var sValue = oEvent.getParameter('newValue');
					var oCalendar = oCore.byId("Cal1");
					var oDate;
					if (sValue.length == 14 && !isNaN(sValue)){
						oDate = oFormatYyyyMMddHHmmss.parse(sValue);
					}
					oCalendar.setMaxDate(oDate);
				}
			})
		]
	});
	oFormContainer.addFormElement(oFormElement);

	// single interval selection
	var oStartDate = new Date();
	oStartDate.setHours(oStartDate.getHours() - 1);
	new CalendarTimeInterval("Cal2",{
		width: "500px",
		startDate: oStartDate,
		items: 6,
		intervalMinutes: 30,
		intervalSelection: true,
		ariaLabelledBy: ["H-C2"],
		select: function(oEvent){
			var oTF1 = oCore.byId("TF2-start");
			var oTF2 = oCore.byId("TF2-end");
			var oCalendar = oEvent.oSource;
			var aSelectedDates = oCalendar.getSelectedDates();
			if (aSelectedDates.length > 0 ) {
				var oDate = aSelectedDates[0].getStartDate();
				if (oDate) {
					oTF1.setValue(oFormatYyyyMMddHHmmss.format(oDate));
				} else {
					oTF1.setValue("");
				}
				oDate = aSelectedDates[0].getEndDate();
				if (oDate) {
					oTF2.setValue(oFormatYyyyMMddHHmmss.format(oDate));
				} else {
					oTF2.setValue("");
				}
			} else {
				oTF1.setValue("");
				oTF2.setValue("");
			}
		}
	}).placeAt("sample2");

	new Label({text: "selected date from", labelFor: "TF2-start"}).placeAt("event2");
	new Input("TF2-start",{
		width: "10rem",
		editable: false
	}).placeAt("event2");

	new Label({text: "to", labelFor: "TF2-end"}).placeAt("event2");
	new Input("TF2-end",{
		width: "10rem",
		editable: false
	}).placeAt("event2");

	new CalendarTimeInterval("Cal3",{
		width: "1000px",
		items: 24,
		intervalMinutes: 120,
		intervalSelection: false,
		singleSelection: false,
		pickerPopup: true,
		select: function(oEvent){
			var oLB = oCore.byId("LB");
			var oCalendar = oEvent.oSource;
			var aSelectedDates = oCalendar.getSelectedDates();
			var oDate;
			if (aSelectedDates.length > 0 ) {
				var aItems = oLB.getItems();
				var oItem;
				for (var i = 0; i < aSelectedDates.length; i++){
					oDate = aSelectedDates[i].getStartDate();
					if (aItems[i]) {
						oItem = aItems[i];
					} else {
						oItem = new Item();
						oLB.addItem(oItem);
					}
					if (oDate) {
						oItem.setText(oFormatYyyyMMddHHmmss.format(oDate));
					} else {
						oItem.setText("");
					}
				}
				if (aItems.length > aSelectedDates.length) {
					for (var i = aSelectedDates.length; i < aItems.length; i++){
						oLB.removeItem(i);
						aItems[i].destroy();
					}
				}
			} else {
				oLB.destroyItems();
			}
		}
	}).placeAt("sample3");

	new Label({text: "selected dates", labelFor: "LB"}).placeAt("event3");
	var oListBox = new SelectList("LB",{
		width: "10rem"
	});

	new ScrollContainer({
		height: "10rem",
		vertical: true,
		content: [oListBox]
	}).placeAt("event3");

	// TODO this is not aggregated anywhere
	new CalendarLegend("Legend1", {
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
});

