sap.ui.define([
	"sap/m/Button",
	"sap/m/HBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/List",
	"sap/m/MessageToast",
	"sap/m/StandardListItem",
	"sap/m/ToggleButton",
	"sap/m/VBox",
	"sap/ui/core/CalendarType",
	"sap/ui/core/Element",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/unified/CalendarDateInterval",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/core/date/UI5Date",
	"sap/m/App",
	"sap/m/Page"
], function(
		Button,
		HBox,
		Input,
		Label,
		List,
		MessageToast,
		StandardListItem,
		ToggleButton,
		VBox,
		CalendarType,
		Element,
		DateFormat,
		coreLibrary,
		Device,
		CalendarDateInterval,
		DateRange,
		DateTypeRange,
		UI5Date,
		App,
		Page
		) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: CalendarType.Gregorian});

	var aSpecialDays = [["20160101",undefined,"Neujahr",1],
		["20160106",undefined,"Heilige Drei Könige",1],
		["20160208",undefined,"Rosenmontag",2],
		["20160209",undefined,"Fastnacht",2],
		["20160210",undefined,"Aschermittwoch",2],
		["20160214",undefined,"Valentinstag",2],
		["20160325",undefined,"Karfreitag",1],
		["20160327",undefined,"Ostersonntag",1],
		["20160328",undefined,"Ostermontag",1],
		["20160501",undefined,"Maifeiertag",1],
		["20160505",undefined,"Christi Himmelfahrt",1],
		["20160508",undefined,"Muttertag",2],
		["20160515",undefined,"Pfingstsonntag",1],
		["20160516",undefined,"Pfingstmontag",1],
		["20160526",undefined,"Fronleichnam",1],
		["20160815",undefined,"Mariä Himmelfahrt",2],
		["20161002",undefined,"Erntedankfest",2],
		["20161003",undefined,"Tag der Deutschen Einheit",1],
		["20161031",undefined,"Reformationstag",2],
		["20161101",undefined,"Allerheiligen",1],
		["20161113",undefined,"Volkstrauertag",2],
		["20161116",undefined,"Buß- und Bettag",2],
		["20161120",undefined,"Totensonntag",2],
		["20161127",undefined,"1. Advent",2],
		["20161204",undefined,"2. Advent",2],
		["20161206",undefined,"Nikolaus",2],
		["20161211",undefined,"3. Advent",2],
		["20161218",undefined,"4. Advent",2],
		["20161224",undefined,"Heiligabend",2],
		["20161225","20141226","Weihnachten",1],
		["20161231",undefined,"Silvester",2],
		["20170101",undefined,"Neujahr",1],
		["20170106",undefined,"Heilige Drei Könige",1],
		["20170804","20140810","Urlaub",3],
		["20160701",undefined,"Type01",1],
		["20160702",undefined,"Type02",2],
		["20160703",undefined,"Type03",3],
		["20160704",undefined,"Type04",4],
		["20160705",undefined,"Type05",5],
		["20160706",undefined,"Type06",6],
		["20160707",undefined,"Type07",7],
		["20160708",undefined,"Type08",8],
		["20160709",undefined,"Type09",9],
		["20160710",undefined,"Type10",10]];

	var oCal = new CalendarDateInterval("Cal1",{
		width: "320px",
		legend: "Legend1",
		select: function(oEvent){
			var oTF = Element.getElementById("TF1");
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
			var oTF = Element.getElementById("TF2");
			var oCalendar = oEvent.oSource;
			var oDate = oCalendar.getStartDate();
			oTF.setValue(oFormatYyyymmdd.format(oDate));
		}
	});

	var oSel = new Input("TF1", {
		editable: true,
		width: "100%",
		placeholder: "yyyyMMdd",
		change: function(oEvent){
			var sValue = oEvent.getParameter('newValue');
			var oCalendar = Element.getElementById("Cal1");
			if (sValue.length == 8 && !isNaN(sValue)) {
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
			} else if (!sValue) {
				oCalendar.destroySelectedDates();
			}
		}
	}).addStyleClass("leftMargin");

	var oStart = new Input("TF2", {
		editable: true,
		width: "100%",
		placeholder: "yyyyMMdd",
		change: function(oEvent){
			var oTF = oEvent.oSource;
			var sValue = oEvent.getParameter('newValue');
			var oCalendar = Element.getElementById("Cal1");
			var oDate = oFormatYyyymmdd.parse(sValue);
			if (oDate) {
				oCalendar.setStartDate(oDate);
				oTF.setValueState(ValueState.None);
			} else {
				oTF.setValueState(ValueState.Error);
			}
		}
	}).addStyleClass("leftMargin");

	var oMin = new Input("TF-min", {
		editable: true,
		width: "100%",
		placeholder: "yyyyMMdd",
		change: function(oEvent){
			var sValue = oEvent.getParameter('newValue');
			var oCalendar = Element.getElementById("Cal1");
			var oDate;
			if (sValue.length == 8 && !isNaN(sValue)) {
				oDate = oFormatYyyymmdd.parse(sValue);
			}
			oCalendar.setMinDate(oDate);
		}
	}).addStyleClass("leftMargin");

	var oMax = new Input("TF-max", {
		editable: true,
		width: "100%",
		placeholder: "yyyyMMdd",
		change: function(oEvent){
			var sValue = oEvent.getParameter('newValue');
			var oCalendar = Element.getElementById("Cal1");
			var oDate;
			if (sValue.length == 8 && !isNaN(sValue)) {
				oDate = oFormatYyyymmdd.parse(sValue);
			}
			oCalendar.setMaxDate(oDate);
		}
	}).addStyleClass("leftMargin");

	var oHbox1 = new HBox({
		items: [
			oCal,
			new VBox({
				items: [
					new HBox({
						items: [
							new Button({
								text: "focus today",
								press: function(oEvent){
									Element.getElementById("Cal1").focusDate(UI5Date.getInstance());
									var oTF = Element.getElementById("TF2");
									var oCalendar = Element.getElementById("Cal1");
									var oDate = oCalendar.getStartDate();
									oTF.setValue(oFormatYyyymmdd.format(oDate));
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
							}),
							new ToggleButton({
								text: "disable days",
								press: function(oEvent){
									var bPressed = oEvent.getParameter("pressed");
									var oCal = Element.getElementById("Cal1");
									if (bPressed) {
										var oDate = oCal.getStartDate();
										if (oDate) {
											oDate = UI5Date.getInstance(oDate.getTime());
										} else {
											oDate = UI5Date.getInstance();
										}
										oDate.setDate(2);
										oCal.addDisabledDate(new DateRange({
											startDate: oDate
										}));
										var oStartDate = UI5Date.getInstance(oDate);
										oStartDate.setDate(10);
										var oEndDate = UI5Date.getInstance(oDate);
										oEndDate.setDate(20);
										oCal.addDisabledDate(new DateRange({
											startDate: oStartDate,
											endDate: oEndDate
										}));
									} else {
										oCal.destroyDisabledDates();
									}
								}
							})
						]
					}),
					new VBox({
						items: [
							new HBox({
								alignItems: "Center",
								items: [
									new Label({
										text: "selected date",
										labelFor: oSel
									}),
									oSel
								]
							}),
							new HBox({
								alignItems: "Center",
								items: [
									new Label({
										text: "start date",
										labelFor: oStart
									}),
									oStart
								]
							}),
							new HBox({
								alignItems: "Center",
								items: [
									new Label({
										text: "min date",
										labelFor: oMin
									}),
									oMin
								]
							}),
							new HBox({
								alignItems: "Center",
								items: [
									new Label({
										text: "max date",
										labelFor: oMax
									}),
									oMax
								]
							})
						]
					})
				]
			}).addStyleClass("leftMargin")
		]
	});

	// single interval selection
	var oStartDate = UI5Date.getInstance();
	oStartDate.setDate(oStartDate.getDate() - 1);
	var oCal2 = new CalendarDateInterval("Cal2", {
		width: "320px",
		startDate: oStartDate,
		days: 7,
		intervalSelection: true,
		select: function(oEvent){
			var oTF1 = Element.getElementById("TF2-start");
			var oTF2 = Element.getElementById("TF2-end");
			var oCalendar = oEvent.oSource;
			var aSelectedDates = oCalendar.getSelectedDates();
			if (aSelectedDates.length > 0 ) {
				var oDate = aSelectedDates[0].getStartDate();
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
	});

	oStart  = new Input("TF2-start", {
		editable: false
	});
	var oEnd = new Input("TF2-end", {
		editable: false
	});

	var oHbox2 = new HBox({
		items: [
			oCal2,
			new Label({
				text: "selected date from",
				labelFor: oStart
			}).addStyleClass("leftMargin"),
			oStart,
			new Label({
				text: "To date",
				labelFor: oEnd
			}),
			oEnd

		]
	});

	var oCal3 = new CalendarDateInterval("Cal3",{
		width: "320px",
		days: 7,
		intervalSelection: false,
		singleSelection: false,
		select: function(oEvent){
			var oLB = Element.getElementById("LB");
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
						oItem = new StandardListItem();
						oLB.addItem(oItem);
					}
					if (oDate) {
						oItem.setTitle(oFormatYyyymmdd.format(oDate));
					} else {
						oItem.setTitle("");
					}
				}
				if (aItems.length > aSelectedDates.length) {
					for (var i = aSelectedDates.length; i < aItems.length; i++) {
						oLB.removeItem(i);
						aItems[i].destroy();
					}
				}
			} else {
				oLB.destroyItems();
			}
		}
	});

	var oHbox3 = new HBox({
		items: [
			oCal3,
			new VBox({
				items: [
					new Label({
						text: "selected dates"
					}), new List("LB",{
						width: "15rem"
					}).addStyleClass("list")]
			}).addStyleClass("leftMargin")
		]
	});

	var oCal4 = new CalendarDateInterval("Cal4",{
		width: "320px",
		days: 7,
		showDayNamesLine: false,
		pickerPopup: true
	});

	var app = new App("myApp");
	var page = new Page("page", {
		title: "Test Page for sap.ui.unified.CalendarDateInterval",
		titleLevel: TitleLevel.H1,
		content: [
			new Label({
				text: "Single day Selection Calendar"
			}),
			oHbox1,
			new Label({
				text: ">Single interval Selection Calendar"
			}),
			oHbox2,
			new Label({
				text: "Multiple day Selection Calendar"
			}),
			oHbox3,
			oCal4
		]
	});

	app.addPage(page);
	app.placeAt("body");
});