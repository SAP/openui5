/*global QUnit */
sap.ui.define([
	"sap/m/SimpleFixFlex",
	"sap/m/Button",
	"sap/m/Text",
	"sap/base/Log",
	"sap/ui/core/Core"
], function(SimpleFixFlex, Button, Text, Log, oCore) {
	"use strict";

	/* --------------------------- SimpleFixFlex API ---------------------------------- */
	QUnit.module("SimpleFixFlex: Default properties values",{
		beforeEach: function() {
			this.oSimpleFixFlex = new SimpleFixFlex();
		},
		afterEach: function() {
			this.oSimpleFixFlex.destroy();
			this.oSimpleFixFlex = null;
		}
	});

	QUnit.test("Default value of design", function(assert) {
		assert.strictEqual(this.oSimpleFixFlex.getProperty("fitParent"), true,
			"The default value for the 'fitParent' property is 'true'.");
	});

	/* --------------------------- SimpleFixFlex Rendering ---------------------------------- */
	QUnit.module("SimpleFixFlex: Zero configuration rendering");

	QUnit.test("SimpleFixFlex should be rendered when zero configuration is passed", function (assert) {
		var oSimpleFixFlex = new SimpleFixFlex().placeAt("qunit-fixture");
		oCore.applyChanges();

		assert.ok(oSimpleFixFlex.getDomRef(), "SimpleFixFlex should be rendered.");
		assert.ok(oSimpleFixFlex.getDomRef("flexContentContainer"), "The flex content container was rendered with id.");

		oSimpleFixFlex.destroy();
	});

	QUnit.test("Warning is logged when FixContent's text exceeds recommended characters", function(assert) {

		// Arrange
		var fnErrorSpy = this.spy(Log, "warning"),
			oSimpleFixFlex = new SimpleFixFlex().placeAt("qunit-fixture"),
			sSimpleFixFlexId = oSimpleFixFlex.getId(),
			iFixContentTextLength;

		// Act
		oCore.applyChanges();

		// Assert
		assert.strictEqual(fnErrorSpy.callCount, 0, "No warning logged for unset text.");

		// Act
		oSimpleFixFlex.setFixContent(new Text({text: "Really short text."}));
		oCore.applyChanges();

		// Arrange
		iFixContentTextLength = oSimpleFixFlex.getFixContent().getText().length;

		// Assert
		assert.ok(iFixContentTextLength < SimpleFixFlex.FIX_AREA_CHARACTER_COUNT_RECOMMENDATION,
				"FixContent's text is less than recommended maximum. No warning needed.");
		assert.strictEqual(fnErrorSpy.callCount, 0, "No warning logged for short text.");

		// Act
		oSimpleFixFlex.setFixContent(new Text({text: "Really long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long  text."}));
		oCore.applyChanges();

		// Arrange
		iFixContentTextLength = oSimpleFixFlex.getFixContent().getText().length;

		// Assert
		assert.ok(iFixContentTextLength > SimpleFixFlex.FIX_AREA_CHARACTER_COUNT_RECOMMENDATION,
				"FixContent's text is more than recommended maximum. Warning is required.");
		assert.ok(fnErrorSpy.calledOnce, "Warning logged once.");
		assert.ok(fnErrorSpy.calledWithExactly(SimpleFixFlex.FIX_AREA_CHARACTERS_ABOVE_RECOMMENDED_WARNING, "", sSimpleFixFlexId),
				"The text of the logged warning is the correct one: '" +
				SimpleFixFlex.FIX_AREA_CHARACTERS_ABOVE_RECOMMENDED_WARNING +
				"' for our SimpleFixFlex instance with ID: '" + sSimpleFixFlexId + "'.");

		// Clean up
		oSimpleFixFlex.destroy();
	});

	QUnit.module("SimpleFixFlex: Rendering", {
		beforeEach: function() {

			// Arrange
			this.oSimpleFixFlex = new SimpleFixFlex({
				id: "simpleFixFlex",
				fixContent: new Text({
					text: "This is a Level 1 explanation. This will contain links and emphasized text in the future"
				}),
				flexContent: new Text({
					text: "This is the flex content."
				})
			});

			// Act
			this.oSimpleFixFlex.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function() {

			// Clean up
			this.oSimpleFixFlex.destroy();
			this.oSimpleFixFlex = null;
		}
	});

	QUnit.test("Fix/Flex content is rendered", function(assert) {

		// Assert
		assert.ok(this.oSimpleFixFlex.$().hasClass("sapUiSimpleFixFlex"),
						"SimpleFixFlex should be rendered.");
		assert.ok(this.oSimpleFixFlex.getFixContent().$().hasClass("sapUiSimpleFixFlexFixed"),
						"FixContent should be rendered.");

		// Act
		this.oSimpleFixFlex.addFlexContent(new Button({ text: "test"}));
		oCore.applyChanges();

		this.oSimpleFixFlex.getFlexContent().forEach(function (oControl) {

			// Assert
			assert.ok(oControl.getDomRef().parentNode.classList.contains("sapUiSimpleFixFlexFlexContent"),
					"The FlexContent aggregation " + oControl.getMetadata().getName() +
					" is rendered inside the FlexContent wrapper div.");
		});
	});

	QUnit.test("FixContent wraps when 'fitParent' is 'true'", function(assert) {

		// Assert
		assert.strictEqual(this.oSimpleFixFlex.$().css("padding-top"),
							this.oSimpleFixFlex.getFixContent().$().outerHeight() + "px",
							"SimpleFixFlex should have the correct padding-top.");
		assert.ok(this.oSimpleFixFlex.getFixContent().$().hasClass("sapUiSimpleFixFlexFixedWrap"),
						"FixContent should wrap.");
	});

	QUnit.test("FixContent does not wrap when 'fitParent' is 'false'", function(assert) {

		// Arrange
		this.oSimpleFixFlex.setFitParent(false);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.oSimpleFixFlex.$().css("padding-top"), "0px",
							"SimpleFixFlex should have the correct padding-top.");
		assert.notOk(this.oSimpleFixFlex.getFixContent().$().hasClass("sapUiSimpleFixFlexFixedWrap"),
						"FixContent should not wrap.");
	});

	QUnit.test("SimpleFixFlex control should not throw error when there is no FixedContent and _onFixContentResize is called", function(assert) {

		// Arrange
		var oSpy = new this.spy(this.oSimpleFixFlex, "_onFixContentResize");

		// Act
		this.oSimpleFixFlex.getFixContent().setVisible(false);
		oCore.applyChanges();

		try {
			oSpy.apply(this.oSimpleFixFlex);
		} catch (e) {
			// pass through here in case of thrown error
		}

		// Assert
		assert.strictEqual(oSpy.threw(), false, "The method didn't threw an error.");
	});

	QUnit.test("SimpleFixFlex control should not throw error when the DOM element doesn't have clientHeight and _onFixContentResize is called", function (assert) {
		// Arrange
		var vResult;
		this.stub(this.oSimpleFixFlex, "getFixContent").callsFake(function () {
			return {
				$: function () {
					return {
						get: function () {
							return {};
						}
					};
				}
			};
		});

		// Act
		vResult = this.oSimpleFixFlex._onFixContentResize();

		// Assert
		assert.strictEqual(vResult, null, "The result of the method should be null, because the DOM element doesn't have clientHeight");
	});
});
