/*global QUnit, sinon */

sap.ui.define([
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/NumericSideIndicator",
	"sap/m/library",
	"sap/m/Button",
	"sap/ui/core/Control",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/Lib"
], (
	Card,
	CardHeader,
	CardNumericHeader,
	CardNumericSideIndicator,
	mLibrary,
	Button,
	Control,
	DateFormat,
	UniversalDate,
	QUnitUtils,
	nextUIUpdate,
	KeyCodes,
	UI5Date,
	Library
) => {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";
	const AvatarColor = mLibrary.AvatarColor;
	const ValueColor = mLibrary.ValueColor;
	const WrappingType = mLibrary.WrappingType;

	const sLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum congue libero ut blandit faucibus. Phasellus sed urna id tortor consequat accumsan eget at leo. Cras quis arcu magna.";

	QUnit.module("Headers");

	QUnit.test("NumericHeader renderer", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({ title: "Title", number: "{Number}" });

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oHeader.$().find(".sapFCardNumericIndicators").length, 1, "NumericIndicators are rendered.");

		oHeader.destroy();
	});

	QUnit.test("Numeric Header indicator truncation", async function (assert) {
		// Arrange
		const sSampleNumber = "1234567812345678",
			oHeader = new CardNumericHeader({
				number: sSampleNumber
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert

		assert.strictEqual(oHeader._getNumericIndicators().$("mainIndicator-value-inner").html().length, sSampleNumber.length, "The numeric content is not truncated");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Numeric Header unitOfMeasurement truncation", async function (assert) {
		// Arrange
		this.clock = sinon.useFakeTimers();
		const oHeader = new CardNumericHeader({
				subtitle: "Lorem",
				unitOfMeasurement: "EUR EUR EUR"
			}),
			oCard = new Card({
				width: "300px",
				header: oHeader
			});

		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		const iWidth = oHeader.$("unitOfMeasurement").width();

		// Act - set long subtitle so that there is no place for unitOfMeasurement
		oHeader.setSubtitle("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a libero nec risus egestas lacinia nec ac metus.");
		await nextUIUpdate(this.clock);
		this.clock.tick(400);

		// Assert
		assert.strictEqual(oHeader.$("unitOfMeasurement").width(), iWidth, "The unitOfMeasurement is not truncated");

		// Clean up
		oCard.destroy();
		this.clock.restore();
		await nextUIUpdate(this.clock);
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
		await nextUIUpdate();

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
		await nextUIUpdate();

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
		const oHeader = new CardHeader({
				iconSrc: "sap-icon://accept"
			});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oHeader._getAvatar().getBackgroundColor(), AvatarColor.Transparent, "Default background of avatar is 'Transparent'");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Header and NumericHeader dataTimestamp", async function (assert) {
		// Arrange
		this.clock = sinon.useFakeTimers();
		const oNow = UI5Date.getInstance(),
			oNowUniversalDate = new UniversalDate(oNow),
			oDateFormat = DateFormat.getDateTimeInstance({relative: true}),
			sTextNow = Library.getResourceBundleFor("sap.f").getText("CARD_HEADER_DATETIMESTAMP_NOW"),
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

		const sText1Minute = oDateFormat.format(oNowUniversalDate);

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
		this.clock.restore();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Side Indicator \"state\" property ", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			sideIndicators: new CardNumericSideIndicator({
				number: "5",
				state: "Error"
			})
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert

		assert.ok(oHeader.getSideIndicators()[0].getDomRef().classList.contains("sapFCardHeaderSideIndicatorStateError"), "SideIndicator has the right class applied");
		assert.notOk(oHeader.getSideIndicators()[0].getDomRef().classList.contains("sapFCardHeaderSideIndicatorStateGood"), "SideIndicator has the right class applied");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Numeric Header's \"sideIndicatorsAlignment\" property ", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			sideIndicatorsAlignment: "End",
			number: 5
		});
		const oNumericIndicators = oHeader._getNumericIndicators();

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.ok(oNumericIndicators.getDomRef().classList.contains("sapFCardNumericIndicatorsSideAlignEnd"), "Numeric header has the right class for alignment applied");
		assert.notOk(oNumericIndicators.getDomRef().classList.contains("sapFCardNumericIndicatorsSideAlignBegin"), "Numeric header has the right class for alignment applied");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Default Header with iconVisibility false", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
			iconSrc: "sap-icon://accept",
			iconVisible: false
		});

		// Act
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

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
		await nextUIUpdate();

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
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oHeader.getAggregation("_title").getWrappingType(), WrappingType.Hyphenated, "Title has correct wrappingType");
		assert.strictEqual(oHeader.getAggregation("_subtitle").getWrappingType(), WrappingType.Hyphenated, "Subtitle has correct wrappingType");
		assert.strictEqual(oHeader.getAggregation("_details").getWrappingType(), WrappingType.Hyphenated, "Details text has correct wrappingType");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Header with main part only", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
				title: "Title"
			}),
			oCard = new Card({
				header: oHeader
			});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		const oMainPartDomRef = oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart");

		// Assert
		assert.ok(oHeader.getDomRef().classList.contains("sapFCardHeaderMainPartOnly"), "Header has correct class applied");
		assert.ok(oMainPartDomRef.classList.contains("sapFCardHeaderLastPart"), "Main part has correct class applied");
	});

	QUnit.test("Header with numeric part", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
				title: "Title",
				number: "5"
			}),
			oCard = new Card({
				header: oHeader
			});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		const oMainPartDomRef = oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart");
		const oNumericPartDomRef = oHeader.getDomRef().querySelector(".sapFCardNumericHeaderNumericPart");

		// Assert
		assert.notOk(oHeader.getDomRef().classList.contains("sapFCardHeaderMainPartOnly"), "Header has correct class applied");
		assert.notOk(oMainPartDomRef.classList.contains("sapFCardHeaderLastPart"), "Main part does NOT have 'sapFCardHeaderLastPart' class");
		assert.ok(oNumericPartDomRef.classList.contains("sapFCardHeaderLastPart"), "Numeric part has correct class applied");
	});

	QUnit.module("Headers press event");

	QUnit.test("Press is fired on Enter keydown for numeric header", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({ title: "Title" }),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		QUnitUtils.triggerKeydown(oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart"), KeyCodes.ENTER);

		// Assert
		assert.ok(fnPressHandler.calledOnce, "The press event is fired on Enter keydown");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Press is fired on Space keyup for numeric header", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({ title: "Title" }),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		QUnitUtils.triggerKeyup(oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart"), KeyCodes.SPACE);

		// Assert
		assert.ok(fnPressHandler.calledOnce, "The press event is fired on Space keyup");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Press event is NOT fired when Enter or Space is pressed on the toolbar", async function (assert) {
		// Arrange
		const oToolbar = new Button(),
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
		await nextUIUpdate();

		// Act
		QUnitUtils.triggerKeydown(oToolbar.getDomRef(), KeyCodes.ENTER);
		QUnitUtils.triggerKeydown(oToolbar.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.ok(fnPressHandler.notCalled, "Enter or Space on the toolbar shouldn't result in press event");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Press is fired when the header is tapped", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
				title: "Title"
			}),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Act
		QUnitUtils.triggerEvent("tap", oHeader.getDomRef());

		// Assert
		assert.notOk(fnPressHandler.called, "Tapping the header should NOT result in press event");

		// Act
		QUnitUtils.triggerEvent("tap", oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart"));

		// Assert
		assert.ok(fnPressHandler.calledOnce, "Tapping the header should result in press event");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Press is NOT fired when the header with href is tapped", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
				title: "Title",
				href: "https://www.sap.com"
			}),
			oCard = new Card({
				header: oHeader
			}),
			fnPressHandler = this.stub();

		oHeader.attachPress(fnPressHandler);
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Act
		QUnitUtils.triggerEvent("tap", oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart"), { ctrlKey: true });

		// Assert
		assert.ok(fnPressHandler.notCalled, "Tapping the header with href should NOT result in press event");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Press is NOT fired when the toolbar is tapped", async function (assert) {
		// Arrange
		const oToolbar = new Button(),
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
		await nextUIUpdate();

		// Act
		QUnitUtils.triggerEvent("tap", oToolbar.getDomRef());

		// Assert
		assert.ok(fnPressHandler.notCalled, "Tapping the toolbar shouldn't result in press event");

		// Clean up
		oCard.destroy();
	});

	QUnit.module("Header toolbar");

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
		await nextUIUpdate();

		// Act
		QUnitUtils.triggerEvent("focusin", oToolbar.getDomRef());

		// Assert
		assert.ok(oHeader.getDomRef().classList.contains("sapFCardHeaderToolbarFocused"), "When toolbar is focused, header should have CSS class set");

		// Act
		oHeader.invalidate();
		await nextUIUpdate();

		// Assert
		assert.ok(oHeader.getDomRef().classList.contains("sapFCardHeaderToolbarFocused"), "After rendering CSS class should remain");

		// Clean up
		oCard.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("Header", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({ title: "Title" });
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		const oTitleDomRef = oHeader.getDomRef().querySelector(".sapFCardTitle");
		assert.strictEqual(oTitleDomRef.getAttribute("role"), "heading", "Card title's role is correct.");
		assert.strictEqual(oTitleDomRef.getAttribute("aria-level"), "3", "Card title's heading level is correct.");

		const oMainPartDomRef = oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart");
		assert.strictEqual(oHeader.getFocusDomRef().getAttribute("role"), "group" , "Header role is correct.");
		assert.notOk(oMainPartDomRef.classList.contains("sapFCardSectionClickable"), "sapFCardSectionClickable class is not set");

		// Act
		oHeader.attachPress(function () { });
		await nextUIUpdate();

		assert.strictEqual(oHeader.getFocusDomRef().getAttribute("role"), "button" , "Header role is correct.");
		assert.ok(oMainPartDomRef.classList.contains("sapFCardSectionClickable"), "sapFCardSectionClickable class is set");

		oHeader.destroy();
	});

	QUnit.test("Numeric Header", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({ title: "Title" });
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		const oTitleDomRef = oHeader.getDomRef().querySelector(".sapFCardTitle");
		assert.strictEqual(oTitleDomRef.getAttribute("role"), "heading", "Card title's role is correct.");
		assert.strictEqual(oTitleDomRef.getAttribute("aria-level"), "3", "Card title's heading level is correct.");

		const oMainPartDomRef = oHeader.getDomRef().querySelector(".sapFCardHeaderMainPart");
		assert.strictEqual(oHeader.getFocusDomRef().getAttribute("role"), "group" , "Header role is correct.");
		assert.notOk(oMainPartDomRef.classList.contains("sapFCardSectionClickable"), "sapFCardSectionClickable class is not set");

		// Act
		oHeader.attachPress(function () { });
		await nextUIUpdate();

		assert.strictEqual(oHeader.getFocusDomRef().getAttribute("role"), "button" , "Header role is correct.");
		assert.ok(oMainPartDomRef.classList.contains("sapFCardSectionClickable"), "sapFCardSectionClickable class is set");

		oHeader.destroy();
	});

	QUnit.test("Numeric Header with number set a bit later", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			title: "Title",
			state: ValueColor.Error,
			sideIndicators: [
				new CardNumericSideIndicator({
					number: "5",
					state: ValueColor.Error
				})
			]
		});
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.equal(oHeader.$("focusable").attr("aria-labelledby").indexOf("mainIndicator"), -1, "'aria-labelledby' does not contain main indicator id");

		// Act
		oHeader.setNumber("22");
		await nextUIUpdate();

		// Assert
		assert.ok(oHeader.$("focusable").attr("aria-labelledby").indexOf("mainIndicator") > -1, "'aria-labelledby' contains main indicator id");

		// Clean up
		oHeader.destroy();
	});

	QUnit.module("Error in header", {
		beforeEach: function () {
			this.Error = Control.extend("Error", {
				renderer: {
					apiVersion: 2,
					render: function (oRm, oControl) {
						oRm.openStart("div", oControl).openEnd().close("div");
					}
				}
			});
		}
	});

	QUnit.test("Error in Default Header", async function (assert) {
		// Arrange
		const oHeader = new CardHeader({
			title: "Title",
			subtitle: "Subtitle",
			statusText: "Status",
			iconSrc: "sap-icon://accept",
			toolbar: new Button()
		});
		const oError = new this.Error();

		oHeader.setAggregation("_error", oError);
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.ok(oError.getDomRef(), "Error is rendered.");
		assert.notOk(oHeader.getAggregation("_title").getDomRef(), "Title shouldn't be rendered.");
		assert.notOk(oHeader.getAggregation("_subtitle").getDomRef(), "Subtitle shouldn't be rendered.");
		assert.notOk(oHeader.getDomRef("status"), "Status shouldn't be rendered.");
		assert.notOk(oHeader.getAggregation("_avatar").getDomRef(), "Icon shouldn't be rendered.");
		assert.notOk(oHeader.getToolbar().getDomRef(), "Toolbar shouldn't be rendered.");

		// Clean up
		oHeader.destroy();
	});

	QUnit.test("Error in Numeric Header", async function (assert) {
		// Arrange
		const oHeader = new CardNumericHeader({
			title: "Title",
			subtitle: "Subtitle",
			statusText: "Status",
			iconSrc: "sap-icon://accept",
			toolbar: new Button(),
			number: "5",
			details: "Details",
			sideIndicators: [
				new CardNumericSideIndicator({
					number: "5"
				})
			]
		});
		const oError = new this.Error();

		oHeader.setAggregation("_error", oError);
		oHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.ok(oError.getDomRef(), "Error is rendered.");
		assert.notOk(oHeader.getAggregation("_title").getDomRef(), "Title shouldn't be rendered.");
		assert.notOk(oHeader.getAggregation("_subtitle").getDomRef(), "Subtitle shouldn't be rendered.");
		assert.notOk(oHeader.getDomRef("status"), "Status shouldn't be rendered.");
		assert.notOk(oHeader.getAggregation("_avatar").getDomRef(), "Icon shouldn't be rendered.");
		assert.notOk(oHeader.getToolbar().getDomRef(), "Toolbar shouldn't be rendered.");
		assert.notOk(oHeader.getAggregation("_numericIndicators").getDomRef(), "Numeric indicators shouldn't be rendered.");
		assert.notOk(oHeader.getAggregation("_details").getDomRef(), "Details shouldn't be rendered.");

		// Clean up
		oHeader.destroy();
	});

});