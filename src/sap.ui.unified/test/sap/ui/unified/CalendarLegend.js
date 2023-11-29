sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/format/DateFormat",
	"sap/ui/layout/ResponsiveFlowLayout",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/m/Label",
	"sap/ui/layout/VerticalLayout",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/unified/library",
	"sap/ui/core/library"
], function(
	Element,
	DateFormat,
	ResponsiveFlowLayout,
	ResponsiveFlowLayoutData,
	Calendar,
	CalendarLegend,
	CalendarLegendItem,
	DateRange,
	DateTypeRange,
	Label,
	VerticalLayout,
	App,
	Page,
	unifiedLibrary,
	coreLibrary
) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;
	var StandardCalendarLegendItem = unifiedLibrary.StandardCalendarLegendItem;
	var TitleLevel = coreLibrary.TitleLevel;

	var oLabel1 = new Label("label1", {text: "Simple Legend example"});
	var oLegend1 = new CalendarLegend("Leg1");

	var oLabel31 = new Label("label31", {text: "Legend with 2 standard categories"});
	var oLegend31 = new CalendarLegend("Leg31", {
		standardItems: [
			StandardCalendarLegendItem.NonWorkingDay,
			StandardCalendarLegendItem.WorkingDay]
	});

	var oLabel32 = new Label("label32", {text: "Legend with no standard categories and one custom category"});
	var oLegend32 = new CalendarLegend("Leg32", {
		standardItems: [],
		items: [new CalendarLegendItem({
			text: "Holiday",
			type: CalendarDayType.Type01,
			tooltip: "Type 01"
		})]
	});

	var oLabel4 = new Label("label4", {text: "Legend with custom categories"});
	var oLegend4 = new CalendarLegend("Leg4");
	for (var i = 0; i < 10; i++) {
		oLegend4.addItem(new CalendarLegendItem({
			text: "Placeholder" + (i + 1)
		}));
	}

	var oFormatYyyymmdd = DateFormat.getInstance({
		pattern: "yyyyMMdd"
	});

	var aSpecialDays = [
		["20140801", undefined, "Placeholder01", 1],
		["20140802", undefined, "Some very long Placeholder02, that will be not truncated but will go on couple of rows", 2],
		["20140803", undefined, "Placeholder03 ", 3],
		["20140804", undefined, "Placeholder04", 4],
		["20140805", undefined, "Placeholder05", 5],
		["20140806", undefined, "Placeholder06", 6],
		["20140807", undefined, "Placeholder07", 7],
		["20140808", undefined, "Placeholder08", 8],
		["20140809", undefined, "Placeholder09", 9],
		["20140810", undefined, "Placeholder10", 10]
	];

	var oCal = new Calendar("Cal", {
		selectedDates: [new DateRange({startDate: oFormatYyyymmdd.parse("20140820")})]
	});

	var oLabel5 = new Label("label5", {text: "Legend with calendar"});
	var oLegend5 = new CalendarLegend("Leg5");

	oCal.setLegend(oLegend5);

	//add specialDays
	for (var i = 0; i < aSpecialDays.length; i++) {
		var aSpecialDay = aSpecialDays[i];
		var sType = "";
		if (aSpecialDay[3] < 10) {
			sType = "Type0" + aSpecialDay[3];
		} else {
			sType = "Type" + aSpecialDay[3];
		}
		var specialDate = new DateTypeRange({
			startDate: oFormatYyyymmdd.parse(aSpecialDay[0]),
			endDate: oFormatYyyymmdd.parse(aSpecialDay[1]),
			type: sType,
			tooltip: aSpecialDay[2]
		});
		Element.getElementById("Cal").addSpecialDate(specialDate);
		oLegend5.addItem(new CalendarLegendItem({
			text: aSpecialDay[2]
		}));
	}

	var oLayout = new ResponsiveFlowLayout();
	var oCalLayout = new ResponsiveFlowLayoutData({
		minWidth: 320,
		weight: 2,
		margin: false,
		linebreakable: false
	});
	var oLegLayout = new ResponsiveFlowLayoutData({
		minWidth: 150,
		weight: 1,
		margin: false
	});
	oLegend5.setLayoutData(oLegLayout);
	oCal.setLayoutData(oCalLayout);
	oLayout.addContent(oCal);
	oLayout.addContent(oLegend5);

	var oCal2 = new Calendar("Cal2", {
		selectedDates: [new DateRange({startDate: oFormatYyyymmdd.parse("20140820")})]
	});

	var oLabel6 = new Label("label6", {text: "Legend with calendar (compact mode)"});
	var oLegend6 = new CalendarLegend("Leg6");

	oCal2.setLegend(oLegend6);

	//add specialDays
	for (var i = 0; i < aSpecialDays.length; i++) {
		var aSpecialDay = aSpecialDays[i];
		var sType = "";
		if (aSpecialDay[3] < 10) {
			sType = "Type0" + aSpecialDay[3];
		} else {
			sType = "Type" + aSpecialDay[3];
		}
		specialDate = new DateTypeRange({
			startDate: oFormatYyyymmdd.parse(aSpecialDay[0]),
			endDate: oFormatYyyymmdd.parse(aSpecialDay[1]),
			type: sType,
			tooltip: aSpecialDay[2]
		});
		Element.getElementById("Cal2").addSpecialDate(specialDate);
		oLegend6.addItem(new CalendarLegendItem({
			text: aSpecialDay[2]
		}));
	}

	var oLayout2 = new ResponsiveFlowLayout();
	var oCalLayout2 = new ResponsiveFlowLayoutData({
		minWidth: 280,
		weight: 2,
		margin: false,
		linebreakable: false
	});
	var oLegLayout2 = new ResponsiveFlowLayoutData({
		minWidth: 100,
		weight: 1,
		margin: false
	});
	oLegend6.setColumnWidth("115px");
	oLegend6.setLayoutData(oLegLayout2);
	oCal2.setLayoutData(oCalLayout2);
	oLayout2.addContent(oCal2);
	oLayout2.addContent(oLegend6);

	var oLabel7 = new Label("label7", {text: "Simple Legend example"});
	var oLegend7 = new CalendarLegend("Leg7", {
		items: [new CalendarLegendItem({
			text: "Type10",
			type: CalendarDayType.Type10,
			tooltip: "Type 10"
		}),
			new CalendarLegendItem({
				text: "Type09",
				type: CalendarDayType.Type09,
				tooltip: "Type 9"
			}),
			new CalendarLegendItem({
				text: "Type08",
				type: CalendarDayType.Type08,
				tooltip: "Type 8"
			}),
			new CalendarLegendItem({text: "no type 1", tooltip: "no type 1"}),
			new CalendarLegendItem({
				text: "Type07",
				type: CalendarDayType.Type07,
				tooltip: "Type 7"
			}),
			new CalendarLegendItem({text: "no type 2", tooltip: "no type 2"})
		]
	});

	var oLabel8 = new Label("label8", {text: "Custom colors Legend example"});
	var oLegend8 = new CalendarLegend("Leg8", {
		items: [new CalendarLegendItem({text: "Red", color: "red", tooltip: "Red"}),
			new CalendarLegendItem({text: "Green", color: "green", tooltip: "Green"}),
			new CalendarLegendItem({text: "Blue", color: "blue", tooltip: "Blue"})
		]
	});

	var oLabel9 = new Label("label9", {text: "CalendarLegend with all types example"});
	var oLegend9 = new CalendarLegend("Leg9", {
		items: [
			new CalendarLegendItem({
				text: "01",
				type: CalendarDayType.Type01,
				tooltip: "Type 01"
			}),
			new CalendarLegendItem({
				text: "02",
				type: CalendarDayType.Type02,
				tooltip: "Type 02"
			}),
			new CalendarLegendItem({
				text: "03",
				type: CalendarDayType.Type03,
				tooltip: "Type 03"
			}),
			new CalendarLegendItem({
				text: "04",
				type: CalendarDayType.Type04,
				tooltip: "Type 04"
			}),
			new CalendarLegendItem({
				text: "05",
				type: CalendarDayType.Type05,
				tooltip: "Type 05"
			}),
			new CalendarLegendItem({
				text: "06",
				type: CalendarDayType.Type06,
				tooltip: "Type 06"
			}),
			new CalendarLegendItem({
				text: "07",
				type: CalendarDayType.Type07,
				tooltip: "Type 07"
			}),
			new CalendarLegendItem({
				text: "08",
				type: CalendarDayType.Type08,
				tooltip: "Type 08"
			}),
			new CalendarLegendItem({
				text: "09",
				type: CalendarDayType.Type09,
				tooltip: "Type 09"
			}),
			new CalendarLegendItem({
				text: "10",
				type: CalendarDayType.Type10,
				tooltip: "Type 10"
			}),
			new CalendarLegendItem({
				text: "11",
				type: CalendarDayType.Type11,
				tooltip: "Type 11"
			}),
			new CalendarLegendItem({
				text: "12",
				type: CalendarDayType.Type12,
				tooltip: "Type 12"
			}),
			new CalendarLegendItem({
				text: "13",
				type: CalendarDayType.Type13,
				tooltip: "Type 13"
			}),
			new CalendarLegendItem({
				text: "14",
				type: CalendarDayType.Type14,
				tooltip: "Type 14"
			}),
			new CalendarLegendItem({
				text: "15",
				type: CalendarDayType.Type15,
				tooltip: "Type 15"
			}),
			new CalendarLegendItem({
				text: "16",
				type: CalendarDayType.Type16,
				tooltip: "Type 16"
			}),
			new CalendarLegendItem({
				text: "17",
				type: CalendarDayType.Type17,
				tooltip: "Type 17"
			}),
			new CalendarLegendItem({
				text: "18",
				type: CalendarDayType.Type18,
				tooltip: "Type 18"
			}),
			new CalendarLegendItem({
				text: "19",
				type: CalendarDayType.Type19,
				tooltip: "Type 19"
			}),
			new CalendarLegendItem({
				text: "20",
				type: CalendarDayType.Type20,
				tooltip: "Type 20"
			})
		]
	});

	var oVerticalLayout = new VerticalLayout({
		content: [
			oLabel1,
			oLegend1,
			oLabel31,
			oLegend31,
			oLabel32,
			oLegend32,
			oLabel4,
			oLegend4,
			oLabel5,
			oCal,
			oLegend5,
			oLabel6,
			oCal2,
			oLegend6,
			oLabel7,
			oLegend7,
			oLabel8,
			oLegend8,
			oLabel9,
			oLegend9
		]
	});

	var app = new App("myApp");
	var page = new Page("page", {
		title: "Test Page for sap.ui.unified.CalendarLegend",
		titleLevel: TitleLevel.H1,
		content: [
			oVerticalLayout
		]
	});

	app.addPage(page);
	app.placeAt("body");
});
