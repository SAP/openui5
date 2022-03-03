/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Log, coreLibrary, Helper, opaTest) {
	"use strict";

	/* global opaSkip */

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var oComponentOptions = { // options to start UI component in each Opa test
			componentConfig : {name : "sap.ui.core.internal.samples.odata.twoFields"}
		};

	Helper.qUnitModule("sap.ui.core.internal.samples.twoFields");

	// uncomment this to write the full test results to the browser console
	// QUnit.on("runEnd", function (oDetails) {
	// 	Log.info(JSON.stringify(oDetails));
	// });

	//*****************************************************************************
	opaTest("1) Entry of amount (step 1) and currency (step 2) "
			+ "in previously empty input fields (success case)",
		function (Given, When, Then) {
			Given.iStartMyUIComponent(oComponentOptions);

			When.onMainPage.initializeUnit();
			Then.onMainPage.checkUnit("");
			Then.onMainPage.checkValue("");
			When.onMainPage.enterValue("100");
			Then.onMainPage.checkUnit("");
			Then.onMainPage.checkValue("100");
			When.onMainPage.enterUnit("DEG");
			Then.onMainPage.checkUnit("DEG");
			Then.onMainPage.checkValue("100.0", "100");

			When.onMainPage.initializeCurrency();
			Then.onMainPage.checkUnit("");
			Then.onMainPage.checkValue("");
			When.onMainPage.enterValue("100");
			Then.onMainPage.checkUnit("");
			Then.onMainPage.checkValue("100.00", "100");
			When.onMainPage.enterUnit("JPY");
			Then.onMainPage.checkUnit("JPY");
			Then.onMainPage.checkValue("100");
			When.onMainPage.enterUnit("USDN");
			Then.onMainPage.checkUnit("USDN");
			Then.onMainPage.checkValue("100.00000", "100");

			Given.iTeardownMyUIComponent();
		});

	//*****************************************************************************
	opaSkip("2) Entry of amount (step 1) and currency (step 2) "
			+ "in previously empty input fields (error case)",
		function (Given, When, Then) {
			Given.iStartMyUIComponent(oComponentOptions);

			When.onMainPage.initializeCurrency();
			Then.onMainPage.checkUnit("");
			Then.onMainPage.checkValue("");
			When.onMainPage.enterValue("100.1");
			Then.onMainPage.checkUnit("");
			Then.onMainPage.checkValue("100.10", "100.1");
			When.onMainPage.enterUnit("JPY");
			Then.onMainPage.checkUnit("JPY", null, ValueState.Error, "Currency.WithoutDecimals");
			Then.onMainPage.checkValue("100.1", "100.1", ValueState.Error,
				"Currency.WithoutDecimals");

			Given.iTeardownMyUIComponent();
		});

	//*****************************************************************************
	opaSkip("3) Currency is already available, the user enters an invalid amount.",
		function (Given, When, Then) {
			Given.iStartMyUIComponent(oComponentOptions);

			When.onMainPage.initializeCurrency(undefined, {content : "JPY"});
			Then.onMainPage.checkUnit("JPY");
			Then.onMainPage.checkValue("");
			When.onMainPage.enterValue("100.1");
			Then.onMainPage.checkUnit("JPY", "JPY", ValueState.Error, "EnterInt");
			Then.onMainPage.checkValue("100.1", null, ValueState.Error, "EnterInt");

			Given.iTeardownMyUIComponent();
		});

	//*****************************************************************************
	opaTest("4) Currency is already available, the user enters a valid amount.",
		function (Given, When, Then) {
			Given.iStartMyUIComponent(oComponentOptions);

			When.onMainPage.initializeCurrency(undefined, {content : "JPY"});
			Then.onMainPage.checkUnit("JPY");
			Then.onMainPage.checkValue("");
			When.onMainPage.enterValue("100");
			Then.onMainPage.checkUnit("JPY");
			Then.onMainPage.checkValue("100");

			Given.iTeardownMyUIComponent();
		});

	//*****************************************************************************
["editable", "enabled"].forEach(function (sProperty) {
	opaSkip("5) Currency is available, the field is not " + sProperty
			+ ". The user enters an invalid amount.",
		function (Given, When, Then) {
			var oCurrency = {content : "JPY"};

			Given.iStartMyUIComponent(oComponentOptions);

			oCurrency[sProperty] = false;
			When.onMainPage.initializeCurrency(undefined, oCurrency);
			Then.onMainPage.checkUnit("JPY");
			Then.onMainPage.checkValue("");
			When.onMainPage.enterValue("100.1");
			// disabled/readonly fields also get an error value state but do not show it
			Then.onMainPage.checkUnit("JPY", "JPY", ValueState.Error, "EnterInt");
			//FIXME validation message text is wrong, if one field does not accept input
			Then.onMainPage.checkValue("100.1", null, ValueState.Error, "EnterInt");

			Given.iTeardownMyUIComponent();
		});
});

	//*****************************************************************************
["editable", "enabled"].forEach(function (sProperty) {
	opaSkip("6) Amount is in a not " + sProperty
			+ " field, currency is changed so that the amount has too many decimal places",
		function (Given, When, Then) {
			var oValue = {content : "100.1"};

			Given.iStartMyUIComponent(oComponentOptions);

			oValue[sProperty] = false;
			When.onMainPage.initializeCurrency(oValue, {content : "EUR"});
			Then.onMainPage.checkUnit("EUR");
			Then.onMainPage.checkValue("100.10", "100.1");
			When.onMainPage.enterUnit("JPY");
			//FIXME validation message text is wrong, if one field does not accept input
			Then.onMainPage.checkUnit("JPY", "EUR", ValueState.Error, "Currency.WithoutDecimals");
			// disabled/readonly fields also get an error value state but cannot show it
			Then.onMainPage.checkValue("100.1", "100.1", ValueState.Error,
				"Currency.WithoutDecimals");

			Given.iTeardownMyUIComponent();
		});
});

	//*****************************************************************************
	opaTest("7) Entry of amount (step 1) and new currency (step 2) with "
			+ "previously available currency (success case)",
		function (Given, When, Then) {
			Given.iStartMyUIComponent(oComponentOptions);

			When.onMainPage.initializeCurrency(undefined, {content : "EUR"});
			Then.onMainPage.checkUnit("EUR");
			Then.onMainPage.checkValue("");
			When.onMainPage.enterValue("100");
			Then.onMainPage.checkUnit("EUR");
			Then.onMainPage.checkValue("100.00", "100");
			When.onMainPage.enterUnit("JPY");
			Then.onMainPage.checkUnit("JPY");
			Then.onMainPage.checkValue("100");

			Given.iTeardownMyUIComponent();
		});

	//*****************************************************************************
	opaSkip("8) Entry of amount (step 1) and new currency (step 2) with "
			+ "previously available currency (error case)",
		function (Given, When, Then) {
			Given.iStartMyUIComponent(oComponentOptions);

			When.onMainPage.initializeCurrency(undefined, {content : "EUR"});
			Then.onMainPage.checkUnit("EUR");
			Then.onMainPage.checkValue("");
			When.onMainPage.enterValue("100.1");
			Then.onMainPage.checkUnit("EUR");
			Then.onMainPage.checkValue("100.10", "100.1");
			When.onMainPage.enterUnit("JPY");
			Then.onMainPage.checkUnit("JPY", "EUR", ValueState.Error, "Currency.WithoutDecimals");
			Then.onMainPage.checkValue("100.1", "100.1", ValueState.Error,
				"Currency.WithoutDecimals");

			Given.iTeardownMyUIComponent();
		});

	//*****************************************************************************
	opaTest("9) The backend sends an invalid quantity: No error is shown",
		function (Given, When, Then) {
			Given.iStartMyUIComponent(oComponentOptions);

			When.onMainPage.initializeUnit({content : "1.54"}, {content : "KG"});
			Then.onMainPage.checkUnit("KG");
			Then.onMainPage.checkValue("1.54");

			Given.iTeardownMyUIComponent();
		});

	// additional tests not specified in CPOUI5MODELS-6

	//*****************************************************************************
	opaTest("10) Entry of an invalid unit",
		function (Given, When, Then) {
			Given.iStartMyUIComponent(oComponentOptions);

			When.onMainPage.initializeCurrency({content : "1.23"}, {content : "EUR"});
			Then.onMainPage.checkUnit("EUR");
			Then.onMainPage.checkValue("1.23");
			When.onMainPage.enterUnit("WRONG");
			Then.onMainPage.checkUnit("WRONG", "EUR", ValueState.Error, "Currency.InvalidMeasure");
			Then.onMainPage.checkValue("1.23");

			Given.iTeardownMyUIComponent();
		});

	//*****************************************************************************
	opaSkip("11) Invalid currency amount can be fixed by changing to a valid matching currency",
		function (Given, When, Then) {
			Given.iStartMyUIComponent(oComponentOptions);

			When.onMainPage.initializeCurrency({content : "1"}, {content : "JPY"});
			Then.onMainPage.checkUnit("JPY");
			Then.onMainPage.checkValue("1");
			When.onMainPage.enterValue("2.34");
			Then.onMainPage.checkUnit("JPY", "JPY", ValueState.Error, "EnterInt");
			Then.onMainPage.checkValue("2.34", "1", ValueState.Error, "EnterInt");
			When.onMainPage.enterUnit("EUR");
			Then.onMainPage.checkUnit("EUR");
			Then.onMainPage.checkValue("2.34");

			Given.iTeardownMyUIComponent();
		});

	//*****************************************************************************
	opaTest("12) Invalid value at one part only shown at that part",
		function (Given, When, Then) {
			Given.iStartMyUIComponent(oComponentOptions);

			When.onMainPage.initializeCurrency(undefined, {content : "EUR"});
			Then.onMainPage.checkUnit("EUR");
			Then.onMainPage.checkValue("");
			When.onMainPage.enterValue("-1");
			Then.onMainPage.checkUnit("EUR", "EUR");
			Then.onMainPage.checkValue("-1", null, ValueState.Error, "EnterNumberMin", ["0"]);
			When.onMainPage.enterValue("5");
			Then.onMainPage.checkValue("5.00", "5");
			Then.onMainPage.checkUnit("EUR");

			Given.iTeardownMyUIComponent();
		});

	//*****************************************************************************
	opaSkip("13) Changing a non parsable value to a value that leads to a ValidateException on both"
			+ " parts leads to both parts highlighted",
		function (Given, When, Then) {
			Given.iStartMyUIComponent(oComponentOptions);

			When.onMainPage.initializeUnit({content : "2.1"}, {content : "M/L"});
			Then.onMainPage.checkValue("2.100", "2.1");
			Then.onMainPage.checkUnit("M/L");
			When.onMainPage.enterUnit("XYZ");
			Then.onMainPage.checkValue("2.1");
			Then.onMainPage.checkUnit("XYZ", "M/L", ValueState.Error, "Unit.InvalidMeasure");
			When.onMainPage.enterUnit("KG");
			Then.onMainPage.checkUnit("KG", "M/L", ValueState.Error, "Unit.WithoutDecimals");
			Then.onMainPage.checkValue("2.1", "2.1", ValueState.Error, "Unit.WithoutDecimals");
			When.onMainPage.enterValue("2");
			Then.onMainPage.checkValue("2");
			Then.onMainPage.checkUnit("KG");

			Given.iTeardownMyUIComponent();
		});

	//*****************************************************************************
	// See <git>/c/openui5/+/5118252/12#message-53acb6cf_747a89d3
	opaSkip("14) Changing to a different valid value after entering a non-parsable unit must keep"
			+ " the illegal unit. Correction to the unit writes both value and unit to the model."
			+ " The same applies when changing roles of value and unit.",
		function (Given, When, Then) {
			Given.iStartMyUIComponent(oComponentOptions);

			When.onMainPage.initializeUnit({content : "2"}, {content : "KG"});
			Then.onMainPage.checkUnit("KG");
			Then.onMainPage.checkValue("2");
			// not parsable unit
			When.onMainPage.enterUnit("XYZ");
			Then.onMainPage.checkValue("2");
			//TODO text should be "Enter a valid unit"
			Then.onMainPage.checkUnit("XYZ", "KG", ValueState.Error, "Unit.InvalidMeasure");
			When.onMainPage.enterValue("3");
			//TODO new error message text required for this special case, e.g.
			// "Enter a valid unit to change the number"
			Then.onMainPage.checkValue("3", "2", ValueState.Error, "Unit.Invalid");
			Then.onMainPage.checkUnit("XYZ", "KG", ValueState.Error, "Unit.Invalid");
			// A correction to the unit must write *both* value and unit to the model
			When.onMainPage.enterUnit("DEG");
			Then.onMainPage.checkValue("3.0", "3");
			Then.onMainPage.checkUnit("DEG");
			// not parsable value
			When.onMainPage.enterValue("ABC");
			Then.onMainPage.checkValue("ABC", "3", ValueState.Error, "EnterNumber");
			Then.onMainPage.checkUnit("DEG");
			When.onMainPage.enterUnit("M/L");
			//TODO new error message text required for this special case!
			Then.onMainPage.checkValue("ABC", "3", ValueState.Error, "EnterNumber");
			//TODO new error message text required for this special case, e.g.
			// "Enter a valid number to change the unit"
			Then.onMainPage.checkUnit("M/L", "DEG", ValueState.Error, "Unit.Invalid");
			When.onMainPage.enterValue("4.1");
			Then.onMainPage.checkValue("4.100", "4.1");
			Then.onMainPage.checkUnit("M/L");

			Given.iTeardownMyUIComponent();
		});
});