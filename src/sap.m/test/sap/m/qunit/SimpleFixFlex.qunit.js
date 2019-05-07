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
			this.oSimpleFixFlex = new SimpleFixFlex({
				id: "simpleFixFlex",
				fixContent: new Text({
					text: "This is a Level 1 explanation. This will contain links and emphasized text in the future"
				}),
				flexContent: new Text({
					text: "This is the flex content."
				})
			});

			this.oSimpleFixFlex.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function() {
			this.oSimpleFixFlex.destroy();
			this.oSimpleFixFlex = null;
		}
	});

	QUnit.test("Fix/Flex content is rendered", function(assert) {

		assert.strictEqual(this.oSimpleFixFlex.$().hasClass("sapUiSimpleFixFlex"), true,
						"SimpleFixFlex should be rendered.");
		assert.strictEqual(this.oSimpleFixFlex.getFixContent().$().hasClass("sapUiSimpleFixFlexFixed"), true,
						"FixContent should be rendered.");
		assert.strictEqual(this.oSimpleFixFlex.getFlexContent().$().hasClass("sapUiSimpleFixFlexFlexContent"), true,
						"FlexContent should be renedered");
	});

	QUnit.test("FixContent wraps when 'fitParent' is 'true'", function(assert) {
		assert.strictEqual(this.oSimpleFixFlex.$().css("padding-top"),
							this.oSimpleFixFlex.getFixContent().$().outerHeight() + "px",
							"SimpleFixFlex should have the correct padding-top.");
		assert.strictEqual(this.oSimpleFixFlex.getFixContent().$().hasClass("sapUiSimpleFixFlexFixedWrap"), true,
						"FixContent should wrap.");
	});

	QUnit.test("FixContent does not wrap when 'fitParent' is 'false'", function(assert) {
		this.oSimpleFixFlex.setFitParent(false);
		oCore.applyChanges();

		assert.strictEqual(this.oSimpleFixFlex.$().css("padding-top"), "0px",
							"SimpleFixFlex should have the correct padding-top.");
		assert.strictEqual(!this.oSimpleFixFlex.getFixContent().$().hasClass("sapUiSimpleFixFlexFixedWrap"), true,
						"FixContent should not wrap.");
	});
});
