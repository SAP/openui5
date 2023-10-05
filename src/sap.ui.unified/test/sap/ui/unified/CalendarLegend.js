sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/Core",
	"sap/ui/core/format/DateFormat",
	"sap/ui/layout/ResponsiveFlowLayout",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/library",
	"sap/ui/core/Element"
], function(MessageToast, oCore, DateFormat, ResponsiveFlowLayout, ResponsiveFlowLayoutData, Calendar, CalendarLegend, CalendarLegendItem, DateRange, DateTypeRange, unifiedLibrary, Element) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;
	var StandardCalendarLegendItem = unifiedLibrary.StandardCalendarLegendItem;


	new CalendarLegend("Leg1", {}).placeAt("sample1");

	new CalendarLegend("Leg2", {}).placeAt("sample2");

	new CalendarLegend("Leg3", {columnWidth: 'auto'}).placeAt("sample3");


	new CalendarLegend("Leg31", {
		standardItems: [
			StandardCalendarLegendItem.NonWorkingDay,
			StandardCalendarLegendItem.WorkingDay]
	}).placeAt("sample31");

	new CalendarLegend("Leg32", {
		standardItems: [],
		items: [new CalendarLegendItem({
			text: "Holiday",
			type: CalendarDayType.Type01,
			tooltip: "Type 01"
		})]
	}).placeAt("sample32");

	var oLeg4 = new CalendarLegend("Leg4", {});
	for (var i = 0; i < 10; i++) {
		oLeg4.addItem(new CalendarLegendItem({
			text: "Placeholder" + (i + 1)
		}));
	}
	oLeg4.placeAt("sample4");

	var oFormatYyyymmdd = DateFormat.getInstance({
		pattern: "yyyyMMdd"
	});

	var aSpecialDays = [
		["20140801", undefined, "Placeholder01", 11],
		["20140802", undefined, "Some very long Placeholder02, that will be not truncated but will go on couple of rows", 12],
		["20140803", undefined, "Placeholder03 ", 13],
		["20140804", undefined, "Placeholder04", 14],
		["20140805", undefined, "Placeholder05", 15],
		["20140806", undefined, "Placeholder06", 16],
		["20140807", undefined, "Placeholder07", 17],
		["20140808", undefined, "Placeholder08", 18],
		["20140809", undefined, "Placeholder09", 19],
		["20140810", undefined, "Placeholder10", 20]
	];

	var oCal = new Calendar("Cal", {
		selectedDates: [new DateRange({startDate: oFormatYyyymmdd.parse("20140820")})],
		select: function (oEvent) {
			MessageToast.show("Select");
		},
		cancel: function (oEvent) {
			MessageToast.show("Cancel");
		}
	});

	var oLeg5 = new CalendarLegend("Leg5", {});

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
		Element.registry.get("Cal").addSpecialDate(specialDate);
		oLeg5.addItem(new CalendarLegendItem({
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
	oLeg5.setLayoutData(oLegLayout);
	oCal.setLayoutData(oCalLayout);
	oLayout.addContent(oCal);
	oLayout.addContent(oLeg5);
	oLayout.placeAt("sample5");

	var oCal2 = new Calendar("Cal2", {
		selectedDates: [new DateRange({startDate: oFormatYyyymmdd.parse("20140820")})],
		select: function (oEvent) {
			MessageToast.show("Select");
		},
		cancel: function (oEvent) {
			MessageToast.show("Cancel");
		}
	});

	var oLeg6 = new CalendarLegend("Leg6", {});

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
		Element.registry.get("Cal2").addSpecialDate(specialDate);
		oLeg6.addItem(new CalendarLegendItem({
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
	oLeg6.setColumnWidth("115px");
	oLeg6.setLayoutData(oLegLayout2);
	oCal2.setLayoutData(oCalLayout2);
	oLayout2.addContent(oCal2);
	oLayout2.addContent(oLeg6);
	oLayout2.placeAt("sample6");

	new CalendarLegend("Leg7", {
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
	}).placeAt("sample7");

	new CalendarLegend("Leg8", {
		items: [new CalendarLegendItem({text: "Red", color: "red", tooltip: "Red"}),
			new CalendarLegendItem({text: "Green", color: "green", tooltip: "Green"}),
			new CalendarLegendItem({text: "Blue", color: "blue", tooltip: "Blue"})
		]
	}).placeAt("sample8");

	new CalendarLegend("Leg9", {
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
	}).placeAt("sample9");
});
