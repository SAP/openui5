/*global QUnit */

sap.ui.define([
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/NumericSideIndicator",
	"sap/m/BadgeCustomData",
	"sap/m/library",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UniversalDate"
],
function (
	Card,
	CardHeader,
	CardNumericHeader,
	CardNumericSideIndicator,
	BadgeCustomData,
	mLibrary,
	Text,
	Core,
	jQuery,
	Control,
	DateFormat,
	UniversalDate
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";
	var AvatarColor = mLibrary.AvatarColor;
	var ValueColor = mLibrary.ValueColor;

	function createCard(HeaderType) {
		var oCard = new Card("somecard", {
			tooltip: 'Some tooltip',
			header: new HeaderType({ title: "Title" }),
			content: new Text({ text: "Text" })
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

	QUnit.test("NumericHeader renderer", function (assert) {
		// Arrange
		var oHeader = new CardNumericHeader({ title: "Title", number: "{Number}" });
		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oHeader.$().find(".sapFCardNumericIndicators").length, 1, "NumericIndicators are rendered.");

		oHeader.destroy();
	});

	QUnit.test("Press is fired on sapselect for numeric header", function (assert) {
		// Arrange
		var oHeader = new CardNumericHeader({ title: "Title" }),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

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

		assert.strictEqual(oHeader._getNumericIndicators().$("mainIndicator-value-inner").html().length, sSampleNumber.length, "The numeric content is not truncated");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Numeric Header unitOfMeasurement truncation", function (assert) {

		// Arrange
		var oHeader = new CardNumericHeader({
				subtitle: "Lorem",
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

	QUnit.test("Side Indicator \"state\" property ", function (assert) {
		// Arrange
		var oHeader = new CardNumericHeader({
			sideIndicators: new CardNumericSideIndicator({
				number: "5",
				state: "Error"
			})
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert

		assert.ok(oHeader.getSideIndicators()[0].getDomRef().classList.contains("sapFCardHeaderSideIndicatorStateError"), "SideIndicator has the right class applied");
		assert.notOk(oHeader.getSideIndicators()[0].getDomRef().classList.contains("sapFCardHeaderSideIndicatorStateGood"), "SideIndicator has the right class applied");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Numeric Header's \"sideIndicatorsAlignment\" property ", function (assert) {
		// Arrange
		var oHeader = new CardNumericHeader({
			sideIndicatorsAlignment: "End",
			number: 5
		});
		var oNumericIndicators = oHeader._getNumericIndicators();

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.ok(oNumericIndicators.getDomRef().classList.contains("sapFCardNumericIndicatorsSideAlignEnd"), "Numeric header has the right class for alignment applied");
		assert.notOk(oNumericIndicators.getDomRef().classList.contains("sapFCardNumericIndicatorsSideAlignBegin"), "Numeric header has the right class for alignment applied");

		// Clean up
		oHeader.destroy();
	});
	QUnit.test("Card has correct class when header is not visible", function (assert) {
		// Arrange
		var oCard = createCard(CardHeader);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oCard.getCardHeader().getVisible(), true, "Card's header is visible");
		assert.strictEqual(oCard.getDomRef().classList.contains("sapFCardNoHeader"), false, "Card does not have class sapFCardNoHeader");

		// Act
		oCard.getCardHeader().setVisible(false);
		this.clock.tick(100);

		// Assert
		assert.strictEqual(oCard.getCardHeader().getVisible(), false, "Card's header is not visible");
		assert.strictEqual(oCard.getDomRef().classList.contains("sapFCardNoHeader"), true, "Card has class sapFCardNoHeader");

		oCard.destroy();
		Core.applyChanges();
	});

	QUnit.module("Accessibility");

	QUnit.test("Header", function (assert) {

		// Arrange
		var oCard = createCard(CardHeader);

		var oTitleDomRef = oCard.getDomRef().querySelector(".sapFCardTitle");
		assert.strictEqual(oTitleDomRef.getAttribute("role"), "heading", "Card title's role is correct.");
		assert.strictEqual(oTitleDomRef.getAttribute("aria-level"), "3", "Card title's heading level is correct.");

		var $header = oCard.getHeader().$();
		assert.strictEqual($header.attr("role"), "group" , "Header role is correct.");
		assert.notOk($header.hasClass("sapFCardClickable"), "sapFCardClickable class is not set");

		oCard.getHeader().attachPress(function () { });
		oCard.invalidate();

		Core.applyChanges();

		$header = oCard.getHeader().$();
		assert.strictEqual($header.attr("role"), "group" , "Header role is correct.");
		assert.ok($header.hasClass("sapFCardClickable"), "sapFCardClickable class is set");

		oCard.destroy();
	});

	QUnit.test("Numeric Header", function (assert) {

		// Arrange
		var oCard = createCard(CardNumericHeader);

		var oTitleDomRef = oCard.getDomRef().querySelector(".sapFCardTitle");
		assert.strictEqual(oTitleDomRef.getAttribute("role"), "heading", "Card title's role is correct.");
		assert.strictEqual(oTitleDomRef.getAttribute("aria-level"), "3", "Card title's heading level is correct.");

		var $header = oCard.getHeader().$();
		assert.strictEqual($header.attr("role"), "group" , "Header role is correct.");
		assert.notOk($header.hasClass("sapFCardClickable"), "sapFCardClickable class is not set");

		oCard.getHeader().attachPress(function () { });
		oCard.invalidate();

		Core.applyChanges();

		$header = oCard.getHeader().$();
		assert.strictEqual($header.attr("role"), "group" , "Header role is correct.");
		assert.ok($header.hasClass("sapFCardClickable"), "sapFCardClickable class is set");

		oCard.destroy();
	});

	QUnit.test("Numeric Header with number set a bit later", function (assert) {

		// Arrange
		var oCard = createCard(CardNumericHeader);
		oCard.getCardHeader().setState(ValueColor.Error);
		oCard.getCardHeader().addSideIndicator(new CardNumericSideIndicator({
			number: "5",
			state: "Error"
		}));
		Core.applyChanges();

		// Assert
		assert.equal(oCard.getCardHeader().$("focusable").attr("aria-labelledby").indexOf("mainIndicator"), -1, "'aria-labelledby' does not contain main indicator id");

		// Act
		oCard.getCardHeader().setNumber("22");
		Core.applyChanges();

		// Assert
		assert.ok(oCard.getCardHeader().$("focusable").attr("aria-labelledby").indexOf("mainIndicator") > -1, "'aria-labelledby' contains main indicator id");

		// Clean up
		oCard.destroy();
	});

	QUnit.module("Custom header", {
		before: function () {
			this.CustomHeader = Control.extend("test.sap.f.card.CustomHeader", {
				metadata: {
					interfaces: ["sap.f.cards.IHeader"]
				},
				renderer: {
					apiVersion: 2,
					render: function (oRm, oControl) {
						oRm.openStart("div", oControl).openEnd().close("div");
					}
				}
			});
		}
	});

	QUnit.test("Card with custom header", function (assert) {
		// Arrange
		var oCard = new Card({
			header: new this.CustomHeader()
		});

		try {
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
			assert.ok(true, "Card with custom header is successfully rendered");

		} catch (e) {
			assert.ok(false, "Couldn't render card with custom header. " + e.message);
		}

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
		assert.ok(oCard.getCardHeader().$("focusable").attr("aria-labelledby").indexOf($badgeIndicator.attr('id')) > -1, "aria-labelledby contains the badge indicator id");

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
		assert.ok(oCard.getCardHeader().$("focusable").attr("aria-labelledby").indexOf($badgeIndicator.attr('id')) === -1, "aria-labelledby does not contain the badge indicator id");

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