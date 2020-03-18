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

	function createCard(HeaderType) {
		var oCard = new Card("somecard", {
			tooltip: 'Some tooltip',
			header: new HeaderType({ title: "Title" }),
			content: new sap.m.Text({ text: "Text" })
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		return oCard;
	}

	QUnit.module("Init");

	QUnit.test("Initialization", function (assert) {

		// Arrange
		var oCard = createCard(CardHeader);

		// Assert
		assert.ok(oCard.getDomRef(), "The card is rendered");
		assert.ok(oCard.getHeader().getDomRef(), "Card header should be rendered.");
		assert.ok(oCard.getContent().getDomRef(), "Card content should be rendered.");
		assert.strictEqual(oCard.$().attr('title'), "Some tooltip", "Tooltip is rendered");

		oCard.destroy();
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

		oCard.destroy();
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

	QUnit.module("Headers ACC roles");

	QUnit.test("Header", function (assert) {

		// Arrange
		var oCard = createCard(CardHeader);

		var $header = oCard.getHeader().$();
		assert.strictEqual($header.attr("role"), "heading" , "Header role is correct.");
		assert.notOk($header.hasClass("sapFCardClickable"), "sapFCardClickable class is not set");

		oCard.getHeader().attachPress(function () { });
		oCard.invalidate();

		Core.applyChanges();

		$header = oCard.getHeader().$();
		assert.strictEqual($header.attr("role"), "button" , "Header role is correct.");
		assert.ok($header.hasClass("sapFCardClickable"), "sapFCardClickable class is set");

		oCard.destroy();
	});

	QUnit.test("Numeric Header", function (assert) {

		// Arrange
		var oCard = createCard(CardNumericHeader);

		var $header = oCard.getHeader().$();
		assert.strictEqual($header.attr("role"), "heading" , "Header role is correct.");
		assert.notOk($header.hasClass("sapFCardClickable"), "sapFCardClickable class is not set");

		oCard.getHeader().attachPress(function () { });
		oCard.invalidate();

		Core.applyChanges();

		$header = oCard.getHeader().$();
		assert.strictEqual($header.attr("role"), "button" , "Header role is correct.");
		assert.ok($header.hasClass("sapFCardClickable"), "sapFCardClickable class is set");

		oCard.destroy();
	});
});