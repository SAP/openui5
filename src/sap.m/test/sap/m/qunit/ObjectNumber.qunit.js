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
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Library, createAndAppendDiv, ObjectNumber, jQuery, coreLibrary, Device, Version, Label, Panel, Text, mobileLibrary, nextUIUpdate) {
	"use strict";

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextDirection
	var EmptyIndicatorMode = mobileLibrary.EmptyIndicatorMode;

	// shortcut for library resource bundle
	var oRb = Library.getResourceBundleFor("sap.m");

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
});