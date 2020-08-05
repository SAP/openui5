/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ProgressIndicator",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library",
	"sap/ui/core/Core"
], function(QUnitUtils, createAndAppendDiv, ProgressIndicator, jQuery, coreLibrary, Core) {
	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

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
	Core.applyChanges();

	//deferment

	jQuery(document).ready(function() {

	});

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
		Core.applyChanges();

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
	});

	//test of overwritten method setPercentValue()
	QUnit.test("setPercentValue min and max value", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			percentValue: 10
		});

		oProgIndicator.placeAt("qunit-fixture");
		Core.applyChanges();

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
		Core.applyChanges();
		$progressIndicator = oProgressIndicator.$();

		aTestCases.forEach(function (oTestCase){
			fnTestForClassesToValuesMapping(oTestCase.value, oTestCase.expectedClass);
		});

		oProgressIndicator.destroy();
	});

	QUnit.test("setPercentValue to not valid type of values", function(assert) {
		var oProgressIndicator = new ProgressIndicator({percentValue: 0});

		oProgressIndicator.placeAt("qunit-fixture");
		Core.applyChanges();

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

	QUnit.test("text should not be rendered when displayValue is not set", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			percentValue: 50
		});

		oProgIndicator.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(oProgIndicator.$().find(".sapMPITextLeft").text(), "", "no text is rendered");
		assert.strictEqual(oProgIndicator.$().find(".sapMPITextRight").text(), "", "no text is rendered");

		oProgIndicator.destroy();
	});

	QUnit.test("Display-Only progress indicator", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			displayOnly: true
		});

		oProgIndicator.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIDisplayOnly"), true, "should have class 'sapMPIDisplayOnly'");

		oProgIndicator.setDisplayOnly(false);
		Core.applyChanges();

		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIDisplayOnly"), false, "class 'sapMPIDisplayOnly' should be removed");

		oProgIndicator.destroy();
	});

	QUnit.test("ARIA attributes should be present", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			percentValue: 50
		});

		oProgIndicator.placeAt("qunit-fixture");
		Core.applyChanges();

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
		Core.applyChanges();

		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuenow")), 50, "aria-valuenow should equal 50");
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50%", "aria-valuetext should be 50%");

		oProgIndicator.setPercentValue(15);
		Core.applyChanges();
		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuenow")), 15, "aria-valuenow should equal 15");
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "15%", "aria-valuetext should be 15%");

		oProgIndicator.setPercentValue(95);
		Core.applyChanges();
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
		Core.applyChanges();

		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50/100", "aria-valuetext should be '50/100'");

		oProgIndicator.setDisplayValue("65/100");
		Core.applyChanges();
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "65/100", "aria-valuetext should be '65/100'");

		oProgIndicator.destroy();
	});

	QUnit.test("ARIA valuetext should contain information about the state", function(assert) {
		var oProgIndicator = new ProgressIndicator({
			percentValue: 50,
			state: ValueState.Success
		});

		oProgIndicator.placeAt("qunit-fixture");
		Core.applyChanges();

		var stateText = oProgIndicator._getStateText();
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50% " + stateText, "aria-valuetext should be '50% " + stateText + "'");

		oProgIndicator.setState(ValueState.Error);
		Core.applyChanges();
		stateText = oProgIndicator._getStateText();
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50% " + stateText, "aria-valuetext should be '50% " + stateText + "'");

		oProgIndicator.setState(ValueState.Warning);
		Core.applyChanges();
		stateText = oProgIndicator._getStateText();
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50% " + stateText, "aria-valuetext should be '50% " + stateText + "'");

		oProgIndicator.setState(ValueState.Information);
		Core.applyChanges();
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
		Core.applyChanges();

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
		assert.strictEqual(oInfo.type, Core.getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_PROGRESS"), "Type");
		assert.strictEqual(oInfo.description, Core.getLibraryResourceBundle("sap.m").getText("ACC_CTR_STATE_PROGRESS", [50]), "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");
		oControl.setPercentValue(10);
		oControl.setEnabled(false);
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, Core.getLibraryResourceBundle("sap.m").getText("ACC_CTR_STATE_PROGRESS", [10]), "Description");
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

	QUnit.test("Animation is displayed when displayAnimation is true", function(assert) {
		// Arrange
		var oProgressIndicator = new ProgressIndicator(),
			iExpectedAnimationDuration = 2000, // the default one
			oSpy = this.spy(jQuery.fn, "animate");

		// Act
		oProgressIndicator.placeAt("content");
		Core.applyChanges();
		oProgressIndicator.setPercentValue(100);

		// Assert
		assert.ok(oSpy.calledOnce, "jQuery's animate method is called only once");
		assert.strictEqual(oSpy.args[0][1], iExpectedAnimationDuration,
			"jQuery's animate method's second argument is " + iExpectedAnimationDuration +
			" milliseconds (default animation) as expected");

		// Clean up
		oSpy.reset();
		oProgressIndicator.destroy();
	});

	QUnit.test("Animation is not displayed when displayAnimation is false", function(assert) {
		// Arrange
		var oProgressIndicator = new ProgressIndicator({
				displayAnimation: false
			}),
			iExpectedAnimationDuration = 0,
			oSpy = this.spy(jQuery.fn, "animate");

		// Act
		oProgressIndicator.placeAt("content");
		Core.applyChanges();
		oProgressIndicator.setPercentValue(100);

		// Assert
		assert.ok(oSpy.calledOnce, "jQuery's animate method is called only once");
		assert.strictEqual(oSpy.args[0][1], iExpectedAnimationDuration,
			"jQuery's animate method's second argument is " + iExpectedAnimationDuration +
			" milliseconds (no animation) as expected");

		// Clean up
		oSpy.reset();
		oProgressIndicator.destroy();
	});
});