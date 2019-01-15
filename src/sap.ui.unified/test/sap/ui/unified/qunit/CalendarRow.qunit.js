/*global QUnit, window */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendRenderer",
	"sap/ui/unified/CalendarRowRenderer",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/core/InvisibleText",
	"sap/ui/unified/CalendarRow",
	"sap/ui/unified/CalendarAppointment",
	"sap/ui/unified/library"
], function(qutils, CalendarLegend, CalendarLegendRenderer, CalendarRowRenderer,
	CalendarLegendItem, InvisibleText, CalendarRow, CalendarAppointment, unifiedLibrary) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;
	var oFormatYyyyMMddHHmm = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMMddHHmm", calendarType: sap.ui.core.CalendarType.Gregorian});

	var sSelectedAppointmentId = "";
	var iSelectedGroupAppointments = 0;
	var bMultiSelect = false,
		sDomRefId;
	var handleSelect = function(oEvent){
		sSelectedAppointmentId = "";
		iSelectedGroupAppointments = 0;
		var oAppointment = oEvent.getParameter("appointment");
		if (oAppointment) {
			sSelectedAppointmentId = oAppointment.getId();
		}else {
			var aAppointments = oEvent.getParameter("appointments");
			iSelectedGroupAppointments = aAppointments.length;
		}
		bMultiSelect = oEvent.getParameter("multiSelect");
		sDomRefId = oEvent.getParameter("domRefId");
	};

	var oIntervalStartDate;
	var oIntervalEndDate;
	var bSubInterval = false;
	var handleIntervalSelect = function(oEvent){
		oIntervalStartDate = oEvent.getParameter("startDate");
		oIntervalEndDate = oEvent.getParameter("endDate");
		bSubInterval = oEvent.getParameter("subInterval");
	};

	var bStartDateChange = false;
	var oStartDate;
	var handleStartDateChange = function(oEvent){

		var oRow = oEvent.oSource;
		oStartDate = oRow.getStartDate();
		bStartDateChange = true;

	};

	var bLeaveRow = false;
	var sType;
	var handleLeaveRow = function(oEvent){

		bLeaveRow = true;
		sType = oEvent.getParameter("type");

	};

	var oRow1 = new CalendarRow("Row1",  {
		startDate: new Date("2015", "01", "01", "10", "15"),
		select: handleSelect,
		startDateChange: handleStartDateChange,
		intervalSelect: handleIntervalSelect,
		leaveRow: handleLeaveRow,
		appointments: [new sap.ui.unified.CalendarAppointment("App0", {
				startDate: new Date("2015", "01", "01", "08", "15"),
				endDate: new Date("2015", "01", "01", "08", "20"),
				type: sap.ui.unified.CalendarDayType.None,
				title: "Appointment 0",
				tooltip: "Tooltip 0",
				text: "Appointment of 5 minutes, 2 hour in past",
				key: "A0"
			}),
			new sap.ui.unified.CalendarAppointment("App1", {
				startDate: new Date("2015", "01", "01", "11", "15"),
				endDate: new Date("2015", "01", "01", "13", "15"),
				type: sap.ui.unified.CalendarDayType.None,
				title: "Appointment 1",
				tooltip: "Tooltip 1",
				text: "Appointment of 2 hours, 1 hour in future",
				icon: "sap-icon://call",
				key: "A1"
			}),
			new sap.ui.unified.CalendarAppointment("App2", {
				startDate: new Date("2015", "01", "01", "09", "45"),
				endDate: new Date("2015", "01", "01", "11", "45"),
				type: sap.ui.unified.CalendarDayType.Type01,
				tentative: true,
				title: "Appointment 2",
				tooltip: "Tooltip 2",
				text: "Appointment of 2 hour, 30 minutes in past",
				key: "A2"
			}),
			new sap.ui.unified.CalendarAppointment("App3", {
				startDate: new Date("2015", "01", "01", "15", "00"),
				endDate: new Date("2015", "01", "01", "15", "30"),
				type: sap.ui.unified.CalendarDayType.Type02,
				title: "Appointment 3",
				tooltip: "Tooltip 3",
				text: "Appointment of 30 minutes",
				key: "A3"
			}),
			new sap.ui.unified.CalendarAppointment("App4", {
				startDate: new Date("2015", "01", "01", "15", "30"),
				endDate: new Date("2015", "01", "01", "16", "00"),
				type: sap.ui.unified.CalendarDayType.Type03,
				title: "Appointment 4",
				tooltip: "Tooltip 4",
				text: "Appointment of 30 minutes, starts at end of App3",
				key: "A4"
			}),
			new sap.ui.unified.CalendarAppointment("App5", {
				startDate: new Date("2015", "01", "02", "10", "30"),
				endDate: new Date("2015", "01", "02", "11", "00"),
				type: sap.ui.unified.CalendarDayType.Type04,
				title: "Appointment 5",
				tooltip: "Tooltip 5",
				text: "Appointment of 30 minutes, next day",
				key: "A5"
			}),
			new sap.ui.unified.CalendarAppointment("App6", {
				startDate: new Date("2015", "01", "02", "0", "0"),
				endDate: new Date("2015", "01", "02", "23", "59", "59"),
				type: sap.ui.unified.CalendarDayType.Type05,
				title: "Appointment 6",
				tooltip: "Tooltip 6",
				text: "Appointment of full next day",
				key: "A6"
			}),
			new sap.ui.unified.CalendarAppointment("App7", {
				startDate: new Date("2015", "02", "01", "0", "0"),
				endDate: new Date("2015", "04", "31", "23", "59", "59"),
				type: sap.ui.unified.CalendarDayType.Type06,
				title: "Appointment 7",
				tooltip: "Tooltip 7",
				text: "Appointment of full next 2 months",
				key: "A7"
			}),
			new sap.ui.unified.CalendarAppointment("App8", {
				startDate: new Date("2015", "05", "02", "0", "0"),
				endDate: new Date("2015", "05", "02", "23", "59", "59"),
				type: sap.ui.unified.CalendarDayType.Type07,
				title: "Appointment 8",
				tooltip: "Tooltip 8",
				text: "Appointment of one day",
				key: "A8"
			})
		],
		intervalHeaders: [new sap.ui.unified.CalendarAppointment("IHead1", {
				startDate: new Date("2015", "01", "01", "12", "00"),
				endDate: new Date("2015", "01", "01", "13", "00"),
				type: sap.ui.unified.CalendarDayType.None,
				title: "Head 1",
				tooltip: "Tooltip 1",
				text: "Head of one hour",
				icon: "sap-icon://sap-ui5",
				key: "I1"
			}),
			new sap.ui.unified.CalendarAppointment("IHead2", {
				startDate: new Date("2015", "01", "03", "00", "00"),
				endDate: new Date("2015", "01", "04", "23", "59"),
				type: sap.ui.unified.CalendarDayType.Type01,
				title: "Head 2",
				tooltip: "Tooltip 2",
				text: "Head of 2 days",
				key: "I2"
			}),
			new sap.ui.unified.CalendarAppointment("IHead3", {
				startDate: new Date("2015", "02", "01", "00", "00"),
				endDate: new Date("2015", "02", "31", "23", "59"),
				type: sap.ui.unified.CalendarDayType.Type02,
				title: "Head 3",
				tooltip: "Tooltip 3",
				text: "Head of 1 month",
				key: "I3"
			})
		]
	}).placeAt("content");

	var initializeRow1 = function(){
		oRow1.setIntervals(12);
		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Hour);
		oRow1.setStartDate(new Date("2015", "01", "01", "10", "15"));
		var aAppointments = oRow1.getAppointments();
		for (var i = 1; i < aAppointments.length; i++){
			aAppointments[i].setSelected(false);
		}

		sap.ui.getCore().applyChanges();
	};

	var oRow2 = new CalendarRow("Row2",  {
		startDate: new Date("2015", "01", "01", "10", "15"),
		height: "100px",
		width: "500px",
		intervals: 5,
		intervalType: sap.ui.unified.CalendarIntervalType.Day,
		tooltip: "Row tooltip",
		showIntervalHeaders: false,
		select: handleSelect,
		intervalSelect: handleIntervalSelect,
		appointments: [
			{
				startDate: new Date("2015", "01", "07", "0", "0"),
				endDate: new Date("2015", "01", "12", "23", "59"),
				title: "Education",
				type: "Type03"
			}
		]
	}).placeAt("content");

	QUnit.module("Properties");

	QUnit.test("Calendar Row", function(assert) {
		//Assert default value
		assert.equal(oRow1.getGroupAppointmentsMode(), sap.ui.unified.GroupAppointmentsMode.Collapsed, "Calendar Row 1: group appointment mode is set");
		//Act
		oRow1.setGroupAppointmentsMode(sap.ui.unified.GroupAppointmentsMode.Expanded);
		//Assert
		assert.equal(oRow1.getGroupAppointmentsMode(), sap.ui.unified.GroupAppointmentsMode.Expanded, "Calendar Row 1: group appointment mode is set");
		//Cleanup
		oRow1.setGroupAppointmentsMode(sap.ui.unified.GroupAppointmentsMode.Collapsed);
	});

	QUnit.test("Calendar Row appointments removed from groups when groupAppointmentsMode is Expanded", function(assert) {
		//Prepare
		var previousGroupAppointmentsMode = oRow1.getGroupAppointmentsMode();
		var previousIntervalType = oRow1.getIntervalType();
		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Month);
		sap.ui.getCore().applyChanges();

		// Assert before act
		var nbItems = oRow1.getAggregation("groupAppointments").length;
		assert.ok(nbItems > 0, "CalendarRow 1: groupAppointments aggregation has " + nbItems + " items.");

		//Act
		oRow1.setGroupAppointmentsMode(sap.ui.unified.GroupAppointmentsMode.Expanded);
		sap.ui.getCore().applyChanges();
		assert.ok(true, "Set the groupAppointmentsMode to Expanded");

		//Assert
		assert.deepEqual(oRow1.getAggregation("groupAppointments").length, 0, "CalendarRow 1: groupAppointments aggregation is empty");

		//Cleanup
		oRow1.setGroupAppointmentsMode(previousGroupAppointmentsMode);
		oRow1.setIntervalType(previousIntervalType);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Calendar Row group appointments are not changed on the phone device when groupAppointmentsMode is Expanded", function(assert) {
		//Prepare
		var deviceStub = this.stub(sap.ui.Device.system, "phone", true);
		var previousIntervalType = oRow1.getIntervalType();
		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Month);
		sap.ui.getCore().applyChanges();
		var previousGroupAppointmentsMode = oRow1.getGroupAppointmentsMode();

		// Assert before act
		var nbItemsBefore = oRow1.getAggregation("groupAppointments").length;
		assert.ok(nbItemsBefore > 0, "CalendarRow 1: groupAppointments aggregation has " + nbItemsBefore + " items");

		//Act
		oRow1.setGroupAppointmentsMode(sap.ui.unified.GroupAppointmentsMode.Expanded);
		sap.ui.getCore().applyChanges();
		assert.ok(true, "Set the groupAppointmentsMode to Expanded");

		//Assert
		var nbItemsAfter = oRow1.getAggregation("groupAppointments").length;
		assert.ok(nbItemsBefore === nbItemsAfter, "CalendarRow 1: groupAppointments aggregation is not changed");

		//Cleanup
		oRow1.setGroupAppointmentsMode(previousGroupAppointmentsMode);
		oRow1.setIntervalType(previousIntervalType);
		sap.ui.getCore().applyChanges();
		deviceStub.restore();
	});

	QUnit.test("Appointment", function(assert) {
		var oAppointment = sap.ui.getCore().byId("App0");
		assert.equal(oAppointment.getKey(), "A0", "Appointment: key set");
		assert.equal(oAppointment.getTitle(), "Appointment 0", "Appointment: Title set");
		assert.equal(oAppointment.getText(), "Appointment of 5 minutes, 2 hour in past", "Appointment: text set");
		assert.equal(oAppointment.getIcon(), "", "Appointment: no icon set");
		assert.equal(oAppointment.getTentative(), false, "Appointment: tentative not set");
		assert.equal(oAppointment.getSelected(), false, "Appointment: selected not set");
	});

	QUnit.module("Rendering");

	QUnit.test("Row", function(assert) {
		assert.ok(!jQuery("#Row1").attr("style"), "Row1: no width and heigh set");
		assert.ok(!jQuery("#Row1").attr("title"), "Row1: no tooltip set");
		assert.equal(jQuery("#Row1").attr("tabindex"), undefined, "Row1: no tab index should be set");

		assert.equal(jQuery("#Row2").css("width"), "500px", "Row2: width set");
		assert.equal(jQuery("#Row2").css("height"), "100px", "Row2: height set");
		assert.equal(jQuery("#Row2").attr("title"), "Row tooltip", "Row2: tooltip set");
	});

	QUnit.test("Appointments row", function(assert) {
		var aIntervals = jQuery("#Row1-Apps").children(".sapUiCalendarRowAppsInt");
		assert.equal(aIntervals.length, 12, "Row1: per default 12 intervals rendered");
		var sStyle = jQuery(aIntervals[0]).attr("style");
		var aTest = sStyle.match(/width:(\s?)(\d+(.?)(\d+))/);
		var iWidth = Math.floor(aTest[2] * 100) / 100;
		assert.equal(iWidth, Math.floor(10000 / 12) / 100 + "", "Row1: interval width");

		aIntervals = jQuery("#Row2-Apps").children(".sapUiCalendarRowAppsInt");
		assert.equal(aIntervals.length, 5, "Row2: 5 intervals rendered");
		sStyle = jQuery(aIntervals[0]).attr("style");
		aTest = sStyle.match(/width:(\s?)(\d+(.?)(\d+))/);
		iWidth = Math.floor(aTest[2] * 100) / 100;
		assert.equal(iWidth, Math.floor(10000 / 5) / 100 + "", "Row2: interval width");

		assert.ok(jQuery("#Row1-Now").get(0), "Now indicatior is rendered");
		assert.ok(!jQuery("#Row1-Now").is(":visible"), "Now indicatior is not visible");
	});

	QUnit.test("Appointments row - non working items", function(assert) {
		var aIntervals = jQuery("#Row1-Apps").children(".sapUiCalendarRowAppsInt");
		var bNonWorkingIntervals = false;

		for (var i = 0; i < aIntervals.length; i++) {
			if (jQuery(aIntervals[i]).hasClass("sapUiCalendarRowAppsNoWork")) {
				bNonWorkingIntervals = true;
			}
		}

		assert.ok(!bNonWorkingIntervals, "Row1: no non working interval displayed");

		oRow1.setNonWorkingHours([11, 12, 14]);
		sap.ui.getCore().applyChanges();
		aIntervals = jQuery("#Row1-Apps").children(".sapUiCalendarRowAppsInt");
		assert.ok(!jQuery(aIntervals[0]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval0 not non-working interval");
		assert.ok(jQuery(aIntervals[1]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval1 non-working interval");
		assert.ok(jQuery(aIntervals[2]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval2 non-working interval");
		assert.ok(!jQuery(aIntervals[3]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval3 not non-working interval");
		assert.ok(jQuery(aIntervals[4]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval4 non-working interval");
		assert.ok(!jQuery(aIntervals[5]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval5 not non-working interval");
		oRow1.setNonWorkingHours();
		sap.ui.getCore().applyChanges();
		aIntervals = jQuery("#Row1-Apps").children(".sapUiCalendarRowAppsInt");
		assert.ok(!jQuery(aIntervals[1]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval1 not non-working interval");

		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Day);
		sap.ui.getCore().applyChanges();
		aIntervals = jQuery("#Row1-Apps").children(".sapUiCalendarRowAppsInt");
		assert.ok(jQuery(aIntervals[0]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval0 non-working interval");
		assert.ok(!jQuery(aIntervals[1]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval1 not non-working interval");
		assert.ok(!jQuery(aIntervals[2]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval2 not non-working interval");
		assert.ok(!jQuery(aIntervals[3]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval3 not non-working interval");
		assert.ok(!jQuery(aIntervals[4]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval4 not non-working interval");
		assert.ok(!jQuery(aIntervals[5]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval5 not non-working interval");
		assert.ok(jQuery(aIntervals[6]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval6 non-working interval");
		assert.ok(jQuery(aIntervals[7]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval7 non-working interval");

		oRow1.setNonWorkingDays([2, 3, 5]);
		sap.ui.getCore().applyChanges();
		aIntervals = jQuery("#Row1-Apps").children(".sapUiCalendarRowAppsInt");
		assert.ok(!jQuery(aIntervals[0]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval0 not non-working interval");
		assert.ok(!jQuery(aIntervals[1]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval1 not non-working interval");
		assert.ok(jQuery(aIntervals[2]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval2 non-working interval");
		assert.ok(jQuery(aIntervals[3]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval3 non-working interval");
		assert.ok(!jQuery(aIntervals[4]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval4 not non-working interval");
		assert.ok(jQuery(aIntervals[5]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval5 non-working interval");
		assert.ok(!jQuery(aIntervals[6]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval6 not non-working interval");
		assert.ok(!jQuery(aIntervals[7]).hasClass("sapUiCalendarRowAppsNoWork"), "Row1: interval7 not non-working interval");

		oRow1.setNonWorkingDays([]);
		sap.ui.getCore().applyChanges();
		aIntervals = jQuery("#Row1-Apps").children(".sapUiCalendarRowAppsInt");
		for (var i = 0; i < aIntervals.length; i++) {
			if (jQuery(aIntervals[i]).hasClass("sapUiCalendarRowAppsNoWork")) {
				bNonWorkingIntervals = true;
			}
		}
		assert.ok(!bNonWorkingIntervals, "Row1: no non working interval displayed");

		oRow1.setNonWorkingDays();
		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Hour);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Appointments - Hours view", function(assert) {
		var $Appointment0 = jQuery("#App0");
		var $Appointment1 = jQuery("#App1");
		var $Appointment2 = jQuery("#App2");
		var $Appointment3 = jQuery("#App3");
		var $Appointment4 = jQuery("#App4");
		var $Appointment5 = jQuery("#App5");
		var $Appointment6 = jQuery("#App6");
		var $Appointment7 = jQuery("#App7");
		var $Appointment8 = jQuery("#App8");
		var $AppointmentDummy = jQuery("#Row1-DummyApp");

		assert.ok(!$Appointment0.get(0), "Appointment0 not rendered");

		assert.ok($Appointment1.get(0), "Appointment1 rendered");
		assert.equal($Appointment1.attr("title"), "Tooltip 1", "Appointment1: tooltip rendered");
		assert.equal(jQuery("#App1-Title").text(), "Appointment 1", "Appointment1: title rendered");
		assert.equal(jQuery("#App1-Text").text(), "Appointment of 2 hours, 1 hour in future", "Appointment1: text rendered");
		assert.equal($Appointment1.attr("tabindex"), "-1", "Appointment1: tabindex -1 rendered");
		assert.ok(jQuery("#App1-Icon").get(0), "Appointment1: icon rendered");
		assert.ok($Appointment1.attr("class").search("sapUiCalendarAppType") < 0, "Appointment1: no type rendered");
		assert.ok(!$Appointment1.hasClass("sapUiCalendarAppTent"), "Appointment1: not rendered as tentative");
		assert.ok(!$Appointment1.hasClass("sapUiCalendarAppSmall"), "Appointment1: not rendered as small appointment");

		assert.ok($Appointment2.get(0), "Appointment2 rendered");
		assert.ok(!jQuery("#App2-Icon").get(0), "Appointment2: no icon rendered");
		assert.equal($Appointment2.attr("tabindex"), "0", "Appointment2: tabindex 0 rendered");
		assert.ok($Appointment2.hasClass("sapUiCalendarAppType01"), "Appointment2: type rendered");
		assert.ok($Appointment2.hasClass("sapUiCalendarAppTent"), "Appointment2: rendered as tentative");
		assert.ok($Appointment1.attr("data-sap-level") != $Appointment2.attr("data-sap-level"), "Appointment 2 has different level than Appointment 1 (as overlapping)");
		assert.ok($Appointment1.offset().top != $Appointment2.offset().top, "Appointment 2 has different level rendered than Appointment 1 (as overlapping)");

		assert.ok($Appointment3.get(0), "Appointment3 rendered");
		assert.equal($Appointment3.attr("tabindex"), "-1", "Appointment3: tabindex -1 rendered");
		assert.ok($Appointment3.hasClass("sapUiCalendarAppType02"), "Appointment3: type rendered");
		assert.ok(Math.abs(Math.floor($Appointment3.offset().left - jQuery("#Row1-AppsInt5").offset().left)) <= 1, "Appointment 3 has same start rendered as Interval 5"); // maybe it varias 1px because of rounding

		assert.ok($Appointment4.get(0), "Appointment4 rendered");
		assert.equal($Appointment4.attr("tabindex"), "-1", "Appointment4: tabindex -1 rendered");
		assert.ok($Appointment4.hasClass("sapUiCalendarAppType03"), "Appointment4: type rendered");

		assert.ok(!$Appointment5.get(0), "Appointment5 not rendered");
		assert.ok(!$Appointment6.get(0), "Appointment6 not rendered");
		assert.ok(!$Appointment7.get(0), "Appointment7 not rendered");
		assert.ok(!$Appointment8.get(0), "Appointment8 not rendered");

		assert.ok($AppointmentDummy.get(0), "Dummy Appointment rendered");
		assert.ok(!$AppointmentDummy.is(":visible"), "Dummy Appointment not visible");

	});

	QUnit.test("Interval headers - Hours view", function(assert) {
		var oHead = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsIntHead")[0];
		assert.ok(oHead, "Interval0: Head area rendered");
		assert.equal(jQuery(oHead).children().length, 0, "Interval0: Head has no content");

		var $Head = jQuery("#IHead1");
		assert.ok($Head.get(0), "Interval2: Header appointment rendered");
		assert.equal($Head.attr("title"), "Tooltip 1", "Interval2: Header appointment has tooltip rendered");
		assert.ok($Head.children().length > 0, "Interval2: Header appointment has content");
		assert.equal(jQuery($Head.find(".sapUiCalendarRowAppsIntHeadTitle")[0]).text(), "Head 1", "Interval2: Head has title rendered");
		assert.equal(jQuery($Head.find(".sapUiCalendarRowAppsIntHeadText")[0]).text(), "Head of one hour", "Interval2: Head has text rendered");
		assert.ok(Math.abs(Math.floor($Head.offset().left - jQuery("#Row1-AppsInt2").offset().left)) <= 1, "Intervalhead has same start rendered as Interval 2"); // maybe it varias 1px because of rounding
		assert.ok(Math.abs(Math.floor(($Head.offset().left + $Head.outerWidth()) - (jQuery("#Row1-AppsInt2").offset().left + jQuery("#Row1-AppsInt2").outerWidth()))) <= 1, "Intervalhead has same end rendered as Interval 2"); // maybe it varias 1px because of rounding

		oHead = jQuery("#Row1-AppsInt2").children(".sapUiCalendarRowAppsIntHead")[0];
		assert.ok(oHead, "Interval2: Head area rendered");
		assert.equal(jQuery(oHead).children().length, 0, "Interval2: Head has no content");

		oHead = jQuery("#Row2-AppsInt0").children(".sapUiCalendarRowAppsIntHead")[0];
		assert.ok(!oHead, "Row2: Interval0: no head area rendered");
	});

	QUnit.test("Subintervals - Hours view", function(assert) {
		var aSubintervals = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsSubInt");
		assert.equal(aSubintervals.length, 0, "No subintervals rendered");

		oRow1.setShowSubIntervals(true);
		sap.ui.getCore().applyChanges();
		aSubintervals = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsSubInt");
		assert.equal(aSubintervals.length, 4, "4 subintervals rendered");
		var sStyle = jQuery(aSubintervals[0]).attr("style");
		var aTest = sStyle.match(/width:(\s?)(\d+(.?)(\d+))/);
		var iWidth = aTest[2];
		assert.equal(iWidth, "25", "subinterval width");

		oRow1.setShowSubIntervals(false);
		sap.ui.getCore().applyChanges();
		aSubintervals = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsSubInt");
		assert.equal(aSubintervals.length, 0, "No subintervals rendered");
	});

	QUnit.test("Appointments - new start date", function(assert) {
		var sLevel = jQuery("#App2").attr("data-sap-level");

		var oDate = new Date();
		oDate.setHours(oDate.getHours() - 3);
		oRow1.setStartDate(oDate);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#Row1-Now").get(0), "Now indicatior is rendered");
		assert.ok(jQuery("#Row1-Now").is(":visible"), "Now indicatior is visible");
		initializeRow1();

		oRow1.setStartDate(new Date("2015", "0", "31", "22", "15"));
		sap.ui.getCore().applyChanges();
		var $Appointment0 = jQuery("#App0");
		var $Appointment1 = jQuery("#App1");
		var $Appointment2 = jQuery("#App2");
		var $Appointment3 = jQuery("#App3");
		var $Appointment4 = jQuery("#App4");
		var $Appointment5 = jQuery("#App5");
		var $Appointment6 = jQuery("#App6");
		var $Appointment7 = jQuery("#App7");
		var $Appointment8 = jQuery("#App8");
		var $AppointmentDummy = jQuery("#Row1-DummyApp");

		assert.ok($Appointment0.get(0), "Appointment0 rendered");
		assert.ok(!$Appointment0.hasClass("sapUiCalendarAppTent"), "Appointment0: not rendered as tentative");
		assert.ok(!$Appointment0.hasClass("sapUiCalendarAppSel"), "Appointment0: not rendered as selected");
		assert.ok($Appointment0.hasClass("sapUiCalendarAppSmall"), "Appointment0: rendered as small appointment");
		// outerWdith() dimensions may be incorrect when the page is zoomed by the user; browsers do not expose an API to detect this condition.
		assert.equal($Appointment0.outerWidth(), $AppointmentDummy.outerWidth(), "Appointment0 hat min. width");
		assert.ok(!$Appointment1.get(0), "Appointment1 not rendered");
		assert.ok($Appointment2.get(0), "Appointment2 rendered");
		assert.equal($Appointment2.attr("data-sap-level"), sLevel, "Appointment2 has same level like before");

		assert.ok(!$Appointment3.get(0), "Appointment3 not rendered");
		assert.ok(!$Appointment4.get(0), "Appointment4 not rendered");
		assert.ok(!$Appointment5.get(0), "Appointment5 not rendered");
		assert.ok(!$Appointment6.get(0), "Appointment6 not rendered");
		assert.ok(!$Appointment7.get(0), "Appointment7 not rendered");
		assert.ok(!$Appointment8.get(0), "Appointment8 not rendered");

	});

	QUnit.test("Appointments - EmptyIntervalHeaders", function(assert) {
		oRow1.setShowEmptyIntervalHeaders(false);
		sap.ui.getCore().applyChanges();
		var oHead = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsIntHead")[0];
		assert.ok(!oHead, "no empty Head area rendered");

		oRow1.setShowEmptyIntervalHeaders(true);
		sap.ui.getCore().applyChanges();
		oHead = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsIntHead")[0];
		assert.ok(oHead, "Interval0: Head area rendered again");
		assert.equal(jQuery(oHead).children().length, 0, "Interval0: Head has no content");

	});

	QUnit.test("Appointments - change properties", function(assert) {
		var oAppointment = sap.ui.getCore().byId("App0");
		oAppointment.setKey("Ap0");
		oAppointment.setTitle("App 0");
		oAppointment.setText("App 0");
		oAppointment.setIcon("sap-icon://sap-ui5");
		oAppointment.setTentative(true);
		oAppointment.setSelected(true);
		sap.ui.getCore().applyChanges();

		var $Appointment0 = jQuery("#App0");
		assert.equal(oAppointment.getKey(), "Ap0", "Appointment: key set");
		assert.equal(oAppointment.getTitle(), "App 0", "Appointment: Title set");
		assert.equal(oAppointment.getText(), "App 0", "Appointment: text set");
		assert.equal(oAppointment.getIcon(), "sap-icon://sap-ui5", "Appointment: icon set");
		assert.equal(oAppointment.getTentative(), true, "Appointment: tentative set");
		assert.equal(oAppointment.getSelected(), true, "Appointment: selected set");

		assert.equal(jQuery("#App0-Title").text(), "App 0", "Appointment0: title rendered");
		assert.equal(jQuery("#App0-Text").text(), "App 0", "Appointment0: text rendered");
		assert.ok(jQuery("#App0-Icon").get(0), "Appointment0: icon rendered");
		assert.ok($Appointment0.hasClass("sapUiCalendarAppTent"), "Appointment0: rendered as tentative");
		assert.ok($Appointment0.hasClass("sapUiCalendarAppSel"), "Appointment0: rendered as selected");

	});

	QUnit.test("Appointment - setSelected(false) updates internal array of selected appointments", function(assert) {
		// Prepare
		var oApp = new CalendarAppointment({
			startDate: new Date(),
			endDate: new Date(),
			selected: true
		}), oCalendarRow = new CalendarRow({
			appointments: [oApp]});

		oCalendarRow.placeAt('qunit-fixture');
		sap.ui.getCore().applyChanges();

		// Pre-Assert
		assert.deepEqual(oCalendarRow.aSelectedAppointments, [oApp.getId()], "Selected appointment is part of CalendarRow's aSelectedAppointments array");

		// Act
		oApp.setSelected(false);

		// Assert
		assert.deepEqual(oCalendarRow.aSelectedAppointments, [], "Deselected appointment is removed from CalendarRow's aSelectedAppointments array");

		// Cleanup
		oCalendarRow.destroy();
	});

	QUnit.test("Appointment - setSelected(true) updates internal array of selected appointments", function(assert) {
		// Prepare
		var oApp = new CalendarAppointment({
			startDate: new Date(),
			endDate: new Date(),
			selected: false
		}), oCalendarRow = new CalendarRow({
			appointments: [oApp]});

		oCalendarRow.placeAt('qunit-fixture');
		sap.ui.getCore().applyChanges();

		// Pre-Assert
		assert.deepEqual(oCalendarRow.aSelectedAppointments, [], "Initially appointment is not part of CalendarRow's aSelectedAppointments array");

		// Act
		oApp.setSelected(true);

		// Assert
		assert.deepEqual(oCalendarRow.aSelectedAppointments, [oApp.getId()], "Selected appointment is part of CalendarRow's aSelectedAppointments array");

		// Cleanup
		oCalendarRow.destroy();
	});

	QUnit.test("Appointments - days view", function(assert) {
		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Day);
		sap.ui.getCore().applyChanges();
		var $Appointment0 = jQuery("#App0");
		var $Appointment1 = jQuery("#App1");
		var $Appointment2 = jQuery("#App2");
		var $Appointment3 = jQuery("#App3");
		var $Appointment4 = jQuery("#App4");
		var $Appointment5 = jQuery("#App5");
		var $Appointment6 = jQuery("#App6");
		var $Appointment7 = jQuery("#App7");
		var $Appointment8 = jQuery("#App8");

		assert.ok($Appointment0.get(0), "Appointment0 rendered");
		assert.ok($Appointment1.get(0), "Appointment1 rendered");
		assert.ok($Appointment2.get(0), "Appointment2 rendered");
		assert.ok($Appointment3.get(0), "Appointment3 rendered");
		assert.ok($Appointment4.get(0), "Appointment4 rendered");
		assert.ok($Appointment5.get(0), "Appointment5 rendered");

		assert.ok($Appointment6.get(0), "Appointment6 rendered");
		assert.ok(Math.abs(Math.floor($Appointment6.offset().left - jQuery("#Row1-AppsInt2").offset().left)) <= 1, "Appointment 6 has same start rendered as Interval 2"); // maybe it varias 1px because of rounding
		assert.ok(Math.abs(Math.floor(($Appointment6.offset().left + $Appointment6.outerWidth()) - (jQuery("#Row1-AppsInt2").offset().left + jQuery("#Row1-AppsInt2").outerWidth()))) <= 1, "Appointment 6 has same end rendered as Interval 2"); // maybe it varias 1px because of rounding

		assert.ok(!$Appointment7.get(0), "Appointment7 not rendered");
		assert.ok(!$Appointment8.get(0), "Appointment8 not rendered");
	});

	QUnit.test("Interval headers - days view", function(assert) {
		var oHead = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsIntHead")[0];
		assert.ok(oHead, "Interval0: Head area rendered");
		assert.equal(jQuery(oHead).children().length, 0, "Interval0: Head has no content");

		var $Head = jQuery("#IHead2");
		assert.ok($Head.get(0), "Interval3: Header appointment rendered");
		assert.equal($Head.attr("title"), "Tooltip 2", "Interval3: Header appointment has tooltip rendered");
		assert.ok($Head.children().length > 0, "Interval3: Header appointment has content");
		assert.equal(jQuery($Head.find(".sapUiCalendarRowAppsIntHeadTitle")[0]).text(), "Head 2", "Interval3: Head has title rendered");
		assert.equal(jQuery($Head.find(".sapUiCalendarRowAppsIntHeadText")[0]).text(), "Head of 2 days", "Interval3: Head has text rendered");
		assert.ok(Math.abs(Math.floor($Head.offset().left - jQuery("#Row1-AppsInt3").offset().left)) <= 1, "Intervalhead has same start rendered as Interval 3"); // maybe it varias 1px because of rounding
		// outerWdith() dimensions may be incorrect when the page is zoomed by the user; browsers do not expose an API to detect this condition.
		assert.ok(Math.abs(Math.floor(($Head.offset().left + $Head.outerWidth()) - (jQuery("#Row1-AppsInt4").offset().left + jQuery("#Row1-AppsInt4").outerWidth()))) <= 1, "Intervalhead has same end rendered as Interval 4"); // maybe it varias 1px because of rounding

		assert.ok(jQuery("#Row1-AppsInt0").hasClass("sapUiCalendarRowAppsIntLast"), "Interval0 is last of month");
		assert.ok(jQuery("#Row1-AppsInt1").hasClass("sapUiCalendarRowAppsIntFirst"), "Interval1 is first of month");
	});

	QUnit.test("Subintervals - days view", function(assert) {
		var aSubintervals = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsSubInt");
		assert.equal(aSubintervals.length, 0, "No subintervals rendered");

		oRow1.setShowSubIntervals(true);
		sap.ui.getCore().applyChanges();
		aSubintervals = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsSubInt");
		assert.equal(aSubintervals.length, 24, "24 subintervals rendered");
		var sStyle = jQuery(aSubintervals[0]).attr("style");
		var aTest = sStyle.match(/width:(\s?)(\d+(.?)(\d+))/);
		var iWidth = Math.floor(aTest[2] * 100) / 100;
		assert.equal(iWidth, Math.floor(10000 / 24) / 100 + "", "subinterval width");

		oRow1.setShowSubIntervals(false);
		sap.ui.getCore().applyChanges();
		aSubintervals = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsSubInt");
		assert.equal(aSubintervals.length, 0, "No subintervals rendered");
	});

	QUnit.test("Appointments - month view", function(assert) {
		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Month);
		sap.ui.getCore().applyChanges();
		var $Appointment0 = jQuery("#App0");
		var $Appointment1 = jQuery("#App1");
		var $Appointment2 = jQuery("#App2");
		var $Appointment3 = jQuery("#App3");
		var $Appointment4 = jQuery("#App4");
		var $Appointment5 = jQuery("#App5");
		var $Appointment6 = jQuery("#App6");
		var $Appointment7 = jQuery("#App7");
		var $Appointment8 = jQuery("#App8");

		assert.ok(!$Appointment0.get(0), "Appointment0 not rendered");
		assert.ok(!$Appointment1.get(0), "Appointment1 not rendered");
		assert.ok(!$Appointment2.get(0), "Appointment2 not rendered");
		assert.ok(!$Appointment3.get(0), "Appointment3 not rendered");
		assert.ok(!$Appointment4.get(0), "Appointment4 not rendered");
		assert.ok(!$Appointment5.get(0), "Appointment5 not rendered");
		assert.ok(!$Appointment6.get(0), "Appointment6 not rendered");

		var $Group0 = jQuery("#Row1-Group0");
		assert.ok($Group0.get(0), "Group appointment rendered");
		assert.equal(jQuery("#Row1-Group0-Title").text(), "7", "Group appointment text");

		assert.ok($Appointment7.get(0), "Appointment7 rendered");
		assert.ok(Math.abs(Math.floor($Appointment7.offset().left - jQuery("#Row1-AppsInt2").offset().left)) <= 1, "Appointment 7 has same start rendered as Interval 2"); // maybe it varias 1px because of rounding
		// outerWdith() dimensions may be incorrect when the page is zoomed by the user; browsers do not expose an API to detect this condition.
		assert.ok(Math.abs(Math.floor(($Appointment7.offset().left + $Appointment7.outerWidth()) - (jQuery("#Row1-AppsInt4").offset().left + jQuery("#Row1-AppsInt4").outerWidth()))) <= 1, "Appointment 7 has same end rendered as Interval 4"); // maybe it varias 1px because of rounding

		assert.ok($Appointment8.get(0), "Appointment8 rendered");
	});

	QUnit.test("Interval headers - month view", function(assert) {
		var oHead = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsIntHead")[0];
		assert.ok(oHead, "Interval0: Head area rendered");
		assert.equal(jQuery(oHead).children().length, 0, "Interval0: Head has no content");

		var $Head = jQuery("#IHead3");
		assert.ok($Head.get(0), "Interval2: Header appointment rendered");
		assert.equal($Head.attr("title"), "Tooltip 3", "Interval2: Header appointment has tooltip rendered");
		assert.ok($Head.children().length > 0, "Interval2: Header appointment has content");
		assert.equal(jQuery($Head.find(".sapUiCalendarRowAppsIntHeadTitle")[0]).text(), "Head 3", "Interval3: Head has title rendered");
		assert.equal(jQuery($Head.find(".sapUiCalendarRowAppsIntHeadText")[0]).text(), "Head of 1 month", "Interval3: Head has text rendered");
		assert.ok(Math.abs(Math.floor($Head.offset().left - jQuery("#Row1-AppsInt2").offset().left)) <= 1, "Intervalhead has same start rendered as Interval 2"); // maybe it varias 1px because of rounding
		assert.ok(Math.abs(Math.floor(($Head.offset().left + $Head.outerWidth()) - (jQuery("#Row1-AppsInt2").offset().left + jQuery("#Row1-AppsInt2").outerWidth()))) <= 1, "Intervalhead has same end rendered as Interval 2"); // maybe it varias 1px because of rounding
	});

	QUnit.test("Subintervals - months view", function(assert) {
		var aSubintervals = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsSubInt");
		assert.equal(aSubintervals.length, 0, "No subintervals rendered");

		oRow1.setShowSubIntervals(true);
		sap.ui.getCore().applyChanges();
		aSubintervals = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsSubInt");
		assert.equal(aSubintervals.length, 31, "31 subintervals rendered (first month)");
		assert.ok(!jQuery(aSubintervals[0]).hasClass("sapUiCalendarRowAppsNoWork"), "Subinterval0 working interval");
		assert.ok(!jQuery(aSubintervals[1]).hasClass("sapUiCalendarRowAppsNoWork"), "Subinterval1 working interval");
		assert.ok(jQuery(aSubintervals[2]).hasClass("sapUiCalendarRowAppsNoWork"), "Subinterval2 non-working interval");
		assert.ok(jQuery(aSubintervals[3]).hasClass("sapUiCalendarRowAppsNoWork"), "Subinterval3 non-working interval");
		assert.ok(!jQuery(aSubintervals[4]).hasClass("sapUiCalendarRowAppsNoWork"), "Subinterval4 working interval");
		assert.ok(!jQuery(aSubintervals[5]).hasClass("sapUiCalendarRowAppsNoWork"), "Subinterval5 working interval");
		assert.ok(!jQuery(aSubintervals[6]).hasClass("sapUiCalendarRowAppsNoWork"), "Subinterval6 working interval");
		assert.ok(!jQuery(aSubintervals[7]).hasClass("sapUiCalendarRowAppsNoWork"), "Subinterval7 working interval");
		assert.ok(!jQuery(aSubintervals[8]).hasClass("sapUiCalendarRowAppsNoWork"), "Subinterval8 working interval");
		assert.ok(jQuery(aSubintervals[9]).hasClass("sapUiCalendarRowAppsNoWork"), "Subinterval9 non-working interval");
		assert.ok(jQuery(aSubintervals[10]).hasClass("sapUiCalendarRowAppsNoWork"), "Subinterval10 non-working interval");

		aSubintervals = jQuery("#Row1-AppsInt1").children(".sapUiCalendarRowAppsSubInt");
		assert.equal(aSubintervals.length, 28, "28 subintervals rendered (second month)");
		var sStyle = jQuery(aSubintervals[0]).attr("style");
		var aTest = sStyle.match(/width:(\s?)(\d+(.?)(\d+))/);
		var iWidth = Math.floor(aTest[2] * 100) / 100;
		assert.equal(iWidth, Math.floor(10000 / 28) / 100 + "", "subinterval width");

		oRow1.setShowSubIntervals(false);
		sap.ui.getCore().applyChanges();
		aSubintervals = jQuery("#Row1-AppsInt0").children(".sapUiCalendarRowAppsSubInt");
		assert.equal(aSubintervals.length, 0, "No subintervals rendered");
	});

	QUnit.test("Appointments - change intervals", function(assert) {
		oRow1.setIntervals(2);
		sap.ui.getCore().applyChanges();
		var aIntervals = jQuery("#Row1-Apps").children(".sapUiCalendarRowAppsInt");
		assert.equal(aIntervals.length, 2, "Row1: 3 intervals rendered");
		var sStyle = jQuery(aIntervals[0]).attr("style");
		var aTest = sStyle.match(/width:(\s?)(\d+(.?)(\d+))/);
		var iWidth = aTest[2];
		assert.equal(iWidth, 100 / 2 + "", "Row1: interval width");

		assert.ok(!jQuery("#App0").get(0), "Appointment0 not rendered");
		assert.ok(!jQuery("#App1").get(0), "Appointment1 not rendered");
		assert.ok(!jQuery("#App2").get(0), "Appointment2 not rendered");
		assert.ok(!jQuery("#App3").get(0), "Appointment3 not rendered");
		assert.ok(!jQuery("#App4").get(0), "Appointment4 not rendered");
		assert.ok(!jQuery("#App5").get(0), "Appointment5 not rendered");
		assert.ok(!jQuery("#App6").get(0), "Appointment6 not rendered");
		assert.ok(!jQuery("#App7").get(0), "Appointment7 not rendered");
		assert.ok(!jQuery("#App8").get(0), "Appointment8 not rendered");
		assert.ok(jQuery("#Row1-Group0").get(0), "Group appointment rendered");
	});

	QUnit.module("Interaction");

	QUnit.test("click on group-appointment", function(assert) {
		qutils.triggerEvent("tap", "Row1-Group0");

		assert.equal(iSelectedGroupAppointments, 7, "Selected Appointments in group");
		assert.ok(sap.ui.getCore().byId("App1").getSelected(), "Appointment1: selected property set");
		assert.ok(sap.ui.getCore().byId("App2").getSelected(), "Appointment1: selected property set");
		assert.ok(sap.ui.getCore().byId("App3").getSelected(), "Appointment1: selected property set");
		assert.ok(sap.ui.getCore().byId("App4").getSelected(), "Appointment1: selected property set");
		assert.ok(sap.ui.getCore().byId("App5").getSelected(), "Appointment1: selected property set");
		assert.ok(sap.ui.getCore().byId("App6").getSelected(), "Appointment1: selected property set");
		assert.equal(sDomRefId, "Row1-Group0", "sDomRefId returns the right ID of the group appointment");
	});

	QUnit.test("click on appointment", function(assert) {
		var sSelectedTextId = InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_SELECTED");
		var sAriaLabel1, sAriaLabel2, sAriaLabel3;
		// initialize Row1
		initializeRow1();

		qutils.triggerEvent("tap", "App1");
		assert.equal(sSelectedAppointmentId, "App1", "Appointment 1: click fires select event");
		assert.ok(!bMultiSelect, "Appointment 1: no multiple selection");
		assert.ok(sap.ui.getCore().byId("App1").getSelected(), "Appointment1: selected property set");
		assert.ok(jQuery("#App1").hasClass("sapUiCalendarAppSel"), "Appointment1: selected rendered");
		sAriaLabel1 = jQuery("#App1").attr("aria-labelledby");
		assert.ok(sAriaLabel1.indexOf(sSelectedTextId) > -1, "Appointment1: selected ARIA text is rendered");
		assert.equal(sDomRefId, "App1", "sDomRefId returns the right ID of the appointment");

		qutils.triggerEvent("tap", "App2-Title");
		assert.ok(!sap.ui.getCore().byId("App1").getSelected(), "Appointment1: selected property not longer set");
		assert.ok(!jQuery("#App1").hasClass("sapUiCalendarAppSel"), "Appointment1: selected not longer rendered");
		assert.equal(sSelectedAppointmentId, "App2", "Appointment 2: click on title fires select event");
		assert.ok(!bMultiSelect, "Appointment 2: no multiple selection");
		assert.ok(sap.ui.getCore().byId("App2").getSelected(), "Appointment2: selected property set");
		assert.ok(jQuery("#App2").hasClass("sapUiCalendarAppSel"), "Appointment2: selected rendered");
		sAriaLabel2 = jQuery("#App2").attr("aria-labelledby");
		assert.ok(sAriaLabel2.indexOf(sSelectedTextId) > -1, "Appointment2: selected ARIA text is rendered");
		sAriaLabel1 = jQuery("#App1").attr("aria-labelledby");
		assert.ok(sAriaLabel1.indexOf(sSelectedTextId) == -1, "Appointment1: selected ARIA text is removed");
		assert.equal(sDomRefId, "App2", "sDomRefId returns the right ID of the appointment");

		qutils.triggerEvent("tap", "App3-Text", {ctrlKey: true});
		assert.ok(sap.ui.getCore().byId("App2").getSelected(), "Appointment2: selected still property set");
		assert.ok(jQuery("#App2").hasClass("sapUiCalendarAppSel"), "Appointment2: selected still rendered");
		assert.equal(sSelectedAppointmentId, "App3", "Appointment 3: click on text fires select event");
		assert.ok(bMultiSelect, "Appointment 3: multiple selection");
		assert.ok(sap.ui.getCore().byId("App3").getSelected(), "Appointment3: selected property set");
		assert.ok(jQuery("#App3").hasClass("sapUiCalendarAppSel"), "Appointment3: selected rendered");
		sAriaLabel3 = jQuery("#App3").attr("aria-labelledby");
		assert.ok(sAriaLabel3.indexOf(sSelectedTextId) > -1, "Appointment3: selected ARIA text is rendered");
		sAriaLabel2 = jQuery("#App2").attr("aria-labelledby");
		assert.ok(sAriaLabel2.indexOf(sSelectedTextId) > -1, "Appointment2: selected ARIA text is still rendered");
		assert.equal(sDomRefId, "App3", "sDomRefId returns the right ID of the appointment");
	});

	QUnit.test("click on interval", function(assert) {
		oIntervalStartDate = undefined;
		oIntervalEndDate = undefined;
		bSubInterval = undefined;
		qutils.triggerEvent("tap", "Row1-AppsInt1");
		assert.ok(oIntervalStartDate && oIntervalEndDate, "IntervalSelect event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalStartDate), "201502011100", "StartDate set");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalEndDate), "201502011159", "EndDate set");
		assert.ok(!bSubInterval, "No sub-interval clicked");

		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Day);
		sap.ui.getCore().applyChanges();
		oIntervalStartDate = undefined;
		oIntervalEndDate = undefined;
		bSubInterval = undefined;
		qutils.triggerEvent("tap", "Row1-AppsInt1");
		assert.ok(oIntervalStartDate && oIntervalEndDate, "IntervalSelect event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalStartDate), "201502020000", "StartDate set");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalEndDate), "201502022359", "EndDate set");
		assert.ok(!bSubInterval, "No sub-interval clicked");

		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Month);
		sap.ui.getCore().applyChanges();
		oIntervalStartDate = undefined;
		oIntervalEndDate = undefined;
		bSubInterval = undefined;
		qutils.triggerEvent("tap", "Row1-AppsInt1");
		assert.ok(oIntervalStartDate && oIntervalEndDate, "IntervalSelect event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalStartDate), "201503010000", "StartDate set");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalEndDate), "201503312359", "EndDate set");
		assert.ok(!bSubInterval, "No sub-interval clicked");

		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Hours);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("click on sub-interval", function(assert) {
		oRow1.setShowSubIntervals(true);
		sap.ui.getCore().applyChanges();
		var aSubIntervals = jQuery("#Row1-AppsInt1").children(".sapUiCalendarRowAppsSubInt");
		oIntervalStartDate = undefined;
		oIntervalEndDate = undefined;
		bSubInterval = undefined;
		qutils.triggerEvent("tap", aSubIntervals[1]);
		assert.ok(oIntervalStartDate && oIntervalEndDate, "IntervalSelect event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalStartDate), "201502011115", "StartDate set");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalEndDate), "201502011129", "EndDate set");
		assert.ok(bSubInterval, "sub-interval clicked");

		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Day);
		sap.ui.getCore().applyChanges();
		aSubIntervals = jQuery("#Row1-AppsInt1").children(".sapUiCalendarRowAppsSubInt");
		oIntervalStartDate = undefined;
		oIntervalEndDate = undefined;
		bSubInterval = undefined;
		qutils.triggerEvent("tap", aSubIntervals[1]);
		assert.ok(oIntervalStartDate && oIntervalEndDate, "IntervalSelect event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalStartDate), "201502020100", "StartDate set");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalEndDate), "201502020159", "EndDate set");
		assert.ok(bSubInterval, "sub-interval clicked");

		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Month);
		sap.ui.getCore().applyChanges();
		aSubIntervals = jQuery("#Row1-AppsInt1").children(".sapUiCalendarRowAppsSubInt");
		oIntervalStartDate = undefined;
		oIntervalEndDate = undefined;
		bSubInterval = undefined;
		qutils.triggerEvent("tap", aSubIntervals[1]);
		assert.ok(oIntervalStartDate && oIntervalEndDate, "IntervalSelect event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalStartDate), "201503020000", "StartDate set");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalEndDate), "201503022359", "EndDate set");
		assert.ok(bSubInterval, "sub-interval clicked");

		oRow1.setIntervalType(sap.ui.unified.CalendarIntervalType.Hours);
		oRow1.setShowSubIntervals(false);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("keyboard arrow navigation", function(assert) {
		initializeRow1();
		jQuery("#App1").focus();
		assert.equal(document.activeElement.id, "App1", "Appointment1 focused");
		assert.equal(jQuery("#App1").attr("tabindex"), "0", "Appointment1: tabindex 0 rendered");
		assert.equal(jQuery("#App2").attr("tabindex"), "-1", "Appointment2: tabindex -1 rendered");
		assert.equal(oRow1.getFocusedAppointment().getId(), "App1", "Appointment1 returned by getFocusedAppointment");

		bStartDateChange = false;
		qutils.triggerKeydown("App1", "ARROW_RIGHT");
		sap.ui.getCore().applyChanges();
		assert.equal(document.activeElement.id, "App3", "Appointment3 focused");
		assert.equal(jQuery("#App3").attr("tabindex"), "0", "Appointment3: tabindex 0 rendered");
		assert.equal(jQuery("#App1").attr("tabindex"), "-1", "Appointment1: tabindex -1 rendered");
		assert.equal(oRow1.getFocusedAppointment().getId(), "App3", "Appointment3 returned by getFocusedAppointment");
		assert.ok(!bStartDateChange, "StartDateChange event not fired");

		jQuery("#App2").focus();
		assert.equal(document.activeElement.id, "App2", "Appointment2 focused");
		assert.equal(jQuery("#App1").attr("tabindex"), "-1", "Appointment1: tabindex 0 rendered");
		assert.equal(jQuery("#App2").attr("tabindex"), "0", "Appointment2: tabindex -1 rendered");
		assert.equal(oRow1.getFocusedAppointment().getId(), "App2", "Appointment2 returned by getFocusedAppointment");

		qutils.triggerKeydown("App2", "ARROW_LEFT");
		sap.ui.getCore().applyChanges();
		assert.equal(document.activeElement.id, "App0", "Appointment0 focused");
		assert.equal(jQuery("#App0").attr("tabindex"), "0", "Appointment0: tabindex 0 rendered");
		assert.equal(jQuery("#App2").attr("tabindex"), "-1", "Appointment2: tabindex -1 rendered");
		assert.equal(oRow1.getFocusedAppointment().getId(), "App0", "Appointment0 returned by getFocusedAppointment");
		assert.ok(bStartDateChange, "StartDateChange event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oStartDate), "201502010800", "new Start date");
	});

	QUnit.test("keyboard HOME/END navigation", function(assert) {
		initializeRow1();
		jQuery("#App1").focus();
		bStartDateChange = false;
		qutils.triggerKeydown("App1", "HOME");
		sap.ui.getCore().applyChanges();
		assert.equal(document.activeElement.id, "App0", "Appointment0 focused");
		assert.equal(jQuery("#App0").attr("tabindex"), "0", "Appointment0: tabindex 0 rendered");
		assert.equal(jQuery("#App1").attr("tabindex"), "-1", "Appointment1: tabindex -1 rendered");
		assert.equal(oRow1.getFocusedAppointment().getId(), "App0", "Appointment0 returned by getFocusedAppointment");
		assert.ok(bStartDateChange, "StartDateChange event fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oStartDate), "201502010800", "new Start date");

		bStartDateChange = false;
		qutils.triggerKeydown("App0", "END");
		sap.ui.getCore().applyChanges();
		assert.equal(document.activeElement.id, "App4", "Appointment4 focused");
		assert.equal(jQuery("#App0").attr("tabindex"), "-1", "Appointment0: tabindex -1 rendered");
		assert.equal(jQuery("#App4").attr("tabindex"), "0", "Appointment4: tabindex 0 rendered");
		assert.equal(oRow1.getFocusedAppointment().getId(), "App4", "Appointment4 returned by getFocusedAppointment");
		assert.ok(!bStartDateChange, "StartDateChange event not fired");
	});

	QUnit.test("keyboard selection", function(assert) {
		jQuery("#App0").focus();
		qutils.triggerKeydown("App0", "ENTER");
		assert.equal(sSelectedAppointmentId, "App0", "Appointment 0: ENTER fires select event");
		assert.ok(!bMultiSelect, "Appointment 0: no multiple selection");
		assert.ok(sap.ui.getCore().byId("App0").getSelected(), "Appointment0: selected property set");
		assert.ok(jQuery("#App0").hasClass("sapUiCalendarAppSel"), "Appointment0: selected rendered");
	});

	QUnit.test("keyboard leaveRow", function(assert) {
		bLeaveRow = false;
		sType = undefined;
		jQuery("#App0").focus();
		qutils.triggerKeydown("App0", "ARROW_UP");
		assert.ok(bLeaveRow, "LeaveRow event fired");
		assert.equal(sType, "sapup", "LeaveRow event 'type' parameter set");

		bLeaveRow = false;
		sType = undefined;
		qutils.triggerKeydown("App0", "ARROW_DOWN");
		assert.ok(bLeaveRow, "LeaveRow event fired");
		assert.equal(sType, "sapdown", "LeaveRow event 'type' parameter set");

		bLeaveRow = false;
		qutils.triggerKeydown("App0", "HOME");
		assert.ok(bLeaveRow, "LeaveRow event fired");
		assert.equal(sType, "saphome", "LeaveRow event 'type' parameter set");

		bLeaveRow = false;
		jQuery("#App1").focus();
		qutils.triggerKeydown("App1", "HOME");
		assert.ok(!bLeaveRow, "No LeaveRow event fired");

		bLeaveRow = false;
		qutils.triggerKeydown("App0", "END");
		assert.ok(!bLeaveRow, "NoLeaveRow event fired");

		bLeaveRow = false;
		qutils.triggerKeydown("App4", "END");
		assert.ok(bLeaveRow, "LeaveRow event fired");
		assert.equal(sType, "sapend", "LeaveRow event 'type' parameter set");
	});

	QUnit.module("functions");

	QUnit.test("focusAppointment", function(assert) {
		oRow1.focusAppointment(sap.ui.getCore().byId("App2"));
		assert.equal(document.activeElement.id, "App2", "Appointment2 focused");
	});

	QUnit.test("focusNearestAppointment", function(assert) {
		oRow1.focusNearestAppointment(new Date("2015", "01", "01", "11", "00"));
		assert.equal(document.activeElement.id, "App1", "Appointment1 focused");
	});

	QUnit.test("_determineVisibleAppointments", function (assert) {
		//arrange
		var aAppointments = oRow2.getAppointments(),
			oApp = aAppointments[0];

		//assert
		assert.ok(!oApp.$().is(":visible"), "The appointment is visible");
		//arrange
		oRow2.setIntervalType(sap.ui.unified.CalendarIntervalType.Month);
		sap.ui.getCore().applyChanges();
		//assert
		assert.ok(oApp.$().is(":visible"), "The first appointment is visible");
		assert.equal(oRow2._getVisibleAppointments().length, 1, "The number of visible appointments is as expected");
	});

	QUnit.test("_setCustomAppointmentsSorterCallback after initial rendering", function (assert) {
		//arrange and act
		oRow1._setCustomAppointmentsSorterCallback(function(oApp1, oApp2) {
			if (oApp1.getType() > oApp2.getType()) {
				return 1;
			}
			if (oApp1.getType() < oApp2.getType()) {
				return -1;
			}
			return 0;
		});
		sap.ui.getCore().applyChanges();
		assert.equal(oRow1._aVisibleAppointments[0].level, "0", "Appointment1 now has level 0");

	});

	QUnit.test("_setCustomAppointmentsSorterCallback", function (assert) {
		//arrange and act
		var fnCustom = this.spy();
		oRow1._setCustomAppointmentsSorterCallback(fnCustom);
		sap.ui.getCore().applyChanges();

		//assert
		assert.equal(oRow1._fnCustomSortedAppointments, fnCustom,
				"_setCustomAppointmentsSorterCallback sets a function to the _fnCustomSortedAppointments");
		assert.ok(fnCustom.callCount > 0,
				"_setCustomAppointmentsSorterCallback calls the custom sort function");
	});

QUnit.module("RTL", {
		beforeEach: function () {
			//Arrange
			this.bOriginalRTLMode = sap.ui.getCore().getConfiguration().getRTL();
			sap.ui.getCore().getConfiguration().setRTL(true);

			this.oRowRTL = new CalendarRow("RowRTL",  {
				startDate: new Date("2015", "01", "01", "10", "15"),
				intervalType: sap.ui.unified.CalendarIntervalType.Day,
				appointments: [
					new CalendarAppointment("App0RTL", {
						startDate: new Date("2015", "01", "01", "08", "15"),
						endDate: new Date("2015", "01", "01", "08", "20")
					}),
					new CalendarAppointment("App1RTL", {
						startDate: new Date("2015", "01", "01", "11", "15"),
						endDate: new Date("2015", "01", "01", "13", "15")
					}),
					new CalendarAppointment("App2RTL", {
							startDate: new Date("2015", "01", "01", "09", "45"),
							endDate: new Date("2015", "01", "01", "11", "45")
						}),
					new CalendarAppointment("App3RTL", {
							startDate: new Date("2015", "01", "01", "15", "00"),
							endDate: new Date("2015", "01", "01", "15", "30")
						})
				]
			});
			this.oRowRTL.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			//Cleanup
			sap.ui.getCore().getConfiguration().setRTL(this.bOriginalRTLMode);
			this.oRowRTL.destroy();
		}
	});

QUnit.test("keyboard arrow navigation", function(assert) {
	jQuery("#App1RTL").focus();
	assert.equal(document.activeElement.id, "App1RTL", "Appointment1 focused");
	assert.equal(jQuery("#App1RTL").attr("tabindex"), "0", "Appointment1: tabindex 0 rendered");
	assert.equal(jQuery("#App2RTL").attr("tabindex"), "-1", "Appointment2: tabindex -1 rendered");
	assert.equal(this.oRowRTL.getFocusedAppointment().getId(), "App1RTL", "Appointment1 returned by getFocusedAppointment");

	qutils.triggerKeydown("App1RTL", "ARROW_LEFT");
	sap.ui.getCore().applyChanges();
	assert.equal(document.activeElement.id, "App3RTL", "Appointment3 focused");
	assert.equal(jQuery("#App3RTL").attr("tabindex"), "0", "Appointment3: tabindex 0 rendered");
	assert.equal(jQuery("#App1RTL").attr("tabindex"), "-1", "Appointment1: tabindex -1 rendered");
	assert.equal(this.oRowRTL.getFocusedAppointment().getId(), "App3RTL", "Appointment3 returned by getFocusedAppointment");

	jQuery("#App2RTL").focus();
	assert.equal(document.activeElement.id, "App2RTL", "Appointment2 focused");
	assert.equal(jQuery("#App1RTL").attr("tabindex"), "-1", "Appointment1: tabindex 0 rendered");
	assert.equal(jQuery("#App2RTL").attr("tabindex"), "0", "Appointment2: tabindex -1 rendered");
	assert.equal(this.oRowRTL.getFocusedAppointment().getId(), "App2RTL", "Appointment2 returned by getFocusedAppointment");

	qutils.triggerKeydown("App2RTL", "ARROW_RIGHT");
	sap.ui.getCore().applyChanges();
	assert.equal(document.activeElement.id, "App0RTL", "Appointment0 focused");
	assert.equal(jQuery("#App0RTL").attr("tabindex"), "0", "Appointment0: tabindex 0 rendered");
	assert.equal(jQuery("#App2RTL").attr("tabindex"), "-1", "Appointment2: tabindex -1 rendered");
	assert.equal(this.oRowRTL.getFocusedAppointment().getId(), "App0RTL", "Appointment0 returned by getFocusedAppointment");
});

QUnit.test("Now indicator is displayed on the right", function(assert) {
	var oDate = new Date();
	oDate.setHours(oDate.getHours() - 3);
	this.oRowRTL.setStartDate(oDate);
	sap.ui.getCore().applyChanges();
	assert.ok(jQuery("#RowRTL-Now").is(":visible"), "Now indicatior is visible");
	assert.ok(jQuery("#RowRTL-Now").css("right"), "Now indicatior is displayed on the right");
});

QUnit.module("Accessibility", {
	beforeEach: function () {
		this.sut = new CalendarRow({
			startDate: new Date(2017, 3, 1, 12, 0, 0, 0),
			width: "100%",
			appointments: [
				new CalendarAppointment({
					startDate: new Date(2017, 3, 1, 13, 0, 0, 0),
					endDate: new Date(2017, 3, 1, 18, 30, 0, 0),
					type: sap.ui.unified.CalendarDayType.None,
					title: "Appointment 0",
					tooltip: "Tooltip 0",
					text: "Appointment in the past",
					key: "app-0"
				}),
				new CalendarAppointment({
					startDate: new Date(2017, 3, 1, 9, 15, 0, 0),
					endDate: new Date(2017, 3, 1, 19, 45, 0, 0),
					type: sap.ui.unified.CalendarDayType.Type01,
					title: "Appointment 1",
					tooltip: "Tooltip 1",
					text: "Appointment of 2 hours, 1 hour in future",
					icon: "sap-icon://call",
					key: "app-1"
				}),
				new CalendarAppointment({
					startDate: new Date(2017, 3, 1, 14, 0, 0, 0),
					endDate: new Date(2017, 3, 1, 16, 0, 0, 0),
					type: sap.ui.unified.CalendarDayType.Type02,
					tentative: true,
					title: "Appointment 2",
					tooltip: "Tooltip 2",
					text: "Appointment of 2 hour, 30 minutes in past",
					key: "app-2"
				})
			]
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
	},
	afterEach: function () {
		this.sut.destroy();
		this.sut = undefined;
	}
});

QUnit.test("CalendarRow '_oFormatAria' formatter", function (assert) {
	var that = this,
		fnGetAriaDescriptionText = function (oAppointment) {
			if (!(oAppointment && oAppointment instanceof sap.ui.unified.CalendarAppointment)) {
				return;
			}
			var sLocalizedStart = that.sut._oRb.getText("CALENDAR_START_TIME"),
				sFormattedStartDate = that.sut._oFormatAria.format(oAppointment.getStartDate()),
				sLocalizedEnd = that.sut._oRb.getText("CALENDAR_END_TIME"),
				sFormattedEndDate = that.sut._oFormatAria.format(oAppointment.getEndDate()),
				sTooltip = oAppointment.getTooltip() || "";
				sType = oAppointment.getType() !== CalendarDayType.None ? "; " + CalendarLegendRenderer.getTypeAriaText(oAppointment.getType()).getText() : "";

			return sLocalizedStart + ": " + sFormattedStartDate + "; " + sLocalizedEnd + ": " + sFormattedEndDate + "; " + sTooltip + sType;
		},
		aAppointments = this.sut.getAppointments();

	assert.ok(this.sut._oFormatAria, "Formatter has been initialized");
	assert.ok(this.sut._oFormatAria instanceof sap.ui.core.format.DateFormat, "Formatter is of a correct type");
	assert.ok(this.sut._oFormatAria.oFormatOptions.pattern.indexOf("E") > -1, "Formatted date/datetime string includes weekday");
	aAppointments.forEach(function (oAppointment, iIndex) {
		var sExpectedDescription = fnGetAriaDescriptionText(oAppointment),
			oAppointmentDescElement = oAppointment.$("Descr");

		if (oAppointmentDescElement.length) {
			assert.strictEqual(oAppointmentDescElement.text(), sExpectedDescription, "The text node of the appointment " + iIndex + " 'aria-describedby' element has correct value");
		} else {
			assert.ok(true, "The appointment " + iIndex + " is not displayed in the current viewport");
		}
	});
});

QUnit.module("Pure unit testing");
	QUnit.test("CalendarRowRender.getAriaTextForType", function (assert) {
		//Prepare
		var aLegendItems1to2 =
				[
					new CalendarLegendItem({type: CalendarDayType.Type01, text: "Day off"}),
					new CalendarLegendItem({type: CalendarDayType.Type02, text: "On Duty"})
				],
			sResult1,
			sResult2;

		//Act
		sResult1 = CalendarRowRenderer.getAriaTextForType(CalendarDayType.Type01, aLegendItems1to2);
		sResult2 = CalendarRowRenderer.getAriaTextForType(CalendarDayType.Type03, aLegendItems1to2);

		//Assert
		assert.equal(sResult1, "Day off", "When the given type  matches legend item's type");
		assert.equal(sResult2, CalendarLegendRenderer.typeARIATexts[CalendarDayType.Type03].getText(),
			"When the given type does not match legend item's type");
		assert.equal(sResult2, CalendarLegendRenderer.typeARIATexts[CalendarDayType.Type03].getText(),
			"When the legendItems is not given");

		//Cleanup - nothing to lean
	});
});