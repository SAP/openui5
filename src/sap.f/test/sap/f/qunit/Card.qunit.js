/*global QUnit, sinon */

sap.ui.define([
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/f/cards/NumericHeader",
	"sap/m/BadgeCustomData",
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UniversalDate"
],
function (
	Card,
	CardHeader,
	CardNumericHeader,
	BadgeCustomData,
	mLibrary,
	Core,
	jQuery,
	DateFormat,
	UniversalDate
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";
	var AvatarColor = mLibrary.AvatarColor;

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

	QUnit.test("Default Header avatar default color", function (assert) {
		// Arrange
		var oHeader = new CardHeader({
				iconSrc: "sap-icon://accept"
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert

		assert.strictEqual(oHeader._getAvatar().getBackgroundColor(), AvatarColor.Transparent, "Default background of avatar is 'Transparent'");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Header and NumericHeader dataTimestamp", function (assert) {
		// Arrange
		var oNow = new Date(),
			oNowUniversalDate = new UniversalDate(oNow),
			oDateFormat = DateFormat.getDateTimeInstance({relative: true}),
			sTextNow = oDateFormat.format(oNowUniversalDate),
			sText1Minute,
			oHeader = new CardHeader({
				dataTimestamp: oNow.toISOString()
			}),
			oNumericHeader = new CardNumericHeader({
				dataTimestamp: oNow.toISOString()
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		oNumericHeader.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oHeader.getAggregation("_dataTimestamp").getText(), sTextNow, "DataTimestamp for 'now' is correct for Header");
		assert.strictEqual(oNumericHeader.getAggregation("_dataTimestamp").getText(), sTextNow, "DataTimestamp for 'now' is correct for NumericHeader");

		// Act - wait 1 minute
		this.clock.tick(60100);

		sText1Minute = oDateFormat.format(oNowUniversalDate);

		// Assert
		assert.strictEqual(oHeader.getAggregation("_dataTimestamp").getText(), sText1Minute, "DataTimestamp is updated after 1m for Header");
		assert.strictEqual(oNumericHeader.getAggregation("_dataTimestamp").getText(), sText1Minute, "DataTimestamp is updated after 1m for NumericHeader");

		// Act - set empty timestamp
		oHeader.setDataTimestamp(null);
		oNumericHeader.setDataTimestamp(null);

		// Assert
		assert.notOk(oHeader.getAggregation("_dataTimestamp"), "DataTimestamp is removed for Header");
		assert.notOk(oNumericHeader.getAggregation("_dataTimestamp"), "DataTimestamp is removed for NumericHeader");

		// Clean up
		oHeader.destroy();
		oNumericHeader.destroy();
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

		oCard.addCustomData(new BadgeCustomData({value: "New"}));
		Core.applyChanges();

		var $badgeIndicator = oCard.$().find(".sapMBadgeIndicator");

		// Assert
		assert.strictEqual($badgeIndicator.attr("data-badge"), "New", "Badge indicator is correctly rendered");
		assert.strictEqual($badgeIndicator.attr("aria-label"), "New", "Badge aria-label correctly rendered");
		assert.ok(oCard.getCardHeader().$().attr("aria-labelledby").indexOf($badgeIndicator.attr('id')) > -1, "aria-labelledby contains the badge indicator id");

		oCard.destroy();
	});

	QUnit.test("Auto hide", function (assert) {

		// Arrange
		var oCard = createCard(CardHeader);

		oCard.addCustomData(new BadgeCustomData({value: "New"}));
		Core.applyChanges();

		oCard.focus();

		var $badgeIndicator = oCard.$().find(".sapMBadgeIndicator");

		// Assert
		assert.ok($badgeIndicator.attr("data-badge"), "Badge indicator is rendered");

		this.clock.tick(4000);

		assert.equal(oCard._isBadgeAttached, false, "Badge indicator is not rendered");
		assert.notOk($badgeIndicator.attr("aria-label"), "Badge aria-label is removed");
		assert.ok(oCard.getCardHeader().$().attr("aria-labelledby").indexOf($badgeIndicator.attr('id')) === -1, "aria-labelledby does not contain the badge indicator id");

		oCard.addCustomData(new BadgeCustomData({value: "New"}));
		Core.applyChanges();

		$badgeIndicator = oCard.$().find(".sapMBadgeIndicator");

		// Assert
		assert.ok($badgeIndicator.attr("data-badge"), "Badge indicator is rendered");

		oCard.onsapenter();
		assert.equal(oCard._isBadgeAttached, false, "Badge indicator is not rendered");

		oCard.destroy();
	});
});