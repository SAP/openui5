/*global QUnit */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ObjectNumber",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/base/util/Version",
	"sap/m/Label",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/model/json/JSONModel"
], function(Library, createAndAppendDiv, ObjectNumber, jQuery, coreLibrary, Device, Version, Label, Panel, Text, mobileLibrary, nextUIUpdate, JSONModel) {
	"use strict";

	// shortcut for sap.ui.core.TextAlign
	const TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	const TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.EmptyIndicatorMode
	const EmptyIndicatorMode = mobileLibrary.EmptyIndicatorMode;

	// shortcut for sap.m.ReactiveAreaMode
	const ReactiveAreaMode = mobileLibrary.ReactiveAreaMode;

	// shortcut for sap.m.ObjectNumberDisplayMode
	const ObjectNumberDisplayMode = mobileLibrary.ObjectNumberDisplayMode;

	// shortcut for library resource bundle
	const oRb = Library.getResourceBundleFor("sap.m");

	createAndAppendDiv("content");


	QUnit.test("Should render ObjectNumber with unit", async function(assert) {
		//Arrange
		var sNumber = "5",
			sUnit = "Euro",
			sut = new ObjectNumber("on1", {
				number: sNumber,
				unit: sUnit
			});

		//Act
		sut.placeAt("content");
		await nextUIUpdate();

		//Assert
		assert.equal(jQuery(".sapMObjectNumberText:contains(" + sNumber + ")").length,1,"Number should be rendered");
		assert.equal(jQuery(".sapMObjectNumberUnit:contains(" + sUnit + ")").length,1,"Unit should be redndered");

		var $ontxt = jQuery("#on1").find(".sapMObjectNumberText");
		var sFontWeight = $ontxt.css("font-weight");
		assert.equal((sFontWeight === "bold" || sFontWeight === "700"), true, "font weight should be bold by default"); // IE and FF return "700" while chrome returns "bold"

		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should not render unit element when Unit is empty", async function(assert) {
		// Arrange
		var oObjectNumber = new ObjectNumber("onUnit", {
			number: 256
		});

		oObjectNumber.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(jQuery("#onUnit").find(".sapMObjectNumberUnit").length, 0, "No unit span is rendered when the Unit is null.");

		oObjectNumber.setUnit("");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(jQuery("#onUnit").find(".sapMObjectNumberUnit").length, 0, "No unit span is rendered when the Unit is empty string.");

		// Clean up
		oObjectNumber.destroy();
	});

	QUnit.test("Non-emphasized ObjectNumber", async function(assert) {
		//Arrange
		var sNumber = "5",
			sUnit = "Euro",
			sut = new ObjectNumber("on2", {
				number: sNumber,
				unit: sUnit,
				emphasized: false
			});

		//Act
		sut.placeAt("content");
		await nextUIUpdate();

		//Assert
		var $ontxt = jQuery("#on2").find(".sapMObjectNumberText");
		var expected = Device.browser.webkit ? "normal" : "400";
		// check if the jQuery version is lower than 1.10 then use "normal" will be set as font-weigt
		// from jQuery 1.10 jQuery converts the font-weight of "normal" into 400
		expected = Version(jQuery.fn.jquery).compareTo("1.10") > 0 ? "400" : expected;
		assert.equal($ontxt.css("font-weight"), expected, "font weight of non-emphasized ObjectNumber should be " + expected);

		//Cleanup
		sut.destroy();
	});

	QUnit.test("ValueState of ObjectNumber", async function(assert) {
		//Arrange
		var sNumber = "5",
			sUnit = "Euro",
			sut = new ObjectNumber("on3", {
				number: sNumber,
				unit: sUnit
			});

		//Act
		sut.placeAt("content");
		await nextUIUpdate();

		//Assert
		var $ontxt = jQuery("#on3");
		assert.ok($ontxt.hasClass("sapMObjectNumberStatusNone"), "Object Number should be assigned css class 'sapMObjectNumberStatusNone'" );

		var aValueStates = [
			ValueState.Error,
			ValueState.Warning,
			ValueState.Success,
			ValueState.Information,
			ValueState.None];

		for (var i = 0; i < aValueStates.length; i++) {
			sut.setState(aValueStates[i]);
			await nextUIUpdate();
			var sStatusClass = "sapMObjectNumberStatus" + aValueStates[i];
			var $ontxt = jQuery("#on3");
			assert.ok($ontxt.hasClass(sStatusClass), "Object Number should be assigned css class '" + sStatusClass + "'" );
			if (i > 0) {
				//Make sure that the old class got removed
				var sFormerStatusClass = "sapMObjectNumberStatus" + aValueStates[i - 1];
				assert.ok(!$ontxt.hasClass(sFormerStatusClass), "Object Number should not be assigned css class '" + sFormerStatusClass + "' any more." );
			}
		}

		//Cleanup
		sut.destroy();
	});

	QUnit.test("RTL ObjectNumber", async function(assert) {
		//Arrange
		var on4 = new ObjectNumber("on4", {
			number: "1.50",
			unit: "Euro",
			textDirection: TextDirection.LTR,
			textAlign: TextAlign.Begin
		});

		var on5 = new ObjectNumber("on5", {
			number: "1.50",
			unit: "Euro",
			textDirection: TextDirection.LTR,
			textAlign: TextAlign.End
		});

		var on6 = new ObjectNumber("on6", {
			number: "1.50",
			unit: "וְהָיוּ הַדְּבָרִים",
			textDirection: TextDirection.RTL,
			textAlign: TextAlign.Begin
		});

		var on7 = new ObjectNumber("on7", {
			number: "1.50",
			unit: "וְהָיוּ הַדְּבָרִים",
			textDirection: TextDirection.RTL,
			textAlign: TextAlign.End
		});

		var bodyMargin = parseInt(window.getComputedStyle(document.getElementsByTagName('body')[0]).getPropertyValue('margin-left'));

		//Act
		on4.placeAt("content");
		on5.placeAt("content");
		on6.placeAt("content");
		on7.placeAt("content");

		await nextUIUpdate();

		//Assert
		var $onnum = jQuery("#on4").find(".sapMObjectNumberText");
		var $onunit = jQuery("#on4").find(".sapMObjectNumberUnit");

		assert.equal($onnum.offset().left, bodyMargin, "object number is left aligned");
		assert.ok($onunit.offset().left > $onnum.offset().left, "number unit is on the right side of the number.");

		$onnum = jQuery("#on5").find(".sapMObjectNumberText");
		$onunit = jQuery("#on5").find(".sapMObjectNumberUnit");

		assert.ok($onnum.offset().left > 0, "object number is right aligned");
		assert.ok($onunit.offset().left > $onnum.offset().left, "number unit is on the right side of the number.");

		$onnum = jQuery("#on6").find(".sapMObjectNumberText");
		$onunit = jQuery("#on6").find(".sapMObjectNumberUnit");

		assert.ok($onunit.offset().left > 0, "object number is right aligned");
		assert.ok($onunit.offset().left < $onnum.offset().left, "number unit is on the left side of the number.");
		$onnum = jQuery("#on7").find(".sapMObjectNumberText");
		$onunit = jQuery("#on7").find(".sapMObjectNumberUnit");

		assert.equal($onunit.offset().left, bodyMargin, "object number is left aligned");
		assert.ok($onunit.offset().left < $onnum.offset().left, "number unit is on the left side of the number.");

		//Cleanup
		on4.destroy();
		on5.destroy();
		on6.destroy();
		on7.destroy();

	});

	QUnit.test("reactiveAreaMode", async function(assert) {
		// Prepare
		var oObjectNumber = new ObjectNumber({
			number: "123",
			unit: "KG",
			active: true
		});

		oObjectNumber.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.notOk(oObjectNumber.getDomRef().classList.contains("sapMLnkLargeReactiveArea"), "Reactive area class is not added by default");

		// Act
		oObjectNumber.setReactiveAreaMode(ReactiveAreaMode.Overlay);
		await nextUIUpdate();

		// Assert
		assert.ok(oObjectNumber.getDomRef().classList.contains("sapMLnkLargeReactiveArea"), "Reactive area class is added");

		// Clean
		oObjectNumber.destroy();
	});

	QUnit.module("Screen reader support", {
		beforeEach: async function () {
			this.oON = new ObjectNumber("ON", {
				number: 256,
				unit: "EUR",
				emphasized: false
			});
			this.oONStateId = "ON-state";
			this.oONEmphasizedInfoId = "ON-emphasized";
			this.oONRoleDescriptionId = "ON-roledescription";

			this.oON.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oON.destroy();
		}

	});

	QUnit.test("Default ObjectNumber", function (assert) {
		var oStateElement = document.getElementById(this.oONStateId),
			oEmphasizedInfoElement = document.getElementById(this.oONEmphasizedInfoId),
			oControlRef = this.oON.getDomRef();

		assert.notOk(oEmphasizedInfoElement, "Additional SPAN for emphasized information isn't created");
		assert.notOk(oStateElement, "Additional SPAN for the state isn't created");
		assert.strictEqual(oControlRef.getAttribute("role"), null, "Inactive ObjectNumbers don't have a role");
	});

	QUnit.test("Active ObjectNumber", async function (assert) {
		var oLabel = new Label("label", {
				text: "Label",
				labelFor: "ON"
			}),
			oControlRef;

		this.oON.setActive(true);

		oLabel.placeAt("content");
		await nextUIUpdate();

		oControlRef = this.oON.getDomRef();
		assert.strictEqual(oControlRef.getAttribute("role"), "button", "ObjectNumber indicates it's active state");
		assert.strictEqual(oControlRef.getAttribute("aria-labelledby"), "label ON-number ON-unit",
			"ObjectNumber's content information is added in aria-labelledby alongside the label");
		oLabel.destroy();
	});

	QUnit.test("ariaLabelledBy", async function (assert) {
		var oText = new Text("label", {
				text: "Label"
			}),
			oControlRef;

		this.oON.addAriaLabelledBy(oText);

		oText.placeAt("qunit-fixture");
		await nextUIUpdate();

		oControlRef = this.oON.getDomRef();
		assert.strictEqual(oControlRef.getAttribute("aria-describedby"), "label ON-number ON-unit",
			"ObjectNumber's content information is added in aria-describedby alongside the label");
		oText.destroy();
	});


	QUnit.test("ObjectNumber with state (different than 'None')", async function (assert) {
		var sErrorText = Library.getResourceBundleFor("sap.m").getText("OBJECTNUMBER_ARIA_VALUE_STATE_ERROR"),
			oStateElement;

		this.oON.setState(ValueState.Error);
		await nextUIUpdate();

		oStateElement = document.getElementById(this.oONStateId);
		assert.ok(oStateElement, "A SPAN with the state is created");
		assert.ok(oStateElement.classList.contains("sapUiPseudoInvisibleText"), "SPAN is pseudo invisible instead of invisible");
		assert.notOk(oStateElement.getAttribute("aria-hidden"), "There's no aria-hidden attribute on the SPAN");
		assert.strictEqual(oStateElement.innerHTML, sErrorText, "Control has mapped the correct state text");
	});

	QUnit.test("ObjectNumber's Emphasized information", async function (assert) {
		var sEmphasizedText = Library.getResourceBundleFor("sap.m").getText("OBJECTNUMBER_EMPHASIZED"),
			oEmphasizedInfoElement;

		this.oON.setEmphasized(true);
		await nextUIUpdate();

		oEmphasizedInfoElement = document.getElementById(this.oONEmphasizedInfoId);
		assert.ok(oEmphasizedInfoElement, "A SPAN with the emphasized information is created");
		assert.ok(oEmphasizedInfoElement.classList.contains("sapUiPseudoInvisibleText"), "SPAN is pseudo invisible instead of invisible");
		assert.strictEqual(oEmphasizedInfoElement.innerHTML, sEmphasizedText, "Control has mapped the correct text for emphasizing");

		this.oON.setNumber(undefined);
		await nextUIUpdate();
		oEmphasizedInfoElement = document.getElementById(this.oONEmphasizedInfoId);

		assert.notOk(oEmphasizedInfoElement, "Text element for emphasized information is not present");

	});

	QUnit.test("ObjectNumber with only Unit (no number) with EmptyIndicatorMode Off", async function (assert) {
		var oLabel = new Label("label", {
				text: "Label",
				labelFor: "ON"
			}),
			oControlRef;

		oLabel.placeAt("content");
		this.oON.setNumber("");
		await nextUIUpdate();

		oControlRef = this.oON.getDomRef();
		assert.strictEqual(oControlRef.getAttribute("aria-describedby"), "label ON-unit",
			"ObjectNumber's unit information is added in aria-describedby alongside the label when there is no number and EmptyIndicatorMode is Off");
		oLabel.destroy();
	});

	QUnit.test("empty ObjectNumber (without number) with EmptyIndicatorMode On", async function (assert) {
		var oLabel = new Label("label", {
				text: "Label",
				labelFor: "ON"
			}),
			oControlRef;

		oLabel.placeAt("content");
		this.oON.setEmptyIndicatorMode("On");
		this.oON.setNumber("");
		await nextUIUpdate();

		oControlRef = this.oON.getDomRef();
		assert.strictEqual(oControlRef.getAttribute("aria-describedby"), "label",
			"ObjectNumber's content information is not added in aria-describedby alongside the label when there is no number and EmptyIndicatoMode is On");
		oLabel.destroy();
	});

	QUnit.test("ObjectNumber with ariaDescribedBy association", async function (assert) {
		var oDescription = new Text({ text: "Description" }),
			sAriaDescribedByReferences;

		this.oON.addAriaDescribedBy(oDescription);
		await nextUIUpdate();

		sAriaDescribedByReferences = this.oON.getDomRef().getAttribute("aria-describedby");
		assert.strictEqual(sAriaDescribedByReferences, oDescription.getId(), "Description's ID is placed in aria-describedby");
	});

	QUnit.test("getAccessibilityInfo()", function (assert) {
		var oAccInfo = this.oON.getAccessibilityInfo(),
			sExpectedDescription = this.oON.getNumber() + " " + this.oON.getUnit(),
			sErrorText = Library.getResourceBundleFor("sap.m").getText("OBJECTNUMBER_ARIA_VALUE_STATE_ERROR");

		assert.strictEqual(oAccInfo.description, sExpectedDescription, "Description contains just number and unit");

		// Update ObjectNumber's state
		this.oON.setState(ValueState.Error);
		oAccInfo = this.oON.getAccessibilityInfo();
		sExpectedDescription += " " + sErrorText;

		assert.strictEqual(oAccInfo.description, sExpectedDescription, "Description is updated with state's text");
	});

	QUnit.test("getAccessibilityInfo() uses formatter-resolved unit", function(assert) {
		const oModel = new JSONModel({ currency: "EUR" });
		this.oON.setModel(oModel);
		this.oON.bindProperty("unit", { path: "/currency", formatter: function() { return "custom-unit"; } });

		const oAccInfo = this.oON.getAccessibilityInfo();
		assert.ok(oAccInfo.description.includes("custom-unit"),
			"Accessibility description contains the formatter-resolved unit");
	});

	QUnit.module("EmptyIndicator", {
		beforeEach : async function() {
			this.oObjectNumber = new ObjectNumber({
				emptyIndicatorMode: EmptyIndicatorMode.On
			});

			this.oObjectNumberEmptyAuto = new ObjectNumber({
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			});

			this.oObjectNumberEmptyAutoNoClass = new ObjectNumber({
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			});

			this.oPanel = new Panel({
				content: this.oObjectNumberEmptyAuto
			}).addStyleClass("sapMShowEmpty-CTX");

			this.oPanel1 = new Panel({
				content: this.oObjectNumberEmptyAutoNoClass
			});

			this.oObjectNumber.placeAt("content");
			this.oPanel.placeAt("content");
			this.oPanel1.placeAt("content");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oObjectNumber.destroy();
			this.oObjectNumberEmptyAuto.destroy();
			this.oObjectNumberEmptyAutoNoClass.destroy();
			this.oPanel.destroy();
			this.oPanel1.destroy();
		}
	});

	QUnit.test("Indicator should be rendered", function(assert) {
		var oSpan = this.oObjectNumber.getDomRef().children[0].children[0];
		assert.strictEqual(oSpan.firstElementChild.textContent, oRb.getText("EMPTY_INDICATOR"), "Empty indicator is rendered");
		assert.strictEqual(oSpan.firstElementChild.getAttribute("aria-hidden"), "true", "Accessibility attribute is set");
		assert.strictEqual(oSpan.lastElementChild.textContent, oRb.getText("EMPTY_INDICATOR_TEXT"), "Accessibility text is added");
	});

	QUnit.test("Indicator should not be rendered when text is not empty", async function(assert) {
		//Arrange
		this.oObjectNumber.setNumber(12);
		await nextUIUpdate();

		//Assert
		assert.strictEqual(this.oObjectNumber.getDomRef().childNodes[0].textContent, "12", "Empty indicator is not rendered");
	});

	QUnit.test("Indicator should not be rendered when property is set to off", async function(assert) {
		//Arrange
		this.oObjectNumber.setEmptyIndicatorMode(EmptyIndicatorMode.Off);
		await nextUIUpdate();

		//Assert
		assert.strictEqual(this.oObjectNumber.getDomRef().childNodes[0].textContent, "", "Empty indicator is not rendered");
	});

	QUnit.test("Indicator should be rendered, when sapMShowEmpty-CTX is added to parent", function(assert) {
		//Assert
		var oSpan = this.oObjectNumberEmptyAuto.getDomRef().childNodes[0].children[0];
		assert.strictEqual(oSpan.firstElementChild.textContent, oRb.getText("EMPTY_INDICATOR"), "Empty indicator is rendered");
		assert.strictEqual(oSpan.firstElementChild.getAttribute("aria-hidden"), "true", "Accessibility attribute is set");
		assert.strictEqual(oSpan.lastElementChild.textContent, oRb.getText("EMPTY_INDICATOR_TEXT"), "Accessibility text is added");
	});

	QUnit.test("Indicator should not be rendered when text is available", async function(assert) {
		//Arrange
		this.oObjectNumberEmptyAuto.setNumber(12);
		await nextUIUpdate();

		//Assert
		assert.strictEqual(this.oObjectNumberEmptyAuto.getDomRef().childNodes[0].textContent, "12", "Empty indicator is not rendered");
	});

	QUnit.test("Indicator should not be rendered when property is set to off and there is a number", async function(assert) {
		//Arrange
		this.oObjectNumber.setEmptyIndicatorMode(EmptyIndicatorMode.Off);
		this.oObjectNumber.setNumber(12);
		await nextUIUpdate();

		//Assert
		assert.strictEqual(this.oObjectNumber.getDomRef().childNodes[0].textContent, "12", "Empty indicator is not rendered");
	});

	QUnit.module("Display modes", {
		beforeEach: async function() {
			this.oON = new ObjectNumber({ number: "5", unit: "kg" });
			this.oON.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oON.destroy();
		}
	});

	QUnit.test("Unit mode: root CSS class is applied", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Unit);
		await nextUIUpdate();

		assert.ok(this.oON.getDomRef().classList.contains("sapMObjectNumberUnitMode"),
			"sapMObjectNumberUnitMode class is present");
		assert.notOk(this.oON.getDomRef().classList.contains("sapMObjectNumberCurrency"),
			"sapMObjectNumberCurrency class is not present");
	});

	QUnit.test("Unit mode: raw unit string is rendered as-is", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Unit);
		await nextUIUpdate();

		const sUnitText = this.oON.getDomRef().querySelector(".sapMObjectNumberUnit").textContent;
		assert.strictEqual(sUnitText, "kg", "Raw unit string is rendered without figure space prefix");
	});

	QUnit.test("Unit mode: number formatted to maxPrecision decimals", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Unit);
		this.oON.setMaxPrecision(2);
		await nextUIUpdate();

		const sNumberText = this.oON.getDomRef().querySelector(".sapMObjectNumberText").textContent;
		assert.strictEqual(sNumberText, "5.00" + ObjectNumber.FIGURE_SPACE, "Number is formatted to 2 decimal places");
	});

	QUnit.test("Unit mode: no decimal padding when maxPrecision is unset", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Unit);
		await nextUIUpdate();

		const sNumberText = this.oON.getDomRef().querySelector(".sapMObjectNumberText").textContent;
		assert.strictEqual(sNumberText, "5" + ObjectNumber.FIGURE_SPACE, "Number without decimal padding is rendered as-is");
	});

	QUnit.test("Unit mode: useSymbol has no effect", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Unit);
		this.oON.setUseSymbol(true);
		await nextUIUpdate();

		const sUnitText = this.oON.getDomRef().querySelector(".sapMObjectNumberUnit").textContent;
		assert.strictEqual(sUnitText, "kg", "useSymbol is ignored — raw unit string is shown without figure space prefix");
	});

	QUnit.test("Currency mode: sapMObjectNumberCurrency class is applied", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Currency);
		this.oON.setUnit("USD");
		await nextUIUpdate();

		assert.ok(this.oON.getDomRef().classList.contains("sapMObjectNumberCurrency"),
			"sapMObjectNumberCurrency class is present");
		assert.notOk(this.oON.getDomRef().classList.contains("sapMObjectNumberUnitMode"),
			"sapMObjectNumberUnitMode class is not present");
	});

	QUnit.test("Currency mode: useSymbol shows currency symbol", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Currency);
		this.oON.setUnit("USD");
		this.oON.setUseSymbol(true);
		await nextUIUpdate();

		const sUnitText = this.oON.getDomRef().querySelector(".sapMObjectNumberUnit").textContent;
		assert.strictEqual(sUnitText, "$", "USD currency symbol is rendered");
	});

	QUnit.test("Currency mode: useSymbol false shows ISO code", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Currency);
		this.oON.setUnit("USD");
		this.oON.setUseSymbol(false);
		await nextUIUpdate();

		const sUnitText = this.oON.getDomRef().querySelector(".sapMObjectNumberUnit").textContent;
		assert.strictEqual(sUnitText, "USD", "ISO code is shown when useSymbol is false");
	});

	QUnit.test("Currency mode: maxPrecision adds figure-space padding beyond CLDR digits", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Currency);
		this.oON.setUnit("USD"); // CLDR: 2 decimal digits
		this.oON.setMaxPrecision(4); // 2 extra digits → 2 figure spaces appended
		await nextUIUpdate();

		const sNumberText = this.oON.getDomRef().querySelector(".sapMObjectNumberText").textContent;
		const iFigureSpaces = (sNumberText.match(new RegExp(ObjectNumber.FIGURE_SPACE, "g")) || []).length;
		assert.strictEqual(iFigureSpaces, 2, "Two figure spaces are appended for 2 extra reserved digits");
	});

	QUnit.test("Currency mode: maxPrecision unset uses CLDR digits with no extra padding", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Currency);
		this.oON.setUnit("USD"); // CLDR: 2 decimal digits
		await nextUIUpdate();

		const sNumberText = this.oON.getDomRef().querySelector(".sapMObjectNumberText").textContent;
		const iFigureSpaces = (sNumberText.match(new RegExp(ObjectNumber.FIGURE_SPACE, "g")) || []).length;
		assert.strictEqual(iFigureSpaces, 0, "No padding when maxPrecision is not set");
	});

	QUnit.test("Currency mode: '*' unit renders empty number text", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Currency);
		this.oON.setUnit("*");
		await nextUIUpdate();

		const sNumberText = this.oON.getDomRef().querySelector(".sapMObjectNumberText").textContent;
		assert.strictEqual(sNumberText, "", "Number text is empty for '*' currency");
	});

	QUnit.test("Currency mode: unit span is rendered even when no unit is set", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Currency);
		this.oON.setUnit("");
		await nextUIUpdate();

		assert.strictEqual(this.oON.getDomRef().querySelectorAll(".sapMObjectNumberUnit").length, 1,
			"Unit span is rendered in Currency mode when unit is empty");
	});

	QUnit.test("number formatter is respected in Default mode", async function(assert) {
		const oModel = new JSONModel({ value: "5" });
		this.oON.setModel(oModel);
		this.oON.bindProperty("number", { path: "/value", formatter: function(sValue) { return "custom-" + sValue; } });
		await nextUIUpdate();

		assert.strictEqual(this.oON.getDomRef().querySelector(".sapMObjectNumberText").textContent,
			"custom-5 ", "number formatter output is rendered verbatim in Default mode");
	});

	QUnit.test("number formatter is respected in Currency mode", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Currency);
		this.oON.setUnit("USD");
		const oModel = new JSONModel({ value: 1234.5678, unit: "USD" });
		this.oON.setModel(oModel);
		this.oON.bindProperty("number", {
			parts: [{ path: "/value" }, { path: "/unit" }],
			formatter: function() { return "1,234.5678"; }
		});
		await nextUIUpdate();

		assert.strictEqual(this.oON.getDomRef().querySelector(".sapMObjectNumberText").textContent,
			"1,234.5678", "number formatter output is rendered verbatim in Currency mode");
	});

	QUnit.test("number formatter is respected in Unit mode", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Unit);
		const oModel = new JSONModel({ value: 5000 });
		this.oON.setModel(oModel);
		this.oON.bindProperty("number", { path: "/value", formatter: function() { return "5,000.00"; } });
		await nextUIUpdate();

		assert.strictEqual(this.oON.getDomRef().querySelector(".sapMObjectNumberText").textContent,
			"5,000.00" + ObjectNumber.FIGURE_SPACE, "number formatter output is rendered verbatim in Unit mode");
	});

	QUnit.test("number binding without formatter still uses CLDR formatting in Currency mode", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Currency);
		this.oON.setUnit("USD");
		const oModel = new JSONModel({ value: "5" });
		this.oON.setModel(oModel);
		this.oON.bindProperty("number", { path: "/value" });
		await nextUIUpdate();

		const sText = this.oON.getDomRef().querySelector(".sapMObjectNumberText").textContent;
		assert.ok(sText.startsWith("5"), "CLDR-formatted number starts with '5' when no formatter is set");
		assert.ok(sText.includes("."), "CLDR formatting applied decimal separator");
	});

	QUnit.test("unit formatter is respected in Currency mode with useSymbol=true", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Currency);
		this.oON.setUseSymbol(true);
		const oModel = new JSONModel({ currency: "EUR" });
		this.oON.setModel(oModel);
		this.oON.bindProperty("unit", { path: "/currency", formatter: function() { return "€€"; } });
		await nextUIUpdate();

		assert.strictEqual(this.oON.getDomRef().querySelector(".sapMObjectNumberUnit").textContent,
			"€€", "unit formatter output is used directly, CLDR symbol lookup skipped");
	});

	QUnit.test("unit binding without formatter still resolves CLDR symbol in Currency mode with useSymbol=true", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Currency);
		this.oON.setUseSymbol(true);
		const oModel = new JSONModel({ currency: "EUR" });
		this.oON.setModel(oModel);
		this.oON.bindProperty("unit", { path: "/currency" });
		await nextUIUpdate();

		assert.strictEqual(this.oON.getDomRef().querySelector(".sapMObjectNumberUnit").textContent,
			"€", "CLDR symbol '€' is resolved for EUR when no formatter is set");
	});

	QUnit.test("unit formatter with figure-space padding is preserved in Unit mode", async function(assert) {
		this.oON.setDisplayMode(ObjectNumberDisplayMode.Unit);
		const oModel = new JSONModel({ unit: "km" });
		this.oON.setModel(oModel);
		this.oON.bindProperty("unit", { path: "/unit", formatter: function(sUnit) { return "\u2007\u2007" + sUnit; } });
		await nextUIUpdate();

		assert.strictEqual(this.oON.getDomRef().querySelector(".sapMObjectNumberUnit").textContent,
			"\u2007\u2007km", "figure-space padded unit string is preserved verbatim");
	});
});