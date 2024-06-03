/*global QUnit */

sap.ui.define([
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/NumericSideIndicator",
	"sap/m/BadgeCustomData",
	"sap/m/library",
	"sap/m/Button",
	"sap/m/Text",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/Lib"
],
function (
	Card,
	CardHeader,
	CardNumericHeader,
	CardNumericSideIndicator,
	BadgeCustomData,
	mLibrary,
	Button,
	Text,
	jQuery,
	Control,
	DateFormat,
	UniversalDate,
	QUnitUtils,
	nextUIUpdate,
	KeyCodes,
	UI5Date,
	Library
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";
	const AvatarColor = mLibrary.AvatarColor;
	const ValueColor = mLibrary.ValueColor;
	const WrappingType = mLibrary.WrappingType;

	const sLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum congue libero ut blandit faucibus. Phasellus sed urna id tortor consequat accumsan eget at leo. Cras quis arcu magna.";


	/**
	 * In each test using fake timers, it might happen that a rendering task is queued by
	 * creating a fake timer. Without an appropriate clock.tick call, this timer might not execute
	 * and a later nextUIUpdate with real timers would wait endlessly.
	 * To prevent this, after each test another rendering cycle is executed which will clear any
	 * pending fake timer. The rendering itself should not be needed by the tests, if they are properly
	 * isolated.
	 */
	async function afterEach() {
		await nextUIUpdate(this.clock);
	}

	function createCard(HeaderType) {
		var oCard = new Card("somecard", {
			tooltip: 'Some tooltip',
			header: new HeaderType({ title: "Title" }),
			content: new Text({ text: "Text" })
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);

		return oCard;
	}

	QUnit.module("Init", {
		afterEach
	});

	QUnit.test("Initialization", async function (assert) {

		// Arrange
		var oCard = createCard(CardHeader);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oCard.getDomRef(), "The card is rendered");
		assert.ok(oCard.getHeader().getDomRef(), "Card header should be rendered.");
		assert.ok(oCard.getContent().getDomRef(), "Card content should be rendered.");
		assert.strictEqual(oCard.$().attr('title'), "Some tooltip", "Tooltip is rendered");

		oCard.destroy();
	});

	QUnit.module("Headers", {
		afterEach
	});

	QUnit.test("NumericHeader renderer", async function (assert) {
		// Arrange
		var oHeader = new CardNumericHeader({ title: "Title", number: "{Number}" });
		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oHeader.$().find(".sapFCardNumericIndicators").length, 1, "NumericIndicators are rendered.");

		oHeader.destroy();
	});

	QUnit.test("Numeric Header indicator truncation", async function (assert) {

		// Arrange
		var sSampleNumber = "1234567812345678",
			oHeader = new CardNumericHeader({
				number: sSampleNumber
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Assert

		assert.strictEqual(oHeader._getNumericIndicators().$("mainIndicator-value-inner").html().length, sSampleNumber.length, "The numeric content is not truncated");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Numeric Header unitOfMeasurement truncation", async function (assert) {

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
		await nextUIUpdate(this.clock);

		iWidth = oHeader.$("unitOfMeasurement").width();

		// Act - set long subtitle so that there is no place for unitOfMeasurement
		oHeader.setSubtitle("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a libero nec risus egestas lacinia nec ac metus.");
		await nextUIUpdate(this.clock);
		this.clock.tick(400);

		// Assert
		assert.strictEqual(oHeader.$("unitOfMeasurement").width(), iWidth, "The unitOfMeasurement is not truncated");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Default header tooltips", async function (assert) {

		// Arrange
		const oHeader = new CardHeader({
				title: sLongText,
				subtitle: sLongText
			}),
			oCard = new Card({
				width: "300px",
				header: oHeader
			});

		oHeader.setProperty("useTooltips", true);

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Act
		QUnitUtils.triggerMouseEvent(oHeader.getDomRef("title-inner"), "mouseover");
		QUnitUtils.triggerMouseEvent(oHeader.getDomRef("subtitle-inner"), "mouseover");

		// Assert
		assert.strictEqual(oHeader.getDomRef("title-inner").title, sLongText, "The title has correct tooltip");
		assert.strictEqual(oHeader.getDomRef("subtitle-inner").title, sLongText, "The subtitle has correct tooltip");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Numeric header tooltips", async function (assert) {

		// Arrange
		const oHeader = new CardNumericHeader({
				title: sLongText,
				subtitle: sLongText,
				details: sLongText
			}),
			oCard = new Card({
				width: "300px",
				header: oHeader
			});

		oHeader.setProperty("useTooltips", true);

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Act
		QUnitUtils.triggerMouseEvent(oHeader.getDomRef("title-inner"), "mouseover");
		QUnitUtils.triggerMouseEvent(oHeader.getDomRef("subtitle-inner"), "mouseover");
		QUnitUtils.triggerMouseEvent(oHeader.getDomRef("details"), "mouseover");

		// Assert
		assert.strictEqual(oHeader.getDomRef("title-inner").title, sLongText, "The title has correct tooltip");
		assert.strictEqual(oHeader.getDomRef("subtitle-inner").title, sLongText, "The subtitle has correct tooltip");
		assert.strictEqual(oHeader.getDomRef("details").title, sLongText, "The subtitle has correct tooltip");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Default Header avatar default color", async function (assert) {
		// Arrange
		var oHeader = new CardHeader({
				iconSrc: "sap-icon://accept"
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Assert

		assert.strictEqual(oHeader._getAvatar().getBackgroundColor(), AvatarColor.Transparent, "Default background of avatar is 'Transparent'");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Header and NumericHeader dataTimestamp", async function (assert) {
		// Arrange
		var oNow = UI5Date.getInstance(),
			oNowUniversalDate = new UniversalDate(oNow),
			oDateFormat = DateFormat.getDateTimeInstance({relative: true}),
			sTextNow = Library.getResourceBundleFor("sap.f").getText("CARD_HEADER_DATETIMESTAMP_NOW"),
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
		await nextUIUpdate(this.clock);

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

	QUnit.test("Side Indicator \"state\" property ", async function (assert) {
		// Arrange
		var oHeader = new CardNumericHeader({
			sideIndicators: new CardNumericSideIndicator({
				number: "5",
				state: "Error"
			})
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Assert

		assert.ok(oHeader.getSideIndicators()[0].getDomRef().classList.contains("sapFCardHeaderSideIndicatorStateError"), "SideIndicator has the right class applied");
		assert.notOk(oHeader.getSideIndicators()[0].getDomRef().classList.contains("sapFCardHeaderSideIndicatorStateGood"), "SideIndicator has the right class applied");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Numeric Header's \"sideIndicatorsAlignment\" property ", async function (assert) {
		// Arrange
		var oHeader = new CardNumericHeader({
			sideIndicatorsAlignment: "End",
			number: 5
		});
		var oNumericIndicators = oHeader._getNumericIndicators();

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oNumericIndicators.getDomRef().classList.contains("sapFCardNumericIndicatorsSideAlignEnd"), "Numeric header has the right class for alignment applied");
		assert.notOk(oNumericIndicators.getDomRef().classList.contains("sapFCardNumericIndicatorsSideAlignBegin"), "Numeric header has the right class for alignment applied");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Card has correct class when header is not visible", async function (assert) {
		// Arrange
		var oCard = createCard(CardHeader);
		await nextUIUpdate(this.clock);

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
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Default Header with iconVisibility false", async function (assert) {
		// Arrange
		var oHeader = new CardHeader({
			iconSrc: "sap-icon://accept",
			iconVisible: false
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(!!oHeader.$().find(".sapFCardHeaderImage").length, false, "Icon is not visible");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Header Hyphenation", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
				title: "pneumonoultramicroscopicsilicovolcanoconiosis",
				subtitle: "pneumonoultramicroscopicsilicovolcanoconiosis",
				wrappingType: WrappingType.Hyphenated
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oHeader.getAggregation("_title").getWrappingType(), WrappingType.Hyphenated, "Title has correct wrappingType");
		assert.strictEqual(oHeader.getAggregation("_subtitle").getWrappingType(), WrappingType.Hyphenated, "Subtitle has correct wrappingType");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Numeric Header Hyphenation", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
				title: "pneumonoultramicroscopicsilicovolcanoconiosis",
				subtitle: "pneumonoultramicroscopicsilicovolcanoconiosis",
				details: "pneumonoultramicroscopicsilicovolcanoconiosis",
				detailsMaxLines: 2,
				wrappingType: WrappingType.Hyphenated
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oHeader.getAggregation("_title").getWrappingType(), WrappingType.Hyphenated, "Title has correct wrappingType");
		assert.strictEqual(oHeader.getAggregation("_subtitle").getWrappingType(), WrappingType.Hyphenated, "Subtitle has correct wrappingType");
		assert.strictEqual(oHeader.getAggregation("_details").getWrappingType(), WrappingType.Hyphenated, "Details text has correct wrappingType");

		// Clean up
		oHeader.destroy();
	});

	QUnit.module("Headers press event", {
		afterEach
	});

	QUnit.test("Press is fired on sapselect for numeric header", async function (assert) {
		// Arrange
		var oHeader = new CardNumericHeader({ title: "Title" }),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);
		oHeader.onsapselect(new jQuery.Event("sapselect"));

		// Assert
		assert.ok(fnPressHandler.calledOnce, "The press event is fired on sapselect");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Press event is NOT fired when Enter or Space is pressed on the toolbar", async function (assert) {
		// Arrange
		var oToolbar = new Button(),
			oHeader = new CardNumericHeader({
				title: "Title",
				toolbar: oToolbar
			}),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Act
		QUnitUtils.triggerKeydown(oToolbar.getDomRef(), KeyCodes.ENTER);
		QUnitUtils.triggerKeydown(oToolbar.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.ok(fnPressHandler.notCalled, "Enter or Space on the toolbar shouldn't result in press event");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Press is NOT fired when the toolbar is tapped", async function (assert) {
		// Arrange
		var oToolbar = new Button(),
			oHeader = new CardNumericHeader({
				title: "Title",
				toolbar: oToolbar
			}),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Act
		QUnitUtils.triggerEvent("tap", oToolbar.getDomRef());

		// Assert
		assert.ok(fnPressHandler.notCalled, "Tapping the toolbar shouldn't result in press event");

		// Clean up
		oCard.destroy();
	});

	QUnit.module("Header toolbar", {
		afterEach
	});

	QUnit.test("sapFCardHeaderToolbarFocused CSS class", async function (assert) {
		const oToolbar = new Button(),
			oHeader = new CardHeader({
				title: "Title",
				toolbar: oToolbar
			}),
			oCard = new Card({
				header: oHeader
			});

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Act
		QUnitUtils.triggerEvent("focusin", oToolbar.getDomRef());

		// Assert
		assert.ok(oHeader.getDomRef().classList.contains("sapFCardHeaderToolbarFocused"), "When toolbar is focused, header should have CSS class set");

		// Act
		oHeader.invalidate();
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oHeader.getDomRef().classList.contains("sapFCardHeaderToolbarFocused"), "After rendering CSS class should remain");

		// Clean up
		oCard.destroy();
	});

	QUnit.module("Accessibility", {
		afterEach
	});

	QUnit.test("Empty card", async function (assert) {

		// Arrange
		var oCard = new Card();

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		assert.ok(oCard.getDomRef().getAttribute("aria-labelledby"), "aria-labelledby is set");

		oCard.destroy();
	});

	QUnit.test("Header", async function (assert) {

		// Arrange
		var oCard = createCard(CardHeader);
		await nextUIUpdate(this.clock);

		var oTitleDomRef = oCard.getDomRef().querySelector(".sapFCardTitle");
		assert.strictEqual(oTitleDomRef.getAttribute("role"), "heading", "Card title's role is correct.");
		assert.strictEqual(oTitleDomRef.getAttribute("aria-level"), "3", "Card title's heading level is correct.");

		var $header = oCard.getHeader().$();
		assert.strictEqual(oCard.getFocusDomRef().getAttribute("role"), "group" , "Header role is correct.");
		assert.notOk($header.hasClass("sapFCardSectionClickable"), "sapFCardSectionClickable class is not set");

		oCard.getHeader().attachPress(function () { });
		oCard.invalidate();

		await nextUIUpdate(this.clock);

		$header = oCard.getHeader().$();
		assert.strictEqual(oCard.getFocusDomRef().getAttribute("role"), "button" , "Header role is correct.");
		assert.ok($header.hasClass("sapFCardSectionClickable"), "sapFCardSectionClickable class is set");

		oCard.destroy();
	});

	QUnit.test("Numeric Header", async function (assert) {

		// Arrange
		var oCard = createCard(CardNumericHeader);
		await nextUIUpdate(this.clock);

		var oTitleDomRef = oCard.getDomRef().querySelector(".sapFCardTitle");
		assert.strictEqual(oTitleDomRef.getAttribute("role"), "heading", "Card title's role is correct.");
		assert.strictEqual(oTitleDomRef.getAttribute("aria-level"), "3", "Card title's heading level is correct.");

		var $header = oCard.getHeader().$();
		assert.strictEqual(oCard.getFocusDomRef().getAttribute("role"), "group" , "Header role is correct.");
		assert.notOk($header.hasClass("sapFCardSectionClickable"), "sapFCardSectionClickable class is not set");

		oCard.getHeader().attachPress(function () { });
		oCard.invalidate();

		await nextUIUpdate(this.clock);

		$header = oCard.getHeader().$();
		assert.strictEqual(oCard.getFocusDomRef().getAttribute("role"), "button" , "Header role is correct.");
		assert.ok($header.hasClass("sapFCardSectionClickable"), "sapFCardSectionClickable class is set");

		oCard.destroy();
	});

	QUnit.test("Numeric Header with number set a bit later", async function (assert) {

		// Arrange
		var oCard = createCard(CardNumericHeader);
		oCard.getCardHeader().setState(ValueColor.Error);
		oCard.getCardHeader().addSideIndicator(new CardNumericSideIndicator({
			number: "5",
			state: "Error"
		}));
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(oCard.getCardHeader().$("focusable").attr("aria-labelledby").indexOf("mainIndicator"), -1, "'aria-labelledby' does not contain main indicator id");

		// Act
		oCard.getCardHeader().setNumber("22");
		await nextUIUpdate(this.clock);

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
		},
		afterEach
	});

	QUnit.test("Card with custom header", function (assert) {
		// Arrange
		var oCard = new Card({
			header: new this.CustomHeader()
		});

		try {
			oCard.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync(); // TODO rendering async here might not allow to catch errors
			assert.ok(true, "Card with custom header is successfully rendered");

		} catch (e) {
			assert.ok(false, "Couldn't render card with custom header. " + e.message);
		}

		oCard.destroy();
	});

	QUnit.module("Badge", {
		afterEach
	});

	QUnit.test("Rendering", async function (assert) {

		// Arrange
		var oCard = createCard(CardHeader);

		oCard.addCustomData(new BadgeCustomData({value: "New"}));
		await nextUIUpdate(this.clock);

		var $badgeIndicator = oCard.$().find(".sapMBadgeIndicator");

		// Assert
		assert.strictEqual($badgeIndicator.attr("data-badge"), "New", "Badge indicator is correctly rendered");
		assert.strictEqual($badgeIndicator.attr("aria-label"), "New", "Badge aria-label correctly rendered");
		assert.ok(oCard.getCardHeader().$("focusable").attr("aria-labelledby").indexOf($badgeIndicator.attr('id')) > -1, "aria-labelledby contains the badge indicator id");

		oCard.destroy();
	});

	QUnit.test("Auto hide", async function (assert) {

		// Arrange
		var oCard = createCard(CardHeader);

		oCard.addCustomData(new BadgeCustomData({value: "New"}));
		await nextUIUpdate(this.clock);

		oCard.focus();

		var $badgeIndicator = oCard.$().find(".sapMBadgeIndicator");

		// Assert
		assert.ok($badgeIndicator.attr("data-badge"), "Badge indicator is rendered");

		this.clock.tick(4000);

		assert.equal(oCard._isBadgeAttached, false, "Badge indicator is not rendered");
		assert.notOk($badgeIndicator.attr("aria-label"), "Badge aria-label is removed");
		assert.ok(oCard.getCardHeader().$("focusable").attr("aria-labelledby").indexOf($badgeIndicator.attr('id')) === -1, "aria-labelledby does not contain the badge indicator id");

		oCard.addCustomData(new BadgeCustomData({value: "New"}));
		await nextUIUpdate(this.clock);

		$badgeIndicator = oCard.$().find(".sapMBadgeIndicator");

		// Assert
		assert.ok($badgeIndicator.attr("data-badge"), "Badge indicator is rendered");

		oCard.onsapenter();
		assert.equal(oCard._isBadgeAttached, false, "Badge indicator is not rendered");

		oCard.destroy();
	});
});