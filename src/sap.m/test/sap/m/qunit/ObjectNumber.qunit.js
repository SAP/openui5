/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ObjectNumber",
	"jquery.sap.global",
	"sap/ui/core/library"
], function(QUnitUtils, createAndAppendDiv, ObjectNumber, jQuery, coreLibrary) {
	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	createAndAppendDiv("content");



	QUnit.test("ShouldRenderObjectNumber", function(assert) {
		//SUT
		var sNumber = "5",
			sNumberUnit = "Euro",
			sut = new ObjectNumber("on1", {
				number: sNumber,
				numberUnit : sNumberUnit
			});

		//Act
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(jQuery(".sapMObjectNumberText:contains(" + sNumber + ")").length,1,"Number should be there");
		assert.equal(jQuery(".sapMObjectNumberUnit:contains(" + sNumberUnit + ")").length,1,"Number unit should be there");

		$ontxt = jQuery("#on1").find(".sapMObjectNumberText");
		var sFontWeight = $ontxt.css("font-weight");
		assert.equal((sFontWeight === "bold" || sFontWeight === "700"), true, "font weight should be bold by default"); // IE and FF return "700" while chrome returns "bold"

		//Cleanup
		sut.destroy();
	});

	QUnit.test("ShouldRenderUnit", function(assert) {
		//SUT
		var sUnit = "Dollar";
		sut = new ObjectNumber("unit", {
		number: "10",
		unit : sUnit,
		numberUnit: "Euro"
		});

		//Act
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(jQuery(".sapMObjectNumberUnit:contains(" + sUnit + ")").length,1,"unit should be used instead of numberUnit");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should not render unit element when Unit is empty", function(assert) {

		// System under test
		var oObjectNumber = new ObjectNumber("onUnit", {
			number: 256
		});

		oObjectNumber.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(jQuery("#onUnit").find(".sapMObjectNumberUnit").length, 0, "No unit span is rendered when the Unit is null.");

		oObjectNumber.setUnit("");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(jQuery("#onUnit").find(".sapMObjectNumberUnit").length, 0, "No unit span is rendered when the Unit is empty string.");

		// Clean up
		oObjectNumber.destroy();
	});

	QUnit.test("Non-emphasized ObjectNumber", function(assert) {
		//SUT

		var sNumber = "5",
			sNumberUnit = "Euro",
			sut = new ObjectNumber("on2", {
				number: sNumber,
				numberUnit : sNumberUnit,
				emphasized: false
			});

		//Act
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();

		//Assert
		$ontxt = jQuery("#on2").find(".sapMObjectNumberText");
		var expected = jQuery.browser.webkit ? "normal" : "400";
		// check if the jQuery version is lower than 1.10 then use "normal" will be set as font-weigt
		// from jQuery 1.10 jQuery converts the font-weight of "normal" into 400
		expected = jQuery.sap.Version(jQuery.fn.jquery).compareTo("1.10") > 0 ? "400" : expected;
		assert.equal($ontxt.css("font-weight"), expected, "font weight of non-emphasized ObjectNumber should be " + expected);

		//Cleanup
		sut.destroy();
	});

	QUnit.test("ValueState of ObjectNumber", function(assert) {
		//SUT

		var sNumber = "5",
			sNumberUnit = "Euro",
			sut = new ObjectNumber("on3", {
				number: sNumber,
				numberUnit : sNumberUnit
			});

		//Act
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();

		//Assert
		//Check value
		$ontxt = jQuery("#on3");
		assert.ok($ontxt.hasClass("sapMObjectNumberStatusNone"), "Object Number should be assigned css class 'sapMObjectNumberStatusNone'" );

		var aValueStates = [
			ValueState.Error,
			ValueState.Warning,
			ValueState.Success,
			ValueState.Information,
			ValueState.None];

		for (var i = 0; i < aValueStates.length; i++) {
			sut.setState(aValueStates[i]);
			sap.ui.getCore().applyChanges();
			var sStatusClass = "sapMObjectNumberStatus" + aValueStates[i];
			$ontxt = jQuery("#on3");
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

	QUnit.test("RTL ObjectNumber", function(assert) {
		//SUT
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

		//Act
		on4.placeAt("content");
		on5.placeAt("content");
		on6.placeAt("content");
		on7.placeAt("content");

		sap.ui.getCore().applyChanges();

		//Assert
		var $onnum = jQuery("#on4").find(".sapMObjectNumberText");
		var $onunit = jQuery("#on4").find(".sapMObjectNumberUnit");

		assert.equal($onnum.offset().left, 0, "object number is left aligned");
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

		assert.equal($onunit.offset().left, 0, "object number is left aligned");
		assert.ok($onunit.offset().left < $onnum.offset().left, "number unit is on the left side of the number.");

		//Cleanup
		on4.destroy();
		on5.destroy();
		on6.destroy();
		on7.destroy();
	});

	QUnit.module("Screen reader support", {
		beforeEach: function () {
			this.oON = new ObjectNumber("ON", {
				number: 256,
				unit: "EUR",
				emphasized: false
			});
			this.oONStateId = "ON-state";
			this.oONEmphasizedInfoId = "ON-emphasized";

			this.oON.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oON.destroy();
		}

	});

	QUnit.test("Default ObjectNumber", function (assert) {
		var oStateElement = document.getElementById(this.oONStateId),
			oEmphasizedInfoElement = document.getElementById(this.oONEmphasizedInfoId);

		assert.notOk(oEmphasizedInfoElement, "Additional SPAN for emphasized information isn't created");
		assert.notOk(oStateElement, "Additional SPAN for the state isn't created");
	});

	QUnit.test("ObjectNumber with state (different than 'None')", function (assert) {
		var oCore = sap.ui.getCore(),
			sErrorText = oCore.getLibraryResourceBundle("sap.m").getText("OBJECTNUMBER_ARIA_VALUE_STATE_ERROR"),
			oStateElement;

		this.oON.setState(ValueState.Error);
		oCore.applyChanges();

		oStateElement = document.getElementById(this.oONStateId);
		assert.ok(oStateElement, "A SPAN with the state is created");
		assert.ok(oStateElement.classList.contains("sapUiPseudoInvisibleText"), "SPAN is pseudo invisible instead of invisible");
		assert.notOk(oStateElement.getAttribute("aria-hidden"), "There's no aria-hidden attribute on the SPAN");
		assert.strictEqual(oStateElement.innerHTML, sErrorText, "Control has mapped the correct state text");
	});

	QUnit.test("ObjectNumber's Emphasized information", function (assert) {
		var oCore = sap.ui.getCore(),
			sEmphasizedText = oCore.getLibraryResourceBundle("sap.m").getText("OBJECTNUMBER_EMPHASIZED"),
			oEmphasizedInfoElement;

		this.oON.setEmphasized(true);
		oCore.applyChanges();

		oEmphasizedInfoElement = document.getElementById(this.oONEmphasizedInfoId);
		assert.ok(oEmphasizedInfoElement, "A SPAN with the emphasized information is created");
		assert.ok(oEmphasizedInfoElement.classList.contains("sapUiPseudoInvisibleText"), "SPAN is pseudo invisible instead of invisible");
		assert.strictEqual(oEmphasizedInfoElement.innerHTML, sEmphasizedText, "Control has mapped the correct text for emphasizing");
	});

	QUnit.test("ObjectNumber with ariaDescribedBy association", function (assert) {
		var oDescription = new sap.m.Text({ text: "Description" }),
			sAriaDescribedByReferences;

		this.oON.addAriaDescribedBy(oDescription);
		sap.ui.getCore().applyChanges();

		sAriaDescribedByReferences = this.oON.getDomRef().getAttribute("aria-describedby");
		assert.strictEqual(sAriaDescribedByReferences, oDescription.getId(), "Description's ID is placed in aria-describedby");
	});

	QUnit.test("getAccessibilityInfo()", function (assert) {
		var oAccInfo = this.oON.getAccessibilityInfo(),
			sExpectedDescription = this.oON.getNumber() + " " + this.oON.getUnit(),
			sErrorText = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("OBJECTNUMBER_ARIA_VALUE_STATE_ERROR");

		assert.strictEqual(oAccInfo.description, sExpectedDescription, "Description contains just number and unit");

		// Update ObjectNumber's state
		this.oON.setState(ValueState.Error);
		oAccInfo = this.oON.getAccessibilityInfo();
		sExpectedDescription += " " + sErrorText;

		assert.strictEqual(oAccInfo.description, sExpectedDescription, "Description is updated with state's text");
	});
});