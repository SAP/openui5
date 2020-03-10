/*global QUnit sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/layout/FixFlex',
	'sap/m/Button',
	'sap/m/Label'
], function(
	jQuery,
	FixFlex,
	Button,
	Label) {
	'use strict';

	/* =========================================================== */
	/* Initialize module                                           */
	/* =========================================================== */

	QUnit.module("Init");

	QUnit.test("Initial Check", function (assert) {
		// Arrange
		var oButton1 = new Button();
		var oButton2 = new Button();
		var oButton3 = new Button();

		// System under Test
		var oFixFlex = new FixFlex({
			flexContent: oButton1,
			fixContent: [oButton2, oButton3]
		});

		// Act
		var s1 = sap.ui.getCore().byId(oFixFlex.getId());

		// Assert
		assert.ok((s1 !== undefined) && (s1 != null), "FixFlex should be found");

		// Cleanup
		oFixFlex.destroy();
	});

	/* =========================================================== */
	/* Render module                                               */
	/* =========================================================== */

	QUnit.module("Render");

	QUnit.test("Check if fix/flex content is rendered", function (assert) {
		// Arrange
		var oButton1 = new Button(), oButton2 = new Button(), oButton3 = new Button();

		// System under Test
		var oFixFlex = new FixFlex({
			flexContent: oButton1,
			fixContent: [oButton2, oButton3]
		});

		oFixFlex.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oFixFlex.$().hasClass("sapUiFixFlex"), "FixFlex should be rendered");
		assert.ok(jQuery(oFixFlex.$().children()[0]).hasClass("sapUiFixFlexFixed"), "Fixed container should be rendered");
		assert.ok(jQuery(oFixFlex.$().children()[1]).hasClass("sapUiFixFlexFlexible"), "Flex container should be rendered");
		assert.ok(oButton1.$().hasClass("sapMBtn"), "Button should be rendered");
		assert.ok(oButton2.$().hasClass("sapMBtn"), "Button should be rendered");
		assert.ok(oButton3.$().hasClass("sapMBtn"), "Button should be rendered");

		// Cleanup
		oFixFlex.destroy();
	});

	/* =========================================================== */
	/* API module                                                  */
	/* =========================================================== */

	QUnit.module("API");

	QUnit.test("Test child order", function (assert) {
		// Arrange
		var oButton1 = new Button(), oButton2 = new Button(), oButton3 = new Button();

		// System under test
		var oFixFlex = new FixFlex({
			flexContent: oButton1,
			fixContent: [oButton2, oButton3]
		});

		oFixFlex.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oFixFlex.setFixFirst(false);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(jQuery(oFixFlex.$().children()[0]).hasClass("sapUiFixFlexFlexible"), "Flex container should be the first child");

		// Cleanup
		oFixFlex.destroy();
	});

	QUnit.test("Test layout direction", function (assert) {
		// Arrange
		var oButton1 = new Button(), oButton2 = new Button(), oButton3 = new Button();

		// System under test
		var oFixFlex = new FixFlex({
			flexContent: oButton1,
			fixContent: [oButton2, oButton3]
		});

		oFixFlex.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oFixFlex.setVertical(false);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(jQuery(oFixFlex.$()).hasClass("sapUiFixFlexRow"), "The layout direction should be horizontal (row)");

		// Cleanup
		oFixFlex.destroy();
	});

	QUnit.test("Legacy support with vertical layout", function (assert) {
		var $FixChild,
			$FlexChild,
			iFixChildWidth,
			iFixChildHeight,
			iFlexChildWidth,
			iFlexChildHeight;

		// Arrange
		var oButton1 = new Button(), oButton2 = new Button(), oButton3 = new Button();

		// System under test
		var oFixFlex = new FixFlex({
			flexContent: oButton1,
			fixContent: [oButton2, oButton3]
		});

		oFixFlex.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		$FixChild = oFixFlex.$("Fixed");
		$FlexChild = oFixFlex.$("Flexible");

		iFixChildWidth = $FixChild.outerWidth();
		iFixChildHeight = $FixChild.outerHeight();
		iFlexChildWidth = $FlexChild.outerWidth();
		iFlexChildHeight = $FlexChild.outerHeight();

		// Act
		oFixFlex._handlerResizeNoFlexBoxSupport();
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(iFixChildWidth, $FixChild.outerWidth(), "Width is not changed");
		assert.strictEqual(iFixChildHeight, $FixChild.outerHeight(), "Height is not changed");
		assert.strictEqual(iFlexChildWidth, $FlexChild.outerWidth(), "Width is not changed");
		assert.strictEqual(iFlexChildHeight, $FlexChild.outerHeight(), "Height is not changed");

		// Cleanup
		oFixFlex.destroy();
	});

	QUnit.test("Legacy support with horizontal layout", function (assert) {
		var $FixChild,
			$FlexChild,
			iFixChildWidth,
			iFixChildHeight,
			iFlexChildWidth,
			iFlexChildHeight;

		// Arrange
		var oButton1 = new Button(), oButton2 = new Button(), oButton3 = new Button();

		// System under test
		var oFixFlex = new FixFlex({
			flexContent: oButton1,
			fixContent: [oButton2, oButton3],
			vertical: false
		});

		oFixFlex.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		$FixChild = oFixFlex.$("Fixed");
		$FlexChild = oFixFlex.$("Flexible");

		iFixChildWidth = $FixChild.outerWidth();
		iFixChildHeight = $FixChild.outerHeight();
		iFlexChildWidth = $FlexChild.outerWidth();
		iFlexChildHeight = $FlexChild.outerHeight();

		// Act
		oFixFlex._handlerResizeNoFlexBoxSupport();
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(iFixChildWidth, $FixChild.outerWidth(), "Width is not changed");
		assert.strictEqual(iFixChildHeight, $FixChild.outerHeight(), "Height is not changed");
		assert.strictEqual(iFlexChildWidth, $FlexChild.outerWidth(), "Width is not changed");
		assert.strictEqual(iFlexChildHeight, $FlexChild.outerHeight(), "Height is not changed");

		// Cleanup
		oFixFlex.destroy();
	});

	QUnit.test("Flexible part Scrolling", function (assert) {
		var oFlexLabel = new Label({
				text: "Loooong text. Loooong text. Loooong text. Loooong text. Loooong text. Loooong text. Loooong text. Loooong text."
			}),
			oFixLabel = new Label({text: "Ninja!"});

		var oFixFlex = new FixFlex({
			flexContent: oFlexLabel,
			fixContent: [oFixLabel]
		});

		oFixFlex.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var $flexible = oFixFlex.$().find('.sapUiFixFlexFlexible');
		assert.equal($flexible.css('overflow'), 'hidden', 'Overflow is hidden.');

		oFixFlex.setMinFlexSize(100);
		sap.ui.getCore().applyChanges();

		// Assert
		$flexible = oFixFlex.$().find('.sapUiFixFlexFlexible');
		assert.equal($flexible.css('overflow-x'), 'auto', 'Overflow x is auto.');
		assert.equal($flexible.css('overflow-y'), 'auto', 'Overflow y is auto.');

		// Cleanup
		oFixFlex.destroy();
	});

	QUnit.test("Flexible part Scrolling with minFlexSize", function (assert) {
		var oFlexLabel = new Label({
				text: "Loooong text. Loooong text. Loooong text. Loooong text. Loooong text. Loooong text. Loooong text. Loooong text."
			}),
			oFixLabel = new Label({text: "Ninja!"});

		var oFixFlex = new FixFlex({
			flexContent: oFlexLabel,
			fixContent: [oFixLabel],
			minFlexSize: 1000
		});

		// Act
		oFixFlex.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oFixFlex.$().hasClass("sapUiFixFlexScrolling"), "'sapUiFixFlexScrolling' class should be added to the FixFlex.");
		assert.notOk(oFixFlex.$().hasClass("sapUiFixFlexInnerScrolling"), "'sapUiFixFlexInnerScrolling' class should be removed from the FixFlex.");

		// Cleanup
		oFixFlex.destroy();
	});
});
