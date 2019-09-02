/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/DateTimePicker",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/Device",
	"sap/m/TimePickerSliders",
	"jquery.sap.keycodes",
	"sap/ui/unified/DateRange",
	"jquery.sap.global"
], function(
	qutils,
	createAndAppendDiv,
	DateTimePicker,
	JSONModel,
	DateTime,
	ODataDateTime,
	Device,
	TimePickerSliders,
	jQuery,
	DateRange
) {
	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");
	createAndAppendDiv("uiArea3");
	createAndAppendDiv("uiArea4");
	createAndAppendDiv("uiArea5").setAttribute("style", "width:200px;");
	createAndAppendDiv("uiArea7");
	createAndAppendDiv("uiArea8");


	var bChange = false;
	var sValue = "";
	var bValid = false;
	var sId = "";

	function handleChange(oEvent){
			var oDTP = oEvent.oSource;
			sValue = oEvent.getParameter("newValue");
			bValid = oEvent.getParameter("valid");
			bChange = true;
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
	sap.ui.getCore().setModel(oModel);

	var bParseError = false;
	sap.ui.getCore().attachParseError(
			function(oEvent) {
				sId = oEvent.getParameter("element").getId();
				sValue = oEvent.getParameter('newValue');
				bValid = false;
				bParseError = true;
			});

	var bValidationSuccess = false;
	sap.ui.getCore().attachValidationSuccess(
			function(oEvent) {
				sId = oEvent.getParameter("element").getId();
				sValue = oEvent.getParameter('newValue');
				bValid = true;
				bValidationSuccess = true;
			});

	var oDTP4 = new DateTimePicker("DTP4", {
		width: "250px",
		value: {
			path: "/dateValue",
			type: new DateTime({style: "medium", strictParsing: true})}
		}).placeAt("uiArea4");


	QUnit.module("initialization");

	QUnit.test("Date formatter", function(assert) {
		assert.ok(!oDTP1.getValue(), "DTP1: no value");
		assert.ok(!oDTP1.getDateValue(), "DTP1: no DateValue");
		assert.equal(oDTP2.getValue(), "2016-02-17,10-11-12", "DTP2: Value in internal format set");
		assert.equal(oDTP2.getDateValue().getTime(), new Date("2016", "01", "17", "10", "11", "12").getTime(), "DTP2: DateValue set");
		assert.equal(oDTP3.getValue(), "2/17/16, 10:11 AM", "DTP3: Value in internal format set");
		assert.equal(oDTP3.getDateValue().getTime(), new Date("2016", "01", "17", "10", "11", "12").getTime(), "DTP3: DateValue set");
		assert.equal(oDTP4.getValue(), "Feb 17, 2016, 10:11:12 AM", "DTP4: Value in internal format set");
		assert.equal(oDTP4.getDateValue().getTime(), new Date("2016", "01", "17", "10", "11", "12").getTime(), "DTP4: DateValue set");
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
		sap.ui.getCore().applyChanges();
		qutils.triggerEvent("click", "DatePicker-icon");

		// Assert
		assert.ok(true, "No error is thrown when DateTimePicker opens and maxDate is yesterday");

		// Clean
		oDP.destroy();
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

	QUnit.test("Time sliders are updated right after popup is open", function(assert) {
		var done = assert.async();
		//Prepare
		var oDTP = new DateTimePicker().placeAt("uiArea1"),
			oTPS,
			oSpyUpdateSlidersFn;
		sap.ui.getCore().applyChanges();

		oDTP._createPopup();
		oDTP._createPopupContent();
		oTPS = oDTP._oPopup.getContent()[0].getTimeSliders();
		oSpyUpdateSlidersFn = sinon.spy(oTPS, "_updateSlidersValues");

		//Act
		oDTP._openPopup();
		setTimeout(function() {
			//Assert
			assert.equal(oSpyUpdateSlidersFn.callCount, 1, "Once picker is opened, function updateSlidersValues should be called");
			assert.ok(oTPS._getFirstSlider().getIsExpanded(), "Once picker is opened, the first slider is expanded");

			//Cleanup
			oSpyUpdateSlidersFn.restore();
			oDTP.destroy();
			done();
		}, 400);
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
		sap.ui.getCore().applyChanges();



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
			oDTP7 = new DateTimePicker("DTP7", {}).placeAt("uiArea8");
		sap.ui.getCore().applyChanges();
		oDTP7.focus();
		qutils.triggerEvent("click", "DTP7-icon");
		sap.ui.getCore().applyChanges();

		// Act
		oDTP7._handleWindowResize({name: "Phone"});


		// Asssert
		oDTP7.getAggregation("_popup").attachEventOnce("afterOpen", function() {
			assert.ok(jQuery("#DTP7-PC-Switch")[0], "Swicher rendered");
			assert.ok(jQuery("#DTP7-PC-Switch").is(":visible"), "Swicher is visible");
			oDTP7.destroy();
			done();
		});
	});

	QUnit.test("Swticher is rendered and hidden on large screen size", function(assert) {
		// Arrange
		var done = assert.async(),
			oDTP8 = new DateTimePicker("DTP8", {}).placeAt("uiArea8");
		sap.ui.getCore().applyChanges();
		oDTP8.focus();
		qutils.triggerEvent("click", "DTP8-icon");
		sap.ui.getCore().applyChanges();

		// Act
		oDTP8._handleWindowResize({name: "Tablet"});

		// Asssert
		oDTP8.getAggregation("_popup").attachEventOnce("afterOpen", function() {
			assert.ok(jQuery("#sap-ui-invisible-DTP8-PC-Switch")[0], "Swicher rendered");
			assert.ok(jQuery("#sap-ui-invisible-DTP8-PC-Switch").is(":hidden"), "Swicher is hidden");
			oDTP8.destroy();
			done();
		});
	});

	QUnit.module("initialFocusedDate property", {
		beforeEach: function () {
			this.oDTp = new DateTimePicker();
			this.oDTp.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},

		afterEach: function () {
			this.oDTp.destroy();
			this.oDTp = null;
		}
	});

	QUnit.test("_fillDateRange should call Calendar's focusDate method and sliders _setTimeValues with initialFocusedDateValue if no value is set", function (assert) {
		// prepare
		var oExpectedDateValue = new Date(2017, 4, 5, 6, 7, 8);
		this.oDTp._oCalendar = { focusDate: this.spy(), destroy: function () {} };
		this.oDTp._oDateRange = { getStartDate: function () {}, setStartDate: function () {} };
		this.oDTp._oSliders = new TimePickerSliders(this.oDTp.getId() + "-Sliders", {
			displayFormat: "hh:mm:ss"
		});
		var oSetTimeValuesSpy = this.spy(this.oDTp._oSliders, "_setTimeValues");

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

	QUnit.test("_fillDateRange should call Calendar's focusDate method and sliders _setTimeValues with currentDate if initialFocusedDateValue and value are not set", function (assert) {
		// prepare
		var oExpectedDateValue = new Date(2017, 4, 5, 6, 7, 8);
		this.oDTp._oCalendar = { focusDate: this.spy(), destroy: function () {} };
		this.oDTp._oDateRange = { getStartDate: function () {}, setStartDate: function () {} };
		this.oDTp._oSliders = new TimePickerSliders(this.oDTp.getId() + "-Sliders", {
			displayFormat: "hh:mm:ss"
		});
		var oSetTimeValuesSpy = this.spy(this.oDTp._oSliders, "_setTimeValues");

		// act
		this.oDTp._fillDateRange();

		// assert
		assert.equal(this.oDTp._oCalendar.focusDate.calledWith(oExpectedDateValue), false, "focusDate should not be called with initialFocusedDateValue");
		assert.notEqual(this.oDTp._oCalendar.focusDate.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "focusDate should be called with " + oExpectedDateValue);
		assert.equal(oSetTimeValuesSpy.calledWith(oExpectedDateValue), false, "_setTimeValues should not be called with initialFocusedDateValue");

		// cleanup
		oSetTimeValuesSpy.restore();
	});

	QUnit.test("_fillDateRange should call Calendar's focusDate method and sliders _setTimeValues with valueDate", function (assert) {
		// prepare
		var oExpectedDateValue = new Date(2017, 4, 5, 6, 7, 8),
			oGetDateValue = this.stub(this.oDTp, "getDateValue", function () { return oExpectedDateValue; });
		this.oDTp._oCalendar = { focusDate: this.spy(), destroy: function () {} };
		this.oDTp._oDateRange = { getStartDate: function () {}, setStartDate: function () {} };
		this.oDTp._oSliders = new TimePickerSliders(this.oDTp.getId() + "-Sliders", {
			displayFormat: "hh:mm:ss"
		});
		var oSetTimeValuesSpy = this.spy(this.oDTp._oSliders, "_setTimeValues");

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
		bChange = false;
		sValue = "";
		bValid = true;
		sId = "";
		oDTP2.focus();
		jQuery("#DTP2").find("input").val("37+02+2016:10+11");
		qutils.triggerKeyboardEvent("DTP2-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DTP2").find("input").change(); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, "DTP2", "Change event fired");
		assert.equal(sValue, "37+02+2016:10+11", "Value of event has entered value if invalid");
		assert.ok(!bValid, "Value is not valid");
		assert.equal(oDTP2.getValue(), "37+02+2016:10+11", "Value has entered value if invalid");
		assert.equal(oDTP2.getDateValue().getTime(), new Date("2016", "01", "17", "10", "11", "12").getTime(), "DateValue not changed set");

		bChange = false;
		sValue = "";
		bValid = true;
		sId = "";
		oDTP2.focus();
		jQuery("#DTP2").find("input").val("18+02+2016:10+30");
		qutils.triggerKeyboardEvent("DTP2-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DTP2").find("input").change(); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, "DTP2", "Change event fired");
		assert.equal(sValue, "2016-02-18,10-30-00", "Value of event has entered value if valid");
		assert.ok(bValid, "Value is valid");
		assert.equal(oDTP2.getValue(), "2016-02-18,10-30-00", "Value has entered value if valid");
		assert.equal(oDTP2.getDateValue().getTime(), new Date("2016", "01", "18", "10", "30", "00").getTime(), "DateValue not changed set");

	});
	/*
				QUnit.test("change date by Pageup/down", function(assert) {
				});
	*/
	QUnit.test("change date using calendar - open", function(assert) {
		var done = assert.async();
		bChange = false;
		sValue = "";
		sId = "";
		oDTP3.focus();
		qutils.triggerEvent("click", "DTP3-icon");
		sap.ui.getCore().applyChanges();
		setTimeout(function(){
			assert.ok(jQuery("#DTP3-cal")[0], "calendar rendered");
			assert.ok(jQuery("#DTP3-cal").is(":visible"), "calendar is visible");

			var oSliders = sap.ui.getCore().byId("DTP3-Sliders");
			assert.equal(oSliders.getAggregation("_columns").length, 3 , "DTP3: number of rendered sliders");

			var aDays = jQuery("#DTP3-cal--Month0-days").find(".sapUiCalItem");
			var oDay;
			for ( var i = 0; i < aDays.length; i++) {
				oDay = aDays[i];
				if (jQuery(oDay).attr("data-sap-day") == "20160210") {
					oDay.focus();
					break;
				}
			}

			// use ENTER to not run into itemNavigation
			qutils.triggerKeyboardEvent(oDay, jQuery.sap.KeyCodes.ENTER, false, false, false);

			var aHours = jQuery("#DTP3-Sliders-listHours-content").find(".sapMTimePickerItem");
			var iIndex = 0;
			for ( iIndex = 0; iIndex < aHours.length; iIndex++) {
				if (jQuery(aHours[iIndex]).hasClass("sapMTimePickerItemSelected")) {
					break;
				}
			}

			oDTP3._oSliders.getAggregation("_columns")[0].focus();
			qutils.triggerKeyboardEvent(oDTP3._oSliders.getAggregation("_columns")[0].getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN, false, false, false);

			done();
		}, 400);
	});

	QUnit.test("change date using calendar - choose", function(assert) {
		var done = assert.async();
		setTimeout(function(){
			jQuery("#DTP3-OK").focus();
			qutils.triggerKeydown("DTP3-OK", jQuery.sap.KeyCodes.ENTER, false, false, false);
			qutils.triggerKeyup("DTP3-OK", jQuery.sap.KeyCodes.ENTER, false, false, false);
			setTimeout(function(){
				assert.ok(!jQuery("#DTP3-cal").is(":visible"), "calendar is invisible");
				assert.ok(!jQuery("#DTP3-Sliders").is(":visible"), "Silder is invisible");
				assert.equal(sId, "DTP3", "Change event fired");
				assert.equal(sValue, "2/10/16, 11:11 AM", "Value in internal format priovided");
				assert.equal(oDTP3.getValue(), "2/10/16, 11:11 AM", "Value in internal format set");
				assert.equal(oDTP3.getDateValue().getTime(), new Date("2016", "01", "10", "11", "11").getTime(), "DateValue set");
				done();
			}, 600);
		}, 400);
	});

	QUnit.module("Accessibility");

	QUnit.test("aria-expanded correctly set", function(assert) {
		var done = assert.async(),
			oDTP = new DateTimePicker("DP", {}).placeAt("uiArea8");

		sap.ui.getCore().applyChanges();

		//before opening the popup
		assert.equal(oDTP.$("inner").attr("aria-expanded"), "false", "DP input has 'aria-expand' set to false when the picker is not open");

		// open DatePicker
		oDTP.focus();
		qutils.triggerEvent("click", "DP-icon");

		sap.ui.getCore().applyChanges();
		setTimeout(function(){
			//after opening popup
			assert.equal(oDTP.$("inner").attr("aria-expanded"), "true", "DP input has 'aria-expand' set to true when the picker is open");

			oDTP.destroy();
			done();
		}, 600);
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
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATETIMEINPUT"), "Type");
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
	QUnit.module("Calendar and TimePicker");

	QUnit.test("When the popover is initially opened and there is a tap on the hours slider it should gain focus", function(assert) {
		//Prepare
		var oDTP = new DateTimePicker().placeAt("uiArea7");

		//Act
		oDTP._createPopup();
		oDTP._createPopupContent();
		var oRenderSpy = this.spy(oDTP._oPopup.getContent()[0].getTimeSliders().getAggregation("_columns")[0], "focus");
		sap.ui.getCore().applyChanges();
		oDTP._openPopup();
		oDTP._oPopup.getContent()[0].getTimeSliders().getAggregation("_columns")[0].fireTap({ setMarked:  jQuery.noop });

		// Assert
		assert.strictEqual(oRenderSpy.callCount, 1, "The slider's value is focused after a tap");

		oRenderSpy.restore();
		oDTP.destroy();
	});

	QUnit.test("Open picker on small screen", function(assert) {
		//Prepare
		jQuery("html").removeClass("sapUiMedia-Std-Desktop");
		jQuery("html").addClass("sapUiMedia-Std-Phone");

		var oDTP5 = new DateTimePicker("DTP5", {
						dateValue: new Date()
					}).placeAt("uiArea5");
		sap.ui.getCore().applyChanges();

		var done = assert.async();

		oDTP5.focus();
		qutils.triggerEvent("click", "DTP5-icon");
		sap.ui.getCore().applyChanges();
		setTimeout(function(){
			assert.ok(jQuery("#DTP5-RP-popover")[0], "popover is rendered");
			assert.ok(jQuery("#DTP5-RP-popover").is(":visible"), "popover is visible");
			oDTP5.destroy();
			jQuery("html").addClass("sapUiMedia-Std-Desktop");
			jQuery("html").removeClass("sapUiMedia-Std-Phone");
			done();
		}, 400);
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
			oFormatter = sap.ui.core.format.DateFormat.getDateTimeInstance({
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

	QUnit.module("Private");

	QUnit.test("For IE & Edge the input selection is cleared before opening the picker and restoring back when picker is closed", function(assert) {
		var done = assert.async(),
			oBrowserStub = this.stub(Device, "browser", {msie: true}),
			oTouchStub = this.stub(Device, "support", {touch: false});

		this.clock = sinon.useFakeTimers();
		var oDTP = new DateTimePicker("DTP6", {
			dateValue: new Date()
		}).placeAt("uiArea5");
		sap.ui.getCore().applyChanges();

		oDTP._$input.get(0).selectionStart = 3;
		oDTP._$input.get(0).selectionEnd = 3;

		oDTP.$().find(".sapUiIcon").click(); //simulate opening
		this.clock.tick(100);

		//Assert
		assert.equal(oDTP._$input.get(0).selectionStart, 0, "selection start should be 0");
		assert.equal(oDTP._$input.get(0).selectionEnd, 0, "selection end should be 0");

		//Act
		sap.ui.getCore().byId("DTP6-OK").firePress();

		setTimeout(function(){
			//Assert
			assert.equal(oDTP._$input.get(0).selectionStart, 3, "selection start must be restored");
			assert.equal(oDTP._$input.get(0).selectionEnd, 3, "selection end must be restored");

			//Cleanup
			oBrowserStub.restore();
			oTouchStub.restore();
			this.clock.restore();
			done();
		}.bind(this), 1000);

		this.clock.tick(1000);//"waits" for close popup animation to complete
	});

	// BCP: 1880193676
	QUnit.test("For IE & Edge the input selection is stored and cleared from _openPopup method (before opening the Popover)", function (assert) {
		// Arrange
		var fn = function () {},
			oStub = this.stub(Device, "browser", { msie: true }),
			oDP = new DateTimePicker(),
			oDPStoreInputSelectionSpy = this.spy(oDP, "_storeInputSelection");

		oDP._oPopup = {
			setAutoCloseAreas: fn,
			openBy: fn,
			isOpen: fn,
			getContent: function () { return []; },
			getAggregation: function () {
					return { oPopup: { setAutoCloseAreas: fn }
				};
			}
		}; // simulate that there is a popup
		oDP.placeAt("uiArea2");
		sap.ui.getCore().applyChanges();

		// Act
		oDP._openPopup();

		// Arrange
		assert.equal(oDPStoreInputSelectionSpy.callCount, 1, "_storeInputSelection is called once on _openPopup");

		// Cleanup
		oStub.restore();
		oDPStoreInputSelectionSpy.restore();
		oDP.destroy();
	});

	QUnit.test("_getInitialFocusedDateValue should return the initialFocusedDateValue property if it is set", function (assert) {
		// arrange
		var oExpectedDate = new Date(2017, 5, 15),
			oDateTimePicker = new DateTimePicker(),
			oGetInitialFocusedDateValueStub = this.stub(oDateTimePicker, "getInitialFocusedDateValue", function () {
				return oExpectedDate;
			});

		// act && assert
		assert.equal(oDateTimePicker._getInitialFocusedDateValue(), oExpectedDate, "should return the value of the property initialFocusedDateValue");

		// cleanup
		oGetInitialFocusedDateValueStub.restore();
		oDateTimePicker.destroy();
	});

	QUnit.test("_getInitialFocusedDateValue should return the current Date if initialFocusedDateValue proeprty is not set", function (assert) {
		// arrange
		var oExpectedDate = new Date(),
			oDateTimePicker = new DateTimePicker(),
			oInitialFocusedDateValue = oDateTimePicker._getInitialFocusedDateValue();

		// act && assert
		assert.equal(oInitialFocusedDateValue.getYear(), oExpectedDate.getYear(), "year should be the current year");
		assert.equal(oInitialFocusedDateValue.getMonth(), oExpectedDate.getMonth(), "month should be the current month");
		assert.equal(oInitialFocusedDateValue.getDay(), oExpectedDate.getDay(), "day should be the current day");

		// cleanup
		oDateTimePicker.destroy();
	});

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

	QUnit.test("setMinutesStep, setSecondsStep set the steps to the sliders", function(assert) {
		//arrange, act
		var oDTP = new DateTimePicker({
			minutesStep: 5,
			secondsStep: 4
		}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		oDTP._createPopup();
		oDTP._createPopupContent();
		oDTP._openPopup();

		//asert
		assert.equal(oDTP._oSliders.getMinutesStep(), 5, "sliders has the correct minutes step");
		assert.equal(oDTP._oSliders.getSecondsStep(), 4, "sliders has the correct seconds step");

		//clean
		oDTP.destroy();
	});
});