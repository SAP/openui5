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
	"sap/ui/unified/CalendarMonthInterval",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/library",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/Element"
], function(
	Button,
	Input,
	Label,
	MessageToast,
	ScrollContainer,
	SelectList,
	ToggleButton,
	CalendarType,
	oCore,
	DateFormat,
	Item,
	coreLibrary,
	Device,
	Form,
	FormContainer,
	FormElement,
	ResponsiveGridLayout,
	layoutLibrary,
	Calendar,
	CalendarLegend,
	CalendarLegendItem,
	CalendarMonthInterval,
	DateRange,
	DateTypeRange,
	unifiedLibrary,
	UI5Date,
	Element
) {
	"use strict";

	var BackgroundDesign = layoutLibrary.BackgroundDesign;
	var CalendarDayType = unifiedLibrary.CalendarDayType;
	var ValueState = coreLibrary.ValueState;

	var oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: CalendarType.Gregorian});

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
		["20151225", "20141226" ,"Weihnachten", 1],
		["20151231", undefined, "Silvester", 2],
		["20160101", undefined, "Neujahr", 1],
		["20160106", undefined, "Heilige Drei Könige", 1],
		["20150804", "20140810", "Urlaub", 3],
		["20160201", undefined, "Type01", 1],
		["20160301", undefined, "Type02", 2],
		["20160401", undefined, "Type03", 3],
		["20160501", undefined, "Type04", 4],
		["20160601", undefined, "Type05", 5],
		["20160701", undefined, "Type06", 6],
		["20160801", undefined, "Type07", 7],
		["20160901", undefined, "Type08", 8],
		["20161001", undefined, "Type09", 9],
		["20161101", undefined, "Type10", 10]
	];

	new CalendarMonthInterval("Cal1",{
		width: Device.system.phone ? "340px" : "464px",
		legend: "Legend1",
		ariaLabelledBy: "H-C1",
		select: function(oEvent){
			var oTF = Element.registry.get("TF1");
			var oCalendar = oEvent.oSource;
			var aSelectedDates = oCalendar.getSelectedDates();
			var oDate;
			if (aSelectedDates.length > 0 ) {
				oDate = aSelectedDates[0].getStartDate();
				oTF.setValue(oFormatYyyymmdd.format(oDate));
			} else {
				oTF.setValue("");
			}
		},
		cancel: function(oEvent){
			MessageToast.show("Cancel");
		},
		startDateChange: function(oEvent){
			var oTF = Element.registry.get("TF2");
			var oCalendar = oEvent.oSource;
			var oDate = oCalendar.getStartDate();
			oTF.setValue(oFormatYyyymmdd.format(oDate));
		}
	}).placeAt("sample1");

	var oForm = new Form("F1", {
		title: "Actions for CalendarMonthInterval",
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
					Element.registry.get("Cal1").focusDate(UI5Date.getInstance());
				}
			}),
			new ToggleButton({
				text: "special days",
				press: function(oEvent){
					var bPressed = oEvent.getParameter("pressed");
					if (bPressed) {
						for (var i = 0; i < aSpecialDays.length; i++) {
							var aSpecialDay = aSpecialDays[i];
							var sType = "";
							if (aSpecialDay[3] < 10) {
								sType = "Type0" + aSpecialDay[3];
							} else {
								sType = "Type" + aSpecialDay[3];
							}
							Element.registry.get("Cal1").addSpecialDate(new DateTypeRange({
								startDate: oFormatYyyymmdd.parse(aSpecialDay[0]),
								endDate: oFormatYyyymmdd.parse(aSpecialDay[1]),
								type: sType,
								tooltip: aSpecialDay[2]
							}));
						}
					} else {
						Element.registry.get("Cal1").destroySpecialDates();
					}
				}
			})
		]
	});
	oFormContainer.addFormElement(oFormElement);

	oFormElement = new FormElement("F1E2", {
		label: "selected date",
		fields: [
			new Input("TF1", {
				editable: true,
				width: "9rem",
				placeholder: "yyyyMMdd",
				change: function(oEvent){
					var sValue = oEvent.getParameter('newValue');
					var oCalendar = Element.registry.get("Cal1");
					if (sValue.length == 8 && !isNaN(sValue)){
						var oDate = oFormatYyyymmdd.parse(sValue);
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
			new Input("TF2",{
				editable: true,
				width: "9rem",
				placeholder: "yyyyMMdd",
				change: function(oEvent){
					var oTF = oEvent.oSource;
					var sValue = oEvent.getParameter('newValue');
					var oCalendar = Element.registry.get("Cal1");
					var oDate = oFormatYyyymmdd.parse(sValue);
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
				width: "9rem",
				placeholder: "yyyyMMdd",
				change: function(oEvent){
					var sValue = oEvent.getParameter('newValue');
					var oCalendar = Element.registry.get("Cal1");
					var oDate;
					if (sValue.length == 8 && !isNaN(sValue)){
						oDate = oFormatYyyymmdd.parse(sValue);
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
			new Input("TF-max", {
				editable: true,
				width: "9rem",
				placeholder: "yyyyMMdd",
				change: function(oEvent){
					var sValue = oEvent.getParameter('newValue');
					var oCalendar = Element.registry.get("Cal1");
					var oDate;
					if (sValue.length == 8 && !isNaN(sValue)){
						oDate = oFormatYyyymmdd.parse(sValue);
					}
					oCalendar.setMaxDate(oDate);
				}
			})
		]
	});
	oFormContainer.addFormElement(oFormElement);

	// single interval selection
	var oStartDate = UI5Date.getInstance();
	oStartDate.setDate(15);
	oStartDate.setMonth(oStartDate.getMonth() - 1);
	new CalendarMonthInterval("Cal2",{
		width: Device.system.phone ? "340px" : "496px",
		startDate: oStartDate,
		months: 6,
		intervalSelection: true,
		ariaLabelledBy: ["H-C2"],
		select: function(oEvent){
			var oTF1 = Element.registry.get("TF2-start");
			var oTF2 = Element.registry.get("TF2-end");
			var oCalendar = oEvent.oSource;
			var aSelectedDates = oCalendar.getSelectedDates();
			var oDate;
			if (aSelectedDates.length > 0 ) {
				oDate = aSelectedDates[0].getStartDate();
				if (oDate) {
					oTF1.setValue(oFormatYyyymmdd.format(oDate));
				} else {
					oTF1.setValue("");
				}
				oDate = aSelectedDates[0].getEndDate();
				if (oDate) {
					oTF2.setValue(oFormatYyyymmdd.format(oDate));
				} else {
					oTF2.setValue("");
				}
			} else {
				oTF1.setValue("");
				oTF2.setValue("");
			}
		}
	}).placeAt("sample2");

	new Label({text: "selected date from: ", labelFor: "TF2-start"}).placeAt("event2");
	new Input("TF2-start",{
		width: "9rem",
		editable: false
	}).placeAt("event2");
	new Label({text: "to: ", labelFor: "TF2-end"}).placeAt("event2");
	new Input("TF2-end",{
		width: "9rem",
		editable: false
	}).placeAt("event2");

	new CalendarMonthInterval("Cal3",{
		months: 24,
		intervalSelection: false,
		singleSelection: false,
		pickerPopup: true,
		ariaLabelledBy: "H-C3",
		select: function(oEvent){
			var oLB = Element.registry.get("LB");
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
						oItem.setText(oFormatYyyymmdd.format(oDate));
					} else {
						oItem.setText("");
					}
				}
				if (aItems.length > 10) {
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
		width: "8rem"
	});

	new ScrollContainer({
		height: "9rem",
		vertical: true,
		content: [oListBox]
	}).placeAt("event3");

	// TODO not aggregated anywhere?
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
