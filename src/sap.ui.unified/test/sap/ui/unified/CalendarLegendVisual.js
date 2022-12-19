sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/layout/ResponsiveFlowLayout",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/library"
], function(MessageToast, DateFormat, ResponsiveFlowLayout, ResponsiveFlowLayoutData, Calendar, CalendarLegend, CalendarLegendItem, DateRange, DateTypeRange, unifiedLibrary) {
	"use strict";

	var oFormatYyyymmdd = DateFormat.getInstance({
		pattern: "yyyyMMdd"
	});

	var aSpecialDays = [
		["20140801", undefined, "Placeholder01", 11],
		["20140811", undefined, "Placeholder01", 11],
		["20140813", undefined, "Placeholder01", 11],
		["20140821", undefined, "Placeholder01", 11],
		["20140802", undefined, "Some very long Placeholder02, that will be not truncated but will go on couple of rows", 12],
		["20140803", undefined, "Placeholder03 ", 13],
		["20140823", undefined, "Placeholder03 ", 13],
		["20140824", undefined, "Placeholder03 ", 13],
		["20140804", undefined, "Placeholder04", 14],
		["20140814", undefined, "Placeholder04", 14],
		["20140815", undefined, "Placeholder04", 14],
		["20140805", undefined, "Placeholder05", 15],
		["20140806", undefined, "Placeholder06", 16],
		["20140807", undefined, "Placeholder07", 17],
		["20140808", undefined, "Placeholder08", 18],
		["20140818", undefined, "Placeholder08", 18],
		["20140828", undefined, "Placeholder08", 18],
		["20140809", undefined, "Placeholder09", 19],
		["20140810", undefined, "Placeholder10", 20],
		["20140901", undefined, "Placeholder01", 11],
		["20140911", undefined, "Placeholder01", 11],
		["20140913", undefined, "Placeholder01", 11],
		["20140921", undefined, "Placeholder01", 11],
		["20140902", undefined, "Some very long Placeholder02, that will be not truncated but will go on couple of rows", 12],
		["20140903", undefined, "Placeholder03 ", 13],
		["20140923", undefined, "Placeholder03 ", 13],
		["20140924", undefined, "Placeholder03 ", 13],
		["20140904", undefined, "Placeholder04", 14],
		["20140914", undefined, "Placeholder04", 14],
		["20140915", undefined, "Placeholder04", 14],
		["20140905", undefined, "Placeholder05", 15]
	];

	var oCal = new Calendar("Cal", {
		months: 2,
		selectedDates: [new DateRange({startDate: oFormatYyyymmdd.parse("20140820")})],
		select: function (oEvent) {
			MessageToast.show("Select");
		},
		cancel: function (oEvent) {
			MessageToast.show("Cancel");
		}
	});

	var oLeg = new CalendarLegend("Leg", {});
	var aLegendTypes = [];

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
		oCal.addSpecialDate(specialDate);
		if (aLegendTypes.indexOf(sType) === -1) {
			oLeg.addItem(new CalendarLegendItem({
				text: aSpecialDay[2],
				type: sType
			}));
			aLegendTypes.push(sType);
		}
	}

	var oLayout = new ResponsiveFlowLayout();
	var oCalLayout = new ResponsiveFlowLayoutData({
		minWidth: 720,
		weight: 2,
		margin: false,
		linebreakable: false
	});
	var oLegLayout = new ResponsiveFlowLayoutData({
		minWidth: 150,
		weight: 1,
		margin: false
	});
	oLeg.setLayoutData(oLegLayout);
	oCal.setLayoutData(oCalLayout);
	oCal.setLegend(oLeg);
	oLayout.addContent(oCal);
	oLayout.addContent(oLeg);
	oLayout.placeAt("sample5");

});
