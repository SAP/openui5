/*global QUnit */
sap.ui.define([
	"sap/m/SimpleFixFlex",
	"sap/m/SimpleFixFlexRenderer",
	"sap/m/Text"
], function(SimpleFixFlex, SimpleFixFlexRenderer, Text) {
	"use strict";

	var oCore = sap.ui.getCore();

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
		this.oSimpleFixFlex.addFlexContent(new sap.m.Button({ text: "test"}));
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
});
