/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/DateTimePicker",
	"sap/m/Label",
	"sap/m/Button",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/Device",
	"sap/m/TimePickerClocks",
	"sap/ui/core/Popup",
	"sap/ui/core/format/DateFormat",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes",
	"sap/ui/unified/DateRange",
	"sap/ui/core/Core",
	"sap/ui/base/ManagedObjectObserver"
], function(
	qutils,
	createAndAppendDiv,
	DateTimePicker,
	Label,
	Button,
	JSONModel,
	DateTime,
	ODataDateTime,
	Device,
	TimePickerClocks,
	Popup,
	DateFormat,
	jQuery,
	KeyCodes,
	DateRange,
	oCore,
	ManagedObjectObserver
) {
	"use strict";

	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");
	createAndAppendDiv("uiArea3");
	createAndAppendDiv("uiArea4");
	createAndAppendDiv("uiArea5").style.width = "200px";
	createAndAppendDiv("uiArea6");
	createAndAppendDiv("uiArea7");
	createAndAppendDiv("uiArea8");


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
		}).placeAt("uiArea1");

	var oDTP2 = new DateTimePicker("DTP2", {
		width: "250px",
		value: "2016-02-17,10-11-12",
		valueFormat: "yyyy-MM-dd,HH-mm-ss",
		displayFormat: "dd+MM+yyyy:HH+mm",
		change: handleChange
		}).placeAt("uiArea2");

	var oDTP3 = new DateTimePicker("DTP3", {
		dateValue: new Date("2016", "01", "17", "10", "11", "12"),
		displayFormat: "short",
		change: handleChange
		}).placeAt("uiArea3");

	var oModel = new JSONModel();
	oModel.setData({
		dateValue: new Date("2016", "01", "17", "10", "11", "12")
	});
	oCore.setModel(oModel);

	oCore.attachParseError(
			function(oEvent) {
				sId = oEvent.getParameter("element").getId();
				sValue = oEvent.getParameter('newValue');
				bValid = false;
			});

	oCore.attachValidationSuccess(
			function(oEvent) {
				sId = oEvent.getParameter("element").getId();
				sValue = oEvent.getParameter('newValue');
				bValid = true;
			});

	var oDTP4 = new DateTimePicker("DTP4", {
		width: "250px",
		value: {
			path: "/dateValue",
			type: new DateTime({style: "medium", strictParsing: true})}
		}).placeAt("uiArea4");

	//BCP: 	1970509170
	var oDTP6 = new DateTimePicker("oDTP6", {
		dateValue: new Date("2019", "9", "25", "11", "12", "13")
	}).placeAt("uiArea6");


	QUnit.module("initialization");

	QUnit.test("Date formatter", function(assert) {
		assert.ok(!oDTP1.getValue(), "DTP1: no value");
		assert.ok(!oDTP1.getDateValue(), "DTP1: no DateValue");
		assert.equal(oDTP2.getValue(), "2016-02-17,10-11-12", "DTP2: Value in internal format set");
		assert.equal(oDTP2.getDateValue().getTime(), new Date("2016", "01", "17", "10", "11", "12").getTime(), "DTP2: DateValue set");
		assert.equal(oDTP3.getValue(), "Feb 17, 2016, 10:11:12 AM", "DTP3: Value in internal format set");
		assert.equal(oDTP3.getDateValue().getTime(), new Date("2016", "01", "17", "10", "11", "12").getTime(), "DTP3: DateValue set");
		assert.equal(oDTP4.getValue(), "Feb 17, 2016, 10:11:12 AM", "DTP4: Value in internal format set");
		assert.equal(oDTP4.getDateValue().getTime(), new Date("2016", "01", "17", "10", "11", "12").getTime(), "DTP4: DateValue set");
		assert.equal(oDTP6.getValue(), "Oct 25, 2019, 11:12:13 AM", "oDTP6: Default Value Format Set");
	});


	QUnit.test("Calendar instance is created poroperly", function(assert) {
		//Prepare
		var oDTP = new DateTimePicker().placeAt("uiArea1"),
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
		var oDateTime1 = new Date(2017, 0, 1, 13, 12, 3),
			oDateTime2 = new Date(2017, 0, 10, 13, 3, 12),
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

	QUnit.test("maxDate being yesterday should not throw error on open", function (assert) {
		// Arrange
		var oYesterdayDate = new Date(),
			oDP = new DateTimePicker("DatePicker").placeAt("qunit-fixture");

		oYesterdayDate.setDate(oYesterdayDate.getDate() - 1);

		// Act
		oDP.setMaxDate(oYesterdayDate);
		oCore.applyChanges();
		qutils.triggerEvent("click", "DatePicker-icon");

		// Assert
		assert.ok(true, "No error is thrown when DateTimePicker opens and maxDate is yesterday");

		// Clean
		oDP.destroy();
	});

	QUnit.test("showCurrentTimeButton - button existence", function(assert) {
		// Prepare
		var oDTP = new DateTimePicker({
			showCurrentTimeButton: true
		}).placeAt("qunit-fixture");
		oCore.applyChanges();
		oDTP.toggleOpen();
		oCore.applyChanges();

		// Assert
		assert.ok(oDTP._oClocks.getShowCurrentTimeButton(), "Now button visibility is propagated to the clocks");
	});

	QUnit.test("valueFormat and displayFormat when value is bound", function(assert) {
		var oModel = new JSONModel({ date: new Date(Date.UTC(2016, 1, 18, 8, 0, 0)) }),
			oDTP,
			oInputRef;

		// arrange
		this.stub(oCore.getConfiguration(), "getTimezone").callsFake(function() {
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
		oCore.applyChanges();

		oInputRef = oDTP.$("inner");

		// assert
		assert.equal(oInputRef.val(), "Feb 18, 2016, 10:00:00 AM", "correct displayed value");

		// act - type into the input
		oInputRef.val("Feb 18, 2016, 9:00:00 AM");
		qutils.triggerKeyboardEvent("dtpb-inner", KeyCodes.ENTER, false, false, false);
		oInputRef.trigger("change");

		// assert
		assert.equal(oModel.getProperty('/date').getTime(), Date.UTC(2016, 1, 18, 7, 0, 0), "correct model value");

		// clean
		oDTP.destroy();
	});

	QUnit.test("Overwriting the user input with model updates will be prevented", function (assert) {
		// Prepare
		var oDTP = new DateTimePicker(),
			oHandleInputValueConcurrencySpy = this.spy(oDTP, "handleInputValueConcurrency");

		oDTP._setPreferUserInteraction(true);
		oDTP.placeAt("qunit-fixture");
		oCore.applyChanges();

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
		assert.equal(jQuery("#DTP3").find("input").val(), "2/17/16, 10:11 AM", "DTP3: defined output format used");
		assert.equal(jQuery("#DTP4").find("input").val(), "Feb 17, 2016, 10:11:12 AM", "DTP4: defined output format from binding used");
	});

	QUnit.test("placeholder", function(assert) {
		if (Device.support.input.placeholder) {
			assert.equal(jQuery("#DTP1").find("input").attr("placeholder"), "MMM d, y, h:mm:ss a" , "DTP1: placeholder");
			assert.equal(jQuery("#DTP2").find("input").attr("placeholder"), "dd+MM+yyyy:HH+mm", "DTP2: placeholder");
			assert.equal(jQuery("#DTP3").find("input").attr("placeholder"), "M/d/yy, h:mm a", "DTP3: placeholder");
			assert.equal(jQuery("#DTP4").find("input").attr("placeholder"), "MMM d, y, h:mm:ss a", "DTP4: placeholder from binding used");
		} else {
			assert.ok(!jQuery("#DTP1").find("input").attr("placeholder"), "No placeholder attribute");
		}
	});

	QUnit.test("_fillDateRange works with min date when the current date is out of range", function(assert) {
		var oDateTimePicker = new DateTimePicker("DTPMinMax").placeAt("uiArea1"),
			oNewMinDate = new Date(2014, 0, 1),
			oNewMaxDate = new Date(2014, 11, 31),
			oNewMinDateUTC = new Date(Date.UTC(oNewMinDate.getFullYear(), oNewMinDate.getMonth(), oNewMinDate.getDate())),
			oFocusedDate;

		//arrange
		oDateTimePicker.setMinDate(oNewMinDate);
		oDateTimePicker.setMaxDate(oNewMaxDate);
		oCore.applyChanges();



		//act
		oDateTimePicker.focus();
		qutils.triggerEvent("click", "DTPMinMax-icon");

		oFocusedDate = oDateTimePicker._oCalendar._getFocusedDate().toUTCJSDate();

		//assert
		assert.equal(oFocusedDate.toString(), oNewMinDateUTC.toString(), "oDateTimePicker: focused date equals min date when current date is out of the min/max range");

		//clean
		oDateTimePicker.destroy();
	});

	QUnit.test("Swticher is rendered and visible on small screen size", function(assert) {
		// Arrange
		var done = assert.async(),
			oDTP7 = new DateTimePicker("DTP7", {}),
			oAfterRenderingDelegate,
			oCalendar;

		oDTP7.placeAt("uiArea8");
		oCore.applyChanges();
		oDTP7.focus();

		qutils.triggerEvent("click", "DTP7-icon");
		oCore.applyChanges();
		oCalendar = oDTP7._getCalendar();
		oAfterRenderingDelegate = {
			onAfterRendering: function() {
				assert.ok(jQuery("#DTP7-PC-Switch")[0], "Swicher rendered");
				assert.ok(jQuery("#DTP7-PC-Switch").is(":visible"), "Swicher is visible");
				oCalendar.removeDelegate(oCalendar);
				oDTP7.destroy();
				done();
			}
		};

		// Assert
		oCalendar.addDelegate(oAfterRenderingDelegate);

		// Act
		oDTP7._handleWindowResize({name: "Phone"});
	});

	QUnit.test("Swticher is rendered and hidden on large screen size", function(assert) {
		// Arrange
		var done = assert.async(),
			oDTP8 = new DateTimePicker("DTP8", {}),
			oAfterRenderingDelegate,
			oCalendar;

		oDTP8.placeAt("uiArea8");
		oCore.applyChanges();
		oDTP8.focus();

		qutils.triggerEvent("click", "DTP8-icon");
		oCore.applyChanges();
		oCalendar = oDTP8._getCalendar();
		oAfterRenderingDelegate = {
			onAfterRendering: function() {
				assert.ok(jQuery("#sap-ui-invisible-DTP8-PC-Switch")[0], "Swicher rendered");
				assert.ok(jQuery("#sap-ui-invisible-DTP8-PC-Switch").is(":hidden"), "Swicher is hidden");
				oCalendar.removeDelegate(oCalendar);
				oDTP8.destroy();
				done();
			}
		};

		// Assert
		oCalendar.addDelegate(oAfterRenderingDelegate);

		// Act
		oDTP8._handleWindowResize({name: "Tablet"});
	});

	QUnit.module("initialFocusedDate property", {
		beforeEach: function () {
			this.oDTp = new DateTimePicker();
			this.oDTp.placeAt("qunit-fixture");
			oCore.applyChanges();
		},

		afterEach: function () {
			this.oDTp.destroy();
			this.oDTp = null;
		}
	});

	QUnit.test("_fillDateRange should call Calendar's focusDate method and clocks _setTimeValues with initialFocusedDateValue if no value is set", function (assert) {
		// prepare
		var oExpectedDateValue = new Date(2017, 4, 5, 6, 7, 8);
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
		var oExpectedDateValue = new Date(2017, 4, 5, 6, 7, 8);
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
		var oExpectedDateValue = new Date(2017, 4, 5, 6, 7, 8),
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
		qutils.triggerKeyboardEvent("DTP2-inner", KeyCodes.ENTER, false, false, false);
		jQuery("#DTP2").find("input").trigger("change"); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, "DTP2", "Change event fired");
		assert.equal(sValue, "37+02+2016:10+11", "Value of event has entered value if it is invalid");
		assert.ok(!bValid, "Value is not valid");
		assert.equal(oDTP2.getValue(), "37+02+2016:10+11", "Value has entered value if it is invalid");
		assert.equal(oDTP2.getDateValue().getTime(), new Date("2016", "01", "17", "10", "11", "12").getTime(), "DateValue not changed set");

		sValue = "";
		bValid = true;
		sId = "";
		oDTP2.focus();
		jQuery("#DTP2").find("input").val("18+02+2016:10+30");
		qutils.triggerKeyboardEvent("DTP2-inner", KeyCodes.ENTER, false, false, false);
		jQuery("#DTP2").find("input").trigger("change"); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, "DTP2", "Change event fired");
		assert.equal(sValue, "2016-02-18,10-30-00", "Value of event has entered value if valid");
		assert.ok(bValid, "Value is valid");
		assert.equal(oDTP2.getValue(), "2016-02-18,10-30-00", "Value has entered value if valid");
		assert.equal(oDTP2.getDateValue().getTime(), new Date("2016", "01", "18", "10", "30", "00").getTime(), "DateValue not changed set");

	});

	QUnit.test("change date using calendar - open", function(assert) {
		var done = assert.async(),
			oClocks,
			aMonths,
			aDays,
			oDay,
			i;

		sValue = "";
		sId = "";

		oDTP3._createPopup();
		oDTP3._oPopup.attachEvent("afterOpen", function() {
			oCore.applyChanges();
			assert.ok(jQuery("#DTP3-cal")[0], "calendar rendered");
			assert.ok(jQuery("#DTP3-cal").is(":visible"), "calendar is visible");

			oClocks = oCore.byId("DTP3-Clocks");
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
			qutils.triggerKeyboardEvent(oDay, KeyCodes.ENTER, false, false, false);

			oDTP3._oClocks.getAggregation("_buttons")[0].focus();
			qutils.triggerKeyboardEvent(oDTP3._oClocks.getAggregation("_buttons")[0].getDomRef(), KeyCodes.ARROW_UP, false, false, false);
			oCore.applyChanges();
			assert.equal(jQuery("#DTP3-Clocks-clockH-selected").text(), "11" , "DTP3: correct hours set after keyboard navigation");

			done();
		});

		oDTP3.focus();
		qutils.triggerEvent("click", "DTP3-icon");
		oCore.applyChanges();
	});

	QUnit.test("change date using calendar - choose", function(assert) {
		var done = assert.async();

		oDTP3._oPopup.attachEvent("afterClose", function() {
			assert.ok(!jQuery("#DTP3-cal").is(":visible"), "calendar is invisible");
			assert.ok(!jQuery("#DTP3-Clocks").is(":visible"), "Silder is invisible");
			assert.equal(sId, "DTP3", "Change event fired");
			assert.equal(sValue, "Feb 10, 2016, 11:11:00 AM", "Value in internal format priovided");
			assert.equal(oDTP3.getValue(), "Feb 10, 2016, 11:11:00 AM", "Value in internal format set");
			assert.equal(oDTP3.getDateValue().getTime(), new Date("2016", "01", "10", "11", "11").getTime(), "DateValue set");
			done();
		});

		jQuery("#DTP3-OK").trigger("focus");
		qutils.triggerKeydown("DTP3-OK", KeyCodes.ENTER, false, false, false);
		qutils.triggerKeyup("DTP3-OK", KeyCodes.ENTER, false, false, false);
	});

	QUnit.test("Open DateTimePicker from Button", function(assert) {
		// Prepare
		var oDTP = new DateTimePicker("HDTP", {
				hideInput: true
			}).placeAt("qunit-fixture"),
			oButton = new Button({
				icon: "sap-icon://appointment-2",
				press: function() {
					oCore.byId("HDTP").openBy(this.getDomRef());
				}
			}).placeAt("qunit-fixture");

		oCore.applyChanges();

		// Act
		oButton.firePress();
		oCore.applyChanges();

		// Assert
		assert.ok(oCore.byId(oDTP.getId() + "-cal"), oDTP.getId() + ": calender exists");
		assert.ok(oDTP._oPopup, oDTP.getId() + ": popup exists");
		assert.ok(jQuery("#" + oDTP.getId() + "-cal")[0], "calendar rendered");
		assert.ok(jQuery("#" + oDTP.getId() + "-cal").is(":visible"), "picker is visible");

		// Clean
		oDTP.destroy();
		oButton.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("aria-expanded correctly set", function(assert) {
		var oDTP = new DateTimePicker("DP", {}).placeAt("uiArea8");
		oCore.applyChanges();

		//before opening the popup
		assert.notOk(oDTP.$("inner").attr("aria-expanded"), "false", "DP input doesn't have 'aria-expanded' attrubute set.");
	});

	QUnit.test("aria-haspopup set correctly", function(assert) {
		var oDTP = new DateTimePicker();

		oDTP.placeAt("qunit-fixture");
		oCore.applyChanges();

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
		assert.strictEqual(oInfo.type, oCore.getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATETIMEINPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value  Date and Time", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oInput.setValue("");
		oInput.setEnabled(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Date and Time", "Description");
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

	QUnit.test("_focusActiveButton method: moves the focus to the first clock", function(assert) {
		//Prepare
		var done = assert.async();

		var oDTP = new DateTimePicker().placeAt("uiArea1");
		oCore.applyChanges();

		oDTP._createPopup();
		oDTP._createPopupContent();
		oCore.applyChanges();
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

	QUnit.test("showTimezone and aria-describedBy", function(assert) {
		// arrange
		var oDTP = new DateTimePicker("DTPACC")
			.placeAt("qunit-fixture"),
			oInputRef;
		oCore.applyChanges();

		oInputRef = oDTP.$("inner");

		// assert
		assert.ok(oInputRef.attr("aria-describedby").indexOf("DTPACC-timezoneID") === -1,
			"the timezone id is not included in the aria-describedby DOM references");

		// act
		oDTP.setShowTimezone(true);
		oCore.applyChanges();

		oInputRef = oDTP.$("inner");

		// assert
		assert.ok(oInputRef.attr("aria-describedby").indexOf("DTPACC-timezoneID") > -1,
			"the timezone id is included in the aria-describedby DOM references");

		// clean
		oDTP.destroy();
	});

	QUnit.module("Calendar and TimePicker");

	QUnit.test("Open picker on small screen", function(assert) {
		//Prepare
		jQuery("html").removeClass("sapUiMedia-Std-Desktop");
		jQuery("html").addClass("sapUiMedia-Std-Phone");

		var oDTP5 = new DateTimePicker("DTP5", {
						dateValue: new Date()
					}).placeAt("uiArea5");
		oCore.applyChanges();

		var done = assert.async();

		oDTP5.focus();
		qutils.triggerEvent("click", "DTP5-icon");
		oCore.applyChanges();
		setTimeout(function(){
			assert.ok(jQuery("#DTP5-RP-popover")[0], "popover is rendered");
			assert.ok(jQuery("#DTP5-RP-popover").is(":visible"), "popover is visible");
			oDTP5.destroy();
			jQuery("html").addClass("sapUiMedia-Std-Desktop");
			jQuery("html").removeClass("sapUiMedia-Std-Phone");
			done();
		}, 400);
	});

	QUnit.test("Calendar hides when date is selected (on small screen)", function(assert) {
		var oDTP5 = new DateTimePicker("DTP5", {
				dateValue: new Date(2021, 10, 11)
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

		oDTP5.placeAt("uiArea5");
		oDTP5._createPopup();
		oDTP5._createPopupContent();
		oCalendar = oDTP5._getCalendar();
		oCalendar.addDelegate(oAfterRenderingDelegate);
		oCore.applyChanges();

		oDTP5.focus();
		qutils.triggerEvent("click", "DTP5-icon");
		oCore.applyChanges();
	});

	QUnit.test("data binding with sap.ui.model.odata.type.DateTime", function(assert) {
		var oDate = new Date(2019, 5, 6, 3, 40, 46),
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
		assert.equal(oDateTimePicker._formatValue(oDate), "Jun 6, 2019, 3:40:46 AM", "Date successfully formatted");

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

	QUnit.test("_createPopup: mobile device", function(assert) {
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
		oCore.applyChanges();

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

	QUnit.test("The time picker UI part is created using the display format", function(assert) {
		var oDTP = new DateTimePicker({
			value: "14/09/2021 15:00:00",
			displayFormat: "dd/MM/yyyy h:mm:ss a",
			valueFormat: "dd/MM/yyyy HH:mm:ss"
		}),
		oClocks;

		// arrange
		oDTP.placeAt("qunit-fixture");
		oCore.applyChanges();

		// act
		oDTP._createPopup();
		oDTP._createPopupContent();
		oCore.applyChanges();
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
		var oExpectedDate = new DateRange().setStartDate(new Date(2017, 5, 15)),
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

	QUnit.test("setMinutesStep, setSecondsStep set the steps to the clocks", function(assert) {
		//arrange, act
		var oDTP = new DateTimePicker({
			minutesStep: 5,
			secondsStep: 4
		}).placeAt("qunit-fixture");

		oCore.applyChanges();

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
				myDate: new Date()
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

	QUnit.test("_createPopupContent", function (assert) {
		// Arrange
		var oDTP = new DateTimePicker().placeAt("qunit-fixture"),
			oPopupContent;

		oCore.applyChanges();

		// Act
		oDTP.toggleOpen();

		oPopupContent = oDTP._oPopup.getContent();

		// Assert
		assert.ok(oPopupContent[0].isA("sap.m.ValueStateHeader"), "There is a sap.m.ValueStateHeader created in the popup content");
		assert.ok(oPopupContent[1].isA("sap.m.internal.DateTimePickerPopup"), "There is a sap.m.internal.DateTimePickerPopup created in the popup content");

		// Clean up
		oDTP.destroy();
	});

	QUnit.module("Timezones");

	QUnit.test("value + timezone", function(assert) {
		// arrange
		var oDTP = new DateTimePicker({
			value: "Feb 2, 2022, 8:25:00 AM America/New_York",
			timezone: "America/New_York"
		});

		// assert
		assert.equal(oDTP.getDateValue().getTime(), 1643808300000, "dateValue contains the correct date and time");

		// act
		oDTP.setValue("Feb 2, 2022, 9:25:00 AM America/New_York");

		// assert
		assert.equal(oDTP.getDateValue().getTime(), 1643811900000, "dateValue contains the correct date and time");

		// act
		oDTP.setTimezone("Asia/Kabul");

		// assert
		assert.equal(oDTP.getDateValue().getTime(), 1643777700000, "dateValue contains the correct date and time");
		assert.equal(oDTP.getValue(), "Feb 2, 2022, 9:25:00 AM Asia, Kabul", "the time part of the value stays the same");

		// clean
		oDTP.destroy();
	});

	QUnit.test("dateValue + timezone", function(assert) {
		// arrange
		var oDTP = new DateTimePicker({
			dateValue: new Date(Date.UTC(2022, 1, 2, 13, 25, 0)),
			timezone: "America/New_York"
		});

		// assert
		assert.equal(oDTP.getValue(), "Feb 2, 2022, 8:25:00 AM Americas, New York", "the value is correct");

		// act
		oDTP.setDateValue(new Date(Date.UTC(2022, 1, 2, 14, 25, 0)));

		// assert
		assert.equal(oDTP.getValue(), "Feb 2, 2022, 9:25:00 AM Americas, New York", "the value is correct");

		// act
		oDTP.setTimezone("Asia/Kabul");

		// assert
		assert.equal(oDTP.getDateValue().getTime(), 1643777700000, "dateValue contains the correct date and time");
		assert.equal(oDTP.getValue(), "Feb 2, 2022, 9:25:00 AM Asia, Kabul", "the time part of the value stays the same");

		// clean
		oDTP.destroy();
	});

	QUnit.test("input value", function(assert) {
		// arrange
		var oDTP = new DateTimePicker({
			value: "Feb 2, 2022, 8:25:00 AM America/New_York",
			timezone: "America/New_York"
		}).placeAt("qunit-fixture");
		oCore.applyChanges();

		// assert
		assert.equal(oDTP.$("inner").val(), "Feb 2, 2022, 8:25:00 AM", "correct displayed value");

		// clean
		oDTP.destroy();
	});

	QUnit.test("showTimezone", function(assert) {
		var oDTP;

		// arrange
		this.stub(oCore.getConfiguration(), "getTimezone").callsFake(function() {
			return "Asia/Kabul";
		});

		oDTP = new DateTimePicker().placeAt("qunit-fixture");
		oCore.applyChanges();

		assert.equal(oDTP.$("timezoneLabel").length, 0, "no timezone label");

		// act
		oDTP.setShowTimezone(true);
		oCore.applyChanges();

		// assert
		assert.equal(oDTP.$("timezoneLabel").length, 1, "has a timezone label");
		assert.equal(oDTP.$("timezoneLabel").text(), "Asia/Kabul", "the label text is the default timezone");

		// act
		oDTP.setTimezone("America/New_York");
		oCore.applyChanges();

		// assert
		assert.equal(oDTP.$("timezoneLabel").text(), "America/New_York", "the label text is the provided timezone");

		// clean
		oDTP.destroy();
	});

	QUnit.test("displayFormatType + timezone", function(assert) {
		// arrange
		var oDTP = new DateTimePicker({
			value: "Feb 18, 2016, 10:00:00 AM",
			displayFormatType: "Islamic"
		}).placeAt("qunit-fixture");
		oCore.applyChanges();

		// assert
		assert.equal(oDTP.$("inner").val(), "Jum. I 9, 1437 AH, 10:00:00 AM", "correct displayed value");

		// act
		oDTP.setTimezone("America/New_York");
		oCore.applyChanges();

		// assert
		assert.equal(oDTP.getValue(), "Feb 18, 2016, 10:00:00 AM Americas, New York", "value is correct");
		assert.equal(oDTP.$("inner").val(), "Jum. I 9, 1437 AH, 10:00:00 AM", "correct displayed value");
		assert.equal(oDTP.getDateValue().getTime(), 1455807600000, "correct dateValue");

		// clean
		oDTP.destroy();
	});

	QUnit.test("bound dateValue + timezone", function(assert) {
		// arrange
		var oModel = new JSONModel({ date: new Date(Date.UTC(2016, 1, 18, 15, 0, 0)) }),
			oDTP = new DateTimePicker("dtpb", {
				dateValue: { path: '/date' },
				timezone: "America/New_York" // UTC-5
			}).setModel(oModel),
			oInputRef;

		oDTP.placeAt("qunit-fixture");
		oCore.applyChanges();

		oInputRef = oDTP.$("inner");

		// assert
		assert.equal(oInputRef.val(), "Feb 18, 2016, 10:00:00 AM", "correct displayed value");

		// act - type into the input
		oInputRef.val("Feb 18, 2016, 9:00:00 AM");
		qutils.triggerKeyboardEvent("dtpb-inner", KeyCodes.ENTER, false, false, false);
		oInputRef.trigger("change");

		// assert
		assert.equal(oDTP.getDateValue().getTime(), Date.UTC(2016, 1, 18, 14, 0, 0), "correct dateValue");

		// clean
		oDTP.destroy();
	});

	QUnit.test("timezone + bound value type DateTime - order", function(assert) {
		// arrange
		var oModel = new JSONModel({ date: new Date(2016, 1, 18, 3, 0, 0) }),
			oDTP = new DateTimePicker("dtpbo", {
				timezone: "America/New_York" // UTC-5
			}).setModel(oModel);

		oDTP.placeAt("qunit-fixture");
		oCore.applyChanges();

		// act
		oDTP.bindProperty("value", { path: '/date', type: new DateTime() });
		oCore.applyChanges();

		// assert
		assert.equal(oDTP.getDateValue().getTime(), Date.UTC(2016, 1, 18, 8, 0, 0), "correct dateValue");

		// clean
		oDTP.destroy();
	});

	QUnit.test("timezone + bound value data type String", function(assert) {
		// arrange
		var oModel = new JSONModel({ date: "Feb++18++2016, 3:00:00 AM" }),
			oDTP = new DateTimePicker("dtpbs", {
				valueFormat: "MMM++dd++yyyy, h:mm:ss a",
				timezone: "America/New_York" // UTC-5
			}).setModel(oModel);

		oDTP.placeAt("qunit-fixture");
		oCore.applyChanges();

		// act
		oDTP.bindProperty("value", { path: '/date', type: new sap.ui.model.type.String() });
		oCore.applyChanges();

		// assert
		assert.ok(oDTP.getDateValue(), "has dateValue");
		assert.equal(oDTP.getDateValue().getTime(), Date.UTC(2016, 1, 18, 8, 0, 0), "correct dateValue");

		// clean
		oDTP.destroy();
	});

	QUnit.test("timezone setter does not update 'value' when timezone is the same", function(assert) {
		// arrange
		var done = assert.async(),
			oDTP = new sap.m.DateTimePicker("dtp", {
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

	QUnit.test("when the displayFormat does not contain date part, the selected date is preserved", function(assert) {
		// arrange
		var oDTP = new DateTimePicker("dtp", {
				value: "2022-02-11T07:16:33",
				displayFormat: "HH:mm",
				valueFormat: "yyyy-MM-ddTHH:mm:ss"
			}).placeAt("qunit-fixture");

		oCore.applyChanges();
		oDTP.toggleOpen();

		// assert
		assert.equal(oDTP._getSelectedDate().getTime(), new Date(2022, 1, 11, 7, 16, 33).getTime(), "the selected date is as expected");

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
		assert.equal(oTimezonePopup.getTitle(), "America/New_York",
			"the popup shows the correct timezone");

		// act
		// simulate timezone change, not using the timezone setter
		this.stub(oDTP, "_getTimezone").callsFake(function() {
			return "America/Chicago";
		});
		// act
		oTimezonePopup = oDTP._getTimezoneNamePopup();

		// assert
		assert.equal(oTimezonePopup.getTitle(), "America/Chicago",
			"the popup shows the correct timezone");

		// clean
		oDTP.destroy();
	});

	QUnit.test("picker selection in a different timezone", function(assert) {
		// arrange
		var oDTP = new DateTimePicker("dtp", {
			value: "2022-05-16T01:16:33",
			valueFormat: "yyyy-MM-ddTHH:mm:ss",
			timezone: "UTC"
		}).placeAt("qunit-fixture");

		oCore.applyChanges();
		oDTP.toggleOpen();
		oDTP._selectDate(); //simulate date and time selection via picker

		// assert
		assert.equal(oDTP.getDateValue().getUTCDate(), 16, "the selected date is as expected");
		assert.equal(oDTP.getDateValue().getUTCHours(), 1, "the selected hours is as expected");

		// clean
		oDTP.destroy();
	});

	QUnit.module("Different application timezone", {
		before: function() {
			var sTZ1 = "Europe/Sofia";
			var sTZ2 = "Europe/Berlin";

			this.localTimezone = oCore.getConfiguration().getTimezone();
			oCore.getConfiguration().setTimezone(this.localTimezone === sTZ1 ? sTZ2 : sTZ1);
			oCore.applyChanges();
		},
		after: function() {
			oCore.getConfiguration().setTimezone(this.localTimezone);
			oCore.applyChanges();
		}
	});

	QUnit.test("measure label renders always the same UTC date and time", function(assert) {
		// arrange
		var oDTP = new DateTimePicker("dtp", {
			showTimezone: true
		}).placeAt("qunit-fixture");
		oCore.applyChanges();

		// assert
		assert.equal(oDTP.$().find(".sapMDummyContent").text(), "Nov 20, 2000, 10:10:10 AM",
			"the correct formatted date and time is used to measure the input width");

		// clean
		oDTP.destroy();
	});

	QUnit.module("Events");

	QUnit.test("afterValueHelpOpen and afterValueHelpClose event fire when value help opens and closes", function(assert) {
		var oDTP = new DateTimePicker(),
			spyOpen = this.spy(oDTP, "fireAfterValueHelpOpen"),
			spyClose = this.spy(oDTP, "fireAfterValueHelpClose");

		oDTP.placeAt("qunit-fixture");
		oCore.applyChanges();

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


});