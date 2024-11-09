sap.ui.define([
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/ScrollContainer",
	"sap/m/SelectList",
	"sap/m/ToggleButton",
	"sap/ui/core/CalendarType",
	"sap/ui/core/Element",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Item",
	"sap/ui/core/library",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/library",
	"sap/ui/unified/CalendarMonthInterval",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/core/Title",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/date/UI5Date"
], function(
		Button,
		Input,
		Label,
		MessageToast,
		ScrollContainer,
		SelectList,
		ToggleButton,
		CalendarType,
		Element,
		DateFormat,
		Item,
		coreLibrary,
		Form,
		FormContainer,
		FormElement,
		ResponsiveGridLayout,
		layoutLibrary,
		CalendarMonthInterval,
		DateRange,
		DateTypeRange,
		Title,
		App,
		Page,
		VerticalLayout,
		UI5Date
	) {
	"use strict";

	var BackgroundDesign = layoutLibrary.BackgroundDesign;
	var ValueState = coreLibrary.ValueState;
	var TitleLevel = coreLibrary.TitleLevel;

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

	var oLabel1 = new Label("H-C1", {text: "Single day Selection"});
	var oCalendar1 = new CalendarMonthInterval("Cal1",{
		ariaLabelledBy: "H-C1",
		select: function(oEvent){
			var oInput = Element.getElementById("Input1");
			var oCalendar = oEvent.getSource();
			var aSelectedDates = oCalendar.getSelectedDates();
			var oDate;
			if (aSelectedDates.length > 0 ) {
				oDate = aSelectedDates[0].getStartDate();
				oInput.setValue(oFormatYyyymmdd.format(oDate));
			} else {
				oInput.setValue("");
			}
		},
		cancel: function(oEvent){
			MessageToast.show("Cancel");
		},
		startDateChange: function(oEvent){
			var oInput = Element.getElementById("Input2");
			var oCalendar = oEvent.getSource();
			var oDate = oCalendar.getStartDate();
			oInput.setValue(oFormatYyyymmdd.format(oDate));
		}
	});

	var oForm = new Form("F1", {
		editable: true,
		title: new Title({text: "Control's actions", level: TitleLevel.H2}),
		layout: new ResponsiveGridLayout("L1", {
			breakpointM: 350,
			labelSpanL: 6,
			labelSpanM: 6,
			backgroundDesign: BackgroundDesign.Transparent
		}),
		width: "100%"
	});

	var oFormContainer = new FormContainer("F1C1");
	oForm.addFormContainer(oFormContainer);

	var oFormElement = new FormElement("F1E1", {
		fields: [
			new Button({
				width: "9rem",
				text: "focus now",
				press: function(oEvent){
					Element.getElementById("Cal1").focusDate(UI5Date.getInstance());
				}
			}),
			new ToggleButton({
				width: "9rem",
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
							Element.getElementById("Cal1").addSpecialDate(new DateTypeRange({
								startDate: oFormatYyyymmdd.parse(aSpecialDay[0]),
								endDate: oFormatYyyymmdd.parse(aSpecialDay[1]),
								type: sType,
								tooltip: aSpecialDay[2]
							}));
						}
					} else {
						Element.getElementById("Cal1").destroySpecialDates();
					}
				}
			})
		]
	});
	oFormContainer.addFormElement(oFormElement);

	oFormElement = new FormElement("F1E2", {
		label: "selected date",
		fields: [
			new Input("Input1", {
				width: "9rem",
				placeholder: "yyyyMMdd",
				change: function(oEvent){
					var sValue = oEvent.getParameter('newValue');
					var oCalendar = Element.getElementById("Cal1");
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
			new Input("Input2",{
				width: "9rem",
				placeholder: "yyyyMMdd",
				change: function(oEvent){
					var oInput = oEvent.getSource();
					var sValue = oEvent.getParameter('newValue');
					var oCalendar = Element.getElementById("Cal1");
					var oDate = oFormatYyyymmdd.parse(sValue);
					if (oDate){
						oCalendar.setStartDate(oDate);
						oInput.setValueState(ValueState.None);
					} else {
						oInput.setValueState(ValueState.Error);
					}
				}
			})
		]
	});
	oFormContainer.addFormElement(oFormElement);

	oFormElement = new FormElement("F1E4", {
		label: "minimum date",
		fields: [
			new Input("Input-min",{
				width: "9rem",
				placeholder: "yyyyMMdd",
				change: function(oEvent){
					var sValue = oEvent.getParameter('newValue');
					var oCalendar = Element.getElementById("Cal1");
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
			new Input("Input-max", {
				width: "20rem",
				placeholder: "yyyyMMdd",
				change: function(oEvent){
					var sValue = oEvent.getParameter('newValue');
					var oCalendar = Element.getElementById("Cal1");
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

	var oLabel2 = new Label("H-C2", {text: "Single interval Selection"});
	var oCalendar2 = new CalendarMonthInterval("Cal2",{
		startDate: oStartDate,
		months: 6,
		intervalSelection: true,
		ariaLabelledBy: ["H-C2"],
		select: function(oEvent){
			var oInput1 = Element.getElementById("Input2-start");
			var oInput2 = Element.getElementById("Input2-end");
			var oCalendar = oEvent.getSource();
			var aSelectedDates = oCalendar.getSelectedDates();
			var oDate;
			if (aSelectedDates.length > 0 ) {
				oDate = aSelectedDates[0].getStartDate();
				if (oDate) {
					oInput1.setValue(oFormatYyyymmdd.format(oDate));
				} else {
					oInput1.setValue("");
				}
				oDate = aSelectedDates[0].getEndDate();
				if (oDate) {
					oInput2.setValue(oFormatYyyymmdd.format(oDate));
				} else {
					oInput2.setValue("");
				}
			} else {
				oInput1.setValue("");
				oInput2.setValue("");
			}
		}
	});

	var oStartDateLabel = new Label({text: "selected start date from: ", labelFor: "Input2-start"});
	var oStartDateInput = new Input("Input2-start",{
		width: "9rem",
		editable: false
	});
	var oEndDateLabel = new Label({text: "to end date: ", labelFor: "Input2-end"});
	var oEndDateInput = new Input("Input2-end",{
		width: "9rem",
		editable: false
	});

	var oLabel3 = new Label("H-C3", {text: "multiple day Selection"});
	var oCalendar3 = new CalendarMonthInterval("Cal3",{
		months: 24,
		intervalSelection: false,
		singleSelection: false,
		pickerPopup: true,
		ariaLabelledBy: "H-C3",
		select: function(oEvent){
			var oLB = Element.getElementById("LB");
			var oCalendar = oEvent.getSource();
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
	});

	var oSelectListLabel = new Label({text: "selected dates"});
	var oScrollContainer = new ScrollContainer({
		height: "9rem",
		vertical: true,
		content: [new SelectList("LB", {
			width: "20rem",
			ariaLabelledBy: [oLabel3, oSelectListLabel]
		})]
	});

	var oLayout = new VerticalLayout({
		content: [
			oLabel1,
			oCalendar1,
			oForm,
			oLabel2,
			oCalendar2,
			oStartDateLabel,
			oStartDateInput,
			oEndDateLabel,
			oEndDateInput,
			oLabel3,
			oCalendar3,
			oSelectListLabel,
			oScrollContainer
		]
	});

	var app = new App("myApp");
	var page = new Page("page", {
		title: "Test Page for sap.ui.unified.CalendarMonthInterval",
		titleLevel: TitleLevel.H1,
		content: [
			oLayout
		]
	});

	app.addPage(page);
	app.placeAt("body");
});