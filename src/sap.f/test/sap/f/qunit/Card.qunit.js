/*global QUnit, sinon */

sap.ui.define([
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/f/cards/NumericHeader",
	"sap/m/BadgeCustomData",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery"
],
function (
	Card,
	CardHeader,
	CardNumericHeader,
	BadgeCustomData,
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

	QUnit.test("Numeric Header indicator truncation", function (assert) {

		// Arrange
		var sSampleNumber = "1234567812345678",
			oHeader = new CardNumericHeader({
				number: sSampleNumber
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert

		assert.strictEqual(oHeader.$("mainIndicator-value-inner").html().length, sSampleNumber.length, "The numeric content is not truncated");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Numeric Header unitOfMeasurement truncation", function (assert) {

		// Arrange
		var oHeader = new CardNumericHeader({
				subTitle: "Lorem",
				unitOfMeasurement: "EUR EUR EUR"
			}),
			oCard = new Card({
				width: "300px",
				header: oHeader
			}),
			iWidth;

		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		iWidth = oHeader.$("unitOfMeasurement").width();

		// Act - set long subtitle so that there is no place for unitOfMeasurement
		oHeader.setSubtitle("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a libero nec risus egestas lacinia nec ac metus.");
		Core.applyChanges();
		this.clock.tick(400);

		// Assert
		assert.strictEqual(oHeader.$("unitOfMeasurement").width(), iWidth, "The unitOfMeasurement is not truncated");

		// Clean up
		oCard.destroy();
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

	QUnit.module("Badge");

	QUnit.test("Rendering", function (assert) {

		// Arrange
		var oCard = createCard(CardHeader);

		oCard.addCustomData(new BadgeCustomData({value: 10}));
		Core.applyChanges();

		// Assert
		assert.strictEqual(oCard.$().find(".sapMBadgeIndicator").attr("data-badge"), "10", "Badge indicator is correctly rendered");

		oCard.destroy();
	});

	QUnit.test("Auto hide", function (assert) {

		// Arrange
		var oCard = createCard(CardHeader);

		oCard.addCustomData(new BadgeCustomData({value: 10}));
		Core.applyChanges();

		oCard.focus();

		// Assert
		assert.ok(oCard.$().find(".sapMBadgeIndicator").attr("data-badge"), "Badge indicator is rendered");

		this.clock.tick(4000);

		assert.equal(oCard._isBadgeAttached, false, "Badge indicator is not rendered");

		oCard.destroy();
	});
});