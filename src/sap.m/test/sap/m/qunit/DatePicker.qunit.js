/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/test/TestUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/m/DatePicker",
	"sap/m/InstanceManager",
	"sap/ui/model/type/Date",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/library",
	"sap/ui/core/CalendarType",
	"jquery.sap.keycodes",
	"sap/ui/Device",
	"sap/ui/unified/library",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/unified/calendar/CustomYearPicker",
	"sap/ui/unified/calendar/CustomMonthPicker",
	"jquery.sap.global"
], function(
	qutils,
	createAndAppendDiv,
	TestUtils,
	JSONModel,
	DateFormat,
	DatePicker,
	InstanceManager,
	TypeDate,
	DateTime,
	ODataModel,
	coreLibrary,
	CalendarType,
	jQuery,
	Device,
	unifiedLibrary,
	DateRange,
	DateTypeRange,
	CalendarLegend,
	CalendarLegendItem,
	UniversalDate,
	CustomYearPicker,
	CustomMonthPicker
) {
	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = unifiedLibrary.CalendarDayType;

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");
	createAndAppendDiv("uiArea3");
	createAndAppendDiv("uiArea4");
	createAndAppendDiv("uiArea5");
	createAndAppendDiv("uiArea6");
	var sMyxml =
		"<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\" controllerName=\"my.own.controller\">" +
		"	<VBox>" +
		"		<DatePicker id=\"picker1\"" +
		"			value=\"{" +
		"				path: 'DateTimeOffset'," +
		"				type: 'sap.ui.model.odata.type.DateTimeOffset'" +
		"			}\"" +
		"			displayFormat= \"dd+MM+yyyy\"" +
		"		/>" +
		"		<DatePicker id=\"picker2\"" +
		"			valueFormat= \"dd+MM+yyyy\"" +
		"			value=\"{" +
		"				path: 'DateTimeOffset'," +
		"				type: 'sap.ui.model.odata.type.DateTimeOffset'," +
		"				constraints: { nullable: false }" +
		"			}\"" +
		"		/>" +
		"		<DatePicker id=\"picker3\"" +
		"			displayFormat= \"dd+MM+yyyy\"" +
		"			value=\"{" +
		"				path: 'DateTimeOffset'," +
		"				type: 'sap.ui.model.odata.type.DateTimeOffset'," +
		"				formatOptions: {" +
		"					style: 'short'" +
		"				}" +
		"			}\"" +
		"			valueFormat= \"dd+MM+yyyy\"" +
		"		/>" +
		"		<DatePicker id=\"picker4\"" +
		"			value=\"{" +
		"				path: 'DateTimeOffset'," +
		"				type: 'sap.ui.model.odata.type.DateTimeOffset'," +
		"				formatOptions: {" +
		"					pattern: 'dd+MM+yyyy'" +
		"				}" +
		"			}\"" +
		"		/>" +
		"	</VBox>" +
		"</mvc:View>";


	var Log = sap.ui.require("sap/base/Log");

	var JSONModel = sap.ui.model.json.JSONModel;
	var DatePicker = sap.m.DatePicker;
	var DateFormat = sap.ui.core.format.DateFormat;

	var bChange = false;
	var sValue = "";
	var bValid = false;
	var sId = "";

	var oDefaultMinDate = new DatePicker()._oMinDate;
	var oDefaultMaxDate = new DatePicker()._oMaxDate;

	function handleChange(oEvent){
		var oDP = oEvent.oSource;
		sValue = oEvent.getParameter("newValue");
		bValid = oEvent.getParameter("valid");
		bChange = true;
		sId = oDP.getId();
	}

	var oDP1 = new DatePicker("DP1", {
		change: handleChange
		}).placeAt("uiArea1");

	var oDP2 = new DatePicker("DP2", {
		width: "250px",
		value: "2014-04-01",
		valueFormat: "yyyy-MM-dd",
		displayFormat: "dd+MM+yyyy",
		change: handleChange
		}).placeAt("uiArea2");

	var oDP3 = new DatePicker("DP3", {
		dateValue: new Date("2014", "03", "01"),
		displayFormat: "long",
		change: handleChange
		}).placeAt("uiArea3");

	var oDP5 = new DatePicker("DP5", {
		dateValue: new Date("2015", "10", "23"),
		displayFormat: "long",
		displayFormatType: "Islamic",
		secondaryCalendarType: "Gregorian",
		change: handleChange
		}).placeAt("uiArea5");

	var oModel = new JSONModel();
	oModel.setData({
		dateValue: new Date("2015", "10", "23"),
		dateValue1: new Date("2015", "10", "23")
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

	var oDP6 = new DatePicker("DP6", {
		width: "250px",
		value: {
			path: "/dateValue",
			type: new TypeDate({style: "short", strictParsing: true})}
		}).placeAt("uiArea6");

	var oDP7 = new DatePicker("DP7", {
		width: "250px",
		value: {
			path: "/dateValue1",
			type: new TypeDate({style: "short", strictParsing: true, calendarType: "Islamic"})}
		}).placeAt("uiArea6");


	QUnit.module("initialization");

	QUnit.test("Date formatter", function(assert) {
		assert.ok(!oDP1.getValue(), "DP1: no value");
		assert.ok(!oDP1.getDateValue(), "DP1: no DateValue");
		assert.equal(oDP2.getValue(), "2014-04-01", "DP2: Value in internal format set");
		assert.equal(oDP2.getDateValue().getTime(), new Date("2014", "03", "01").getTime(), "DP2: DateValue set");
		assert.equal(oDP3.getValue(), "4/1/14", "DP3: Value in internal format set");
		assert.equal(oDP3.getDateValue().getTime(), new Date("2014", "03", "01").getTime(), "DP3: DateValue set");
		assert.equal(oDP5.getValue(), "11/23/15", "DP5: Value in internal format set");
		assert.equal(oDP5.getDateValue().getTime(), new Date("2015", "10", "23").getTime(), "DP5: DateValue set");
		assert.equal(oDP6.getValue(), "11/23/15", "DP6: Value in format from binding set");
		assert.equal(oDP6.getDateValue().getTime(), new Date("2015", "10", "23").getTime(), "DP6: DateValue set");
		assert.equal(oDP7.getValue(), "2/10/1437 AH", "DP7: Value in format from binding set");
		assert.equal(oDP7.getDateValue().getTime(), new Date("2015", "10", "23").getTime(), "DP7: DateValue set");
	});

	QUnit.module("Rendering");

	QUnit.test("styling", function(assert) {
		assert.equal(jQuery("#DP1").css("width"), jQuery("body").css("width"), "Default width is 100%"); // comparision with 100% will not work, because with is returned in px
		assert.equal(jQuery("#DP2").css("width"), "250px", "given width used");
		assert.ok(jQuery("#DP1-icon")[0], "Calendar icon rendered");
		assert.ok(!jQuery("#DP3-cal")[0], "no calendar rendered");
	});

	QUnit.test("date format", function(assert) {
		assert.ok(!jQuery("#DP1").find("input").val(), "DP1 : empty date");
		assert.equal(jQuery("#DP2").find("input").val(), "01+04+2014", "DP2: defined output format used");
		assert.equal(jQuery("#DP3").find("input").val(), "April 1, 2014", "DP3: defined output format used");
		assert.equal(jQuery("#DP5").find("input").val(), "Safar 10, 1437 AH", "DP5: defined islamic output format used");
		assert.equal(jQuery("#DP6").find("input").val(), "11/23/15", "DP6: defined output format from binding used");
		assert.equal(jQuery("#DP7").find("input").val(), "2/10/1437 AH", "DP7: defined islamic output format from binding used");
	});

	QUnit.test("ValueHelp icon is not visible when DatePicker is not editable", function (assert) {
		// arrange
		var oDatePicker = new DatePicker({ editable: false }),
			oValueHelpIconSetPropertySpy = this.spy(),
			oValueHelpIconStub = this.stub(oDatePicker, "_getValueHelpIcon", function () {
				return { setProperty: oValueHelpIconSetPropertySpy };
			});

		// act
		oDatePicker.onBeforeRendering();

		// assert
		assert.equal(oValueHelpIconSetPropertySpy.getCall(0).args[0], "visible", "setProperty of the icon should be called for visible");
		assert.equal(oValueHelpIconSetPropertySpy.getCall(0).args[1], false, "visible property should be set to false");

		// cleanup
		oValueHelpIconStub.restore();
		oDatePicker.destroy();
	});

	QUnit.test("title is set to the icon", function (assert) {
		// arrange
		var oDatePicker = new DatePicker(),
			sExpected = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("OPEN_PICKER_TEXT");

		// act
		oDatePicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(oDatePicker.$("icon").attr("title"), sExpected, "icon has its title property set");

		// cleanup
		oDatePicker.destroy();
	});

	QUnit.test("Footer is correctly displayed on dekstop", function(assert) {
		// Prepare
		var oDP = new DatePicker({
				valueFormat: "yyyyMMdd",
				showFooter: true
			}),
			oRP;

		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oDP.toggleOpen();
		oRP = oDP._oPopup;

		// Assert
		assert.ok(oRP.getBeginButton().getVisible(), "Begin button is visible");
		assert.notOk(oRP.getBeginButton().getEnabled(), "Begin button is disabled");
		assert.notOk(oRP.getShowHeader(), "Header is not visible");
		assert.ok(oRP.getEndButton().getVisible(), "End button is visible");

		// Cleanup
		oDP.destroy();
	});

	QUnit.test("Footer is correctly displayed on mobile", function(assert) {
		// Prepare
		var oTouchStub = this.stub(Device, "support", {touch: true}),
			oSystemStub = this.stub(Device, "system", {phone: true}),
			sLabelText = "DatePicker with showFooter property set to 'true'",
			oLabel = new sap.m.Label({text: sLabelText, labelFor: "uniqueId"}),
			oDP = new DatePicker("uniqueId", {
				valueFormat: "yyyyMMdd",
				showFooter: true
			}),
			oRP;

		oLabel.placeAt("qunit-fixture");
		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oDP.toggleOpen();
		oRP = oDP._oPopup;

		// Assert
		assert.ok(oRP.getBeginButton().getVisible(), "Begin button is visible");
		assert.notOk(oRP.getBeginButton().getEnabled(), "Begin button is disabled");
		assert.ok(oRP.getShowHeader(), "Header is visible");
		assert.strictEqual(oRP.getTitle(), sLabelText, "Dialog title text is correct");
		assert.notOk(oRP.getEndButton(), "End button is destroyed");

		// Cleanup
		oDP.destroy();
		oTouchStub.restore();
		oSystemStub.restore();
	});

	QUnit.module("data binding");

	QUnit.test("data binding with sap.ui.model.type.Date", function(assert) {
		// arrange
		var oDatePicker = new DatePicker({
			value: {
				path: "/myTimestamp",
				type: new TypeDate({
					source: {
						pattern: 'timestamp'
					}
				})
			}
		});

		// act
		oDatePicker.setModel(new JSONModel({
			myTimestamp: 1420529121547 // Tue Jan 06 2015 09:25:21 GMT+0200 (FLE Standard Time)
		}));

		// assert
		assert.equal(oDatePicker.getDateValue().getTime(), new Date(2015, 0, 6).getTime(),
			"DatePicker Date value equals the model timestamp representation");

		// cleanup
		oDatePicker.destroy();
	});

	QUnit.test("data binding with OData", function(assert) {
		var done = assert.async();
		sap.ui.controller("my.own.controller", {
			onInit: function() {
				this.getView().bindObject("/EdmTypesCollection(ID='1')");
			}
		});

		TestUtils.useFakeServer(sinon.sandbox.create(),
			"sap/ui/core/demokit/sample/ViewTemplate/types/data", {
				"/sap/opu/odata/sap/ZUI5_EDM_TYPES/$metadata" : {
					source : "metadataV2.xml"
				},
				"/sap/opu/odata/sap/ZUI5_EDM_TYPES/EdmTypesCollection(ID='1')" : {
					source : "EdmTypesV2.json"
				}
			});

		var oModelV2 = new ODataModel({
			serviceUrl : "/sap/opu/odata/sap/ZUI5_EDM_TYPES/",
			useBatch : false
		});

		var view = sap.ui.view({ viewContent: sMyxml, type: ViewType.XML })
			.setModel(oModelV2)
			.placeAt("qunit-fixture");

		oModelV2.attachRequestCompleted(function () {
			var oDate = new Date(1420529121547); // Tue Jan 06 2015 09:25:21 GMT+0200 (FLE Standard Time)

			assert.equal(view.byId("picker1")._$input.val(), DateFormat.getDateTimeInstance().format(oDate), "picker1 has correct value!");
			assert.equal(view.byId("picker1").isValidValue(), true, "picker1 has valid value!");
			assert.equal(view.byId("picker2")._$input.val(), DateFormat.getDateTimeInstance().format(oDate), "picker2 has correct value!");
			assert.equal(view.byId("picker2").isValidValue(), true, "picker2 has valid value!");
			assert.equal(view.byId("picker3")._$input.val(), DateFormat.getDateTimeInstance({style: "short"}).format(oDate), "picker3 has correct value!");
			assert.equal(view.byId("picker3").isValidValue(), true, "picker3 has valid value!");
			assert.equal(view.byId("picker4")._$input.val(), DateFormat.getDateTimeInstance({pattern: "dd+MM+yyyy"}).format(oDate), "picker4 has correct value!");
			assert.equal(view.byId("picker4").isValidValue(), true, "picker4 has valid value!");
			done();
		});
	});

	QUnit.test("data binding with sap.ui.model.odata.type.DateTime", function(assert) {
		var oConfiguration = sap.ui.getCore().getConfiguration();
		var oFormatSettings = oConfiguration.getFormatSettings();
		var oDate = new Date(2017, 0, 1, 0, 0, 0);
		var oModel = new JSONModel({
			myDate: undefined
		});
		var oDateTimeType = new DateTime({
			//Format Options
		},{
			//Constraints
			displayFormat: "Date"
		});
		var oDatePicker = new DatePicker({
			value: {
				path: "/myDate",
				type: oDateTimeType
			}
		}).setModel(oModel);

		oFormatSettings.setLegacyDateFormat("1");

		assert.equal(oDatePicker._parseValue("01.01.2017").getTime(), oDate.getTime(), "Value successfully parsed using legacy date format '1'");
		assert.equal(oDatePicker._formatValue(oDate), "01.01.2017", "Date successfully formatted using legacy date format '1'");

		oFormatSettings.setLegacyDateFormat("2");

		assert.equal(oDatePicker._formatValue(oDate), "01/01/2017", "Date successfully formatted using legacy date format '2'");
		assert.equal(oDatePicker._parseValue("01/01/2017").getTime(), oDate.getTime(), "Value successfully parsed using legacy date format '2'");

		oFormatSettings.setLegacyDateFormat("3");

		assert.equal(oDatePicker._parseValue("01-01-2017").getTime(), oDate.getTime(), "Value successfully parsed using legacy date format '3'");
		assert.equal(oDatePicker._formatValue(oDate), "01-01-2017", "Date successfully formatted using legacy date format '3'");

		oFormatSettings.setLegacyDateFormat("4");

		assert.equal(oDatePicker._parseValue("2017.01.01").getTime(), oDate.getTime(), "Value successfully parsed using legacy date format '4'");
		assert.equal(oDatePicker._formatValue(oDate), "2017.01.01", "Date successfully formatted using legacy date format '4'");

		oFormatSettings.setLegacyDateFormat("5");

		assert.equal(oDatePicker._parseValue("2017/01/01").getTime(), oDate.getTime(), "Value successfully parsed using legacy date format '5'");
		assert.equal(oDatePicker._formatValue(oDate), "2017/01/01", "Date successfully formatted using legacy date format '5'");

		oFormatSettings.setLegacyDateFormat("6");

		assert.equal(oDatePicker._parseValue("2017-01-01").getTime(), oDate.getTime(), "Value successfully parsed using legacy date format '6'");
		assert.equal(oDatePicker._formatValue(oDate), "2017-01-01", "Date successfully formatted using legacy date format '6'");

		oFormatSettings.setLegacyDateFormat("7");

		assert.equal(oDatePicker._parseValue("Heisei29.01.01").getTime(), oDate.getTime(), "Value successfully parsed using legacy date format '7'");
		assert.equal(oDatePicker._formatValue(oDate), "Heisei29.01.01", "Date successfully formatted using legacy date format '7'");

		oFormatSettings.setLegacyDateFormat("8");

		assert.equal(oDatePicker._parseValue("Heisei29/01/01").getTime(), oDate.getTime(), "Value successfully parsed using legacy date format '8'");
		assert.equal(oDatePicker._formatValue(oDate), "Heisei29/01/01", "Date successfully formatted using legacy date format '8'");

		oFormatSettings.setLegacyDateFormat("9");

		assert.equal(oDatePicker._parseValue("Heisei29-01-01").getTime(), oDate.getTime(), "Value successfully parsed using legacy date format '9'");
		assert.equal(oDatePicker._formatValue(oDate), "Heisei29-01-01", "Date successfully formatted using legacy date format '9'");

		oFormatSettings.setLegacyDateFormat("A");

		assert.equal(oDatePicker._parseValue("1438/04/02").getTime(), oDate.getTime(), "Value successfully parsed using legacy date format 'A'");
		assert.equal(oDatePicker._formatValue(oDate), "1438/04/02", "Date successfully formatted using legacy date format 'A'");

		oFormatSettings.setLegacyDateFormat("B");

		assert.equal(oDatePicker._parseValue("1438/04/02").getTime(), oDate.getTime(), "Value successfully parsed using legacy date format 'B'");
		assert.equal(oDatePicker._formatValue(oDate), "1438/04/02", "Date successfully formatted using legacy date format 'B'");

		oFormatSettings.setLegacyDateFormat("C");

		assert.equal(oDatePicker._parseValue("1395/10/12").getTime(), oDate.getTime(), "Value successfully parsed using legacy date format 'C'");
		assert.equal(oDatePicker._formatValue(oDate), "1395/10/12", "Date successfully formatted using legacy date format 'C'");

		oFormatSettings.setLegacyDateFormat();

		assert.equal(oDatePicker._parseValue("Jan 1, 2017").getTime(), oDate.getTime(), "Value successfully parsed using default legacy date format");
		assert.equal(oDatePicker._formatValue(oDate), "Jan 1, 2017", "Date successfully formatted using default legacy date format");

		oConfiguration.setLanguage("ar_SA");

		assert.equal(oDatePicker._parseValue("2 ربيع الآخر 1438 هـ").getTime(), oDate.getTime(), "Value successfully parsed using language 'ar_SA'");
		assert.equal(oDatePicker._formatValue(oDate), "2 ربيع الآخر 1438 هـ", "Date successfully formatted using language 'ar_SA'");

		oConfiguration.setLanguage("en_US");

		assert.equal(oDatePicker._parseValue("Jan 1, 2017").getTime(), oDate.getTime(), "Value successfully parsed using language 'en_US'");
		assert.equal(oDatePicker._formatValue(oDate), "Jan 1, 2017", "Date successfully formatted using language 'en_US'");

		oConfiguration.setCalendarType(CalendarType.Islamic);

		assert.equal(oDatePicker._parseValue("Rab. II 2, 1438 AH").getTime(), oDate.getTime(), "Value successfully parsed using Islamic calendar");
		assert.equal(oDatePicker._formatValue(oDate), "Rab. II 2, 1438 AH", "Date successfully formatted using Islamic calendar");

		oConfiguration.setCalendarType(CalendarType.Japanese);

		assert.equal(oDatePicker._parseValue("Jan 1, 29 Heisei").getTime(), oDate.getTime(), "Value successfully parsed using Japanese calendar");
		assert.equal(oDatePicker._formatValue(oDate), "Jan 1, 29 Heisei", "Date successfully formatted using Japanese calendar");

		oConfiguration.setCalendarType(CalendarType.Persian);

		assert.equal(oDatePicker._parseValue("Dey 12, 1395 AP").getTime(), oDate.getTime(), "Value successfully parsed using Persian calendar");
		assert.equal(oDatePicker._formatValue(oDate), "Dey 12, 1395 AP", "Date successfully formatted using Persian calendar");

		oConfiguration.setCalendarType(CalendarType.Buddhist);

		assert.equal(oDatePicker._parseValue("Jan 1, 2560 BE").getTime(), oDate.getTime(), "Value successfully parsed using Buddhist calendar");
		assert.equal(oDatePicker._formatValue(oDate), "Jan 1, 2560 BE", "Date successfully formatted using Buddhist calendar");

		// clean up
		oConfiguration.setCalendarType(CalendarType.Gregorian);
	});

	QUnit.test("passing a date from a model with a string notation as pattern", function (assert) {
		// Prepare
		var oModel = new sap.ui.model.json.JSONModel({
				date: "20190618000000"
			}),
			oDatePicker = new sap.m.DatePicker("datePicker", {
				value: {path:'model>/date',
					type:'sap.ui.model.type.Date',
					formatOptions: {source: {pattern: 'yyyyMMddHHmmss'}, style:'medium'}}
			});

		// Act
		oDatePicker.setModel(oModel, "model");
		oDatePicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oDatePicker.$().find("input").val(), "Jun 18, 2019", "DOM value should equal the date passed from the model");

		// Clean
		oModel.destroy();
		oDatePicker.destroy();
	});

	QUnit.module("API");

	QUnit.test("setDateValue(time part cut) when mindate/maxdate is the same date, but with time part", function (assert) {
		//Prepare
		var now = new Date(2017, 0, 1, 13, 0, 0),
				today = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
				oDPMinDate = new DatePicker({
					minDate: now,
					displayFormat: "dd.MM.YYYY"
				}),
				oDPMaxDate = new DatePicker({
					maxDate: now,
					displayFormat: "dd.MM.YYYY"
				});
		oDPMinDate.placeAt("qunit-fixture");
		oDPMaxDate.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		//Act
		oDPMinDate.setDateValue(today);

		//Assert
		assert.equal(oDPMinDate.$().find("input").val(), "01.01.2017",
				"DOM value should equal the minDate> without time part");

		//Act
		oDPMaxDate.setDateValue(today);

		//Assert
		assert.equal(oDPMaxDate.$().find("input").val(), "01.01.2017",
				"DOM value should equal the maxDate without time part");

		//Cleanup
		oDPMinDate.destroy();
		oDPMaxDate.destroy();
	});

	QUnit.test("default maxDate has maximum possible hour of the day", function (assert) {
		//Prepare
		var oDP = new DatePicker({
			dateValue: new Date(2000, 11, 31, 23, 59, 59)
		});
		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Act
		oDP.setDateValue(new Date(9999, 11, 31, 23, 59, 59));
		//Assert
		assert.ok(oDP.getValue() !== "", "Given date which is equal to the default maxDate is set correctly");

		//Cleanup
		oDP.destroy();
	});

	QUnit.test("setMinDate when dateValue does not match the new min date", function(assert) {
		assert.ok(Log, "Log module should be available");
		var oDateValue = new Date(2017, 0, 1),
			oNewMinDate = new Date(2018, 0, 1),
			oSut = new DatePicker({
				valueFormat: "yyyyMMdd",
				dateValue: oDateValue
			}),
			sExpectedErrorMsg = "dateValue " + oDateValue.toString() + "(value=20170101) does not match" +
				" min/max date range(" + oNewMinDate.toString() + " - " + oDefaultMaxDate.toString() + ")." +
				" App. developers should take care to maintain dateValue/value accordingly.",
			oSpySetProperty = this.spy(oSut, "setProperty"),
			oSpyLogError = this.spy(Log, "error");

		oSut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Act
		oSut.setMinDate(oNewMinDate);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(oSpySetProperty.withArgs("dateValue").callCount, 0, ".. should not update the property <dateValue>");
		assert.equal(oSpySetProperty.withArgs("value").callCount, 0, ".. should not update the property <value>");
		assert.equal(oSpyLogError.callCount, 1, "..should log one error message in the console");
		oSpyLogError.callCount && assert.equal(oSpyLogError.getCall(0).args[0], sExpectedErrorMsg, ".. with concrete message text");

		//Cleanup
		oSpySetProperty.restore();
		oSpyLogError.restore();
		oSut.destroy();
	});

	QUnit.test("setMaxDate when dateValue does not match the new max date", function(assert) {
		assert.ok(Log, "Log module should be available");
		var oDateValue = new Date(2017, 0, 1),
			oNewMaxDate = new Date(2016, 0, 1),
			oSut = new DatePicker({
				valueFormat: "yyyyMMdd",
				dateValue: oDateValue
			}),
			sExpectedErrorMsg = "dateValue " + oDateValue.toString() + "(value=20170101) does not match" +
				" min/max date range(" + oDefaultMinDate.toString() + " - " + new Date(oNewMaxDate.setHours(23, 59, 59)).toString() + ")." +
				" App. developers should take care to maintain dateValue/value accordingly.",
			oSpySetProperty = this.spy(oSut, "setProperty"),
			oSpyLogError = this.spy(Log, "error");

		oSut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Act
		oSut.setMaxDate(oNewMaxDate);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(oSpySetProperty.withArgs("dateValue").callCount, 0, ".. should not update the property <dateValue>");
		assert.equal(oSpySetProperty.withArgs("value").callCount, 0, ".. should not update the property <value>");
		assert.equal(oSpyLogError.callCount, 1, "..should log one error message in the console");
		oSpyLogError.callCount && assert.equal(oSpyLogError.getCall(0).args[0], sExpectedErrorMsg,
			".. with concrete message text");

		//Cleanup
		oSpySetProperty.restore();
		oSpyLogError.restore();
		oSut.destroy();
	});

	QUnit.test("minDate and value in databinding scenario where the order of setters is not known",
		function (assert) {
			assert.ok(Log, "Log module should be available");
			/**
			 * value in second model is intentionally Jan 20, 2017, in order to examine the scenario, where value
			 * setter is called before the minDate setter and a potentially valid value is not yet considered such,
			 * because the corresponding valid minDate didn't arrive yet.
			 */
			var oModelInvalid = new JSONModel({
					value: "20170101",
					minDate: new Date(2018, 0, 1)
				}),
				oModelValid = new JSONModel({
					minDate: new Date(2017, 0, 10),
					value: "20170120"
				}),
				oDP1 = new DatePicker({
					valueFormat: "yyyyMMdd",
					value: "{/value}",
					minDate: "{/minDate}"
				}),
				oDP2 = new DatePicker({
					valueFormat: "yyyyMMdd",
					minDate: "{/minDate}",
					value: "{/value}"
				}),
				sErrorMsgDP1 = "dateValue " + new Date(2017, 0, 1).toString() + "(value=20170101) does not match" +
					" min/max date range(" + oModelInvalid.getProperty("/minDate").toString() + " - " + oDefaultMaxDate.toString() + ")." +
					" App. developers should take care to maintain dateValue/value accordingly.",
				sErrorMsgDP2 = sErrorMsgDP1,
				oSpyLogError = this.spy(Log, "error");

			oDP1.setModel(oModelInvalid);
			oDP2.setModel(oModelInvalid);
			oDP1.placeAt("qunit-fixture");
			oDP2.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			//Pre-Assert
			assert.equal(oDP1.getValue().toString(), "20170101",
				"Although outside min range, DP1 property <value> should be always set");
			assert.equal(oDP2.getValue().toString(), "20170101",
				"Although outside min range, DP2 property <value> should be always set");

			assert.equal(oDP1.getDateValue().toString(), new Date(2017, 0, 1).toString(),
				"Although outside min range, DP1 property <value> should update the <dateValue> as well");
			assert.equal(oDP2.getDateValue().toString(), new Date(2017, 0, 1).toString(),
				"Although outside min range, DP2 property <value> should update the <dateValue> as well");

			assert.equal(oSpyLogError.callCount, 2, "There should be error messages in the console");
			if (oSpyLogError.callCount) {
				assert.equal(oSpyLogError.getCall(0).args[0], sErrorMsgDP1, "And the first message is with expected text");
				assert.equal(oSpyLogError.getCall(1).args[0], sErrorMsgDP2, "And the second message is with expected text");
			}

			oSpyLogError.reset();

			//Act - set a valid model
			oDP1.setModel(oModelValid);
			oDP2.setModel(oModelValid);
			sap.ui.getCore().applyChanges();

			//Assert
			assert.equal(oDP1.getValue().toString(), "20170120", "A valid DP1 property <value> should be always set");
			assert.equal(oDP2.getValue().toString(), "20170120", "A valid DP2 property <value> should be always set");

			assert.equal(oDP1.getDateValue().toString(), new Date(2017, 0, 20).toString(),
				"A valid DP1 property <value> should update the <dateValue> as well");
			assert.equal(oDP2.getDateValue().toString(), new Date(2017, 0, 20).toString(),
				"A valid DP2 property <value> should update the <dateValue> as well");

			assert.equal(oSpyLogError.callCount, 0, "There must be no error messages in the console");

			//Cleanup
			oSpyLogError.restore();
			oDP1.destroy();
			oDP2.destroy();
		}
	);

	QUnit.test("set(Date)Value to undefined", function(assert) {
		var oDP1 = new DatePicker({
			value: "20170101",
			valueFormat: "yyyyMMdd"
		}),
		oDP2  = new DatePicker({
			value: "20170101",
			valueFormat: "yyyyMMdd"
		});

		oDP1.placeAt("qunit-fixture");
		oDP2.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Act
		oDP1.setDateValue();
		oDP2.setValue();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(oDP1.getDateValue(), null, "Property <dateValue> should be null as it was just set to undefined");
		assert.strictEqual(oDP1.getValue(), "", "Property <value> should be empty, because property <dateValue> was just set to undefined");

		assert.strictEqual(oDP2.getValue(), "", "Property <value> should be empty, as it was just set to undefined");
		assert.strictEqual(oDP2.getDateValue(), null, "Property <dateValue> should be null, because property <value> was just set to undefiend");

		//Cleanup
		oDP1.destroy();
		oDP2.destroy();
	});

	// BCP: 1780526208
	QUnit.test("setDateValue with iframe's JS date object should set properly the date", function (assert) {
		// arrange
		var oDP = new DatePicker(),
			iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		var oWindow = iframe.contentWindow;
		oWindow.dateObj = new oWindow.Date(2017, 11, 12);

		// act
		oDP.setDateValue(oWindow.dateObj);

		// assert
		assert.ok(true, "setDateValue did not throw an expection with date object from an iframe");

		// cleanup
		oDP.destroy();
		document.body.removeChild(iframe);
		iframe = null;
		oDP = null;
	});

	// BCP: 1880065660
	QUnit.test("setMinDate with iframe's JS date object should set properly the min date value", function (assert) {
		// arrange
		var oDP = new DatePicker(),
				iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		var oWindow = iframe.contentWindow;
		oWindow.dateObj = new oWindow.Date(2017, 11, 12);

		// act
		oDP.setMinDate(oWindow.dateObj);

		// assert
		assert.ok(true, "setMinDate did not throw an expection with date object from an iframe");

		// cleanup
		oDP.destroy();
		document.body.removeChild(iframe);
		iframe = null;
		oDP = null;
	});

	// BCP: 1880065660
	QUnit.test("setMaxDate with iframe's JS date object should set properly the max date value", function (assert) {
		// arrange
		var oDP = new DatePicker(),
				iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		var oWindow = iframe.contentWindow;
		oWindow.dateObj = new oWindow.Date(2017, 11, 12);

		// act
		oDP.setMaxDate(oWindow.dateObj);

		// assert
		assert.ok(true, "setMaxDate did not throw an expection with date object from an iframe");

		// cleanup
		oDP.destroy();
		document.body.removeChild(iframe);
		iframe = null;
		oDP = null;
	});

	QUnit.test("setMaxDate to yesterday should not throw error", function (assert) {
		// Arrange
		var oDate = new Date(),
			oDP = new DatePicker("DatePickerApi").placeAt("qunit-fixture");

		oDate.setDate(oDate.getDate() - 1);

		// Act
		oDP.setMaxDate(oDate);
		sap.ui.getCore().applyChanges();
		qutils.triggerEvent("click", "DatePickerApi-icon");

		// Assert
		assert.ok(true, "setMaxDate did not throw an error when maxDate is yesterday");

		// Clean
		oDP.destroy();
	});

	QUnit.test("set(Date)Value to (null)empty string", function(assert) {
		var oDP1 = new DatePicker({
				value: "20170101",
				valueFormat: "yyyyMMdd"
			}),
			oDP2  = new DatePicker({
				value: "20170101",
				valueFormat: "yyyyMMdd"
			});

		oDP1.placeAt("qunit-fixture");
		oDP2.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Act
		oDP1.setDateValue(null);
		oDP2.setValue("");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(oDP1.getDateValue(), null, "Property <dateValue> should be null as it was just set to null");
		assert.strictEqual(oDP1.getValue(), "", "Property <value> should be empty, because property <dateValue> was just set to null");

		assert.strictEqual(oDP2.getValue(), "", "Property <value> should be empty string, as it was just set");
		assert.strictEqual(oDP2.getDateValue(), null, "Property <dateValue> should be null, because property <value> was just set to empty string");

		//Cleanup
		oDP1.destroy();
		oDP2.destroy();
	});

	QUnit.module("initialFocusedDate property", {
		beforeEach: function () {
			this.oDp = new DatePicker();
			this.oDp.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},

		afterEach: function () {
			this.oDp.destroy();
			this.oDp = null;
		}
	});

	QUnit.test("_fillDateRange should call Calendar's focusDate method with initialFocusedDateValue if no value is set", function (assert) {
		// prepare
		var oExpectedDateValue = new Date(2017, 4, 5, 6, 7, 8);
		this.oDp._oCalendar = { focusDate: this.spy(), destroy: function () {} };
		this.oDp._oDateRange = { getStartDate: function () { return false; } };

		// act
		this.oDp.setInitialFocusedDateValue(oExpectedDateValue);
		this.oDp._fillDateRange();

		// assert

		assert.ok(this.oDp._getCalendar().focusDate.calledWith(oExpectedDateValue), "focusDate should be called with initialFocusedDateValue");
		assert.equal(this.oDp._getCalendar().focusDate.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "focusDate should be called with " + oExpectedDateValue);
	});

	QUnit.test("_fillDateRange should call Calendar's focusDate method with current date if initialFocusedDateValue and value are not set", function (assert) {
		// prepare
		var oExpectedDateValue = new Date(2017, 4, 5, 6, 7, 8);
		this.oDp._oCalendar = { focusDate: this.spy(), destroy: function () {} };
		this.oDp._oDateRange = { getStartDate: function () { return false; } };

		// act
		this.oDp._fillDateRange();

		// assert
		assert.equal(this.oDp._getCalendar().focusDate.calledWith(oExpectedDateValue), false, "focusDate should not be called with initialFocusedDateValue");
		assert.notEqual(this.oDp._getCalendar().focusDate.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "focusDate should be called with " + oExpectedDateValue);
	});

	QUnit.test("_fillDateRange should call Calendar's focusDate method with dateValue", function (assert) {
		// prepare
		var oExpectedDateValue = new Date(2017, 4, 5, 6, 7, 8),
			oGetDateValue = this.stub(this.oDp, "getDateValue", function () { return oExpectedDateValue; });
		this.oDp._oCalendar = { focusDate: this.spy(), destroy: function () {} };
		this.oDp._oDateRange = { setStartDate: function () {}, getStartDate: function () {} };

		// act
		this.oDp._fillDateRange();

		// assert
		assert.ok(this.oDp._getCalendar().focusDate.calledWith(oExpectedDateValue), "focusDate should be called with dateValue");
		assert.equal(this.oDp._getCalendar().focusDate.getCall(0).args[0].toString(), oExpectedDateValue.toString(), "focusDate should be called with " + oExpectedDateValue);

		// cleanup
		oGetDateValue.restore();
	});


	QUnit.module("interaction");

	QUnit.test("change date by typing", function(assert) {
		bChange = false;
		sValue = "";
		bValid = true;
		sId = "";
		oDP2.focus();
		jQuery("#DP2").find("input").val("32+04+2014");
		qutils.triggerKeyboardEvent("DP2-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DP2").find("input").change(); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, "DP2", "Change event fired");
		assert.equal(sValue, "32+04+2014", "Value of event has entered value if invalid");
		assert.ok(!bValid, "Value is not valid");
		assert.equal(oDP2.getValue(), "32+04+2014", "Value has entered value if invalid");
		assert.equal(oDP2.getDateValue().getTime(), new Date("2014", "03", "01").getTime(), "DateValue not changed set");

		bChange = false;
		sValue = "";
		bValid = false;
		sId = "";
		oDP2.focus();
		jQuery("#DP2").find("input").val("02+04+2014");
		qutils.triggerKeyboardEvent("DP2-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DP2").find("input").change(); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, "DP2", "Change event fired");
		assert.equal(sValue, "2014-04-02", "Value in internal format priovided");
		assert.ok(bValid, "Value is valid");
		assert.equal(oDP2.getValue(), "2014-04-02", "Value in internal format set");
		assert.equal(oDP2.getDateValue().getTime(), new Date("2014", "03", "02").getTime(), "DateValue set");

		bChange = false;
		bParseError = false;
		bValidationSuccess = false;
		sValue = "";
		bValid = false;
		sId = "";
		oDP6.focus();
		jQuery("#DP6").find("input").val("13/23/2015");
		qutils.triggerKeyboardEvent("DP6-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DP6").find("input").change(); // trigger change event, because browser do not if value is changed using jQuery
		assert.ok(bParseError, "parse error fired");
		assert.ok(!bValidationSuccess, "no validation success fired");
		assert.equal(sId, "DP6", "ID of control");
		assert.equal(sValue, "13/23/2015", "entered Value priovided");
		assert.equal(oDP6.getValue(), "13/23/2015", "entered Value in set");
		assert.equal(oDP6.getDateValue().getTime(), new Date("2015", "10", "23").getTime(), "DateValue not changed");

		bChange = false;
		bParseError = false;
		bValidationSuccess = false;
		sValue = "";
		bValid = false;
		sId = "";
		oDP6.focus();
		jQuery("#DP6").find("input").val("01/01/15");
		qutils.triggerKeyboardEvent("DP6-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DP6").find("input").change(); // trigger change event, because browser do not if value is changed using jQuery
		assert.ok(!bParseError, "no parse error fired");
		assert.ok(bValidationSuccess, "validation success fired");
		assert.equal(sId, "DP6", "ID of control");
		assert.equal(sValue, "1/1/15", "Value in binding format priovided");
		assert.equal(oDP6.getValue(), "1/1/15", "Value in internal format set");
		assert.equal(jQuery("#DP6").find("input").val(), "1/1/15", "output value formatted in binding format");
		assert.equal(oDP6.getDateValue().getTime(), new Date("2015", "0", "1").getTime(), "DateValue changed");
	});

	QUnit.test("change date by Pageup/down", function(assert) {
		bChange = false;
		sValue = "";
		sId = "";
		oDP2.focus();
		qutils.triggerKeyboardEvent("DP2-inner", jQuery.sap.KeyCodes.PAGE_UP, false, false, false);
		assert.equal(sId, "DP2", "PageUp: Change event fired");
		assert.equal(sValue, "2014-04-03", "PageUp: Value in internal format priovided");
		assert.equal(oDP2.getValue(), "2014-04-03", "PageUp: Value in internal format set");
		assert.equal(oDP2.getDateValue().getTime(), new Date("2014", "03", "03").getTime(), "PageUp: DateValue set");
		assert.equal(jQuery("#DP2").find("input").val(), "03+04+2014", "PageUp: Value in external format displayed");
		bChange = false;
		sValue = "";
		sId = "";
		qutils.triggerKeyboardEvent("DP2-inner", jQuery.sap.KeyCodes.PAGE_UP, true, false, false);
		assert.equal(sId, "DP2", "PageUp+shift: Change event fired");
		assert.equal(sValue, "2014-05-03", "PageUp+shift: Value in internal format priovided");
		assert.equal(oDP2.getValue(), "2014-05-03", "PageUp+shift: Value in internal format set");
		assert.equal(oDP2.getDateValue().getTime(), new Date("2014", "4", "03").getTime(), "PageUp+shift: DateValue set");
		assert.equal(jQuery("#DP2").find("input").val(), "03+05+2014", "PageUp+shift: Value in external format displayed");
		bChange = false;
		sValue = "";
		sId = "";
		qutils.triggerKeyboardEvent("DP2-inner", jQuery.sap.KeyCodes.PAGE_UP, true, false, true);
		assert.equal(sId, "DP2", "PageUp+shift+ctrl: Change event fired");
		assert.equal(sValue, "2015-05-03", "PageUp+shift+ctrl: Value in internal format priovided");
		assert.equal(oDP2.getValue(), "2015-05-03", "PageUp+shift+ctrl: Value in internal format set");
		assert.equal(oDP2.getDateValue().getTime(), new Date("2015", "4", "03").getTime(), "PageUp+shift+ctrl: DateValue set");
		assert.equal(jQuery("#DP2").find("input").val(), "03+05+2015", "PageUp+shift+ctrl: Value in external format displayed");
		bChange = false;
		sValue = "";
		sId = "";
		qutils.triggerKeyboardEvent("DP2-inner", jQuery.sap.KeyCodes.PAGE_DOWN, false, false, false);
		assert.equal(sId, "DP2", "PageDown: Change event fired");
		assert.equal(sValue, "2015-05-02", "PageDown: Value in internal format priovided");
		assert.equal(oDP2.getValue(), "2015-05-02", "PageDown: Value in internal format set");
		assert.equal(oDP2.getDateValue().getTime(), new Date("2015", "04", "02").getTime(), "PageDown: DateValue set");
		assert.equal(jQuery("#DP2").find("input").val(), "02+05+2015", "PageDown: Value in external format displayed");
		bChange = false;
		sValue = "";
		sId = "";
		qutils.triggerKeyboardEvent("DP2-inner", jQuery.sap.KeyCodes.PAGE_DOWN, true, false, false);
		assert.equal(sId, "DP2", "PageDown+shift: Change event fired");
		assert.equal(sValue, "2015-04-02", "PageDown+shift: Value in internal format priovided");
		assert.equal(oDP2.getValue(), "2015-04-02", "PageUp+shift: Value in internal format set");
		assert.equal(oDP2.getDateValue().getTime(), new Date("2015", "3", "02").getTime(), "PageDown+shift: DateValue set");
		assert.equal(jQuery("#DP2").find("input").val(), "02+04+2015", "PageDown+shift: Value in external format displayed");
		bChange = false;
		sValue = "";
		sId = "";
		qutils.triggerKeyboardEvent("DP2-inner", jQuery.sap.KeyCodes.PAGE_DOWN, true, false, true);
		assert.equal(sId, "DP2", "PageDown+shift+ctrl: Change event fired");
		assert.equal(sValue, "2014-04-02", "PageDown+shift+ctrl: Value in internal format priovided");
		assert.equal(oDP2.getValue(), "2014-04-02", "PageDown+shift+ctrl: Value in internal format set");
		assert.equal(oDP2.getDateValue().getTime(), new Date("2014", "3", "02").getTime(), "PageDown+shift+ctrl: DateValue set");
		assert.equal(jQuery("#DP2").find("input").val(), "02+04+2014", "PageDown+shift+ctrl: Value in external format displayed");
	});

	//BCP 1670441899
	QUnit.test("focused element after picker close", function(assert) {
		var bOrigTouch = Device.support.touch,
			bOrigDesktop = Device.system.desktop;

		// On a desktop (non-touch) device
		sap.ui.Device.support.touch = false;
		sap.ui.Device.system.desktop = true;
		sap.ui.getCore().byId("DP5").focus();
		qutils.triggerEvent("click", "DP5-icon");
		jQuery("#DP5-cal--Month0-20151124").focus();
		qutils.triggerKeyboardEvent("DP5-cal--Month0-20151124", jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.equal(document.activeElement.id, "DP5-inner", "Focus is on the input field after date selection");

		qutils.triggerEvent("click", "DP5-icon");
		jQuery("#DP5-cal--Month0-20151124").focus();
		qutils.triggerKeyboardEvent("DP5-cal--Month0-20151124", jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.equal(document.activeElement.id, "DP5-inner", "Focus is on the input field after selecting the same date");

		oDP5.focus();
		jQuery("#DP5").find("input").val("4"); // enter invalid date
		qutils.triggerKeyboardEvent("DP2-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DP5").find("input").change();
		qutils.triggerEvent("click", "DP5-icon");
		jQuery("#DP5-cal--Month0-20151124").focus(); // choose previous valid date
		qutils.triggerKeyboardEvent("DP5-cal--Month0-20151124", jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.equal(document.activeElement.id, "DP5-inner", "Focus is on the input field after first entering invalid date and then selecting the previous valid date");

		qutils.triggerEvent("click", "DP5-icon");
		jQuery("#DP5-cal").control(0).fireCancel();
		assert.equal(document.activeElement.id, "DP5-inner", "Focus is on the input field after cancel");

		// On a touch device
		sap.ui.Device.support.touch = true;
		sap.ui.Device.system.desktop = false;
		qutils.triggerEvent("click", "DP5-icon");
		jQuery("#DP5-cal--Month0-20151124").focus();
		qutils.triggerKeyboardEvent("DP5-cal--Month0-20151124", jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.notEqual(document.activeElement.id, "DP5-inner", "Focus is NOT on the input field after date selection");

		qutils.triggerEvent("click", "DP5-icon");
		jQuery("#DP5-cal--Month0-20151124").focus();
		qutils.triggerKeyboardEvent("DP5-cal--Month0-20151124", jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.notEqual(document.activeElement.id, "DP5-inner", "Focus is NOT on the input field after selecting the same date");

		qutils.triggerEvent("click", "DP5-icon");
		jQuery("#DP5-cal").control(0).fireCancel();
		assert.notEqual(document.activeElement.id, "DP5-inner", "Focus is NOT on the input field after cancel");

		sap.ui.Device.system.desktop = bOrigDesktop;
		sap.ui.Device.support.touch = bOrigTouch;
	});

	QUnit.test("change date using calendar", function(assert) {
		bChange = false;
		sValue = "";
		sId = "";
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");
		assert.ok(sap.ui.require("sap/ui/unified/Calendar"), "sap.ui.unified.Calendar now loaded");
		assert.ok(sap.ui.getCore().byId("DP3-cal"), "DP3: calender exists");
		assert.ok(oDP3._oPopup, "DP3: popup exists");
		assert.ok(jQuery("#DP3-cal")[0], "calendar rendered");
		assert.ok(jQuery("#DP3-cal").is(":visible"), "calendar is visible");

		var aDays = jQuery("#DP3-cal--Month0-days").find(".sapUiCalItem");
		var oDay;
		for ( var i = 0; i < aDays.length; i++) {
			oDay = aDays[i];
			if (jQuery(oDay).attr("data-sap-day") == "20140410") {
				oDay.focus();
				break;
			}
		}

		// use ENTER to not run into itemNavigation
		qutils.triggerKeyboardEvent(oDay, jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.ok(!jQuery("#DP3-cal").is(":visible"), "calendar is not invisible");
		assert.equal(sId, "DP3", "Change event fired");
		assert.equal(sValue, "4/10/14", "Value in internal format priovided");
		assert.equal(oDP3.getValue(), "4/10/14", "Value in internal format set");
		assert.equal(oDP3.getDateValue().getTime(), new Date("2014", "03", "10").getTime(), "DateValue set");

		oDP3.setEditable(false);
		sap.ui.getCore().applyChanges();
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");
		assert.ok(!jQuery("#DP3-cal").is(":visible"), "Readonly DatePicker: calendar is not visible");

		oDP3.setEditable(true);
		sap.ui.getCore().applyChanges();

		oDP5.focus();
		qutils.triggerEvent("click", "DP5-icon");
		assert.equal(oDP5._getCalendar().getPrimaryCalendarType(), "Islamic", "DP5: Primary calendar type set");
		assert.equal(oDP5._getCalendar().getSecondaryCalendarType(), "Gregorian", "DP5: Secondary calendar type set");
		jQuery("#DP5-cal--Month0-20151124").focus();
		qutils.triggerKeyboardEvent("DP5-cal--Month0-20151124", jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.equal(oDP5.getValue(), "11/24/15", "Value in internal format set");

		oDP7.focus();
		qutils.triggerEvent("click", "DP7-icon");
		assert.equal(oDP7._getCalendar().getPrimaryCalendarType(), "Islamic", "DP7: Primary calendar type set");
		jQuery("#DP7-cal--Month0-20151124").focus();
		qutils.triggerKeyboardEvent("DP7-cal--Month0-20151124", jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.equal(oDP7.getValue(), "2/11/1437 AH", "Value in binding format set");

		// invalid enterd value must be set to valid by picking in calendar
		bChange = false;
		sValue = "";
		bValid = true;
		sId = "";
		oDP3.focus();
		jQuery("#DP3").find("input").val("invalid");
		qutils.triggerKeyboardEvent("DP3-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DP3").find("input").change(); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, "DP3", "Change event fired");
		assert.equal(sValue, "invalid", "Value of event has entered value if invalid");
		assert.ok(!bValid, "Value is not valid");
		assert.equal(oDP3.getValue(), "invalid", "Value has entered value if invalid");
		assert.equal(oDP3.getDateValue().getTime(), new Date("2014", "03", "10").getTime(), "DateValue not changed set");
		bChange = false;
		sValue = "";
		bValid = true;
		sId = "";
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");
		assert.ok(jQuery("#DP3-cal")[0], "calendar rendered");
		assert.ok(jQuery("#DP3-cal").is(":visible"), "calendar is visible");
		jQuery("#DP3-cal--Month0-20140410").focus();
		qutils.triggerKeyboardEvent("DP3-cal--Month0-20140410", jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.ok(!jQuery("#DP3-cal").is(":visible"), "calendar is not invisible");
		assert.equal(sId, "DP3", "Change event fired");
		// Ssince no format is set, the date picker uses the default short format which for setted local "en-US" is "M/d/yy"
		assert.equal(sValue, "4/10/14", "Value in internal format provided");
		assert.ok(bValid, "Value is valid");
		assert.equal(oDP3.getValue(), "4/10/14", "Value in internal format set");
		assert.equal(oDP3._$input.val(), "April 10, 2014", "Value in display format set");
		assert.equal(oDP3.getDateValue().getTime(), new Date("2014", "03", "10").getTime(), "DateValue set");
	});

	QUnit.test("min/max", function(assert) {
		assert.ok(Log, "Log module should be available");
		var oMinDate = new Date(1,0,1);
		oMinDate.setFullYear("0001");
		var oMaxDate = new Date(9999, 11, 31, 23, 59, 59, 999);
		var oSpyLogError = sinon.spy(Log, "error");

		//Assert
		assert.ok(!oDP3.getMinDate(), "DP3: no min date set");
		assert.ok(!oDP3.getMaxDate(), "DP3: no max date set");
		assert.equal(oDP3._oMinDate.toString(), oMinDate.toString(), "DP3: default min date");
		assert.equal(oDP3._oMaxDate.toString(), oMaxDate.toString(), "DP3: default max date");

		//Act - set min & max date to whatsoever
		var oNewMinDate = new Date(2014,0,1);
		var oNewMaxDate = new Date(2014,11,31, 23, 59, 59, 999);
		oDP3.setMinDate(oNewMinDate);
		oDP3.setMaxDate(oNewMaxDate);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(oDP3.getMinDate().toString(), oNewMinDate.toString(), "DP3: new min date property");
		assert.equal(oDP3.getMaxDate().toString(), oNewMaxDate.toString(), "DP3: new max date property");
		assert.equal(oDP3._oMinDate.toString(), oNewMinDate.toString(), "DP3: new min date");
		assert.equal(oDP3._oMaxDate.toString(), oNewMaxDate.toString(), "DP3: new max date");

		//Prepare
		oSpyLogError.reset();
		var oNewDate = new Date(2016, 1, 15);
		var sErrorMsg = "dateValue " + oNewDate.toString() + "(value=" + oDP3._getFormatter(false).format(oNewDate) +
			") does not match min/max date range(" + oNewMinDate.toString() + " - " + oNewMaxDate.toString() + ")." +
			" App. developers should take care to maintain dateValue/value accordingly.";

		//Act - set dateValue that does not match min/max range
		oDP3.setDateValue(oNewDate);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(oDP3.getDateValue(), oNewDate, "DP3: new invalid <dateValue> set");
		assert.equal(oDP3.getValue(), oDP3._getFormatter(false).format(oNewDate), "DP3: new invalid <value> displayed");
		assert.equal(oSpyLogError.callCount, 1, "There is one error message in the console");
		oSpyLogError.callCount && assert.equal(oSpyLogError.getCall(0).args[0], sErrorMsg, "And the message is as expected");

		//Act - picker focused date, when dateValue does not match the min/max range
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon"); //to load the picker and initialize the calendar
		oDP3._fillDateRange();
		//Assert
		var oNewMinDateUTC = new Date(Date.UTC(oNewMinDate.getFullYear(), oNewMinDate.getMonth(), oNewMinDate.getDate()));
		var oFocusedDate = oDP3._getCalendar()._getFocusedDate().toUTCJSDate();
		assert.equal(oFocusedDate.toString(), oNewMinDateUTC.toString(), "DP3: focused date equals min date when current dateValue out of min/max range");

		//Cleanup
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");//closes the picker

		//Act - the focused date in the picker, when dateValue is null
		oDP3.setDateValue();
		oDP3._fillDateRange();

		//Assert
		var oNewMinDateUTC = new Date(Date.UTC(oNewMinDate.getFullYear(), oNewMinDate.getMonth(), oNewMinDate.getDate()));
		oFocusedDate = oDP3._getCalendar()._getFocusedDate().toUTCJSDate();
		assert.equal(oFocusedDate.toString(), oNewMinDateUTC.toString(), "DP3: focused date equals min date when" +
			" current <dateValue> is null");

		//Prepare
		oSpyLogError.reset();
		//Act - switch from empty dateValue to a valid dateValue
		oNewDate = new Date(2014, 0, 1);
		oDP3.setDateValue(oNewDate);
		//Assert
		assert.equal(oDP3.getDateValue().toString(), oNewDate.toString(), "DP3: new valid date set");
		assert.equal(oDP3.getValue(), "1/1/14", "DP3: new valid date displayed");
		assert.equal(oSpyLogError.callCount, 0, "Error message [" + sErrorMsg  + "] is NOT logged anymore");

		//Act - page down
		bChange = false;
		oDP3.focus();
		qutils.triggerKeydown("DP3-inner", jQuery.sap.KeyCodes.PAGE_DOWN, false, false, false);
		//Assert
		assert.ok(!bChange, "DP3: No change event fired by PAGE_DOWN");
		assert.ok(jQuery.sap.equal(oDP3.getDateValue(), oNewDate), "DP3: date not changed by PAGE_DOWN");
		assert.equal(oDP3.getValue(), "1/1/14", "DP3: value not changed by PAGE_DOWN");

		//Act - pagedown+shift+ctrl
		bChange = false;
		oDP3.focus();
		qutils.triggerKeydown("DP3-inner", jQuery.sap.KeyCodes.PAGE_UP, true, false, true);
		assert.ok(bChange, "DP3: change event fired by PAGE_UP+shift+ctrl");
		assert.equal(oDP3.getDateValue().toString(), oNewMaxDate.toString(), "DP3: date changed by PAGE_DOWN+shift+ctrl");
		assert.equal(oDP3.getValue(), "12/31/14", "DP3: value changed by PAGE_DOWN+shift+ctrl");

		//Act - user types invalid <value> and presses Enter
		bChange = false;
		bValid = true;
		oDP3.focus();
		jQuery("#DP3").find("input").val("December 31, 2015");
		qutils.triggerKeydown("DP3-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DP3").find("input").change(); // trigger change event, because browser do not if value is changed using jQuery
		//Assert
		assert.ok(bChange, "DP3: change event fired by typing invalid date");
		assert.ok(!bValid, "DP3: invalid typed date is described in <change> event by its non-public parameter <valid>");
		assert.equal(oDP3.getDateValue().toString(), oNewMaxDate.toString(), "DP3: dateValue not changed by invalid typing");

		//Act - open the date picker
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");
		//Assert
		assert.equal(oDP3._getCalendar().getMinDate().toString(), oDP3.getMinDate().toString(), "Calendar has the same MinDate as DatePicker");
		assert.equal(oDP3._getCalendar().getMaxDate().toString(), oDP3.getMaxDate().toString(), "Calendar has the same MaxDate as DatePicker");
		//Clean - closes the picker
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");

		//Act - app.developer sets empty min/max date
		oDP3.setMinDate();
		oDP3.setMaxDate();
		sap.ui.getCore().applyChanges();
		//Assert
		assert.ok(!oDP3.getMinDate(), "DP3: no min date set");
		assert.ok(!oDP3.getMaxDate(), "DP3: no max date set");
		assert.equal(oDP3._oMinDate.toString(), oMinDate.toString(), "DP3: default min date");
		assert.equal(oDP3._oMaxDate.toString(), oMaxDate.toString(), "DP3: default max date");

		//Act - open date picker when min/max date are empty
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");
		//Assert
		assert.ok(!oDP3._getCalendar().getMinDate(), "Calendar has no MinDate");
		assert.ok(!oDP3._getCalendar().getMaxDate(), "Calendar has no MaxDate");
		//Cleanup
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");
		oSpyLogError.restore();
	});

	QUnit.test("setValue with value outside min/max range", function (assert) {
		assert.ok(Log, "Log module should be available");
		//Prepare
		var oMinDate = new Date(2017, 0, 1),
			oMaxDate = new Date(2017, 11, 31),
			oDateValue = new Date(2017, 1, 10),
			sValue = "20200630",
			oDP = new DatePicker({
				valueFormat: "yyyyMMdd",
				minDate: oMinDate,
				maxDate: oMaxDate,
				dateValue: oDateValue
			}),
			oSpyLogError = sinon.spy(Log, "error"),
			sErrorMsg = "dateValue " + new Date(2020, 5, 30).toString() + "(value=20200630) does not match " +
				"min/max date range(" + oMinDate.toString() + " - " + new Date(oMaxDate.setHours(23, 59, 59)).toString() +
				"). App. developers should take care to maintain dateValue/value accordingly.";

		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Act
		oDP.setValue(sValue);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(oDP.getValue(), sValue, "..sets the <value> property");
		//new test
		assert.equal(oDP.getDateValue().toString(), new Date(2020, 5, 30).toString(), "..sets the <dateValue> property");
		assert.equal(oSpyLogError.callCount, 1, "There is one error message in the console");
		oSpyLogError.callCount && assert.equal(oSpyLogError.getCall(0).args[0], sErrorMsg, "And the message is as expected");

		//Cleanup
		oSpyLogError.restore();
		oDP.destroy();
	});

	QUnit.test("Opening picker when current value/dateValue is outside min/max range", function (assert) {
		//Prepare
		var oMinDate = new Date(2016, 0, 1),
			oMaxDate = new Date(2016, 11, 31),
			oDP = new DatePicker({
				valueFormat: "yyyyMMdd",
				minDate: oMinDate,
				maxDate: oMaxDate,
				dateValue: new Date(2016, 1, 10)
			}),
			sIconId = oDP.getId() + "-icon";

		oDP.placeAt("qunit-fixture");
		oDP.setValue("20200630");
		sap.ui.getCore().applyChanges();

		//Act
		oDP.focus();
		qutils.triggerEvent("click", sIconId);
		//Assert
		assert.equal(oDP._getCalendar()._getFocusedDate().toLocalJSDate().toString(), oDP._getCalendar().getMinDate().toString(),
			".. should focus a date equal to the <minDate>");

		//Cleanup
		qutils.triggerEvent("click", sIconId);
		oDP.destroy();
	});

	QUnit.test("Opening picker on year picker view on mobile and trying to select a year outside of the mix/max range", function (assert) {
		//Prepare
		var oDP = new DatePicker({
				displayFormat: "yyyy",
				minDate: new Date(2010, 0, 1),
				maxDate: new Date(2020, 0, 1),
				dateValue: new Date(2010, 0, 1)
			}),
			iFocusedIndex = 11,
			oDeviceStub = this.stub(sap.ui.Device.support, "touch", true),
			oYP,
			oFakeEvent,
			oItemNavigationStub,
			oIsValueInThresholdStub,
			fnFireSelectSpy;

		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		oDP.toggleOpen();

		oYP = oDP._getCalendar()._getYearPicker();
		oItemNavigationStub = this.stub(oYP._oItemNavigation, "getFocusedIndex", function () { return iFocusedIndex; });
		oIsValueInThresholdStub = this.stub(oYP, "_isValueInThreshold", function () { return true; });
		fnFireSelectSpy = this.spy(oYP, "fireSelect");

		oFakeEvent = {
			target: jQuery("<div></div>").attr({
				"id": oYP.getId() + "-y20210101",
				"class": "sapUiCalItem"
			}).get(0),
			classList: {
				contains: function() {
					return true;
				}
			}
		};

		// Act
		oYP.onmousedown({});
		oYP.onmouseup(oFakeEvent);

		// Assert
		assert.ok(fnFireSelectSpy.notCalled, "'fireSelect' is not called");

		// Cleanup
		oDP.destroy();
		oDeviceStub.restore();
		oItemNavigationStub.restore();
		oIsValueInThresholdStub.restore();
		fnFireSelectSpy.restore();
	});

	QUnit.test("special cases", function(assert) {
		var oDate = new Date(1, 0, 1);
		oDate.setFullYear(1);
		oDP3.setDateValue(oDate);
		assert.ok(jQuery.sap.equal(oDP3.getDateValue(), oDate), "DP3: 00010101 as valid date set");
		assert.equal(oDP3.getValue(), "1/1/01", "DP3: 00010101 displayed");
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");
		assert.ok(jQuery("#DP3-cal")[0], "calendar rendered");
		assert.ok(jQuery("#DP3-cal").is(":visible"), "calendar is visible");
		assert.ok(jQuery("#DP3-cal--Month0-00010101")[0], "00010101 rendered");
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");

		oDate = new Date(1970, 0, 1);
		oDP3.setDateValue(oDate);
		assert.ok(jQuery.sap.equal(oDP3.getDateValue(), oDate), "DP3: 19700101 as valid date set");
		assert.equal(oDP3.getValue(), "1/1/70", "DP3: 19700101 displayed");
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");
		assert.ok(jQuery("#DP3-cal")[0], "calendar rendered");
		assert.ok(jQuery("#DP3-cal").is(":visible"), "calendar is visible");
		assert.ok(jQuery("#DP3-cal--Month0-19700101")[0], "19700101 rendered");
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");

		oDate = new Date(9999, 11, 31);
		oDP3.setDateValue(oDate);
		assert.ok(jQuery.sap.equal(oDP3.getDateValue(), oDate), "DP3: 99991231 as valid date set");
		assert.equal(oDP3.getValue(), "12/31/99", "DP3: 99991231 displayed");
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");
		assert.ok(jQuery("#DP3-cal")[0], "calendar rendered");
		assert.ok(jQuery("#DP3-cal").is(":visible"), "calendar is visible");
		assert.ok(jQuery("#DP3-cal--Month0-99991231")[0], "99991231 rendered");
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");
	});


	QUnit.test("validation check", function(assert) {

		simulateUserInputViaTheInputField();
		simulateSelectionOnTheCalendar();
		simulateUserInputViaTheInputField();
		simulateSelectionOnTheCalendar();
		simulateUserInputViaTheInputField();

		assert.equal(bChange, true,
				"fireChange is fired everytime when needed and _lastValue is in sync with the selected date");
	});

	QUnit.test("specialDates", function(assert) {
		var done = assert.async();
		var oDate = new Date(2016, 5, 29);
		oDP3.setDateValue(oDate);
		oDate = new Date(2016, 5, 1);
		if (!DateTypeRange) {
			sap.ui.getCore().loadLibrary("sap.ui.unified");
		}
		var oLegend = new CalendarLegend("Legend1", {
			items: [
				new CalendarLegendItem("T1", {type: CalendarDayType.Type01, text: "Typ 1"}),
				new CalendarLegendItem("T2", {type: CalendarDayType.Type02, text: "Typ 2"}),
				new CalendarLegendItem("T3", {type: CalendarDayType.Type03, text: "Typ 3"}),
				new CalendarLegendItem("T4", {type: CalendarDayType.Type04, text: "Typ 4"}),
				new CalendarLegendItem("T5", {type: CalendarDayType.Type05, text: "Typ 5"}),
				new CalendarLegendItem("T6", {type: CalendarDayType.Type06, text: "Typ 6"}),
				new CalendarLegendItem("T7", {type: CalendarDayType.Type07, text: "Typ 7"}),
				new CalendarLegendItem("T8", {type: CalendarDayType.Type08, text: "Typ 8"}),
				new CalendarLegendItem("T9", {type: CalendarDayType.Type09, text: "Typ 9"}),
				new CalendarLegendItem("T10", {type: CalendarDayType.Type10, text: "Typ 10"})
				]
		});
		oDP3.setLegend(oLegend);
		var oSpecialDate = new DateTypeRange({startDate: oDate, type: "Type01"});
		oDP3.addSpecialDate(oSpecialDate);
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");
		assert.ok(jQuery("#DP3-cal--Month0-20160601").hasClass("sapUiCalItemType01"), "20160601 has Type01");
		assert.equal(oDP3.getSpecialDates().length, 1, "1 SpecialDate in Aggregation");
		assert.equal(oDP3._getCalendar().getLegend(), oLegend.getId(), "Legend set at Calendar");

		oDate = new Date(2016, 5, 2);
		var oDate2 = new Date(2016, 5, 3);
		oSpecialDate = new DateTypeRange({startDate: oDate, endDate: oDate2, type: "Type02"});
		oDP3.addSpecialDate(oSpecialDate);
		assert.equal(oDP3.getSpecialDates().length, 2, "2 SpecialDates in Aggregation");
		oDate = new Date(2016, 5, 4);
		oSpecialDate = new DateTypeRange({startDate: oDate, type: "Type03"});
		oDP3.insertSpecialDate(oSpecialDate, 1);
		assert.equal(oDP3.getSpecialDates().length, 3, "3 SpecialDates in Aggregation");
		oDP3.removeSpecialDate(0);
		assert.equal(oDP3.getSpecialDates().length, 2, "2 SpecialDates in Aggregation");
		sap.ui.getCore().applyChanges();

		setTimeout( function(){
			assert.ok(!jQuery("#DP3-cal--Month0-20160601").hasClass("sapUiCalItemType01"), "20160603 has no Type01");
			assert.ok(jQuery("#DP3-cal--Month0-20160602").hasClass("sapUiCalItemType02"), "20160602 has Type02");
			assert.ok(jQuery("#DP3-cal--Month0-20160603").hasClass("sapUiCalItemType02"), "20160603 has Type02");
			assert.ok(jQuery("#DP3-cal--Month0-20160604").hasClass("sapUiCalItemType03"), "20160603 has Type03");

			oDP3.focus();
			qutils.triggerEvent("mousedown", "DP3-icon");
			qutils.triggerEvent("click", "DP3-icon");
			done();
		}, 100);

	});

	QUnit.test("specialDates2", function(assert) {
		var done = assert.async();
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");

		assert.ok(jQuery("#DP3-cal--Month0-20160602").hasClass("sapUiCalItemType02"), "20160602 has Type02");
		assert.ok(jQuery("#DP3-cal--Month0-20160603").hasClass("sapUiCalItemType02"), "20160603 has Type02");
		assert.ok(jQuery("#DP3-cal--Month0-20160604").hasClass("sapUiCalItemType03"), "20160603 has Type03");
		oDP3.removeAllSpecialDates();
		assert.equal(oDP3.getSpecialDates().length, 0, "0 SpecialDates in Aggregation");
		sap.ui.getCore().applyChanges();

		setTimeout( function(){
			assert.ok(!jQuery("#DP3-cal--Month0-20160602").hasClass("sapUiCalItemType02"), "20160602 has no Type02");
			assert.ok(!jQuery("#DP3-cal--Month0-20160603").hasClass("sapUiCalItemType02"), "20160603 has no Type02");
			assert.ok(!jQuery("#DP3-cal--Month0-20160604").hasClass("sapUiCalItemType03"), "20160603 has no Type03");

			oDP3.focus();
			qutils.triggerEvent("mousedown", "DP3-icon");
			qutils.triggerEvent("click", "DP3-icon");
			done();
		}, 100);

	});

	QUnit.test("specialDates3", function(assert) {
		var done = assert.async();
		var oDate = new Date(2016, 5, 5);
		var oSpecialDate = new DateTypeRange("SD1", {startDate: oDate, type: "Type04"});
		oDP3.addSpecialDate(oSpecialDate);
		oDate = new Date(2016, 5, 6);
		oSpecialDate = new DateTypeRange("SD2", {startDate: oDate, type: "Type05"});
		oDP3.addSpecialDate(oSpecialDate);
		assert.equal(oDP3.getSpecialDates().length, 2, "2 SpecialDates in Aggregation");
		oDP3.focus();
		qutils.triggerEvent("mousedown", "DP3-icon");
		qutils.triggerEvent("click", "DP3-icon");

		assert.ok(jQuery("#DP3-cal--Month0-20160605").hasClass("sapUiCalItemType04"), "20160603 has Type04");
		assert.ok(jQuery("#DP3-cal--Month0-20160606").hasClass("sapUiCalItemType05"), "20160603 has Type05");
		oDP3.destroySpecialDates();
		sap.ui.getCore().applyChanges();
		assert.equal(oDP3.getSpecialDates().length, 0, "0 SpecialDates in Aggregation");
		assert.ok(!sap.ui.getCore().byId("SD1"), "Special date control don't exits any more");
		sap.ui.getCore().applyChanges();

		setTimeout( function(){
			assert.ok(!jQuery("#DP3-cal--Month0-20160605").hasClass("sapUiCalItemType04"), "20160603 has no Type04");
			assert.ok(!jQuery("#DP3-cal--Month0-20160606").hasClass("sapUiCalItemType05"), "20160603 has no Type05");

			oDP3.focus();
			qutils.triggerEvent("mousedown", "DP3-icon");
			qutils.triggerEvent("click", "DP3-icon");
			done();
		}, 100);

	});

	//github #1172
	QUnit.test("value is updated when we change the century", function(assert) {
		//arrange
		var newValue,
			oDP = new DatePicker({
				value: "05-05-16",
				valueFormat: "MM-dd-yy",
				displayFormat: "dd+MM+yyyy",
				change: function(oEvent) {
					newValue = oEvent.getParameter("value");
				}
			}).placeAt("uiArea2");

		sap.ui.getCore().applyChanges();

		//act
		oDP.focus();
		oDP.$().find("input").val("05+05+1916");
		oDP.onChange();

		//assert
		assert.strictEqual(newValue, "05-05-16", "change event fired and new value is the same");
		assert.strictEqual(oDP.getDateValue().getFullYear(), 1916, "new dateValue is correct");

		//clean
		oDP.destroy();
	});

	// BCP: 1880193676
	QUnit.test("For IE & Edge the input selection is cleared before opening the picker and restoring back when picker is closed", function(assert) {
		// Arrange
		var done = assert.async(),
			oBrowserStub = this.stub(Device, "browser", {msie: true}),
			oTouchStub = this.stub(Device, "support", {touch: false});

		this.clock = sinon.useFakeTimers();
		var oDP = new DatePicker("DTP6", {
			dateValue: new Date()
		}).placeAt("uiArea2");
		sap.ui.getCore().applyChanges();

		oDP._$input.get(0).selectionStart = 3;
		oDP._$input.get(0).selectionEnd = 3;

		oDP.$().find(".sapUiIcon").click(); //simulate opening
		this.clock.tick(100);

		//Assert
		assert.equal(oDP._$input.get(0).selectionStart, 0, "selection start should be 0");
		assert.equal(oDP._$input.get(0).selectionEnd, 0, "selection end should be 0");

		//Act
		oDP._oPopup.close();

		setTimeout(function(){
			//Assert
			assert.equal(oDP._$input.get(0).selectionStart, 3, "selection start must be restored");
			assert.equal(oDP._$input.get(0).selectionEnd, 3, "selection end must be restored");

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
			oDP = new DatePicker(),
			oDPStoreInputSelectionSpy = this.spy(oDP, "_storeInputSelection");

		oDP._oPopup = {
			openBy: fn,
			isOpen: fn,
			_getPopup: function() {
				return { setAutoCloseAreas: fn, open: fn, isOpen: fn };
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

	QUnit.test("Instance manager detects popup state changes", function (assert) {
		// Prepare
		var oCore = sap.ui.getCore(),
			oDatePicker = new DatePicker();

		oDatePicker.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		assert.notOk(InstanceManager.isPopoverOpen(oDatePicker._oPopup), "Initially closed popup detected");

		// Act
		oDatePicker.toggleOpen(false);
		oCore.applyChanges();

		// Assert
		assert.ok(InstanceManager.isPopoverOpen(oDatePicker._oPopup), "Opening popup detected");

		// Act
		oDatePicker.toggleOpen(true);
		oCore.applyChanges();

		// Assert
		assert.notOk(InstanceManager.isPopoverOpen(oDatePicker._oPopup), "Closing popup detected");

		oDatePicker.destroy();
	});

	QUnit.test("Open popup with CustomYaerPicker as content when datePicker display format contains only years", function(assert) {
		// Prepare
		var oDP = new DatePicker({
				dateValue: new Date("2014", "02", "26"),
				displayFormat: "---yyyy---",
				change: handleChange
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Act
		oDP.toggleOpen(oDP.isOpen());

		// Assert
		assert.ok(sap.ui.getCore().byId(oDP.getId() + "-cal"), oDP.getId() + ": calender exists");
		assert.ok(oDP._oPopup, oDP.getId() + ": popup exists");
		assert.ok(jQuery("#" + oDP.getId() + "-cal")[0], "calendar rendered");
		assert.ok(jQuery("#" + oDP.getId() + "-cal").is(":visible"), "CustomYearPicker is visible");
		assert.ok(oDP._getCalendar() instanceof CustomYearPicker, "Calendar is of type CustomYearPicker");

		// Clean
		oDP.destroy();
	});

	QUnit.test("Open popup with CustomMonthPicker as content when datePicker display format contains only months and years", function(assert) {
		// Prepare
		var oDP = new DatePicker({
				dateValue: new Date("2014", "02", "26"),
				displayFormat: "yyyy+++++MM",
				change: handleChange
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Act
		oDP.toggleOpen(oDP.isOpen());

		// Assert
		assert.ok(sap.ui.getCore().byId(oDP.getId() + "-cal"), oDP.getId() + ": calender exists");
		assert.ok(oDP._oPopup, oDP.getId() + ": popup exists");
		assert.ok(jQuery("#" + oDP.getId() + "-cal")[0], "calendar rendered");
		assert.ok(jQuery("#" + oDP.getId() + "-cal").is(":visible"), "CustomYearPicker is visible");
		assert.ok(oDP._getCalendar() instanceof CustomMonthPicker, "Calendar is of type CustomMonthPicker");

		// Clean
		oDP.destroy();
	});

	QUnit.test("Open popup with Calendar when the display format is dd/MM/YYYY where YYYY results in weekYear for PatternSymbolSettings.type", function(assert) {
		// Prepare
		var oDP = new DatePicker({
				displayFormat: "dd/MM/YYYY",
				change: handleChange
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Act
		oDP.toggleOpen(oDP.isOpen());

		// Assert
		assert.ok(sap.ui.getCore().byId(oDP.getId() + "-cal"), oDP.getId() + ": calender exists");
		assert.ok(oDP._oPopup, oDP.getId() + ": popup exists");
		assert.ok(jQuery("#" + oDP.getId() + "-cal")[0], "calendar rendered");
		assert.ok(jQuery("#" + oDP.getId() + "-cal").is(":visible"), "Calendar is visible");

		// Clean
		oDP.destroy();
	});

	QUnit.test("Open popup with default Calendar when the display format is wrong", function(assert) {
		// Prepare
		var oDP = new DatePicker({
				displayFormat: "aaa/bbb/ccc",
				change: handleChange
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Act
		oDP.toggleOpen(oDP.isOpen());

		// Assert
		assert.ok(sap.ui.getCore().byId(oDP.getId() + "-cal"), oDP.getId() + ": calender exists");
		assert.ok(oDP._oPopup, oDP.getId() + ": popup exists");
		assert.ok(jQuery("#" + oDP.getId() + "-cal")[0], "calendar rendered");
		assert.ok(jQuery("#" + oDP.getId() + "-cal").is(":visible"), "Calendar is visible");

		// Clean
		oDP.destroy();
	});

	QUnit.module("ARIA");

	QUnit.test("aria-ownes and aria-expanded correctly set", function(assert) {
		var oDP = new DatePicker("DP", {}).placeAt("uiArea4");
		sap.ui.getCore().applyChanges();

		//before opening the popup
		assert.strictEqual(oDP.$("inner").attr("type"), "text", "DP input has correct type 'text'");
		assert.ok(!oDP.$("inner").attr("aria-owns"), "DP input does not have 'aria-owns' until the picker gets open");
		assert.equal(oDP.$("inner").attr("aria-expanded"), "false", "DP input has 'aria-expand' set to false when the picker is not open");

		// open DatePicker
		oDP.focus();
		qutils.triggerEvent("click", "DP-icon");

		//after opening popup
		assert.equal(oDP.$("inner").attr("aria-owns"), "DP-cal", "DP input has correct 'aria-owns' when the picker is open");
		assert.equal(oDP.$("inner").attr("aria-expanded"), "true", "DP input has 'aria-expand' set to true when the picker is open");

		oDP.destroy();
	});

	QUnit.test("Tooltip and date annoncement should be set correctly at the described by", function(assert) {
		var sTooltip = "tooltip";
		var sPlaceholder = "placeholder";
		var oDP = new DatePicker({
			placeholder: sPlaceholder
		}).placeAt("uiArea4");
		sap.ui.getCore().applyChanges();

		var $Input = jQuery(oDP.getFocusDomRef());
		var $LabelledByReference = jQuery.sap.byId($Input.attr("aria-labelledby"));
		var $DescribedByReference = jQuery.sap.byId($Input.attr("aria-describedby"));
		var sDateAnnouncement = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("DATEPICKER_DATE_TYPE");

		assert.strictEqual($DescribedByReference.text(), sDateAnnouncement, "Date announcement added into aria-describedby");

		oDP.setTooltip(sTooltip);
		sap.ui.getCore().applyChanges();
		$Input = jQuery(oDP.getFocusDomRef());
		$DescribedByReference = jQuery.sap.byId($Input.attr("aria-describedby"));

		assert.strictEqual($DescribedByReference.text().trim(), sDateAnnouncement, "Date announcement is added into aria-describedby");

		oDP.destroy();
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oInput = new DatePicker({
			value: "Value",
			tooltip: "Tooltip",
			placeholder: "Placeholder"
		});
		var sDatePickerAriaType = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("DATEPICKER_DATE_TYPE");
		assert.ok(!!oInput.getAccessibilityInfo, "DatePicker has a getAccessibilityInfo function");
		var oInfo = oInput.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, oInput.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATEINPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value  " + sDatePickerAriaType, "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oInput.setValue("");
		oInput.setEnabled(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, sDatePickerAriaType, "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oInput.setEnabled(true);
		oInput.setEditable(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oInput.setValueFormat("yyyy.MM.dd");
		oInput.setDisplayFormat("yyyy-MM-dd");
		oInput.setValue("2014.03.26");
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "2014-03-26  " + sDatePickerAriaType, "Description");
		oInput.destroy();
	});

	QUnit.test("Aria in calendar with Secondary calendar type", function(assert) {
		var oFormatSecondaryLong = DateFormat.getInstance({style: "long", calendarType: "Gregorian"}),
			oSecondaryDay = UniversalDate.getInstance(new Date(2015, 10, 25, 0, 0, 0), "Gregorian"),
			sAriaSecondaryDay = oFormatSecondaryLong.format(oSecondaryDay, true),
			sDayAriaText = jQuery("#DP5-inner").val(),
			sExpectedAria = sDayAriaText + " " + sAriaSecondaryDay,
			sAriaText = jQuery("#DP5-cal--Month0-20151124").attr('aria-label');

		assert.strictEqual(sAriaText, sExpectedAria, "Aria contains text for the secondary calendar type");
	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oDP = new DatePicker("EDP").placeAt("uiArea6");
			this.oSpy = sinon.spy();
			this.fnHandleCalendarSelect = sinon.spy(this.oDP, "_handleCalendarSelect");
			this.fnHandleOKButton = sinon.spy(this.oDP, "_handleOKButton");
			this.fnFireNavigate = sinon.spy(this.oDP, "fireNavigate");

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oSpy = null;
			this.fnHandleCalendarSelect.restore();
			this.fnHandleOKButton.restore();
			this.fnFireNavigate.restore();

			this.oDP.destroy();
			this.oDP = null;
		}
	});

	QUnit.test("Compare pressing OK button against pressing a date in the calendar", function(assert) {
		// Prepare
		var oOkButton;

		// Act
		this.oDP.setShowFooter(true);
		this.oDP.toggleOpen();
		oOkButton = this.oDP._oPopup.getBeginButton();

		// Assert
		assert.notOk(oOkButton.getEnabled(), "Ok button is disabled");

		this.oDP._getCalendar().fireSelect();

		// Assert
		assert.ok(this.fnHandleCalendarSelect.calledOnce, "_handleCalendarSelect handle is called when a date is pressed");
		assert.ok(this.oDP._oPopup.isOpen(), "Popover is opened");
		assert.ok(oOkButton.getEnabled(), "Ok button is enabled");

		// Act
		oOkButton.firePress();

		// Assert
		assert.ok(this.fnHandleOKButton.calledOnce, "_handleOKButton handler is called when OK button is pressed");
		assert.notOk(this.oDP._oPopup.isOpen(), "Popover is closed");
	});

	QUnit.test("Press footer cancel button", function(assert) {
		// Prepare
		this.oDP.setShowFooter(true);
		this.oDP.toggleOpen();

		var oPopup = this.oDP._oPopup,
			oBeginButton = oPopup.getBeginButton(),
			oEndButton = oPopup.getEndButton();

		// Act
		oEndButton.firePress();

		// Assert
		assert.ok(this.fnHandleCalendarSelect.notCalled, "_handleCalendarSelect handler is not called when 'Cancel' button is pressed");
		assert.notOk(oPopup.isOpen(), "Popover is closed");
		assert.notOk(oBeginButton.getEnabled(), "Begin button is disabled");
	});

	QUnit.test("Press ESC keyboard key or close the popover by clicking outside of it", function(assert) {
		// Prepare
		var oBeginButton;
		this.oDP.setShowFooter(true);
		this.oDP.toggleOpen();

		oBeginButton = this.oDP._oPopup.getBeginButton();

		// Act
		this.oDP._getCalendar().fireSelect();

		// Assert
		assert.ok(oBeginButton.getEnabled(), "Begin button is enabled");

		// Act
		this.oDP._oPopup.fireAfterClose();

		// Assert
		assert.notOk(oBeginButton.getEnabled(), "Begin button is disabled");
	});

	QUnit.test("navigate", function (assert) {
		// Act
		qutils.triggerEvent("click", "EDP-icon");

		// Assert
		assert.ok(this.fnFireNavigate.callCount, 1, "Event handler should be called once after opening picker");
		assert.ok(this.fnFireNavigate.getCall(0).args[0].afterPopupOpened,
			"Event indicates that it has been fired after popup opening");

		// Act
		qutils.triggerEvent("click", "EDP-cal--Head-next");

		// Assert
		assert.ok(this.fnFireNavigate.callCount, 2, "Event handler should be called a second time after navigating in the calendar");
		assert.notOk(this.fnFireNavigate.getCall(1).args[0].afterPopupOpened, "Event isn't fired after opening");
	});

	QUnit.module("SpecialDates - lazy loading", {
		beforeEach: function () {
			this.oDP = new DatePicker("SDP", {
				dateValue: new Date(2016, 0, 1),
				navigate: this.fHandleNavigate.bind(this)
			}).placeAt("uiArea6");
			sap.ui.getCore().applyChanges();

			// Open date picker
			qutils.triggerEvent("click", "SDP-icon");
		},
		afterEach: function () {
			this.oDP.destroy();
			this.oDP = null;

			this.oStartDate = null;
			this.oEndDate = null;
		},
		fHandleNavigate: function (oEvent) {
			var oDateRange = oEvent.getParameter("dateRange"),
				oDP = oEvent.getSource();

			this.oStartDate = oDateRange.getStartDate();
			this.oEndDate = oDateRange.getEndDate();

			// Clear currently loaded special dates
			oDP.removeAllAggregation("specialDates");

			// Add new special date at start
			oDP.addSpecialDate(
				new DateTypeRange({
					startDate: this.oStartDate,
					type: "Type03"
				})
			);

			// Add new special date at end
			oDP.addSpecialDate(
				new DateTypeRange({
					startDate: this.oEndDate,
					type: "Type03"
				})
			);
		},
		assertSpecialDatesMarked: function (fnDone) {
			var oDateFormat = DateFormat.getInstance({pattern: "YYYYMMdd"});

			// We use 200 ms timeout here to place the test on a safe place on the event loop queue
			// to catch all the ui updates happening with multiple delayed calls.
			setTimeout(function () {
				var $Days = this.oDP._getCalendar().$().find(".sapUiCalItemType03");
				assert.strictEqual($Days.length, 2, "There should be only two special days visible");
				assert.strictEqual(jQuery($Days[0]).data("sap-day").toString(),
					oDateFormat.format(this.oStartDate, false),
					"The first special date '" + this.oStartDate + "' should be marked in the newly displayed month");
				assert.strictEqual(jQuery($Days[1]).data("sap-day").toString(),
					oDateFormat.format(this.oEndDate, false),
					"The second special date '" + this.oEndDate + "' should be marked in the newly displayed month");

				fnDone();
			}.bind(this), 200);
		},
		/**
		 * Click on a calendar month from the monthPicker
		 * @param {int} iIndex 0..11 zero based index of the month
		 */
		clickOnMonth: function (iIndex) {
			var $Items = jQuery("#SDP-cal--MP").find(".sapUiCalItem"),
				$Target = $Items[iIndex];

			qutils.triggerEvent("mousedown", $Target);
			qutils.triggerEvent("mouseup", $Target);
		},
		/**
		 * Click on a calendar year from the yearPicker
		 * @param {int} iYear Year
		 */
		clickOnYear: function (iYear) {
			var $Target = jQuery('[data-sap-year-start="' + iYear + '0101"]', '#SDP-cal--YP');

			qutils.triggerEvent("mousedown", $Target);
			qutils.triggerEvent("mouseup", $Target);
		}
	});

	QUnit.test("Changing month using the next arrow", function (assert) {
		var fnDone = assert.async();

		// Act - click on next button
		qutils.triggerEvent("click", "SDP-cal--Head-next");

		// Assert
		this.assertSpecialDatesMarked(fnDone);
	});

	QUnit.test("Changing month using the back arrow", function (assert) {
		var fnDone = assert.async();

		// Act - click on previous button
		qutils.triggerEvent("click", "SDP-cal--Head-prev");

		// Assert
		this.assertSpecialDatesMarked(fnDone);
	});

	QUnit.test("Changing month using the month picker", function (assert) {
		var fnDone = assert.async();

		// Act
		var that = this;
		setTimeout(function () {
			// Open month picker
			qutils.triggerEvent("click", "SDP-cal--Head-B1");

			// Click on March
			that.clickOnMonth(2);

			// Assert
			that.assertSpecialDatesMarked(fnDone);
		}, 0);
	});

	QUnit.test("Changing month using the year picker", function (assert) {
		var fnDone = assert.async();

		// Act
		var that = this;
		setTimeout(function () {
			// Open month picker
			qutils.triggerEvent("click", "SDP-cal--Head-B2");

			// Click on 2015
			that.clickOnYear(2015);

			// Assert
			that.assertSpecialDatesMarked(fnDone);
		}, 0);
	});

	QUnit.module("Private methods", {
		beforeEach: function () {
			this.oDP = new DatePicker();
		},
		afterEach: function () {
			this.oDP.destroy();
			this.oDP = null;
		}
	});

	// BCP: 1880193676
	QUnit.test("_storeInputSelection should store the selectionStart and End position of the Input and set it to 0", function (assert) {
		// Arrange
		var oBrowserStub = this.stub(Device, "browser", {msie: true}),
			oTouchStub = this.stub(Device, "support", {touch: false}),
			iExpectedSelectionStart = 2,
			iExpectedSelectionEnd = 3,
			oMockedInput = { selectionStart: iExpectedSelectionStart, selectionEnd: iExpectedSelectionEnd },
			oDP = new DatePicker();

		// Act
		oDP._storeInputSelection(oMockedInput);

		// Assert
		assert.equal(oDP._oInputSelBeforePopupOpen.iStart, iExpectedSelectionStart, "Stored selectionStart should be equal to " + iExpectedSelectionStart);
		assert.equal(oDP._oInputSelBeforePopupOpen.iStart, iExpectedSelectionStart, "Stored selectionEnd should be equal to " + iExpectedSelectionEnd);
		assert.equal(oMockedInput.selectionStart, 0, "Input's sectionStart should be restored to 0");
		assert.equal(oMockedInput.selectionEnd, 0, "Input's sectionEnd should be restored to 0");

		// Cleanup
		oDP.destroy();
		oTouchStub.restore();
		oBrowserStub.restore();
	});

	// BCP: 1880193676
	QUnit.test("_restoreInputSelection should restore the selectionStart and End position of the Input", function (assert) {
		// Arrange
		var oBrowserStub = this.stub(Device, "browser", {msie: true}),
			oTouchStub = this.stub(Device, "support", {touch: false}),
			iExpectedSelectionStart = 2,
			iExpectedSelectionEnd = 3,
			oMockedInput = { selectionStart: iExpectedSelectionStart, selectionEnd: iExpectedSelectionEnd },
			oDP = new DatePicker();
		oDP._oInputSelBeforePopupOpen = {
			iStart: iExpectedSelectionStart,
			iEnd: iExpectedSelectionEnd
		};

		// Act
		oDP._restoreInputSelection(oMockedInput);

		// Assert
		assert.equal(oMockedInput.selectionStart, iExpectedSelectionStart, "Input's sectionStart should be restored to " + iExpectedSelectionStart);
		assert.equal(oMockedInput.selectionEnd, iExpectedSelectionEnd, "Input's sectionEnd should be restored to " + iExpectedSelectionEnd);

		// Cleanup
		oBrowserStub.restore();
		oTouchStub.restore();
		oDP.destroy();
	});

	QUnit.test("_getVisibleDatesRange", function (assert) {
		var Calendar = sap.ui.require("sap/ui/unified/Calendar");
		// Assert
		assert.ok(this.oDP._getVisibleDatesRange(new Calendar()) instanceof DateRange,
			"The method should return sap.ui.unified.DateRange");
	});

	//set the input value to an invalid one
	function simulateUserInputViaTheInputField(){
		bChange = false;
		sValue = "";
		bValid = true;
		sId = "";
		jQuery("#DP2").find("input").val("11/190/2016");
		qutils.triggerKeyboardEvent("DP2-inner", jQuery.sap.KeyCodes.ENTER, false, false, false);
		jQuery("#DP2").find("input").change(); // trigger change event, because browser do not if value is changed using jQuery
		assert.equal(sId, "DP2", "Change event fired");
		assert.equal(sValue, "11/190/2016", "The new value is set to an invalid one");
		assert.ok(!bValid, "Value is not valid");
		assert.equal(oDP2.getValue(), "11/190/2016", "Value in internal format set");
	}

	//press the icon and select a valid value
	function simulateSelectionOnTheCalendar(){
		oDP2.focus();
		qutils.triggerEvent("click", "DP2-icon");
		var $Date = jQuery("#DP2-cal--Month0-20140401");
		$Date.focus();
		qutils.triggerKeyboardEvent($Date[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		assert.ok(oDP2.getValue() !== "11/190/2016",
			"The value has successfully changed after a selection from the calendar");
	}


	QUnit.module("isValidValue");

	QUnit.test("Date picker with no settings, no value entered", function (assert) {
		// Arrange
		var oDP = new DatePicker();
		// Act
		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oDP.isValidValue(), true, "empty string is valid value");

		// Cleanup
		oDP.destroy();
	});

	QUnit.test("Date picker with display format no value entered", function (assert) {
		// Arrange
		var oDP = new DatePicker({
			displayFormat: "short"
		});
		// Act
		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oDP.isValidValue(), true, "the value is valid");

		// Cleanup
		oDP.destroy();
	});

	QUnit.test("Date picker with set valid value on init", function (assert) {
		// Arrange
		var oDP = new DatePicker({
			value: "2014-03-26"
		});
		// Act
		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oDP.isValidValue(), true, "the value is valid");

		// Cleanup
		oDP.destroy();
	});

	QUnit.test("Date picker with set not valid value on init", function (assert) {
		// Arrange
		var oDP = new DatePicker({
			value: "99999-63-26"
		});
		// Act
		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oDP.isValidValue(), false, "the value is not valid");

		// Cleanup
		oDP.destroy();
	});

	QUnit.test("Date picker values set via setter", function (assert) {
		// Arrange
		var oDP = new DatePicker();
		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oDP.setValue("2014-03-26");

		// Assert
		assert.equal(oDP.isValidValue(), true, "the value is valid");

		// Act
		oDP.setValue("2014-08-26");

		// Assert
		assert.equal(oDP.isValidValue(), true, "the value is valid");

		// Act
		oDP.setValue("2014-45-44");

		// Assert
		assert.equal(oDP.isValidValue(), false, "the value is not valid");

		// Cleanup
		oDP.destroy();
	});

	QUnit.test("value is valid when we change the century", function(assert) {
		// Arrange
		var oDP = new DatePicker({
				value: "05-05-16",
				valueFormat: "MM-dd-yy",
				displayFormat: "dd+MM+yyyy"
			});
		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oDP.focus();
		oDP.$().find("input").val("05+05+1916");
		oDP.onChange();

		// Assert
		assert.equal(oDP.isValidValue(), true, "the value is valid");

		// Cleanup
		oDP.destroy();
	});

	QUnit.test("typing invalid value", function(assert) {
		// Arrange
		var oDP = new DatePicker();
		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oDP.$().find("input").val("96876876786868678");
		oDP.onChange();

		// Assert
		assert.equal(oDP.isValidValue(), false, "the value is not valid");

		// Cleanup
		oDP.destroy();
	});

	QUnit.test("function return correct value when we change maxDate", function(assert) {
		// Arrange
		var oDP = new DatePicker({
				value: "2019-05-05"
			});
		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oDP.setMaxDate(new Date("2019", "04", "04"));

		// Assert
		assert.equal(oDP.isValidValue(), false, "current value is not valid anymore");

		// Cleanup
		oDP.destroy();
	});

	QUnit.test("function return correct value when we change minDate", function(assert) {
		// Arrange
		var oDP = new DatePicker({
				value: "2019-05-05"
			});
		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oDP.setMinDate(new Date("2019", "06", "06"));

		// Assert
		assert.equal(oDP.isValidValue(), false, "current value is not valid anymore");

		// Cleanup
		oDP.destroy();
	});

	QUnit.test("function return correct value when having minDate and set lower date", function(assert) {
		// Arrange
		var oDP = new DatePicker({
				minDate: new Date("2019", "05", "05")
			});
		oDP.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oDP.setValue("2014-08-26");

		// Assert
		assert.equal(oDP.isValidValue(), false, "current value is not valid");

		// Cleanup
		oDP.destroy();
	});

	QUnit.test("function return correct value when we change minDate", function(assert) {
		// Arrange
		var oDP = new DatePicker({
				value: "2019-04-04",
				minDate: new Date("2019", "05", "05")
			});

		// Act
		oDP._checkMinMaxDate();

		// Assert
		assert.equal(oDP.isValidValue(), false, "current value is not valid anymore");

		// Cleanup
		oDP.destroy();
	});

	QUnit.module("Month Button Appearance", {
		beforeEach: function () {
			this.oDP = new DatePicker("SDP", {
				dateValue: new Date(2016, 0, 1)
			}).placeAt("uiArea6");
			sap.ui.getCore().applyChanges();

			// Open date picker
			qutils.triggerEvent("click", "SDP-icon");
		},
		afterEach: function () {
			this.oDP.destroy();
			this.oDP = null;

			this.oStartDate = null;
			this.oEndDate = null;
		},
		/**
		 * Click on a calendar month from the monthPicker
		 * @param {int} iIndex 0..11 zero based index of the month
		 */
		clickOnMonth: function (iIndex) {
			var $Items = jQuery("#SDP-cal--MP").find(".sapUiCalItem"),
				$Target = $Items[iIndex];

			qutils.triggerEvent("mousedown", $Target);
			qutils.triggerEvent("mouseup", $Target);
		},
		assertButtonAppearance: function (fnDone) {
			var oHeader = this.oDP._oCalendar.getAggregation("header");
			// We use 200 ms timeout here to place the test on a safe place on the event loop queue
			// to catch all the ui updates happening with multiple delayed calls.
			setTimeout(function () {
				assert.strictEqual(oHeader.getVisibleButton1(), true, "Month button is visible again after the Month Picker closing");
				fnDone();
			}, 200);
		}
	});

	QUnit.test("Changing month using the month picker", function (assert) {
		var fnDone = assert.async();

		// Act
		var that = this;
		setTimeout(function () {
			var oHeader = that.oDP._oCalendar.getAggregation("header");

			assert.equal(oHeader.getVisibleButton1(), true, "Month button is visible before the Month Picker opening");

			// Open month picker
			qutils.triggerEvent("click", "SDP-cal--Head-B1");

			assert.equal(oHeader.getVisibleButton1(), false, "Month button is hidden after the Month Picker opening");

			// Click on March
			that.clickOnMonth(2);

			// Assert
			that.assertButtonAppearance(fnDone);

		}, 0);

	});


});