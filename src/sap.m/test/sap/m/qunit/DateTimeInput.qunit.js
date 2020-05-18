/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/model/type/Date",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/m/DateTimeInput",
	"sap/ui/model/type/DateTime",
	"jquery.sap.global",
	"sap/ui/core/library",
	"jquery.sap.keycodes"
], function(
	qutils,
	createAndAppendDiv,
	TypeDate,
	JSONModel,
	DateFormat,
	DateTimeInput,
	DateTime,
	jQuery,
	coreLibrary
) {
	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	createAndAppendDiv("content");
	var sDtiView =
		"<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\">" +
		"	<VBox>" +
		"		<DateTimeInput id=\"typeDate\"" +
		"			type=\"Date\"" +
		"			value=\"{" +
		"				path: '/dateVal'," +
		"				type: 'sap.ui.model.type.Date'" +
		"			}\"" +
		"		/>" +
		"		<DateTimeInput id=\"typeTime\"" +
		"			type=\"Time\"" +
		"			value=\"{" +
		"				path: '/dateVal'," +
		"				type: 'sap.ui.model.type.Time'" +
		"			}\"" +
		"		/>" +
		"		<DateTimeInput id=\"typeDateTime\"" +
		"			type=\"DateTime\"" +
		"			value=\"{" +
		"				path: '/dateVal'," +
		"				type: 'sap.ui.model.type.DateTime'" +
		"			}\"" +
		"		/>" +
		"		<DateTimeInput id=\"dateVSdate\"" +
		"			type=\"Date\"" +
		"			value=\"{" +
		"				path: '/dateVal'," +
		"				type: 'sap.ui.model.type.Date'" +
		"			}\"" +
		"		/>" +
		"		<DateTimeInput id=\"dateVSdatetime\"" +
		"			type=\"Date\"" +
		"			value=\"{" +
		"				path: '/dateVal'," +
		"				type: 'sap.ui.model.type.DateTime'" +
		"			}\"" +
		"		/>" +
		"		<DateTimeInput id=\"datetimeVSdate\"" +
		"			type=\"DateTime\"" +
		"			value=\"{" +
		"				path: '/dateVal'," +
		"				type: 'sap.ui.model.type.Date'" +
		"			}\"" +
		"		/>" +
		"		<DateTimeInput id=\"datetimeVSdatetime\"" +
		"			type=\"DateTime\"" +
		"			value=\"{" +
		"				path: '/dateVal'," +
		"				type: 'sap.ui.model.type.DateTime'" +
		"			}\"" +
		"		/>" +
		"	</VBox>" +
		"</mvc:View>";



	// make jQuery.now work with Sinon fake timers (since jQuery 2.x, jQuery.now caches the native Date.now)
	jQuery.now = function() {
		return Date.now();
	};


	var oNow = new Date(),
		oCore = sap.ui.getCore(),
		sValueFormat = "yyyy-MM-dd",
		sDateValue1 = "2012-05-29",
		sDateValue2 = "1984-03-26",
		sDateValue3 = "1984-03-04",
		oModel = new JSONModel(),
		oFormatter = DateFormat.getDateInstance({
			pattern : sValueFormat
		});

	oModel.setData({
		dateVal : new Date(+oNow)
	});
	sap.ui.getCore().setModel(oModel);

	var bChange = false;
	var sValue = "";
	var bValid = false;
	var sId = "";

	function handleChange(oEvent){
			var oDTI = oEvent.oSource;
			sValue = oEvent.getParameter("newValue");
			bValid = oEvent.getParameter("valid");
			bChange = true;
			sId = oDTI.getId();
		}

	var dti0 = new DateTimeInput({
			displayFormat : "dd MMMM, yyyy",
			valueFormat : sValueFormat,
			placeholder : "Test",
			ariaLabelledBy : "XXX",
			width: "100px",
			change: handleChange
		}).placeAt("content"),
		dti1 = new DateTimeInput({
			type : "Time",
			change: handleChange
		}).placeAt("content"),
		dti2 = new DateTimeInput({
			type : "DateTime",
			displayFormat : new DateTime({style: "long"}).getOutputPattern(),
			change: handleChange
		}).placeAt("content"),
		dti3 = new DateTimeInput({
			value : {
				path : "/dateVal",
				type : new TypeDate({pattern : sValueFormat})
			},
			change: handleChange
		}).placeAt("content"),
		dti4 = new DateTimeInput("errordti", {
			displayFormat : "dd MMMM, yyyy",
			valueState:"Error",
			valueStateText:"Error Message",
			change: handleChange
		}).placeAt("content");



	QUnit.module("Properties");

	QUnit.test("Set and Get Date Value ", function(assert) {

		var oDateValue1 = oFormatter.parse(sDateValue1);
		dti0.setValue(sDateValue1);
		oCore.applyChanges();
		assert.strictEqual(dti0.getValue(), sDateValue1, "value after setValue: " + sDateValue1);
		assert.strictEqual(+dti0.getDateValue(), +oDateValue1, "dateValue after setValue : " + oDateValue1 + " " + dti0.getDateValue());

		var oDateValue2 = oFormatter.parse(sDateValue2);
		dti0.setDateValue(oDateValue2);
		oCore.applyChanges();
		assert.strictEqual(dti0.getValue(), sDateValue2, "value after setDateValue: " + sDateValue2);
		assert.strictEqual(+dti0.getDateValue(), +oDateValue2, "dateValue after setDateValue : " + oDateValue2);

		var oDateValue3 = oFormatter.parse(sDateValue3);
		oModel.setData({
			dateVal : oDateValue3
		});
		oCore.applyChanges();
		assert.strictEqual(dti3.getValue(), sDateValue3, "value after oModel.setData: " + sDateValue3);
		assert.strictEqual(+dti3.getDateValue(), +oDateValue3, "dateValue after oModel.setData : " + oDateValue3);
	});

	QUnit.test("used picker", function(assert) {
		assert.equal(dti0.getAggregation("_picker").getMetadata().getName(), "sap.m.DatePicker", "DatePicker control used inside");
		assert.equal(dti1.getAggregation("_picker").getMetadata().getName(), "sap.m.TimePicker", "TimePicker control used inside");
		assert.equal(dti2.getAggregation("_picker").getMetadata().getName(), "sap.m.DateTimePicker", "DateTimePicker control used inside");
	});

	QUnit.test("picker properties", function(assert) {
		var oDatePicker = dti0.getAggregation("_picker");
		assert.equal(dti0.getValue(), oDatePicker.getValue(), "DatePicker value");
		assert.equal(dti0.getDateValue().getTime(), oDatePicker.getDateValue().getTime(), "DatePicker Datealue");
		assert.equal(dti0.getValueFormat(), oDatePicker.getValueFormat(), "DatePicker valueFormat");
		assert.equal(dti0.getDisplayFormat(), oDatePicker.getDisplayFormat(), "DatePicker displayFormat");
		assert.equal(dti0.getPlaceholder(), oDatePicker.getPlaceholder(), "DatePicker value");
		assert.equal(dti0.getWidth(), "100px", "DateTimeInput width");
		assert.equal(oDatePicker.getWidth(), "100%", "DatePicker width");
		assert.ok(jQuery.sap.equal(dti0.getAriaLabelledBy(), oDatePicker.getAriaLabelledBy()), "DatePicker getAriaLabelledBy");

		oDatePicker = dti4.getAggregation("_picker");
		assert.equal(dti4.getValueState(), oDatePicker.getValueState(), "DatePicker valueState");
		assert.equal(dti4.getValueStateText(), oDatePicker.getValueStateText(), "DatePicker valueStateText");
	});

	// BCP: 1880065660
	QUnit.test("setDateValue with iframe's JS date object should set properly the date", function (assert) {
		// arrange
		var oDTI = new DateTimeInput(),
				iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		var oWindow = iframe.contentWindow;
		oWindow.dateObj = new oWindow.Date(2017, 11, 12);

		// act
		oDTI.setDateValue(oWindow.dateObj);

		// assert
		assert.ok(true, "setDateValue did not throw an expection with date object from an iframe");

		// cleanup
		oDTI.destroy();
		document.body.removeChild(iframe);
		iframe = null;
		oDTI = null;
	});


	QUnit.test("Invalid Value", function(assert) {
		var sInvalidValue = ":)";

		dti2.setValue(sInvalidValue);
		oCore.applyChanges();

		assert.strictEqual(dti2.getValue(), ":)", "value after invalid value set : " + dti2.getValue());
		assert.strictEqual(dti2.getDateValue(), null, "dateValue after invalid value set : " + dti2.getDateValue());
	});

	QUnit.module("Interaction");

	QUnit.test("Change event", function(assert) {
		var oDateValue2 = oFormatter.parse(sDateValue2);
		var oDatePicker = dti0.getAggregation("_picker");
		bChange = false;
		sValue = "";
		bValid = true;
		sId = "";
		dti0.focus();
		oDatePicker.$().find("input").val("33 May, 2012");
		qutils.triggerKeyboardEvent("__input0-Picker-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		oDatePicker.$().find("input").trigger("change"); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, dti0.getId(), "Change event fired");
		assert.equal(sValue, "33 May, 2012", "Value of event has entered value if invalid");
		assert.ok(!bValid, "Value is not valid");
		assert.equal(dti0.getValue(), "33 May, 2012", "Value has entered value if invalid");
		assert.equal(dti0.getDateValue().getTime(), oDateValue2.getTime(), "DateValue not changed set");

		bChange = false;
		sValue = "";
		bValid = false;
		sId = "";
		dti0.focus();
		oDatePicker.$().find("input").val("30 May, 2012");
		qutils.triggerKeyboardEvent("__input0-Picker-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		oDatePicker.$().find("input").trigger("change"); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, dti0.getId(), "Change event fired");
		assert.equal(sValue, "2012-05-30", "Value in internal format priovided");
		assert.ok(bValid, "Value is valid");
		assert.equal(dti0.getValue(), "2012-05-30", "Value in internal format set");
		assert.equal(dti0.getDateValue().getTime(), new Date("2012", "04", "30").getTime(), "DateValue set");

	});

	QUnit.test("Databinding type of 'value' property vs DateTimeInput type", function (assert) {
		//Prepare
		var oMyLocalModel = new JSONModel({dateVal: new Date()}),
				oView = sap.ui.view({
					viewContent: sDtiView,
					type: ViewType.XML
				}),
				oDateVSdate = oView.byId("dateVSdate"),
				oDateVSdatetime = oView.byId("dateVSdatetime"),
				oDatetimeVSdate = oView.byId("datetimeVSdate"),
				oDatetimeVSdatetime = oView.byId("datetimeVSdatetime"),
				aAllDateTimeInputs = [oDateVSdate, oDateVSdatetime, oDatetimeVSdate, oDatetimeVSdatetime];

		oView.setModel(oMyLocalModel);
		oView.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		aAllDateTimeInputs.forEach(function (oDTI) {
			//Act
			oDTI.focus();
			this.clock.tick(500);
			jQuery("#" + oDTI.getId() + "-Picker-icon").trigger("click");

			//Assert
			var oPicker = jQuery("#" + oDTI.getId() + "-Picker-cal");
			assert.ok(oPicker, "There should be a calendar in the DOM");
		}.bind(this));

		//Cleanup
		oView.destroy();
	});

	QUnit.test("Destroy", function(assert) {
		assert.strictEqual(dti1.$().length, 1, "Before destroy DateTimeInput is available");
		dti1.destroy();
		assert.strictEqual(dti1.$().length, 0, "DateTimeInput is destroyed");
	});

	QUnit.test("value state and value state message", function(assert) {
		var oPicker = dti4.getAggregation("_picker");
		dti4.focus();
		this.clock.tick(0); // need some time the popup to be opened in IE
		assert.ok(oPicker._oValueStateMessage._oPopup.isOpen(), "error message is open");
		this.clock.tick(500);

		document.activeElement.blur();
		this.clock.tick();

		assert.ok(!oPicker._oValueStateMessage._oPopup.isOpen(), "error message is closed");
	});

	QUnit.module("Accessibility");

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oInput = new DateTimeInput();
		assert.ok(!!oInput.getAccessibilityInfo, "DateTimeInput has a getAccessibilityInfo function");
		var oInfo = oInput.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		//Rest is tested in unit tests of inner controls
		oInput.destroy();
	});

	QUnit.module("Private");
	QUnit.test("_getPickerByTypeAndPattern", function(assert) {
		var sDatePattern = DateFormat.getDateInstance().oFormatOptions.pattern,
				sTimePattern = DateFormat.getTimeInstance().oFormatOptions.pattern,
				sDateTimePattern = DateFormat.getDateTimeInstance().oFormatOptions.pattern,
				oPicker,
				oNewPicker;

		//1.1 sap.m.DateTimeInput.Date vs date pattern
		test("typeDate", sDatePattern, "sap.m.DatePicker");

		//1.2. sap.m.DateTimeInput.Date vs datetime pattern
		test("typeDate", sDateTimePattern, "sap.m.DateTimePicker");

		//1.3. sap.m.DateTimeInput.Date vs time pattern
		test("typeDate", sTimePattern, "sap.m.TimePicker");

		//2.1. sap.m.DateTimeInput.Time vs date pattern
		test("typeTime", sDatePattern, "sap.m.DatePicker");

		//2.2. sap.m.DateTimeInput.Time vs datetime pattern
		test("typeTime", sDateTimePattern, "sap.m.DateTimePicker");

		//2.3. sap.m.DateTimeInput.Time vs time pattern
		test("typeTime", sTimePattern, "sap.m.TimePicker");

		//3.1. sap.m.DateTimeInput.DateTime vs date pattern
		test("typeDateTime", sDatePattern, "sap.m.DatePicker");

		//3.2. sap.m.DateTimeInput.DateTime vs datetime pattern
		test("typeDateTime", sDateTimePattern, "sap.m.DateTimePicker");

		//3.3. sap.m.DateTimeInput.DateTime vs time pattern
		test("typeDateTime", sTimePattern, "sap.m.TimePicker");

		//helpers

		function prepare() { //creates view with 3 DateTimeInputs where the type and its binding type are equal
			var oMyLocalModel = new JSONModel({dateVal: new Date()}),
					oView = sap.ui.view({
						viewContent: sDtiView,
						type: ViewType.XML
					});
			oView.setModel(oMyLocalModel);
			oView.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			return oView;
		}

		//calls DateTimeInput.prototype._getPickerByTypeAndPattern with pattern that does not corresponds to the
		//DateTimeInput.prototype.type property and verifies that the picker is of correct type
		function test(sDateTimeInputId, sPattern, sExpectedCtrType) {
			//Prepare
			var oDateTimeInput;
			oView = prepare();
			oDateTimeInput = oView.byId(sDateTimeInputId);

			oPicker = oDateTimeInput.getAggregation("_picker");
			//Act
			oNewPicker = oDateTimeInput._getPickerByTypeAndPattern(oDateTimeInput.getType(), oPicker, sPattern);
			//Assert
			assert.equal(oNewPicker.getMetadata().getName(), sExpectedCtrType, "DateTimeInput.type='" + oDateTimeInput.getType() +
					"', pattern='" + sPattern + "' should render a '" + sExpectedCtrType + "'");
			//Cleanup
			oView.destroy();
		}
	});
});