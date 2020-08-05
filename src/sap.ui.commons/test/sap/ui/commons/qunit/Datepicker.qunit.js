/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/Device",
	"sap/ui/commons/DatePicker",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Date",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes"
], function(
	qutils,
	createAndAppendDiv,
	Device,
	DatePicker,
	JSONModel,
	TypeDate,
	jQuery,
	KeyCodes
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea", "uiArea2", "uiArea3", "uiArea4", "uiArea5"]);


	var bMobile = !!Device.browser.mobile;

	var ctrlId   = "myDatePicker";
	var inputId  = ctrlId + "-input";
	var sChangeValue = "";
	var sChangeYyyymmdd = "";
	var bChangeInvalid = true;

	var fHandleChange = function(oEvent){
		sChangeValue = oEvent.getParameter("newValue");
		sChangeYyyymmdd = oEvent.getParameter("newYyyymmdd");
		bChangeInvalid = oEvent.getParameter("invalidValue");
	};

	// With attributes defined at initialization:
	var oPicker  = new DatePicker(ctrlId, {yyyymmdd:"20101010",locale:"en-XX", change: fHandleChange});
	// With attributes defined at initialization, but to be overwritten after initialization:
	var oPicker2 = new DatePicker("myDatePicker2", {yyyymmdd:"20101010",locale:"en-XX"});
	// With attributes to be defined after initialization:
	var oPicker3 = new DatePicker("myDatePicker3");

	oPicker.placeAt("uiArea");
	oPicker2.placeAt("uiArea2");
	oPicker3.placeAt("uiArea3");

	// Defining "locale" then "value":
	oPicker2.setLocale("de");
	oPicker2.setValue("25.12.2010");
	// Defining "yyyymmdd" then "locale":
	// Beware: Use a supported locale since we do not want to revert to the machine's locale,
	//         as English machines would say VALUE = "12/02/2010" while German ones "12.02.2010".
	oPicker3.setYyyymmdd("20100212");
	oPicker3.setLocale("en");

	var baseDate = new Date(1330473600000); // 2012-02-29T00:00:00.00
	var oModel = new JSONModel();
	oModel.setData({
		dateValue: new Date(baseDate.getTime())
	});
	sap.ui.getCore().setModel(oModel);

	(new DatePicker("myDatePicker4", {width: "10em",
		value: {
			path: "/dateValue",
			type: new TypeDate()}
	})).placeAt("uiArea4");

	(new DatePicker("myDatePicker5", {width: "10em",
		value: {
			path: "/dateValue",
			type: new TypeDate({pattern: "yy-MM-dd"})}
	})).placeAt("uiArea4");

	(new DatePicker("myDatePicker6", {width: "15em",
		value: {
			path: "/dateValue",
			type: new TypeDate({style: "long"})}
	})).placeAt("uiArea4");

	var oPicker7 = new DatePicker("myDatePicker7", {locale:"de",placeholder:"20140120"}).placeAt("uiArea5");


	QUnit.module("Date Picker");
	QUnit.test("DomRef test", function(assert) {
		assert.equal( oPicker.getFocusDomRef().id, inputId, "FocusDomRef on input tag" );
		assert.equal( oPicker.getInputDomRef().id, inputId, "InputDomRef on input tag" );
		assert.equal( oPicker.getIdForLabel(), inputId, "Label points to input tag" );
	});

	QUnit.test("Setter-getter tests", function(assert) {
		assert.equal( oPicker.getLocale(),    "en-XX",      "Testing instance with locale:en-XX" );
		assert.equal( oPicker.getYyyymmdd(),  "20101010",   "Testing instance with yyyymmdd:20101010" );
		assert.equal( oPicker2.getLocale(),   "de",         "Testing setLocale(de)" );
		assert.equal( oPicker2.getValue(),    "25.12.2010", "Testing setValue(25.12.2010)" );
		assert.equal( oPicker3.getLocale(),   "en",         "Testing setLocale(en)" );
		assert.equal( oPicker3.getYyyymmdd(), "20100212",   "Testing setYyyymmdd(20100212)" );
	});

	QUnit.test("YYYYMMDD <-> VALUE conversion tests", function(assert) {
		// WARNING: YYYYMMDD <-> VALUE conversions will only work if the Pickers are rendered!
		assert.equal( oPicker.getValue(),     "Oct 10, 2010", "Testing instance with yyyymmdd:20101010" );
		assert.equal( oPicker2.getYyyymmdd(), "20101225",   "Testing setValue(25.12.2010)" );
		assert.equal( oPicker3.getValue(),    "Feb 12, 2010", "Testing setYyyymmdd(20100212)" );
	});

	QUnit.test("initialize - blank value", function(assert) {
		oPicker3.setValue("");
		assert.equal( oPicker3.getValue(), "", "Testing setValue(\"\")" );
		assert.equal( oPicker3.getYyyymmdd(), "",   "Testing setValue(\"\")" );
		oPicker3.setYyyymmdd("20100212");
		oPicker3.setYyyymmdd("");
		assert.equal( oPicker3.getValue(), "", "Testing setYyyymmdd(\"\")" );
		assert.equal( oPicker3.getYyyymmdd(), "",   "Testing setYyyymmdd(\"\")" );
	});

	// The DatePicker always appear ":visible" - test for class !!!
	QUnit.test("TestOpenViaMouseClick", function(assert){
		if (!bMobile){
			assert.ok(!oPicker.getDomRef("cal"), "calendar not exists before 1st click");
			qutils.triggerMouseEvent("myDatePicker-icon", "click");
			assert.ok(oPicker.$("cal").is(":visible"), "Should be visible after 1st click");
			qutils.triggerMouseEvent("myDatePicker-icon", "click");
			assert.ok(!oPicker.$("cal").is(":visible"), "Should be hidden after 2nd click");
		} else {
			assert.ok(true, "not relevant asserts anymore");
			/*
			// on mobile device no jQuery DatePicker must open
			assert.ok(!oPicker.getDomRef("cal"), "no jQuery-DatePicker rendered on mobile devices");
			qutils.triggerMouseEvent("myDatePicker-icon", "click");
			assert.ok(!oPicker.getDomRef("cal"), "still no jQuery-DatePicker rendered on mobile devices after click");
			*/
		}
	});

	if (!bMobile){
		// on mobile devices no keyboard support
		QUnit.test("Keyboard navigation on input field", function(assert) {
			qutils.triggerKeydown("myDatePicker2-input", KeyCodes.PAGE_UP, false, false, false);
			assert.equal(jQuery("#myDatePicker2-input").val(), "26.12.2010", "Date increases by 1 day pressing 'PAGE_UP'");
			assert.equal(oPicker2.getValue(), "25.12.2010", "Value not changed by pressing 'PAGE_UP'");
			qutils.triggerKeydown("myDatePicker2-input", KeyCodes.PAGE_UP, true, false, false);
			assert.equal(jQuery("#myDatePicker2-input").val(), "26.01.2011", "Date increases by 1 month pressing shift+'PAGE_UP'");
			assert.equal(oPicker2.getValue(), "25.12.2010", "Value not changed by pressing shift+'PAGE_UP'");
			qutils.triggerKeydown("myDatePicker2-input", KeyCodes.PAGE_UP, true, false, true);
			assert.equal(jQuery("#myDatePicker2-input").val(), "26.01.2012", "Date increases by 1 year pressing ctrl+shift+'PAGE_UP'");
			assert.equal(oPicker2.getValue(), "25.12.2010", "Value not changed by pressing ctrl+shift+'PAGE_UP'");
			qutils.triggerKeyboardEvent("myDatePicker2-input", KeyCodes.ENTER, false, false, false);
			assert.equal(oPicker2.getValue(), "26.01.2012", "Value changed by pressing ENTER");

			qutils.triggerKeydown("myDatePicker2-input", KeyCodes.PAGE_DOWN, false, false, false);
			assert.equal(jQuery("#myDatePicker2-input").val(), "25.01.2012", "Date decreases by 1 day pressing 'PAGE_DOWN'");
			assert.equal(oPicker2.getValue(), "26.01.2012", "Value not changed by pressing 'PAGE_DOWN'");
			qutils.triggerKeydown("myDatePicker2-input", KeyCodes.PAGE_DOWN, true, false, false);
			assert.equal(jQuery("#myDatePicker2-input").val(), "25.12.2011", "Date decreases by 1 month pressing shift+'PAGE_DOWN'");
			assert.equal(oPicker2.getValue(), "26.01.2012", "Value not changed by pressing shift+'PAGE_DOWN'");
			qutils.triggerKeydown("myDatePicker2-input", KeyCodes.PAGE_DOWN, true, false, true);
			assert.equal(jQuery("#myDatePicker2-input").val(), "25.12.2010", "Date decreases by 1 year pressing ctrl+shift+'PAGE_DOWN'");
			assert.equal(oPicker2.getValue(), "26.01.2012", "Value not changed by pressing ctrl+shift+'PAGE_DOWN'");
			qutils.triggerKeyboardEvent("myDatePicker2-input", KeyCodes.ENTER, false, false, false);
			assert.equal(oPicker2.getValue(), "25.12.2010", "Value changed by pressing ENTER");
		});

		QUnit.test("Input vailidation", function(assert) {
			var oInput = jQuery("#myDatePicker-input");
			oInput.val("Dec 6, 2012");
			qutils.triggerKeyboardEvent("myDatePicker-input", KeyCodes.ENTER, false, false, false);
			assert.equal(oPicker.getValue(), "Dec 6, 2012", "Value after input of Dec 6, 2012");
			assert.equal(oPicker.getYyyymmdd(), "20121206", "Yyyymmdd after input of Dec 6, 2012");
			assert.equal(sChangeValue, "Dec 6, 2012", "Value of Change event after input of Dec 6, 2012");
			assert.equal(sChangeYyyymmdd, "20121206", "Yyymmm of Change event after input of Dec 6, 2012");
			assert.equal(bChangeInvalid, false, "InvalidEntry of Change event after input of Dec 6, 2012");

			oInput.val("11/30/12");
			qutils.triggerKeyboardEvent("myDatePicker-input", KeyCodes.ENTER, false, false, false);
			assert.equal(oPicker.getValue(), "Nov 30, 2012", "Value after input of 11/30/12");
			assert.equal(oPicker.getYyyymmdd(), "20121130", "Yyyymmdd after input of 11/30/12");
			assert.equal(sChangeValue, "Nov 30, 2012", "Value of Change event after input of 11/30/12");
			assert.equal(sChangeYyyymmdd, "20121130", "Yyymmm of Change event after input of 11/30/12");
			assert.equal(bChangeInvalid, false, "InvalidEntry of Change event after input of 11/30/12");

			oInput.val("abc");
			qutils.triggerKeyboardEvent("myDatePicker-input", KeyCodes.ENTER, false, false, false);
			assert.equal(oPicker.getValue(), "abc", "Value after input of abc");
			assert.equal(oPicker.getYyyymmdd(), "20121130", "Yyyymmdd after input of abc");
			assert.equal(sChangeValue, "abc", "Value of Change event after input of abc");
			assert.equal(sChangeYyyymmdd, "20121130", "Yyymmm of Change event after input of abc");
			assert.equal(bChangeInvalid, true, "InvalidEntry of Change event after input of abc");

			oInput.val("");
			qutils.triggerKeyboardEvent("myDatePicker-input", KeyCodes.ENTER, false, false, false);
			assert.equal(oPicker.getValue(), "", "Value after input of \"\"");
			assert.equal(oPicker.getYyyymmdd(), "", "Yyyymmdd after input of \"\"");
			assert.equal(sChangeValue, "", "Value of Change event after input of \"\"");
			assert.equal(sChangeYyyymmdd, "", "Yyymmm of Change event after input of \"\"");
			assert.equal(bChangeInvalid, false, "InvalidEntry of Change event after input of \"\"");
		});
	}

	QUnit.test("DataBindingTest", function(assert) {
		var oDatePicker;

		assert.equal(sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString(), "en-US", "locale of page");
		if (sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString() == "en-US"){
			// test makes no sense if locale is wrong
			oDatePicker = sap.ui.getCore().byId("myDatePicker4");
			assert.equal( oDatePicker.getValue(), "Feb 29, 2012", "Value with default pattern" );
			assert.equal( oDatePicker.getYyyymmdd(), "20120229", "YYYYMMDD with default pattern" );
			if (!bMobile){
				assert.equal( jQuery("#myDatePicker4-input").val(), "Feb 29, 2012", "Displayed value with default pattern" );
			} else {
				assert.ok(true, "not relevant asserts anymore");
			}

			oDatePicker = sap.ui.getCore().byId("myDatePicker5");
			assert.equal( oDatePicker.getValue(), "12-02-29", "Value with defined pattern" );
			assert.equal( oDatePicker.getYyyymmdd(), "20120229", "YYYYMMDD with defined pattern" );
			if (!bMobile){
				assert.equal( jQuery("#myDatePicker5-input").val(), "12-02-29", "Displayed value with defined pattern" );
			} else {
				assert.ok(true, "not relevant asserts anymore");
			}

			oDatePicker = sap.ui.getCore().byId("myDatePicker6");
			assert.equal( oDatePicker.getValue(), "February 29, 2012", "Value with defined pattern" );
			assert.equal( oDatePicker.getYyyymmdd(), "20120229", "YYYYMMDD with defined pattern" );
			if (!bMobile){
				assert.equal( jQuery("#myDatePicker6-input").val(), "February 29, 2012", "Displayed value with defined pattern" );
			} else {
				assert.ok(true, "not relevant asserts anymore");
			}
		}
	});

	QUnit.test("Placeholder", function(assert) {
		assert.equal(oPicker7.getPlaceholder(), "20140120", "Testing attribut value");
		if (Device.support.input.placeholder) {
			assert.equal( jQuery("#myDatePicker7-input").attr("placeholder"), "20.01.2014", "Test attribut formatting");
		} else {
			assert.equal( jQuery("#myDatePicker7-input").val(), "20.01.2014", "Test attribut formatting");
		}

		oPicker7.setPlaceholder("20101230");
		sap.ui.getCore().applyChanges();
		assert.equal( oPicker7.getPlaceholder(), "20101230", "Testing setValue(30.12.2010)" );

		oPicker7.setPlaceholder("Date");
		sap.ui.getCore().applyChanges();
		assert.equal( oPicker7.getPlaceholder(), "Date", "Testing setValue(Date)" );
		if (Device.support.input.placeholder) {
			assert.equal( jQuery("#myDatePicker7-input").attr("placeholder"), "Date", "Placeholder set");
		} else {
			assert.equal( jQuery("#myDatePicker7-input").val(), "Date", "Placeholder set");
		}

		jQuery("#myDatePicker7-icon").trigger("focus");
		qutils.triggerMouseEvent("myDatePicker7-icon", "click");
		if (Device.support.input.placeholder) {
			assert.equal( jQuery("#myDatePicker7-input").attr("placeholder"), "Date", "Placeholder still set after opened");
		} else {
			assert.ok( !jQuery("#myDatePicker7-input").val(), "Placeholder value removed after opened");
		}

		qutils.triggerMouseEvent("myDatePicker7-icon", "click");
		oPicker2.focus();
		if (Device.support.input.placeholder) {
			assert.equal( jQuery("#myDatePicker7-input").attr("placeholder"), "Date", "Placeholder set");
		} else {
			assert.equal( jQuery("#myDatePicker7-input").val(), "Date", "Placeholder set again after closing and focusing other element");
		}
	});
});