/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/UIAreaRegistry",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/DateTimePicker",
	"sap/m/Label",
	"sap/m/Button",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/type/String",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/Device",
	"sap/m/TimePickerClocks",
	"sap/ui/core/Popup",
	"sap/ui/core/format/DateFormat",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes",
	"sap/ui/unified/DateRange",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/date/UI5Date",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/type/DateTimeOffset",
	// load all required calendars in advance
	"sap/ui/core/date/Islamic"
], function(
	Localization,
	Element,
	Library,
	UIAreaRegistry,
	qutils,
	createAndAppendDiv,
	DateTimePicker,
	Label,
	Button,
	JSONModel,
	DateTime,
	TypeString,
	ODataDateTime,
	Device,
	TimePickerClocks,
	Popup,
	DateFormat,
	nextUIUpdate,
	jQuery,
	KeyCodes,
	DateRange,
	ManagedObjectObserver,
	UI5Date,
	DateTimeWithTimezone,
	DateTimeOffset
) {
	"use strict";

	createAndAppendDiv("content");
	// special UIArea for simulating a small screen
	createAndAppendDiv("contentSmall").style.width = "200px";


	var sValue = "";
	var bValid = false;
	var sId = "";

	function handleChange(oEvent){
			var oDTP = oEvent.oSource;
			sValue = oEvent.getParameter("newValue");
			bValid = oEvent.getParameter("valid");
			sId = oDTP.getId();
		}

	var oDTP1 = new DateTimePicker("DTP1", {
		change: handleChange
		}).placeAt("content");

	var oDTP2 = new DateTimePicker("DTP2", {
		width: "250px",
		value: "2016-02-17,10-11-12",
		valueFormat: "yyyy-MM-dd,HH-mm-ss",
		displayFormat: "dd+MM+yyyy:HH+mm",
		change: handleChange
		}).placeAt("content");

	var oDTP3 = new DateTimePicker("DTP3", {
		dateValue: UI5Date.getInstance("2016", "01", "17", "10", "11", "12"),
		displayFormat: "short",
		change: handleChange
		}).placeAt("content");

	var oDTP4 = new DateTimePicker("DTP4", {
		width: "250px",
		value: {
			path: "/dateValue",
			type: new DateTime({style: "medium", strictParsing: true})}
		}).placeAt("content");

	//BCP: 	1970509170
	var oDTP6 = new DateTimePicker("oDTP6", {
		dateValue: UI5Date.getInstance("2019", "9", "25", "11", "12", "13")
	}).placeAt("content");

	// attach the model and central parse and validation handlers to the UIArea
	// Note: 2nd UIArea (contentSmall) does not require data binding or validation handlers
	const oUIArea = UIAreaRegistry.get("content");

	var oModel = new JSONModel();
	oModel.setData({
		dateValue: UI5Date.getInstance("2016", "01", "17", "10", "11", "12")
	});
	oUIArea.setModel(oModel);

	oUIArea.attachParseError(
			function(oEvent) {
				sId = oEvent.getParameter("element").getId();
				sValue = oEvent.getParameter('newValue');
				bValid = false;
			});

	oUIArea.attachValidationSuccess(
			function(oEvent) {
				sId = oEvent.getParameter("element").getId();
				sValue = oEvent.getParameter('newValue');
				bValid = true;
			});


	QUnit.module("initialization");

	QUnit.test("Date formatter", function(assert) {
		assert.ok(!oDTP1.getValue(), "DTP1: no value");
		assert.ok(!oDTP1.getDateValue(), "DTP1: no DateValue");
		assert.equal(oDTP2.getValue(), "2016-02-17,10-11-12", "DTP2: Value in internal format set");
		assert.equal(oDTP2.getDateValue().getTime(), UI5Date.getInstance("2016", "01", "17", "10", "11", "12").getTime(), "DTP2: DateValue set");
		// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oDTP3.getValue(), "Feb 17, 2016, 10:11:12\u202fAM", "DTP3: Value in internal format set");
		assert.equal(oDTP3.getDateValue().getTime(), UI5Date.getInstance("2016", "01", "17", "10", "11", "12").getTime(), "DTP3: DateValue set");
		assert.equal(oDTP4.getValue(), "Feb 17, 2016, 10:11:12\u202fAM", "DTP4: Value in internal format set");
		assert.equal(oDTP4.getDateValue().getTime(), UI5Date.getInstance("2016", "01", "17", "10", "11", "12").getTime(), "DTP4: DateValue set");
		assert.equal(oDTP6.getValue(), "Oct 25, 2019, 11:12:13\u202fAM", "oDTP6: Default Value Format Set");
	});

	QUnit.test("Calendar instance is created poroperly", function(assert) {
		//Prepare
		var oDTP = new DateTimePicker().placeAt("content"),
			oCalendar;

		//Act
		oDTP._createPopup();
		oDTP._createPopupContent();
		oCalendar = oDTP._getCalendar();

		//Assert
		assert.ok(oCalendar.hasListeners("cancel"), "Cancel event listener is added");

		//Clean
		oDTP.destroy();
	});

	QUnit.test("Popover instance is properly configured on desktop", function(assert) {
		// Prepare
		var oDTP = new DateTimePicker().placeAt("qunit-fixture"),
			oSetDurationsSpy = this.spy(Popup.prototype, "setDurations");

		// Act
		oDTP._createPopup();

		// Assert
		assert.ok(oSetDurationsSpy.calledOnce, "Popup opening and closing animation durations are set.");
	});

	QUnit.module("API");

	QUnit.test("setMinDate/setMaxDate preserve the time part for internal oMinDate/oMaxDate properties", function (assert) {
		//Prepare
		var oDateTime1 = UI5Date.getInstance(2017, 0, 1, 13, 12, 3),
			oDateTime2 = UI5Date.getInstance(2017, 0, 10, 13, 3, 12),
			oSut;

		//Act
		oSut = new DateTimePicker({
			minDate: oDateTime1,
			maxDate: oDateTime2
		});

		//Assert
		assert.equal(oSut._oMinDate.toString(), oDateTime1.toString(), "Time part of _oMinDate should be as given by the app");
		assert.equal(oSut._oMaxDate.toString(), oDateTime2.toString(), "Time part of _oMaxDate should be as given by the app");

		//Cleanup - redundant
	});

	QUnit.test("maxDate being yesterday should not throw error on open", async function (assert) {
		// Arrange
		var oYesterdayDate = UI5Date.getInstance(),
			oDP = new DateTimePicker("DatePicker").placeAt("qunit-fixture");

		oYesterdayDate.setDate(oYesterdayDate.getDate() - 1);

		// Act
		oDP.setMaxDate(oYesterdayDate);
		await nextUIUpdate();
		qutils.triggerEvent("click", "DatePicker-icon");

		// Assert
		assert.ok(true, "No error is thrown when DateTimePicker opens and maxDate is yesterday");

		// Clean
		oDP.destroy();
	});

	QUnit.test("showCurrentTimeButton - button existence", async function(assert) {
		// Prepare
		var oDTP = new DateTimePicker({
			showCurrentTimeButton: true
		}).placeAt("qunit-fixture");
		await nextUIUpdate();
		oDTP.toggleOpen();
		await nextUIUpdate();

		// Assert
		assert.ok(oDTP._oClocks.getShowCurrentTimeButton(), "Now button visibility is propagated to the clocks");
	});

	QUnit.test("valueFormat and displayFormat when value is bound", async function(assert) {
		var oModel = new JSONModel({ date: UI5Date.getInstance(Date.UTC(2016, 1, 18, 8, 0, 0)) }),
			oDTP,
			oInputRef;

		// arrange
		this.stub(Localization, "getTimezone").callsFake(function() {
			return "Europe/Sofia";
		});

		// both value format and display format should
		// be ignored when the value is bound to a known type
		oDTP = new DateTimePicker("dtpb", {
			valueFormat: "dd-MM-yyyy-HH-mm-ss",
			displayFormat: "short",
			value: {
				path: '/date',
				type: "sap.ui.model.type.DateTime"
			}
		}).setModel(oModel);

		oDTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		oInputRef = oDTP.$("inner");

		// assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oInputRef.val(), "Feb 18, 2016, 10:00:00\u202fAM", "correct displayed value");

		// act - type into the input
		oInputRef.val("Feb 18, 2016, 9:00:00 AM");
		qutils.triggerKeydown("dtpb-inner", KeyCodes.ENTER, false, false, false);
		oInputRef.trigger("change");

		// assert
		assert.equal(oModel.getProperty('/date').getTime(), Date.UTC(2016, 1, 18, 7, 0, 0), "correct model value");

		// clean
		oDTP.destroy();
	});

	QUnit.test("Overwriting the user input with model updates will be prevented", async function (assert) {
		// Prepare
		var oDTP = new DateTimePicker(),
			oHandleInputValueConcurrencySpy = this.spy(oDTP, "handleInputValueConcurrency");

		oDTP.setPreferUserInteraction(true);
		oDTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oDTP.setValue("test value");

		// Assert
		assert.ok(oHandleInputValueConcurrencySpy.calledOnce, "Model update is prevented");

		// Clean
		oDTP.destroy();
	});

	QUnit.module("Rendering");

	QUnit.test("date format", function(assert) {
		assert.ok(!jQuery("#DTP1").find("input").val(), "DTP1: empty date");
		assert.equal(jQuery("#DTP2").find("input").val(), "17+02+2016:10+11", "DTP2: defined output format used");
		// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(jQuery("#DTP3").find("input").val(), "2/17/16, 10:11\u202fAM", "DTP3: defined output format used");
		assert.equal(jQuery("#DTP4").find("input").val(), "Feb 17, 2016, 10:11:12\u202fAM", "DTP4: defined output format from binding used");
	});

	QUnit.test("placeholder", function(assert) {
		var sPlaceholderPrefix = Library.getResourceBundleFor("sap.ui.core").getText("date.placeholder").split("{")[0];
		if (Device.support.input.placeholder) {
			assert.ok(jQuery("#DTP1").find("input").attr("placeholder").includes(sPlaceholderPrefix) , "DTP1: placeholder");
			assert.ok(jQuery("#DTP2").find("input").attr("placeholder").includes(sPlaceholderPrefix), "DTP2: placeholder");
			assert.ok(jQuery("#DTP3").find("input").attr("placeholder").includes(sPlaceholderPrefix), "DTP3: placeholder");
			assert.ok(jQuery("#DTP4").find("input").attr("placeholder").includes(sPlaceholderPrefix), "DTP4: placeholder from binding used");
		} else {
			assert.ok(!jQuery("#DTP1").find("input").attr("placeholder"), "No placeholder attribute");
		}
	});

	QUnit.test("_fillDateRange works with max date when the current date is after the max date", async function(assert) {
		var oDateTimePicker = new DateTimePicker("DTPMinMax").placeAt("content"),
			oNewMinDate = UI5Date.getInstance(2014, 0, 1),
			oNewMaxDate = UI5Date.getInstance(2014, 11, 31),
			oNewMaxDateUTC = UI5Date.getInstance(Date.UTC(oNewMaxDate.getFullYear(), oNewMaxDate.getMonth(), oNewMaxDate.getDate())),
			oFocusedDate;

		//arrange
		oDateTimePicker.setMinDate(oNewMinDate);
		oDateTimePicker.setMaxDate(oNewMaxDate);
		await nextUIUpdate();



		//act
		oDateTimePicker.focus();
		qutils.triggerEvent("click", "DTPMinMax-icon");

		oFocusedDate = oDateTimePicker._oCalendar._getFocusedDate().toUTCJSDate();

		//assert
		assert.equal(oFocusedDate.toString(), oNewMaxDateUTC.toString(), "oDateTimePicker: focused date equals min date when current date is out of the min/max range");

		//clean
		oDateTimePicker.destroy();
	});

	QUnit.test("_fillDateRange works with min date when the current date is before the min date", async function(assert) {
		var oDateTimePicker = new DateTimePicker("DTPMinMax").placeAt("content"),
			oDate = UI5Date.getInstance(),
			oDateTomorow = UI5Date.getInstance(oDate.getFullYear(), oDate.getMonth(), oDate.getDate() + 1),
			oMinDateUTC = UI5Date.getInstance(Date.UTC(oDateTomorow.getFullYear(), oDateTomorow.getMonth(), oDateTomorow.getDate())),
			oFocusedDate;

		//arrange
		oDateTimePicker.setMinDate(oDateTomorow);
		await nextUIUpdate();

		//act
		oDateTimePicker.focus();
		qutils.triggerEvent("click", "DTPMinMax-icon");

		oFocusedDate = oDateTimePicker._oCalendar._getFocusedDate().toUTCJSDate();

		//assert
		assert.equal(oFocusedDate.toString(), oMinDateUTC.toString(), "oDateTimePicker: focused date equals min date when current date is out of the min/max range");

		//clean
		oDateTimePicker.destroy();
	});

	// QUnit.test("Swticher is rendered and visible on small screen size", async function(assert) {
	// 	// Arrange
	// 	var done = assert.async();
	// 	var	oDTP7 = new DateTimePicker("DTP7", {}),
	// 		oAfterRenderingDelegate,
	// 		oCalendar;

	// 	oDTP7.placeAt("content");
	// 	await nextUIUpdate();
	// 	oDTP7.focus();

	// 	qutils.triggerEvent("click", "DTP7-icon");
	// 	await nextUIUpdate();
	// 	oCalendar = oDTP7._getCalendar();
	// 	oAfterRenderingDelegate = {
	// 		onAfterRendering: function() {
	// 			assert.ok(jQuery("#DTP7-PC-Switch")[0], "Swicher rendered");
	// 			assert.ok(jQuery("#DTP7-PC-Switch").is(":visible"), "Swicher is visible");
	// 			oCalendar.removeDelegate(oCalendar);
	// 			oDTP7.destroy();
	// 			done();
	// 		}
	// 	};

	// 	// Assert
	// 	oCalendar.addDelegate(oAfterRenderingDelegate);

	// 	// Act
	// 	oDTP7._handleWindowResize({name: "Phone"});
	// });

	// QUnit.test("Swticher is rendered and hidden on large screen size", async function(assert) {
	// 	// Arrange
	// 	var done = assert.async(),
	// 		oDTP8 = new DateTimePicker("DTP8", {}),
	// 		oAfterRenderingDelegate,
	// 		oCalendar;

	// 	oDTP8.placeAt("content");
	// 	await nextUIUpdate(this.clock);
	// 	oDTP8.focus();

	// 	qutils.triggerEvent("click", "DTP8-icon");
	// 	await nextUIUpdate(this.clock);
	// 	oCalendar = oDTP8._getCalendar();
	// 	oAfterRenderingDelegate = {
	// 		onAfterRendering:  function() {
	// 			assert.ok(jQuery("#sap-ui-invisible-DTP8-PC-Switch")[0], "Swicher rendered");
	// 			assert.ok(jQuery("#sap-ui-invisible-DTP8-PC-Switch").is(":hidden"), "Swicher is hidden");
	// 			oCalendar.removeDelegate(oCalendar);
	// 			oDTP8.destroy();
	// 			done();
	// 		}
	// 	};

	// 	// Assert
	// 	oCalendar.addDelegate(oAfterRenderingDelegate);

	// 	// Act
	// 	oDTP8._handleWindowResize({name: "Tablet"});
	// });

	QUnit.module("initialFocusedDate property", {
		beforeEach: async function () {
			this.oDTp = new DateTimePicker();
			this.oDTp.placeAt("qunit-fixture");
			await nextUIUpdate();
		},

		afterEach: async function () {
			this.oDTp.destroy();
			await nextUIUpdate();
			this.oDTp = null;
		}
	});

	QUnit.test("_fillDateRange should call Calendar's focusDate method and clocks _setTimeValues with initialFocusedDateValue if no value is set", function (assert) {
		// prepare
		var oExpectedDateValue = UI5Date.getInstance(2017, 4, 5, 6, 7, 8);
		this.oDTp._oCalendar = { focusDate: this.spy(), destroy: function () {} };
		this.oDTp._oOKButton = { setEnabled: function() {} };
		this.oDTp._oDateRange = { getStartDate: function () {}, setStartDate: function () {} };
		this.oDTp._oClocks = new TimePickerClocks(this.oDTp.getId() + "-clocks", {
			displayFormat: "hh:mm:ss"
		});
		var oSetTimeValuesSpy = this.spy(this.oDTp._oClocks, "_setTimeValues");

		// act
		this.oDTp.setInitialFocusedDateValue(oExpectedDateValue);
		this.oDTp._fillDateRange();

		// assert
		assert.ok(this.oDTp._oCalendar.focusDate.calledWith(oExpectedDateValue), "focusDate should be called with initialFocusedDateValue");
		assert.equal(this.oDTp._oCalendar.focusDate.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "focusDate should be called with " + oExpectedDateValue);
		assert.ok(oSetTimeValuesSpy.calledWith(oExpectedDateValue), "_setTimeValues should be called with initialFocusedDateValue");

		// cleanup
		oSetTimeValuesSpy.restore();
	});

	QUnit.test("_fillDateRange should call Calendar's focusDate method and clocks _setTimeValues with currentDate if initialFocusedDateValue and value are not set", function (assert) {
		// prepare
		var oExpectedDateValue = UI5Date.getInstance(2017, 4, 5, 6, 7, 8);
		this.oDTp._oCalendar = { focusDate: this.spy(), destroy: function () {}, removeAllSelectedDates: function() {} };
		this.oDTp._oOKButton = { setEnabled: function() {} };
		this.oDTp._oDateRange = { getStartDate: function () {}, setStartDate: function () {} };
		this.oDTp._oClocks = new TimePickerClocks(this.oDTp.getId() + "-Clocks", {
			displayFormat: "hh:mm:ss"
		});
		var oSetTimeValuesSpy = this.spy(this.oDTp._oClocks, "_setTimeValues");

		// act
		this.oDTp._fillDateRange();

		// assert
		assert.equal(this.oDTp._oCalendar.focusDate.calledWith(oExpectedDateValue), false, "focusDate should not be called with initialFocusedDateValue");
		assert.notEqual(this.oDTp._oCalendar.focusDate.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "focusDate should be called with " + oExpectedDateValue);
		assert.equal(oSetTimeValuesSpy.calledWith(oExpectedDateValue), false, "_setTimeValues should not be called with initialFocusedDateValue");

		// cleanup
		oSetTimeValuesSpy.restore();
	});

	QUnit.test("_fillDateRange should call Calendar's focusDate method and clocks _setTimeValues with valueDate", function (assert) {
		// prepare
		var oExpectedDateValue = UI5Date.getInstance(2017, 4, 5, 6, 7, 8),
			oGetDateValue = this.stub(this.oDTp, "getDateValue").callsFake(function () { return oExpectedDateValue; });
		this.oDTp._oCalendar = { focusDate: this.spy(), destroy: function () {} };
		this.oDTp._oOKButton = { setEnabled: function() {} };
		this.oDTp._oDateRange = { getStartDate: function () {}, setStartDate: function () {} };
		this.oDTp._oClocks = new TimePickerClocks(this.oDTp.getId() + "-Clocks", {
			displayFormat: "hh:mm:ss"
		});
		var oSetTimeValuesSpy = this.spy(this.oDTp._oClocks, "_setTimeValues");

		// act
		this.oDTp._fillDateRange();

		// assert
		assert.ok(this.oDTp._oCalendar.focusDate.calledWith(oExpectedDateValue), "focusDate should be called with valueDate");
		assert.equal(this.oDTp._oCalendar.focusDate.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "focusDate should be called with " + oExpectedDateValue);
		assert.ok(oSetTimeValuesSpy.calledWith(oExpectedDateValue), "_setTimeValues should be called with valueDate");

		// cleanup
		oGetDateValue.restore();
		oSetTimeValuesSpy.restore();
	});

	QUnit.module("interaction");

	QUnit.test("change date by typing", function(assert) {
		sValue = "";
		bValid = true;
		sId = "";
		oDTP2.focus();
		jQuery("#DTP2").find("input").val("37+02+2016:10+11");
		qutils.triggerKeydown("DTP2-inner", KeyCodes.ENTER, false, false, false);
		jQuery("#DTP2").find("input").trigger("change"); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, "DTP2", "Change event fired");
		assert.equal(sValue, "37+02+2016:10+11", "Value of event has entered value if it is invalid");
		assert.ok(!bValid, "Value is not valid");
		assert.equal(oDTP2.getValue(), "37+02+2016:10+11", "Value has entered value if it is invalid");
		assert.equal(oDTP2.getDateValue().getTime(), UI5Date.getInstance("2016", "01", "17", "10", "11", "12").getTime(), "DateValue not changed set");

		sValue = "";
		bValid = true;
		sId = "";
		oDTP2.focus();
		jQuery("#DTP2").find("input").val("18+02+2016:10+30");
		qutils.triggerKeydown("DTP2-inner", KeyCodes.ENTER, false, false, false);
		jQuery("#DTP2").find("input").trigger("change"); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, "DTP2", "Change event fired");
		assert.equal(sValue, "2016-02-18,10-30-00", "Value of event has entered value if valid");
		assert.ok(bValid, "Value is valid");
		assert.equal(oDTP2.getValue(), "2016-02-18,10-30-00", "Value has entered value if valid");
		assert.equal(oDTP2.getDateValue().getTime(), UI5Date.getInstance("2016", "01", "18", "10", "30", "00").getTime(), "DateValue not changed set");

	});

	QUnit.test("change date using calendar - open", async function(assert) {
		var done = assert.async(),
			oClocks,
			aMonths,
			aDays,
			oDay,
			i;

		sValue = "";
		sId = "";

		oDTP3._createPopup();
		oDTP3._oPopup.attachEvent("afterOpen", async function() {
			await nextUIUpdate();
			assert.ok(jQuery("#DTP3-cal")[0], "calendar rendered");
			assert.ok(jQuery("#DTP3-cal").is(":visible"), "calendar is visible");

			oClocks = Element.getElementById("DTP3-Clocks");
			assert.equal(oClocks.getAggregation("_buttons").length, 2 , "DTP3: number of rendered clocks");

			aMonths = jQuery("#DTP3-cal-content").children(".sapUiCalMonthView");
			aDays = jQuery(aMonths[0]).find(".sapUiCalItem");

			for (i = 0; i < aDays.length; i++) {
				oDay = aDays[i];
				if (jQuery(oDay).attr("data-sap-day") == "20160210") {
					oDay.focus();
					break;
				}
			}

			// use ENTER to not run into itemNavigation
			qutils.triggerKeydown(oDay, KeyCodes.ENTER, false, false, false);

			oDTP3._oClocks.getAggregation("_buttons")[0].focus();
			qutils.triggerKeydown(oDTP3._oClocks.getAggregation("_buttons")[0].getDomRef(), KeyCodes.ARROW_UP, false, false, false);
			await nextUIUpdate();
			assert.equal(jQuery("#DTP3-Clocks-clockH-selected").text(), "11" , "DTP3: correct hours set after keyboard navigation");

			done();
		});

		oDTP3.focus();
		qutils.triggerEvent("click", "DTP3-icon");
		await nextUIUpdate();
	});

	QUnit.test("change date using calendar - choose", function(assert) {
		var done = assert.async();

		oDTP3._oPopup.attachEvent("afterClose", function() {
			assert.ok(!jQuery("#DTP3-cal").is(":visible"), "calendar is invisible");
			assert.ok(!jQuery("#DTP3-Clocks").is(":visible"), "Silder is invisible");
			assert.equal(sId, "DTP3", "Change event fired");
			// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
			assert.equal(sValue, "Feb 10, 2016, 11:11:00\u202fAM", "Value in internal format priovided");
			assert.equal(oDTP3.getValue(), "Feb 10, 2016, 11:11:00\u202fAM", "Value in internal format set");
			assert.equal(oDTP3.getDateValue().getTime(), UI5Date.getInstance("2016", "01", "10", "11", "11").getTime(), "DateValue set");
			done();
		});

		jQuery("#DTP3-OK").trigger("focus");
		qutils.triggerKeydown("DTP3-OK", KeyCodes.ENTER, false, false, false);
		qutils.triggerKeyup("DTP3-OK", KeyCodes.ENTER, false, false, false);
	});

	QUnit.test("Open DateTimePicker from Button", async function(assert) {
		// Prepare
		var oDTP = new DateTimePicker("HDTP", {
				hideInput: true
			}).placeAt("qunit-fixture"),
			oButton = new Button({
				icon: "sap-icon://appointment-2",
				press: function() {
					Element.getElementById("HDTP").openBy(this.getDomRef());
				}
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Act
		oButton.firePress();
		await nextUIUpdate();

		// Assert
		assert.ok(Element.getElementById(oDTP.getId() + "-cal"), oDTP.getId() + ": calender exists");
		assert.ok(oDTP._oPopup, oDTP.getId() + ": popup exists");
		assert.ok(jQuery("#" + oDTP.getId() + "-cal")[0], "calendar rendered");
		assert.ok(jQuery("#" + oDTP.getId() + "-cal").is(":visible"), "picker is visible");

		// Clean
		oDTP.destroy();
		oButton.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("aria-expanded correctly set", async function(assert) {
		var oDTP = new DateTimePicker("DP", {}).placeAt("content");
		await nextUIUpdate();

		//before opening the popup
		assert.notOk(oDTP.$("inner").attr("aria-expanded"), "false", "DP input doesn't have 'aria-expanded' attrubute set.");
	});

	QUnit.test("aria-haspopup set correctly", async function(assert) {
		var oDTP = new DateTimePicker();

		oDTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(oDTP.$("inner").attr("aria-haspopup"), "dialog", "DateTimePicker's Input indicates that it opens a dialog");

		oDTP.destroy();
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oInput = new DateTimePicker({
			value: "Value",
			tooltip: "Tooltip",
			placeholder: "Placeholder"
		});
		assert.ok(!!oInput.getAccessibilityInfo, "DateTimePicker has a getAccessibilityInfo function");
		var oInfo = oInput.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, oInput.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_DATETIMEINPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value  Date and Time", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oInput.setValue("");
		oInput.setEnabled(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Placeholder  Date and Time", "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oInput.setEnabled(true);
		oInput.setEditable(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oInput.setValueFormat("yyyy.MM.dd.HH.mm.ss");
		oInput.setDisplayFormat("yyyy-MM-dd-HH-mm-ss");
		oInput.setValue("2014.03.26.10.32.30");
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "2014-03-26-10-32-30  Date and Time", "Description");
		oInput.destroy();
	});

	QUnit.test("_focusActiveButton method: moves the focus to the first clock", async function(assert) {
		//Prepare
		var done = assert.async();

		var oDTP = new DateTimePicker().placeAt("content");
		await nextUIUpdate();

		oDTP._createPopup();
		oDTP._createPopupContent();
		await nextUIUpdate();
		oDTP._openPopup();

		setTimeout(function() {
			var oHoursClock = oDTP._oPopup.getContent()[1].getClocks().getAggregation("_buttons")[0];
			oDTP._oPopupContent.getClocks()._focusActiveButton();

			// Assert
			assert.strictEqual(oHoursClock.getDomRef(), document.activeElement, "The clock's value is focused after a tap");

			oDTP.destroy();
			done();
		}, 400);
	});

	QUnit.test("showTimezone and aria-describedBy", async function(assert) {
		// arrange
		var oDTP = new DateTimePicker("DTPACC")
			.placeAt("qunit-fixture"),
			oInputRef;
		await nextUIUpdate();

		oInputRef = oDTP.$("inner");

		// assert
		assert.ok(oInputRef.attr("aria-describedby").indexOf("DTPACC-timezoneID") === -1,
			"the timezone id is not included in the aria-describedby DOM references");

		// act
		oDTP.setShowTimezone(true);
		await nextUIUpdate();

		oInputRef = oDTP.$("inner");

		// assert
		assert.ok(oInputRef.attr("aria-describedby").indexOf("DTPACC-timezoneID") > -1,
			"the timezone id is included in the aria-describedby DOM references");

		// clean
		oDTP.destroy();
	});

	QUnit.test("Default senatic accessible role gets used", function(assert) {
		// Prepare
		var oDTP = new DateTimePicker();

		// Assert
		assert.strictEqual(oDTP.getRenderer().getAriaRole() , "", "The role attribute is empty");
	});

	QUnit.test("Dialog accessible name", async function(assert) {
		// Prepare
		var oDTP = new DateTimePicker("DTP"),
			sAriaLabelledbyText = Library.getResourceBundleFor("sap.m").getText("DATETIMEPICKER_POPOVER_ACCESSIBLE_NAME"),
			sLabelId;

		oDTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		qutils.triggerEvent("click", "DTP-icon");
		await nextUIUpdate();
		sLabelId = oDTP._oPopup.getDomRef().getAttribute("aria-labelledby");

		// Assert
		assert.strictEqual(Element.getElementById(sLabelId).getDomRef().textContent, sAriaLabelledbyText, "The dialog has the correct accessible name");

		oDTP.destroy();
	});

	QUnit.module("Calendar and TimePicker");

	QUnit.test("Open picker on small screen", async function(assert) {
		//Prepare
		jQuery("html").removeClass("sapUiMedia-Std-Desktop");
		jQuery("html").addClass("sapUiMedia-Std-Phone");

		var oDTP5 = new DateTimePicker("DTP5", {
						dateValue: UI5Date.getInstance()
					}).placeAt("contentSmall");
		await nextUIUpdate();

		var done = assert.async();

		oDTP5.focus();
		qutils.triggerEvent("click", "DTP5-icon");
		await nextUIUpdate();
		setTimeout(function(){
			assert.ok(jQuery("#DTP5-RP-popover")[0], "popover is rendered");
			assert.ok(jQuery("#DTP5-RP-popover").is(":visible"), "popover is visible");
			oDTP5.destroy();
			jQuery("html").addClass("sapUiMedia-Std-Desktop");
			jQuery("html").removeClass("sapUiMedia-Std-Phone");
			done();
		}, 400);
	});

	QUnit.test("Calendar hides when date is selected (on small screen)", async function(assert) {
		var oDTP5 = new DateTimePicker("DTP5", {
				dateValue: UI5Date.getInstance(2021, 10, 11)
			}),
			oCalendar,
			oAfterRenderingDelegate = {
				onAfterRendering: function() {
					oCalendar.removeDelegate(oAfterRenderingDelegate);
					setTimeout(function() {
						var $selectedDate = jQuery("#DTP5-cal--Month0-20211101");
						$selectedDate.trigger("focus");
						qutils.triggerKeydown($selectedDate, KeyCodes.ENTER);
						assert.strictEqual(jQuery("#DTP5-cal").css("display"), "none", "Calendar is not visible");
						assert.strictEqual(jQuery("#DTP5-Clocks").css("display"), "block", "Clocks are visible");
						assert.strictEqual(document.activeElement.id,
											oDTP5._oPopupContent.getClocks().getAggregation("_buttons")[0].getId(),
											"First button of the TimePicker is focused");
						oDTP5.destroy();
						jQuery("html").addClass("sapUiMedia-Std-Desktop");
						jQuery("html").removeClass("sapUiMedia-Std-Phone");
						done();
					}, 0);
				}
			},
			done = assert.async();

		//Prepare
		jQuery("html").removeClass("sapUiMedia-Std-Desktop");
		jQuery("html").addClass("sapUiMedia-Std-Phone");

		oDTP5.placeAt("contentSmall");
		oDTP5._createPopup();
		oDTP5._createPopupContent();
		oCalendar = oDTP5._getCalendar();
		oCalendar.addDelegate(oAfterRenderingDelegate);
		await nextUIUpdate();

		oDTP5.focus();
		qutils.triggerEvent("click", "DTP5-icon");
		await nextUIUpdate();
	});

	QUnit.test("data binding with sap.ui.model.odata.type.DateTime", function(assert) {
		var oDate = UI5Date.getInstance(2019, 5, 6, 3, 40, 46),
			oModel = new JSONModel({
				myDate: undefined
			}),
			oDateTimeType = new ODataDateTime({
				UTC: true
			}, {
				//Constraints
			}),
			oDateTimePicker = new DateTimePicker({
				value: {
					path: "/myDate",
					type: oDateTimeType
				}
			}).setModel(oModel);

		assert.equal(oDateTimePicker._parseValue("Jun 6, 2019, 3:40:46 AM").getTime(), oDate.getTime(), "Value successfully parsed");
		// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oDateTimePicker._formatValue(oDate), "Jun 6, 2019, 3:40:46\u202fAM", "Date successfully formatted");

	});

	QUnit.test("data binding with sap.ui.model.odata.type.DateTime when UTC is set in FormatOptions source", function(assert) {
		var dateValue,
			actualValue,
			oDate = "2018-08-15T13:07:47.000Z",
			oFormatter = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
				UTC: true //setting it to true should give me the original date ("2018-08-15T13:07:47.000Z") in UTC again
			}),
			oModel = new JSONModel({
				myDate: oDate
			}),
			oDateTimePicker = new DateTimePicker({
				value: {
					path: "/myDate",
					type:'sap.ui.model.type.DateTime',
					formatOptions:{
						source: {pattern:'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'', UTC:true},
						style:'medium',
						strictParsing:true
					}
				}
			}).setModel(oModel);

		dateValue = oDateTimePicker.getDateValue();
		actualValue = oFormatter.format(dateValue);
		assert.equal(oDate, actualValue, "Date is formatted and parsed correctly");
	});

	QUnit.test("_createPopup: mobile device", async function(assert) {
		// prepare
		var oDateTimePicker = new DateTimePicker(),
			oDeviceStub = this.stub(Device, "system").value({
				desktop: false,
				tablet: false,
				phone: true
			}),
			oLabel = new Label({text: "DatePicker Label", labelFor: oDateTimePicker.getId()}),
			oDialog;

		oDateTimePicker.placeAt("qunit-fixture");
		oLabel.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oDateTimePicker._createPopup();
		oDialog = oDateTimePicker.getAggregation("_popup");

		// assert
		assert.ok(oDialog.getShowHeader(), "Header is shown");
		assert.ok(oDialog.getShowCloseButton(), "Close button in the header is set");
		assert.strictEqual(oDialog.getTitle(), "DatePicker Label", "Title is set");
		assert.strictEqual(oDialog.getBeginButton().getType(), "Emphasized", "OK button type is set");
		assert.notOk(oDialog.getEndButton(), "Close button in the footer is not set");

		// clean
		oDeviceStub.restore();
		oDateTimePicker.destroy();
		oLabel.destroy();
	});

	QUnit.test("The time picker UI part is created using the display format", async function(assert) {
		var oDTP = new DateTimePicker({
			value: "14/09/2021 15:00:00",
			displayFormat: "dd/MM/yyyy h:mm:ss a",
			valueFormat: "dd/MM/yyyy HH:mm:ss"
		}),
		oClocks;

		// arrange
		oDTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oDTP._createPopup();
		oDTP._createPopupContent();
		await nextUIUpdate();
		oDTP._openPopup();
		oClocks = oDTP._oClocks;

		// assert
		assert.strictEqual("dd/MM/yyyy h:mm:ss a", oClocks.getValueFormat(), "the time picker UI part uses the display format as value format");
		assert.strictEqual("dd/MM/yyyy h:mm:ss a", oClocks.getDisplayFormat(), "the time picker UI part uses only one format");

		// clean
		oDTP.destroy();
	});

	QUnit.module("Private");

	QUnit.test("_selectFocusedDateValue should remove all selectedDates from the calendar and select the focused date", function (assert) {
		// arrange
		var oExpectedDate = new DateRange().setStartDate(UI5Date.getInstance(2017, 5, 15)),
			oDateTimePicker = new DateTimePicker(),
			oCalendar = oDateTimePicker._oCalendar = {
				destroy: function () {},
				removeAllSelectedDates: this.spy(),
				addSelectedDate: this.spy()
			};

		// act
		oDateTimePicker._selectFocusedDateValue(oExpectedDate);

		// assert
		assert.ok(oCalendar.removeAllSelectedDates.calledOnce, "removeAllSelectedDates should be called once");
		assert.ok(oCalendar.addSelectedDate.calledWith(oExpectedDate), "addSelectedDate should be called with: " + oExpectedDate);

		// cleanup
		oDateTimePicker.destroy();
	});

	QUnit.test("setMinutesStep, setSecondsStep set the steps to the clocks", async function(assert) {
		//arrange, act
		var oDTP = new DateTimePicker({
			minutesStep: 5,
			secondsStep: 4
		}).placeAt("qunit-fixture");

		await nextUIUpdate();

		oDTP._createPopup();
		oDTP._createPopupContent();
		oDTP._openPopup();

		//asert
		assert.equal(oDTP._oClocks.getMinutesStep(), 5, "clocks have the correct minutes step");
		assert.equal(oDTP._oClocks.getSecondsStep(), 4, "clocks have the correct seconds step");

		//clean
		oDTP.destroy();
	});

	// BCP: 2170086834
	QUnit.test("DateTimePicker.prototype._parseValue", function(assert) {
		// prepare
		var oModel = new JSONModel({
				myDate: UI5Date.getInstance()
			}),
			oDTP = new DateTimePicker({
				value: {
					path: "/myDate",
					type: 'sap.ui.model.type.DateTime',
					formatOptions: {
						source: {
							pattern:'test'
						}
					}
				}
			}).setModel(oModel),
			oGetFormatterSpy = sinon.spy(oDTP, "_getFormatter");

		// act
		oDTP._parseValue("test", true);

		// assert
		assert.ok(oGetFormatterSpy.calledOnce, "Internal Dateformat isntance is created");

		// clean
		oDTP.destroy();
		oGetFormatterSpy.restore();
	});

	QUnit.test("_createPopupContent", async function (assert) {
		// Arrange
		var oDTP = new DateTimePicker().placeAt("qunit-fixture"),
			oPopupContent;

		await nextUIUpdate();

		// Act
		oDTP.toggleOpen();

		oPopupContent = oDTP._oPopup.getContent();

		// Assert
		assert.ok(oPopupContent[0].isA("sap.m.ValueStateHeader"), "There is a sap.m.ValueStateHeader created in the popup content");
		assert.ok(oPopupContent[1].isA("sap.m.internal.DateTimePickerPopup"), "There is a sap.m.internal.DateTimePickerPopup created in the popup content");

		// Clean up
		oDTP.destroy();
	});

	QUnit.test("_inPreferredUserInteraction", async function (assert) {
		// Prepare
		var oDTP = new DateTimePicker(),
			oInPreferredUserInteractionSpy = this.spy(oDTP, "_inPreferredUserInteraction");

			oDTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.ok(oInPreferredUserInteractionSpy.calledOnce, "Preferred interaction is handled during rendering");

		// Clean
		oDTP.destroy();
	});

	QUnit.module("Timezones");

	QUnit.test("dateValue + timezone", function(assert) {
		// arrange
		var oTestDate = UI5Date.getInstance(2022, 1, 2, 13, 25, 0);
		var oDTP = new DateTimePicker({
			dateValue: UI5Date.getInstance(oTestDate),
			timezone: "America/New_York"
		});
		var oDTPValueAsDate = UI5Date.getInstance(oDTP.getValue());
		// assert
		assert.equal(oDTPValueAsDate.getFullYear(), oTestDate.getFullYear(), "the year is correct 2022");
		assert.equal(oDTPValueAsDate.getMonth(), oTestDate.getMonth(), "the month is correct 1");
		assert.equal(oDTPValueAsDate.getDate(), oTestDate.getDate(), "the date is correct 2");
		assert.equal(oDTPValueAsDate.getHours(), oTestDate.getHours(), "the hours is correct 13");
		assert.equal(oDTPValueAsDate.getMinutes(), oTestDate.getMinutes(), "the minutes is correct 25");
		assert.equal(oDTPValueAsDate.getSeconds(), oTestDate.getSeconds(), "the seconds is correct 00");

		assert.equal(oDTP.getTimezone(), "America/New_York", "the Timezone value is correct");

		// act
		oTestDate = UI5Date.getInstance(2022, 1, 2, 14, 25, 0);
		oDTP.setDateValue(oTestDate);
		oDTPValueAsDate = UI5Date.getInstance(oDTP.getValue());

		// assert
		assert.equal(oDTPValueAsDate.getFullYear(), oTestDate.getFullYear(), "the year is correct 2022");
		assert.equal(oDTPValueAsDate.getMonth(), oTestDate.getMonth(), "the month is correct 1");
		assert.equal(oDTPValueAsDate.getDate(), oTestDate.getDate(), "the date is correct 2");
		assert.equal(oDTPValueAsDate.getHours(), oTestDate.getHours(), "the hours is correct 14");
		assert.equal(oDTPValueAsDate.getMinutes(), oTestDate.getMinutes(), "the minutes is correct 25");
		assert.equal(oDTPValueAsDate.getSeconds(), oTestDate.getSeconds(), "the seconds is correct 00");
		assert.equal(oDTP.getTimezone(), "America/New_York", "the Timezone value is correct");

		// act
		oDTP.setTimezone("Asia/Kabul");

		// assert
		assert.equal(oDTP.getDateValue().getFullYear(), oTestDate.getFullYear(), "dateValue year not change after change timezone property");
		assert.equal(oDTP.getDateValue().getMonth(), oTestDate.getMonth(), "dateValue month not change after change timezone property");
		assert.equal(oDTP.getDateValue().getDate(), oTestDate.getDate(), "dateValue date not change after change timezone property");
		assert.equal(oDTP.getDateValue().getHours(), oTestDate.getHours(), "dateValue hours not change after change timezone property");
		assert.equal(oDTP.getDateValue().getMinutes(), oTestDate.getMinutes(), "dateValue minutes not change after change timezone property");
		assert.equal(oDTP.getDateValue().getSeconds(), oTestDate.getSeconds(), "dateValue seconds not change after change timezone property");

		assert.equal(oDTPValueAsDate.getFullYear(), oTestDate.getFullYear(), "the year is correct 2022");
		assert.equal(oDTPValueAsDate.getMonth(), oTestDate.getMonth(), "the month is correct 1");
		assert.equal(oDTPValueAsDate.getDate(), oTestDate.getDate(), "the date is correct 2");
		assert.equal(oDTPValueAsDate.getHours(), oTestDate.getHours(), "the hours is correct 14");
		assert.equal(oDTPValueAsDate.getMinutes(), oTestDate.getMinutes(), "the minutes is correct 25");
		assert.equal(oDTPValueAsDate.getSeconds(), oTestDate.getSeconds(), "the seconds is correct 00");
		assert.equal(oDTP.getTimezone(), "Asia/Kabul", "the time zone has a correct value");

		// clean
		oDTP.destroy();
	});

	QUnit.test("Timezone interaction on picker", async function(assert) {
		//arange
		this.stub(Localization, "getTimezone").callsFake(function() {
			return "Europe/Sofia";
		});
		var oTestDate = UI5Date.getInstance("Feb 1, 2022, 00:01:00 AM");
		var oDTP = new DateTimePicker("DTP",{
			value: "Feb 1, 2022, 00:01:00 AM",
			showTimezone: true ,
			timezone: "Asia/Kabul",
			change: handleChange
		}).placeAt("qunit-fixture");
		await nextUIUpdate();

		var oConvertDTPInputValueToDate = UI5Date.getInstance(oDTP.$("inner").val());

		// assert
		assert.equal(oConvertDTPInputValueToDate.getFullYear(), oTestDate.getFullYear(), "value must be of the correct year value - 2022");
		assert.equal(oConvertDTPInputValueToDate.getMonth(), oTestDate.getMonth(), "input value must be of the correct month value - 02");
		assert.equal(oConvertDTPInputValueToDate.getDate(), oTestDate.getDate(), "input value must be of the correct date value - 02");
		assert.equal(oConvertDTPInputValueToDate.getHours(), oTestDate.getHours(), "input value must be of the correct hors value - 0");
		assert.equal(oConvertDTPInputValueToDate.getMinutes(), oTestDate.getMinutes(), "input value must be of the correct minutes value - 0");

		var done = assert.async();

		oDTP._createPopup();
		oDTP._oPopup.attachEvent("afterOpen", async function() {
			await nextUIUpdate();
			// assert
			assert.equal(jQuery("#DTP-Clocks-clockH-selected").text(), "12" , "DTP: correct hours set after open picker");
			assert.equal(jQuery("#DTP-Clocks-clockM-selected").text(), "1" , "DTP: correct hours set after open picker");
			done();
		});

		oDTP.focus();
		qutils.triggerEvent("click", "DTP-icon");
		jQuery("#DTP-OK").trigger("focus");
		qutils.triggerKeydown("DTP-OK", KeyCodes.ENTER, false, false, false);
		qutils.triggerKeyup("DTP-OK", KeyCodes.ENTER, false, false, false);
		await nextUIUpdate();

		oConvertDTPInputValueToDate = UI5Date.getInstance(oDTP.$("inner").val());

		// assert
		assert.equal(oConvertDTPInputValueToDate.getFullYear(), oTestDate.getFullYear(), "input value must be of the correct year value - 2022");
		assert.equal(oConvertDTPInputValueToDate.getMonth(), oTestDate.getMonth(), "input value must be of the correct month value - 02");
		assert.equal(oConvertDTPInputValueToDate.getDate(), oTestDate.getDate(), "input value must be of the correct date value - 02");
		assert.equal(oConvertDTPInputValueToDate.getHours(), oTestDate.getHours(), "input value must be of the correct hors value - 0");
		assert.equal(oConvertDTPInputValueToDate.getMinutes(), oTestDate.getMinutes(), "input value must be of the correct minutes value - 0");

		// clean
		oDTP.destroy();
	});


	QUnit.test("showTimezone", async function(assert) {
		var oDTP;

		// arrange
		this.stub(Localization, "getTimezone").callsFake(function() {
			return "Asia/Kabul";
		});

		oDTP = new DateTimePicker().placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(oDTP.$("timezoneLabel").length, 0, "no timezone label");

		// act
		oDTP.setShowTimezone(true);
		await nextUIUpdate();

		// assert
		assert.equal(oDTP.$("timezoneLabel").length, 1, "has a timezone label");
		assert.equal(oDTP.$("timezoneLabel").text(), "Asia, Kabul", "the label text is the default timezone");

		// act
		oDTP.setTimezone("America/New_York");
		await nextUIUpdate();

		// assert
		assert.equal(oDTP.$("timezoneLabel").text(), "Americas, New York", "the label text is the provided timezone");

		// clean
		oDTP.destroy();
	});

	QUnit.test("Timezone popup title is correctly formatted", function(assert) {
		// arrange
		var oDTP = new DateTimePicker("dtp", {
				timezone: "Etc/UTC"
			}).placeAt("qunit-fixture"),
			oTimezonePopup;

		// act
		oTimezonePopup = oDTP._getTimezoneNamePopup();

		// assert
		assert.equal(oTimezonePopup.getTitle(), "UTC",
			"the popup shows the correct timezone");

		// clean
		oDTP.destroy();
	});

	QUnit.test("displayFormatType + timezone", async function(assert) {
		// arrange
		var oDTP = new DateTimePicker({
			value: "Feb 18, 2016, 10:00:00 AM",
			displayFormatType: "Islamic"
		}).placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oDTP.$("inner").val(), "Jum. I 9, 1437 AH, 10:00:00\u202fAM", "correct displayed value");

		// act
		oDTP.setTimezone("America/New_York");
		await nextUIUpdate();

		// assert
		assert.equal(oDTP.getValue(), "Feb 18, 2016, 10:00:00 AM", "value is not changed despite the DTP timezone change");
		assert.equal(oDTP.getTimezone(), "America/New_York", "the value changes when the time zone changes");
		// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oDTP.$("inner").val(), "Jum. I 9, 1437 AH, 10:00:00\u202fAM", "correct displayed value");
		assert.equal(oDTP.getDateValue().getTime(), UI5Date.getInstance(oDTP.getValue()).getTime(), "value is not changed despite the DTP timezone change");

		// clean
		oDTP.destroy();
	});

	QUnit.test("bound dateValue + timezone", async function(assert) {
		// arrange
		var oTestDate = UI5Date.getInstance(2016, 1, 18, 15, 0, 0);
		var oModel = new JSONModel({ date: oTestDate }),
			oDTP = new DateTimePicker("dtpb", {
				dateValue: { path: '/date' },
				timezone: "America/New_York" // UTC-5
			}).setModel(oModel),
			oInputRef;

		oDTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		oInputRef = oDTP.$("inner");
		var oDTPValueAsDate = UI5Date.getInstance(oInputRef.val());
		// assert
		assert.equal(oDTPValueAsDate.getFullYear(), oTestDate.getFullYear(), "the year is correct 2016");
		assert.equal(oDTPValueAsDate.getMonth(), oTestDate.getMonth(), "the month is correct 1");
		assert.equal(oDTPValueAsDate.getDate(), oTestDate.getDate(), "the date is correct 18");
		assert.equal(oDTPValueAsDate.getHours(), oTestDate.getHours(), "the hours is correct 15");
		assert.equal(oDTPValueAsDate.getMinutes(), oTestDate.getMinutes(), "the minutes is correct 0");
		assert.equal(oDTPValueAsDate.getSeconds(), oTestDate.getSeconds(), "the seconds is correct 0");

		// act - type into the input
		oInputRef.val("Feb 18, 2016, 9:00:00 AM");
		qutils.triggerKeydown("dtpb-inner", KeyCodes.ENTER, false, false, false);
		oInputRef.trigger("change");
		oTestDate = UI5Date.getInstance(2016, 1, 18, 9, 0, 0);

		// assert
		assert.equal(oDTP.getDateValue().getFullYear(), oTestDate.getFullYear(), "dateValue year has changed correctly after changing input val");
		assert.equal(oDTP.getDateValue().getMonth(), oTestDate.getMonth(), "dateValue month has changed correctly after changing input val");
		assert.equal(oDTP.getDateValue().getDate(), oTestDate.getDate(), "dateValue date has changed correctly after changing input val");
		assert.equal(oDTP.getDateValue().getHours(), oTestDate.getHours(), "dateValue hours has changed correctly after changing input val");
		assert.equal(oDTP.getDateValue().getMinutes(), oTestDate.getMinutes(), "dateValue minutes has changed correctly after changing input val");
		assert.equal(oDTP.getDateValue().getSeconds(), oTestDate.getSeconds(), "dateValue seconds has changed correctly after changing input val");

		// clean
		oDTP.destroy();
	});

	QUnit.test("timezone + bound value type DateTime - order", async function(assert) {
		// arrange
		var oTestDate = UI5Date.getInstance(2016, 1, 18, 3, 0, 0);
		var oModel = new JSONModel({ date: oTestDate }),
			oDTP = new DateTimePicker("dtpbo", {
				timezone: "America/New_York" // UTC-5
			}).setModel(oModel);

		oDTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oDTP.bindProperty("value", { path: '/date', type: new DateTime() });
		await nextUIUpdate();

		// assert
		assert.equal(oDTP.getDateValue().getFullYear(), oTestDate.getFullYear(), "dateValue year has correct after binding");
		assert.equal(oDTP.getDateValue().getMonth(), oTestDate.getMonth(), "dateValue month has correct after binding");
		assert.equal(oDTP.getDateValue().getDate(), oTestDate.getDate(), "dateValue date has correct after binding");
		assert.equal(oDTP.getDateValue().getHours(), oTestDate.getHours(), "dateValue hours has correct after binding");
		assert.equal(oDTP.getDateValue().getMinutes(), oTestDate.getMinutes(), "dateValue minutes has correct after binding");
		assert.equal(oDTP.getDateValue().getSeconds(), oTestDate.getSeconds(), "dateValue seconds has correct after binding");

		// clean
		oDTP.destroy();
	});

	QUnit.test("timezone + bound value data type String", async function(assert) {
		// arrange
		var oTestDate = UI5Date.getInstance(2016, 1, 18, 3, 0, 0);
		var oModel = new JSONModel({ date: "Feb++18++2016, 3:00:00 AM" }),
			oDTP = new DateTimePicker("dtpbs", {
				valueFormat: "MMM++dd++yyyy, h:mm:ss a",
				timezone: "America/New_York" // UTC-5
			}).setModel(oModel);

		oDTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oDTP.bindProperty("value", { path: '/date', type: new TypeString() });
		await nextUIUpdate();

		// assert
		assert.ok(oDTP.getDateValue(), "has dateValue");

		assert.equal(oDTP.getDateValue().getFullYear(), oTestDate.getFullYear(), "dateValue year has correct value after parse string");
		assert.equal(oDTP.getDateValue().getMonth(), oTestDate.getMonth(), "dateValue month has correct value after parse string");
		assert.equal(oDTP.getDateValue().getDate(), oTestDate.getDate(), "dateValue date has correct value after parse string");
		assert.equal(oDTP.getDateValue().getHours(), oTestDate.getHours(), "dateValue hours has correct value after parse string");
		assert.equal(oDTP.getDateValue().getMinutes(), oTestDate.getMinutes(), "dateValue minutes has correct value after parse string");
		assert.equal(oDTP.getDateValue().getSeconds(), oTestDate.getSeconds(), "dateValue seconds has correct value after parse string");

		// clean
		oDTP.destroy();
	});

	QUnit.test("timezone setter does not update 'value' when timezone is the same", function(assert) {
		// arrange
		var done = assert.async(),
			oDTP = new DateTimePicker("dtp", {
				value: "2022-02-11T07:16:33",
				valueFormat: "yyyy-MM-dd'T'HH:mm:ss",
				displayFormat: "medium",
				timezone: "Europe/Berlin",
				showTimezone: true
			}).placeAt("qunit-fixture"),
			oObserver = new ManagedObjectObserver(function(oChanges) {
				var oControl;

				if (oChanges.name === "value") {
					oControl = oChanges.object;
					oControl.setTimezone(oControl.getTimezone());

					// assert
					assert.equal(oDTP.getValue(), "2022-02-17T17:16:33", "the value is as expected");

					// clean
					oDTP.destroy();
					done();
				}
			});

		oObserver.observe(oDTP, {
			properties: ["value", "timezone"]
		});

		// act
		oDTP.setValue("2022-02-17T17:16:33");
	});

	QUnit.test("when the displayFormat does not contain date part, the selected date is preserved", async function(assert) {
		// arrange
		var oDTP = new DateTimePicker("dtp", {
				value: "2022-02-11T07:16:33",
				displayFormat: "HH:mm",
				valueFormat: "yyyy-MM-ddTHH:mm:ss"
			}).placeAt("qunit-fixture");

		await nextUIUpdate();
		oDTP.toggleOpen();

		// assert
		assert.equal(oDTP._getSelectedDate().getTime(), UI5Date.getInstance(2022, 1, 11, 7, 16, 33).getTime(), "the selected date is as expected");

		// clean
		oDTP.destroy();
	});

	QUnit.test("when the timezone is updated via value binding, the timezone popup is updated", function(assert) {
		// arrange
		var oDTP = new DateTimePicker("dtp", {
				timezone: "America/New_York"
			}).placeAt("qunit-fixture"),
			oTimezonePopup;

		// act
		oTimezonePopup = oDTP._getTimezoneNamePopup();

		// assert
		assert.equal(oTimezonePopup.getTitle(), "Americas, New York",
			"the popup shows the correct timezone");

		// act
		// simulate timezone change, not using the timezone setter
		this.stub(oDTP, "_getTimezone").callsFake(function() {
			return "America/Chicago";
		});
		// act
		oTimezonePopup = oDTP._getTimezoneNamePopup();

		// assert
		assert.equal(oTimezonePopup.getTitle(), "Americas, Chicago",
			"the popup shows the correct timezone");

		// clean
		oDTP.destroy();
	});

	QUnit.test("picker selection in a different timezone", async function(assert) {
		// arrange
		var oDTP = new DateTimePicker("dtp", {
			value: "2022-05-16T01:16:33",
			valueFormat: "yyyy-MM-ddTHH:mm:ss",
			timezone: "UTC"
		}).placeAt("qunit-fixture");

		var oExpectedDate = UI5Date.getInstance(oDTP.getValue());

		await nextUIUpdate();
		oDTP.toggleOpen();
		oDTP._selectDate(); //simulate date and time selection via picker

		// assert
		assert.equal(oDTP.getDateValue().getDate(), oExpectedDate.getDate(), "the selected date is as expected (is same to value property)");
		assert.equal(oDTP.getDateValue().getHours(), oExpectedDate.getHours(), "the selected hours is as expected (is same to value property)");
		assert.equal(oDTP.getDateValue().getMinutes(), oExpectedDate.getMinutes(), "the selected minutes is as expected (is same to value property)");

		// clean
		oDTP.destroy();
	});

	QUnit.test("DateTimeWithTimezone type value binding", async function(assert) {
		// arrange
		var oModel = new JSONModel({
				date: null,
				timezone: null
			}),
			oDTP = new DateTimePicker({
				value: {
					type: new DateTimeWithTimezone(),
					parts: [{
						path: "/date",
						type: new DateTimeOffset()
					}, {
						path: "/timezone",
						type: new TypeString()
					}]
				}
			});

		oDTP.placeAt("qunit-fixture");
		oDTP.setModel(oModel);
		await nextUIUpdate();

		// assert
		assert.ok(oDTP._getTimezoneFormatOptions(false).showTimezone, "Time Zone is displayed with value format");
		assert.notOk(oDTP._getTimezoneFormatOptions(true).showTimezone, "Time Zone is not displayed with display format");
		assert.notOk(oDTP.getDomRef().querySelector("input").innerText, "Input value is empty");

		// clean
		oDTP.destroy();
	});

	QUnit.module("Different application timezone", {
		before: async function() {
			var sTZ1 = "Europe/Sofia";
			var sTZ2 = "Europe/Berlin";

			this.localTimezone = Localization.getTimezone();
			Localization.setTimezone(this.localTimezone === sTZ1 ? sTZ2 : sTZ1);
			await nextUIUpdate();
		},
		after: async function() {
			Localization.setTimezone(this.localTimezone);
			await nextUIUpdate();
		}
	});

	QUnit.test("With Bound and Configured Timezone", async function(assert) {
		// arrange
		Localization.setTimezone("Europe/London");

		var oModel = new JSONModel({
			date: UI5Date.getInstance(2023, 2, 31, 10, 32),
			timezone: "Asia/Tokyo"
		}),
		oDTP = new DateTimePicker({
			value: {
				type: new DateTimeWithTimezone(),
				parts: [{
					path: "/date",
					type: new DateTimeOffset()
				}, {
					path: "/timezone",
					type: new TypeString()
				}]
			}
		});

		oDTP.placeAt("qunit-fixture");
		oDTP.setModel(oModel);

		await nextUIUpdate();

		// assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oDTP._getInputValue(), "Mar 31, 2023, 6:32:00\u202fPM", "correct displayed value");
		assert.equal(oDTP.getValue(), "Mar 31, 2023, 6:32:00\u202fPM Asia, Tokyo", "correct value is set");

		// clean
		oDTP.destroy();
	});

	QUnit.test("DateTimePicker parseValue with timezone binding", async function(assert) {
		// arrange
		Localization.setTimezone("Europe/London");

		var oDate = UI5Date.getInstance(2023, 2, 31, 10, 32), // 8 hour time difference because of DST
			oSecondDate = UI5Date.getInstance(2023, 1, 14), // 9 hour time difference
			oModel = new JSONModel({
			timezoneDTP:"Asia/Tokyo",
			valueDTP: oDate
			}),
			oDTP = new DateTimePicker("dtp-parse", {
				value: {
					parts: [{
							path: '/valueDTP',
							type: new DateTimeOffset()
						},
						{
							path: '/timezoneDTP',
							type: new TypeString()
						}
					],
					type: new DateTimeWithTimezone()
				}
			}).setModel(oModel),
			oInputRef;

		oDTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		oInputRef = oDTP.$("inner");

		assert.strictEqual(oDTP.getValue(), "Mar 31, 2023, 6:32:00\u202fPM Asia, Tokyo", "correct value is set");

		// act - type invalid date into input
		oInputRef.val("Feb 14, 2023");
		qutils.triggerKeydown("dtp-parse-inner", KeyCodes.ENTER, false, false, false);
		oInputRef.trigger("change");

		// assert
		assert.strictEqual(oDTP.getValue(), "Feb 14, 2023", "invalid date is parsed with no issues");
		assert.strictEqual(oDTP.getDateValue().getTime(), oDate.getTime(), "date value remains set to the last valid date");

		// act - type valid date into input
		oInputRef.val("Feb 14, 2023, 9:00:00 AM");
		qutils.triggerKeydown("dtp-parse-inner", KeyCodes.ENTER, false, false, false);
		oInputRef.trigger("change");

		// assert
		assert.strictEqual(oDTP.getValue(), "Feb 14, 2023, 9:00:00\u202fAM Asia, Tokyo", "valid date is parsed");
		assert.strictEqual(oDTP.getDateValue().getTime(), oSecondDate.getTime(), "date value is set to new date");

		// clean
		oDTP.destroy();
	});

	QUnit.test("measure label renders always the same UTC date and time", async function(assert) {
		// arrange
		var oDTP = new DateTimePicker("dtp", {
			showTimezone: true
		}).placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert; \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oDTP.$().find(".sapMDummyContent").text(), "Nov 20, 2000, 10:10:10\u202fAM",
			"the correct formatted date and time is used to measure the input width");

		// clean
		oDTP.destroy();
	});

	QUnit.test("Timezone ID without a translation are also displayed", async function(assert) {
		// arrange
		var oDTP = new DateTimePicker({
			timezone: "Etc/GMT-8",
			showTimezone: true
		}).placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert
		assert.equal(oDTP.getDomRef().querySelector(".sapMDTPTimezoneLabel").innerText, "Etc/GMT-8",
			"Timezone ID is displayed");

		// clean
		oDTP.destroy();
	});

	QUnit.module("Events");

	QUnit.test("afterValueHelpOpen and afterValueHelpClose event fire when value help opens and closes", async function(assert) {
		var oDTP = new DateTimePicker(),
			spyOpen = this.spy(oDTP, "fireAfterValueHelpOpen"),
			spyClose = this.spy(oDTP, "fireAfterValueHelpClose");

		oDTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		oDTP._createPopup();
		oDTP._createPopupContent();
		oDTP._oPopup.fireAfterOpen();
		oDTP._oPopup.fireAfterClose();

		assert.ok(spyOpen.calledOnce, "afterValueHelpOpen event fired");
		assert.ok(spyClose.calledOnce, "afterValueHelpClose event fired");

		spyOpen = null;
		spyClose = null;
		oDTP.destroy();
	});

	QUnit.test("liveChange event", async function(assert) {
		var oDTP = new DateTimePicker(),
			spyLiveChange = this.spy(oDTP, "fireLiveChange");

		oDTP.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oDTP._$input.val("1");
		await nextUIUpdate();
		qutils.triggerEvent("input", oDTP.getFocusDomRef());

		// assert
		assert.equal(spyLiveChange.callCount, 1, "1 character added - liveChange event fired 1 time");

		// act
		oDTP._$input.val("12");
		await nextUIUpdate();
		qutils.triggerEvent("input", oDTP.getFocusDomRef());

		// assert
		assert.equal(spyLiveChange.callCount, 2, "2 characters added - liveChange event fired 2 times");

		// act
		oDTP._$input.val("123");
		await nextUIUpdate();
		qutils.triggerEvent("input", oDTP.getFocusDomRef());

		// assert
		assert.equal(spyLiveChange.callCount, 3, "3 characters added - liveChange event fired 3 times");

		// act
		oDTP._$input.val("123"); // no change since last time
		await nextUIUpdate();
		qutils.triggerEvent("input", oDTP.getFocusDomRef());

		// assert
		assert.equal(spyLiveChange.callCount, 3, "no change since last time - liveChange event fired 3 times (no new firing)");

		spyLiveChange = null;
		oDTP.destroy();
	});

	QUnit.module("DateTimeField - _getBoundValueTypePattern");

	QUnit.test("DateTimePicker shouldn't throw error when the binding type is string.", function(assert) {
		try {
			var oDTP9 = new DateTimePicker("DTP9", {
				value: {
					path: "/dateValue",
					type: new TypeString()
				}
			}).placeAt("content");
			assert.ok(true, "DateTimePicker doesn't throw error when the binding type is string.");
		} catch (e) {
			assert.ok(0, "The control throws an error " + e.stack);
		}
		oDTP9.destroy();
	});

});