/*global QUnit */
sap.ui.define([
	"sap/f/cards/util/addTooltipIfTruncated",
	"sap/m/Text",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(addTooltipIfTruncated, Text, QUnitUtils, nextUIUpdate) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	const sLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum congue libero ut blandit faucibus. Phasellus sed urna id tortor consequat accumsan eget at leo. Cras quis arcu magna.";

	QUnit.module("sap/f/cards/util/addTooltipIfTruncated");

	QUnit.test("Text truncate on single line", async function(assert) {
		// Arrange
		const oText = new Text({
			text: sLongText,
			wrapping: false,
			width: "100px"
		}).placeAt(DOM_RENDER_LOCATION);

		addTooltipIfTruncated(oText);
		await nextUIUpdate();

		// Act
		const oDomRef = oText.getDomRef();
		QUnitUtils.triggerMouseEvent(oDomRef, "mouseover");

		// Assert
		assert.strictEqual(oDomRef.title, sLongText, "Title is added on mouseover");

		// Clean up
		oText.destroy();
	});

	QUnit.test("Text truncate on multiple lines", async function(assert) {
		// Arrange
		const oText = new Text({
			text: sLongText,
			maxLines: 3,
			width: "100px"
		}).placeAt(DOM_RENDER_LOCATION);

		addTooltipIfTruncated(oText);
		await nextUIUpdate();

		// Act
		const oDomRefInner = oText.getDomRef("inner");
		QUnitUtils.triggerMouseEvent(oDomRefInner, "mouseover");

		// Assert
		assert.strictEqual(oDomRefInner.title, sLongText, "Title is added on mouseover");

		// Clean up
		oText.destroy();
	});

	QUnit.test("Text without truncation", async function(assert) {
		// Arrange
		const oText = new Text({
			text: "Test",
			width: "100px"
		}).placeAt(DOM_RENDER_LOCATION);

		addTooltipIfTruncated(oText);
		await nextUIUpdate();

		// Act
		const oDomRef = oText.getDomRef();
		QUnitUtils.triggerMouseEvent(oDomRef, "mouseover");

		// Assert
		assert.notOk(oDomRef.title, "There is no tooltip if text is not truncated");

		// Clean up
		oText.destroy();
	});

	QUnit.test("Text with existing tooltip", async function(assert) {
		// Arrange
		const oText = new Text({
			text: sLongText,
			tooltip: "Test tooltip",
			wrapping: false,
			width: "100px"
		}).placeAt(DOM_RENDER_LOCATION);

		addTooltipIfTruncated(oText);
		await nextUIUpdate();

		// Act
		const oDomRef = oText.getDomRef();
		QUnitUtils.triggerMouseEvent(oDomRef, "mouseover");

		// Assert
		assert.strictEqual(oDomRef.title, "Test tooltip", "The original tooltip is used");

		// Clean up
		oText.destroy();
	});
});
