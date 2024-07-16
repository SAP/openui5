/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ProgressIndicator",
	"sap/m/Page",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library",
	"sap/ui/core/ControlBehavior"
], function(Library, createAndAppendDiv, ProgressIndicator, Page, nextUIUpdate, jQuery, coreLibrary, ControlBehavior) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var POPOVER_WAIT_TIME = 500;

	createAndAppendDiv("content");


	var oProgInd = new ProgressIndicator("pi1", {
		width : "50%",
		percentValue : 30,
		displayValue : "display 30%"
	});
	oProgInd.placeAt("content");

	var oProgInd2 = new ProgressIndicator("pi2", {
		width : "50%",
		percentValue : 70,
		displayValue : "display 10%",
		showValue : false
	});
	oProgInd2.placeAt("content");

	var oProgInd3 = new ProgressIndicator("pi3", {
		width : "50%",
		percentValue : 30,
		displayValue : "display 30 %",
		textDirection: "RTL"
	});

	oProgInd3.placeAt("content");

	var oProgInd4 = new ProgressIndicator("pi4", {
		width : "50%",
		percentValue : 30,
		displayValue : "display 30 %",
		textDirection: "LTR"
	});

	oProgInd4.placeAt("content");
	nextUIUpdate.runSync()/*fake timer is used in module*/;

	QUnit.module("");

	//basic rendering
	QUnit.test("basic rendering", function(assert) {
		var oDomRefPI = document.getElementById("pi1");
		assert.equal(oDomRefPI.style.width, "50%", "control width should be the same");
		var oDomRefPIRemainingBar = document.getElementById("pi1" + "-remainingBar");
		assert.ok(oDomRefPIRemainingBar, "the remaining bar  is rendered");
	});

	QUnit.test("tooltip", function(assert) {
		var sTooltipText = "Some tooltip";
		var oProgressIndicator = new ProgressIndicator({
			percentValue: 50,
			width: "100%",
			tooltip: sTooltipText
		});

		oProgressIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oProgressIndicator.$().attr("title"), sTooltipText, "Tooltip is in the DOM");

		sTooltipText = undefined;
		oProgressIndicator.destroy();
	});

	QUnit.test("percentValue greater half", function(assert) {
		assert.equal(jQuery("#pi1").hasClass("sapMPIValueGreaterHalf"), false, "css-class sapMPIValueGreaterHalf should not be set");
		assert.equal(jQuery("#pi2").hasClass("sapMPIValueGreaterHalf"), true, "css-class sapMPIValueGreaterHalf should be set");
	});

	QUnit.test("showValue", function(assert) {
		assert.equal(jQuery("#pi1").hasClass("sapMPIValueGreaterHalf"), false, "css-class sapMPIValueGreaterHalf should not be set");
		assert.equal(jQuery("#pi2").hasClass("sapMPIValueGreaterHalf"), true, "css-class sapMPIValueGreaterHalf should be set");

		var sDomRefPIText2Left = document.getElementById("pi2-textLeft").firstChild;
		var sDomRefPIText2Right = document.getElementById("pi2-textRight").firstChild;
		assert.equal(sDomRefPIText2Left, null, "textValue should not be shown");
		assert.equal(sDomRefPIText2Right, null, "textValue should not be shown");

		assert.strictEqual(oProgInd.$().hasClass("sapMPINoValue"), false, "ProgressIndicator with showValue=true does not have class sapMPINoValue");
		assert.strictEqual(oProgInd2.$().hasClass("sapMPINoValue"), true, "ProgressIndicator with showValue=false has class sapMPINoValue");
	});

	//test of overwritten method setPercentValue()
	QUnit.test("setPercentValue min and max value", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			percentValue: 10
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oProgIndicator.setPercentValue(0);
		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIValueMin"), true, "sapMPIValueMin class added");
		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIValueMax"), false, "sapMPIValueMax not added");

		oProgIndicator.setPercentValue(100);
		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIValueMin"), false, "sapMPIValueMin removed");
		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIValueMax"), true, "sapMPIValueMax added");

		oProgIndicator.destroy();
	});

	QUnit.test("setPercentValue wrong input (int out of range, too big)", function(assert) {
		var iPercentTest = 120;
		oProgInd.setPercentValue(iPercentTest);
		var iPercentAfter = oProgInd.getPercentValue();
		assert.equal(iPercentAfter, 100, "the value should be set to the mximum one");
	});

	QUnit.test("setPercentValue wrong input (int out of range, too small)", function(assert) {
		var iPercentTest = -20;
		oProgInd.setPercentValue(iPercentTest);
		var iPercentAfter = oProgInd.getPercentValue();
		assert.equal(iPercentAfter, 0, "the value should be set to the minimum one");
	});


	QUnit.test("setPercentValue to various values", function(assert) {
		var oProgressIndicator = new ProgressIndicator({
			percentValue: 0
		}),
		$progressIndicator,
		aTestCases = [
			{value: 100, expectedClass: "sapMPIValueMax"},
			{value: 99, expectedClass: "sapMPIValueNormal"},
			{value: 99.9952, expectedClass: "sapMPIValueNormal"},
			{value: 70, expectedClass: "sapMPIValueNormal"},
			{value: 1, expectedClass: "sapMPIValueNormal"},
			{value: 0.1, expectedClass: "sapMPIValueNormal"},
			{value: 0.255, expectedClass: "sapMPIValueNormal"},
			{value: 101, expectedClass: "sapMPIValueMax"},
			{value: 0, expectedClass: "sapMPIValueMin"},
			{value: -1, expectedClass: "sapMPIValueMin"},
			{value: null, expectedClass: "sapMPIValueMin"}, // null is normalized to 0 by the framework
			{value: undefined, expectedClass: "sapMPIValueMin"} // null is normalized to 0 by the framework
		],
		fnTestForClassesToValuesMapping = function (fPercentValueToSet, sExpectedClass){
			oProgressIndicator.setPercentValue(fPercentValueToSet);
			assert.ok($progressIndicator.hasClass(sExpectedClass),
					"the progress indicator has the correct class: " + sExpectedClass + " for " + fPercentValueToSet + "%");
		};

		oProgressIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		$progressIndicator = oProgressIndicator.$();

		aTestCases.forEach(function (oTestCase){
			fnTestForClassesToValuesMapping(oTestCase.value, oTestCase.expectedClass);
		});

		oProgressIndicator.destroy();
	});

	QUnit.test("setPercentValue to not valid type of values", function(assert) {
		var oProgressIndicator = new ProgressIndicator({percentValue: 0});

		oProgressIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oProgressIndicator.setPercentValue("11");
		assert.strictEqual(oProgressIndicator.getPercentValue(), 11, "Percent value should be cast correctly to the number 11.");

		oProgressIndicator.setPercentValue("110");
		assert.strictEqual(oProgressIndicator.getPercentValue(), 100, "Value greater than 100 should be set to 100.");

		oProgressIndicator.setPercentValue("-10");
		assert.strictEqual(oProgressIndicator.getPercentValue(), 0, "Value lower than 0 should be set to 0.");

		oProgressIndicator.setPercentValue(50);
		oProgressIndicator.setPercentValue("invalid");
		assert.strictEqual(oProgressIndicator.getPercentValue(), 50, "Invalid value should not be set. Previous valid value should be maintained.");

		oProgressIndicator.destroy();
	});

	QUnit.test("setPercentValue when not rendered (removed and then added back to parent's aggregation)", function(assert) {
		// Arrange
		var oProgressIndicator = new ProgressIndicator({
			percentValue: 1
		}),
		oPage = new Page({
			content: [ oProgressIndicator ]
		});

		oPage.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act - set percentValue to 0 and remove it from parent's aggregation
		oProgressIndicator.setPercentValue(0);
		oPage.removeContent(oProgressIndicator);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act - set percentValue to 5 and add it again to the parent's aggregation
		oProgressIndicator.setPercentValue(5);
		oPage.addContent(oProgressIndicator);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.notOk(oProgressIndicator.$().hasClass("sapMPIValueMin"),
			"ProgressIndicator does not have 'sapMPIValueMin' class, when percentValue is greater than 0");

		// Clean up
		oPage.destroy();
	});


	QUnit.test("text should not be rendered when displayValue is not set", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			percentValue: 50
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oProgIndicator.$().find(".sapMPITextLeft").text(), "", "no text is rendered");
		assert.strictEqual(oProgIndicator.$().find(".sapMPITextRight").text(), "", "no text is rendered");

		oProgIndicator.destroy();
	});

	QUnit.test("Display-Only progress indicator", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			displayOnly: true
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIDisplayOnly"), true, "should have class 'sapMPIDisplayOnly'");

		oProgIndicator.setDisplayOnly(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIDisplayOnly"), false, "class 'sapMPIDisplayOnly' should be removed");

		oProgIndicator.destroy();
	});

	QUnit.test("ARIA attributes should be present", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			percentValue: 50
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuemin")), 0, "aria-valuemin should equal 0");
		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuenow")), 50, "aria-valuenow should equal 50");
		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuemax")), 100, "aria-valuemax should equal 100");
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50%", "aria-valuetext should be 50%");

		oProgIndicator.destroy();
	});

	QUnit.test("ARIA attributes should change when percent value changes", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			percentValue: 50
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuenow")), 50, "aria-valuenow should equal 50");
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50%", "aria-valuetext should be 50%");

		oProgIndicator.setPercentValue(15);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuenow")), 15, "aria-valuenow should equal 15");
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "15%", "aria-valuetext should be 15%");

		oProgIndicator.setPercentValue(95);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuenow")), 95, "aria-valuenow should equal 95");
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "95%", "aria-valuetext should be 95%");

		oProgIndicator.destroy();
	});

	QUnit.test("ARIA attributes should change when display value changes", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			percentValue: 50,
			displayValue: "50/100"
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50/100", "aria-valuetext should be '50/100'");

		oProgIndicator.setDisplayValue("65/100");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "65/100", "aria-valuetext should be '65/100'");

		oProgIndicator.destroy();
	});

	QUnit.test("ARIA valuetext should contain information about the state", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			percentValue: 50,
			state: ValueState.Success
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var stateText = oProgIndicator._getStateText();
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50% " + stateText, "aria-valuetext should be '50% " + stateText + "'");

		oProgIndicator.setState(ValueState.Error);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		stateText = oProgIndicator._getStateText();
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50% " + stateText, "aria-valuetext should be '50% " + stateText + "'");

		oProgIndicator.setState(ValueState.Warning);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		stateText = oProgIndicator._getStateText();
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50% " + stateText, "aria-valuetext should be '50% " + stateText + "'");

		oProgIndicator.setState(ValueState.Information);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		stateText = oProgIndicator._getStateText();
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50% " + stateText, "aria-valuetext should be '50% " + stateText + "'");

		oProgIndicator.destroy();
	});

	QUnit.test("ARIA labelledBy and describedBy are set", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			ariaLabelledBy: "id1",
			ariaDescribedBy: "id2"
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oProgIndicator.$().attr("aria-labelledby"), "id1", "aria-labelledby is set correctly");
		assert.strictEqual(oProgIndicator.$().attr("aria-describedby"), "id2", "aria-describedby is set correctly");

		oProgIndicator.destroy();
	});

	QUnit.test("explicitly setting textDirection to RTL should override the global setting", function(assert) {
		var $TestSubject = jQuery("#pi3").find("span");
		var sDirAttribute = $TestSubject.attr("dir");
		assert.equal(sDirAttribute, 'rtl', "the attribute 'dir' should have it's value set to rtl");
	});

	QUnit.test("explicitly setting textDirection to LTR should override the global setting", function(assert) {
		var $TestSubject = jQuery("#pi4").find("span");
		var sDirAttribute = $TestSubject.attr("dir");
		assert.equal(sDirAttribute, 'ltr', "the attribute 'dir' should have it's value set to ltr");
	});

	QUnit.test("not setting textDirection should not change the global text direction", function(assert) {
		var $TestSubject = jQuery("#pi1").find("span");
		var sDirAttribute = $TestSubject.attr("dir");
		assert.equal(sDirAttribute, undefined, "the attribute 'dir' should not exist");
	});

	QUnit.test("explicitly setting textDirection to RTL should result in 'dir' attribute added", function(assert) {
		var $TestSubject = jQuery("#pi3").find("span");
		var sDirAttribute = $TestSubject.attr("dir");
		var bDirAttributeExists = sDirAttribute !== null && sDirAttribute !== undefined;
		assert.equal(bDirAttributeExists, true, "the attribute 'dir' should exist");
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oControl = new ProgressIndicator({percentValue: 50}),
			sDisplayValue = "Display value";
		assert.ok(!!oControl.getAccessibilityInfo, "ProgressIndicator has a getAccessibilityInfo function");
		var oInfo = oControl.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, "progressbar", "AriaRole");
		assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_PROGRESS"), "Type");
		assert.strictEqual(oInfo.description, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_STATE_PROGRESS", [50]), "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");
		oControl.setPercentValue(10);
		oControl.setEnabled(false);
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_STATE_PROGRESS", [10]), "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		oControl.setDisplayValue(sDisplayValue);
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, sDisplayValue, "Description should equal the displayValue when set");
		oControl.destroy();
	});

	QUnit.test("displayAnimation property", function(assert) {
		// Arrange
		var oProgressIndicator = new ProgressIndicator();

		// Assert
		assert.ok(oProgressIndicator.getDisplayAnimation(), "DisplayAnimation is with correct default value");

		// Act
		oProgressIndicator.setDisplayAnimation(false);

		// Assert
		assert.notOk(oProgressIndicator.getDisplayAnimation(), "DisplayAnimation value is successfully changed");

		// Clean up
		oProgressIndicator.destroy();
	});

	QUnit.test("CSS animation properties are applied when displayAnimation is true", function(assert) {
		// Arrange
		var oProgressIndicator = new ProgressIndicator(),
			oBarDomRef;

		// Act
		oProgressIndicator.placeAt("content");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oProgressIndicator.setPercentValue(100);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oBarDomRef = oProgressIndicator.getDomRef().querySelector(".sapMPIBar");

		// Assert
		assert.strictEqual(oBarDomRef.style.transitionProperty, "flex-basis", "The bar's transition-property is set to 'flex-basis'");
		assert.strictEqual(oBarDomRef.style.transitionDuration, "2000ms", "The bar's transition-duration is set to '2000ms'");
		assert.strictEqual(oBarDomRef.style.transitionTimingFunction, "linear", "The bar's transition-timing-function is set to 'linear'");

		// Clean up
		oProgressIndicator.destroy();
	});

	QUnit.test("CSS animation properties are not applied when displayAnimation is false", function(assert) {
		// Arrange
		var oProgressIndicator = new ProgressIndicator({
				displayAnimation: false
			}),
			oBarDomRef;

		// Act
		oProgressIndicator.placeAt("content");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oProgressIndicator.setPercentValue(100);

		oBarDomRef = oProgressIndicator.getDomRef().querySelector(".sapMPIBar");

		// Assert
		assert.notOk(oBarDomRef.style.transitionProperty, "The bar's transition-property is not set");
		assert.notOk(oBarDomRef.style.transitionDuration, "The bar's transition-duration is not set");
		assert.notOk(oBarDomRef.style.transitionTimingFunction, "The bar's transition-timing-function is not set");

		// Clean up
		oProgressIndicator.destroy();
	});

	QUnit.test("CSS animation properties are not applied when Configuration.AnimationMode is 'none'", function(assert) {
		// Arrange
		var oProgressIndicator = new ProgressIndicator(),
			oStub = sinon.stub(ControlBehavior, "getAnimationMode").returns("none"),
			oBarDomRef;

		// Act
		oProgressIndicator.placeAt("content");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oProgressIndicator.setPercentValue(100);

		oBarDomRef = oProgressIndicator.getDomRef().querySelector(".sapMPIBar");

		// Assert
		assert.notOk(oBarDomRef.style.transitionProperty, "The bar's transition-property is not set");
		assert.notOk(oBarDomRef.style.transitionDuration, "The bar's transition-duration is not set");
		assert.notOk(oBarDomRef.style.transitionTimingFunction, "The bar's transition-timing-function is not set");

		// Clean up
		oProgressIndicator.destroy();
		oStub.restore();
	});

	/* --------------------------- ProgressIndicator Popover -------------------------------------- */

	QUnit.module("ProgressIndicator - Popover ", {
		beforeEach: function () {
			this.oPI = new ProgressIndicator({
				width : "30%",
				percentValue : 30,
				displayValue : "Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Long Value"
			});
			this.oPIPopover = this.oPI._getPopover();
			this.oPI.placeAt("qunit-fixture");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oPI.destroy();
			this.oPI = null;
		}
	});

	QUnit.test("Popover behavior when UX requirements are met", function (assert) {
		// Arrange
		var done = assert.async();
		assert.expect(3);

		this.oPIPopover.attachAfterOpen(function(){
			// Assert
			assert.ok(this.oPIPopover.isOpen(), "Popover is opened when the Progress Indicator is pressed.");

			this.oPIPopover.attachAfterClose(function(){
				// Assert
				assert.notOk(this.oPIPopover.isOpen(), "Popover is closed when the Progress Indicator is pressed.");
				done();
			}, this);

			// Act
			this.oPI.ontap();
			this.clock.tick(POPOVER_WAIT_TIME);
		}, this);

		// Assert
		assert.ok(this.oPI._isHoverable(), "Popover is hoverable.");

		// Act
		this.oPI.ontap();
		this.clock.tick(POPOVER_WAIT_TIME);
	});

	QUnit.test("Popover behavior when UX requirements are not met (displayValue is not truncated)", function (assert) {
		// Act
		this.oPI.setDisplayValue(".");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.oPI.ontap();
		this.clock.tick(POPOVER_WAIT_TIME);

		// Assert
		assert.notOk(this.oPIPopover.isOpen(), "Popover is not opened when the Progress Indicator is pressed.");
		assert.notOk(this.oPI._isHoverable(), "Popover is not hoverable.");
	});

	QUnit.test("Popover behavior when UX requirements are not met (no displayValue)", function (assert) {
		// Act
		this.oPI.setDisplayValue("");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.oPI.ontap();
		this.clock.tick(POPOVER_WAIT_TIME);

		// Assert
		assert.notOk(this.oPIPopover.isOpen(), "Popover is not opened when the Progress Indicator is pressed.");
		assert.notOk(this.oPI._isHoverable(), "Popover is not hoverable.");
	});

	QUnit.test("Popover close icon/button behavior", function (assert) {
		// Arrange
		var done = assert.async();
		assert.expect(1);

		this.oPIPopover.attachAfterOpen(function(){
			this.oPIPopover.attachAfterClose(function(){
				// Assert
				assert.notOk(this.oPIPopover.isOpen(), "Popover is closed when its close icon/button is pressed.");
				done();
			}, this);

			// Act
			this.oPI._onPopoverCloseIconPress();
			this.clock.tick(POPOVER_WAIT_TIME);
		}, this);

		// Act
		this.oPI.ontap();
		this.clock.tick(POPOVER_WAIT_TIME);
	});

	QUnit.test("Popover text behavior", function (assert) {
		// Assert
		assert.strictEqual(this.oPI.getDisplayValue(), this.oPI._oPopoverText.getText(),
			"The text inside the popover is initially equal with the displayValue text of the ProgressIndicator.");

		// Act
		this.oPI.setDisplayValue("Test");

		// Assert
		assert.strictEqual(this.oPI.getDisplayValue(), this.oPI._oPopoverText.getText(),
			"The text inside the popover is synced with the displayValue text after updating the displayValue property of the ProgressIndicator.");
	});

	QUnit.module("Value state");
		QUnit.test("enabled set to false", function(assert) {
			// system under test
			var oProgInd = new ProgressIndicator({
				width: "50%",
				percentValue : 30,
				enabled: false,
				state: ValueState.Error
			}),
			oProgIndBar = document.getElementsByClassName("sapMPIBar");

			// act
			oProgInd.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.notOk(jQuery(oProgIndBar).hasClass("sapMPIBarNegative"));

			// act
			oProgInd.setEnabled(true);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// assert
			assert.ok(jQuery(oProgIndBar).hasClass("sapMPIBarNegative"));

			// cleanup
			oProgInd.destroy();

		});

});