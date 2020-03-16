/*global QUnit, sinon */

sap.ui.define([
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/f/cards/NumericHeader",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery"
],
function (
	Card,
	CardHeader,
	CardNumericHeader,
	Core,
	jQuery
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Init");

	QUnit.test("Initialization", function (assert) {

		// Arrange
		var oCard = new Card("somecard", {
			tooltip: 'Some tooltip',
			header: new CardHeader({ title: "Title" }),
			content: new sap.m.Text({ text: "Text" })
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.ok(oCard.getDomRef(), "The card is rendered");
		assert.ok(oCard.getHeader().getDomRef(), "Card header should be rendered.");
		assert.ok(oCard.getContent().getDomRef(), "Card content should be rendered.");
		assert.strictEqual(oCard.$().attr('title'), "Some tooltip", "Tooltip is rendered");
	});

	QUnit.module("Headers");

	QUnit.test("Press is fired on sapselect for default header", function (assert) {
		// Arrange
		var oHeader = new CardHeader({ title: "Title" }),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = sinon.stub();

		oHeader.attachPress(fnPressHandler);

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		oHeader.onsapselect(new jQuery.Event("sapselect"));

		// Assert
		assert.ok(fnPressHandler.calledOnce, "The press event is fired on sapselect");
	});

	QUnit.test("Press is fired on sapselect for numeric header", function (assert) {
		// Arrange
		var oHeader = new CardNumericHeader({ title: "Title" }),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = sinon.stub();

		oHeader.attachPress(fnPressHandler);

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		oHeader.onsapselect(new jQuery.Event("sapselect"));

		// Assert
		assert.ok(fnPressHandler.calledOnce, "The press event is fired on sapselect");
	});

});