/*global QUnit, sinon*/
sap.ui.define([
	"qunit/SemanticUtil",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/Core",
	"sap/f/DynamicPageAccessibleLandmarkInfo",
	"sap/ui/core/InvisibleText"
],
function (
	SemanticUtil,
	ResourceModel,
	Core,
	DynamicPageAccessibleLandmarkInfo,
	InvisibleText
) {
	"use strict";

	sinon.config.useFakeTimers = false;

	var oFactory = SemanticUtil.oFactory,
		oUtil = SemanticUtil.oUtil,
		oSemanticConfiguration = oFactory.getSemanticConfiguration(),
		aSemanticActionsMetadata = oFactory.getSemanticActionsMetadata();

	/* --------------------------- SemanticPage API -------------------------------------- */
	QUnit.module("SemanticPage - API ", {
		beforeEach: function () {
			this.oSemanticPage = oFactory.getSemanticPage();
			oUtil.renderObject(this.oSemanticPage);
		},
		afterEach: function () {
			this.oSemanticPage.destroy();
			this.oSemanticPage = null;
		}
	});

	QUnit.test("test SemanticPage instantiation", function (assert) {
		var CLASS_NAME = "sap.f.semantic.SemanticPage";

		// Assert
		assert.equal(this.oSemanticPage.getMetadata().getName(), CLASS_NAME,
			"SemanticPage instantiated successfully.");
	});


	QUnit.test("test SemanticPage showFooter setter and getter", function (assert) {
		// Assert default
		assert.equal(this.oSemanticPage.getShowFooter(), false,
			"SemanticPage showFooter is false by default.");

		// Act
		this.oSemanticPage.setShowFooter(true);

		// Assert
		assert.equal(this.oSemanticPage.getShowFooter(), true,
			"SemanticPage showFooter set to true and retrieved successfully.");

		// Act
		this.oSemanticPage.setShowFooter(false);

		// Assert
		assert.equal(this.oSemanticPage.getShowFooter(), false,
			"SemanticPage showFooter set to false and retrieved successfully.");
	});

	QUnit.test("test SemanticPage fitContent setter and getter", function (assert) {
		// Assert default
		assert.equal(this.oSemanticPage.getFitContent(), false,
			"SemanticPage fitContent is false by default.");

		assert.equal(this.oSemanticPage._getPage().getFitContent(), false,
			"DynamicPage fitContent is false by default.");

		// Act
		this.oSemanticPage.setFitContent(true);

		// Assert
		assert.equal(this.oSemanticPage.getFitContent(), true,
			"SemanticPage fitContent is successfully set to true.");

		assert.equal(this.oSemanticPage._getPage().getFitContent(), true,
			"DynamicPage fitContent is successfully set to true.");
	});

	QUnit.test("test SemanticPage headerExpanded setter and getter", function (assert) {
		// Assert default
		assert.equal(this.oSemanticPage.getHeaderExpanded(), true,
			"SemanticPage headerExpanded is true by default.");

		// Act
		this.oSemanticPage.setHeaderExpanded(false);

		// Assert
		assert.equal(this.oSemanticPage.getHeaderExpanded(), false,
			"SemanticPage headerExpanded set to false and retrieved successfully.");

		// Act
		this.oSemanticPage.setHeaderExpanded(true);

		// Assert
		assert.equal(this.oSemanticPage.getHeaderExpanded(), true,
			"SemanticPage headerExpanded set to true and retrieved successfully.");
	});


	QUnit.test("test SemanticPage headerPinnable setter and getter", function (assert) {
		// Assert default
		assert.equal(this.oSemanticPage.getHeaderExpanded(), true,
			"SemanticPage headerPinnable is true by default.");

		// Act
		this.oSemanticPage.setHeaderPinnable(false);

		// Assert
		assert.equal(this.oSemanticPage.getHeaderPinnable(), false,
			"SemanticPage headerPinnable set to false and retrieved successfully.");

		// Act
		this.oSemanticPage.setHeaderPinnable(true);

		// Assert
		assert.equal(this.oSemanticPage.getHeaderPinnable(), true,
			"SemanticPage headerPinnable set to true and retrieved successfully.");
	});


	QUnit.test("test SemanticPage preserveHeaderStateOnScroll setter and getter", function (assert) {
		// Assert default
		assert.equal(this.oSemanticPage.getPreserveHeaderStateOnScroll(), false,
			"SemanticPage preserveHeaderStateOnScroll is true by default.");

		// Act
		this.oSemanticPage.setPreserveHeaderStateOnScroll(true);

		// Assert
		assert.equal(this.oSemanticPage.getPreserveHeaderStateOnScroll(), true,
			"SemanticPage preserveHeaderStateOnScroll set to false and retrieved successfully.");

		// Act
		this.oSemanticPage.setPreserveHeaderStateOnScroll(false);

		// Assert
		assert.equal(this.oSemanticPage.getPreserveHeaderStateOnScroll(), false,
			"SemanticPage preserveHeaderStateOnScroll set to true and retrieved successfully.");
	});


	QUnit.test("test SemanticPage toggleHeaderOnTitleClick setter and getter", function (assert) {
		// Assert default
		assert.equal(this.oSemanticPage.getToggleHeaderOnTitleClick(), true,
			"SemanticPage toggleHeaderOnTitleClick is true by default.");

		// Act
		this.oSemanticPage.setToggleHeaderOnTitleClick(false);

		// Assert
		assert.equal(this.oSemanticPage.getToggleHeaderOnTitleClick(), false,
			"SemanticPage toggleHeaderOnTitleClick set to false and retrieved successfully.");

		// Act
		this.oSemanticPage.setToggleHeaderOnTitleClick(true);

		// Assert
		assert.equal(this.oSemanticPage.getToggleHeaderOnTitleClick(), true,
			"SemanticPage toggleHeaderOnTitleClick set to true and retrieved successfully.");
	});

	QUnit.test("test SemanticPage titlePrimaryArea setter and getter", function (assert) {
		var sBeginArea = sap.f.DynamicPageTitleArea.Begin,
			sMiddleArea = sap.f.DynamicPageTitleArea.Middle;

		// Assert default
		assert.strictEqual(this.oSemanticPage.getTitlePrimaryArea(), sBeginArea,
			"SemanticPage titlePrimaryArea is sap.f.DynamicPageTitleArea.Begin by default.");
		assert.strictEqual(this.oSemanticPage._getTitle().getPrimaryArea(), sBeginArea,
			"DynamicPageTitle primaryArea is sap.f.DynamicPageTitleArea.Begin by default.");

		// Act
		this.oSemanticPage.setTitlePrimaryArea(sMiddleArea);

		// Assert
		assert.strictEqual(this.oSemanticPage.getTitlePrimaryArea(), sMiddleArea,
			"SemanticPage titlePrimaryArea set to sap.f.DynamicPageTitleArea.Middle and retrieved successfully.");
		assert.strictEqual(this.oSemanticPage._getTitle().getPrimaryArea(), sMiddleArea,
			"DynamicPageTitle primaryArea set to sap.f.DynamicPageTitleArea.Middle and retrieved successfully.");

		//Setup
		//Create a <code>SemanticPage</code> with <code>titlePrimaryArea</code> set to
		//<code>sap.f.DynamicPageTitleArea.Middle</code> in the constructor
		this.oSemanticPage2 = oFactory.getSemanticPage({titlePrimaryArea : sMiddleArea});
		oUtil.renderObject(this.oSemanticPage2);

		// Assert default
		assert.strictEqual(this.oSemanticPage2.getTitlePrimaryArea(), sMiddleArea,
			"SemanticPage titlePrimaryArea is sap.f.DynamicPageTitleArea.Middle by default.");
		assert.strictEqual(this.oSemanticPage2._getTitle().getPrimaryArea(), sMiddleArea,
			"DynamicPageTitle primaryArea is sap.f.DynamicPageTitleArea.Middle by default.");

		// Act
		this.oSemanticPage2.setTitlePrimaryArea(sBeginArea);

		// Assert
		assert.strictEqual(this.oSemanticPage2.getTitlePrimaryArea(), sBeginArea,
			"SemanticPage titlePrimaryArea set to sap.f.DynamicPageTitleArea.Begin and retrieved successfully.");
		assert.strictEqual(this.oSemanticPage2._getTitle().getPrimaryArea(), sBeginArea,
			"DynamicPageTitle primaryArea set to sap.f.DynamicPageTitleArea.Begin and retrieved successfully..");

		//Cleanup
		this.oSemanticPage2.destroy();
		this.oSemanticPage2 = null;
	});

	QUnit.test("test SemanticPage titleAreaShrinkRatio setter and getter", function (assert) {
		var sDefaultRatio = "1:1.6:1.6",
			sNewRatio = "3:5:8";

		// Assert default
		assert.strictEqual(this.oSemanticPage.getTitleAreaShrinkRatio(), sDefaultRatio,
			"SemanticPage titleAreaShrinkRatio is " + sDefaultRatio + " in by default.");
		assert.strictEqual(this.oSemanticPage._getTitle().getAreaShrinkRatio(), sDefaultRatio,
			"DynamicPageTitle areaShrinkRatio is " + sDefaultRatio + " in by default.");

		// Act
		this.oSemanticPage.setTitleAreaShrinkRatio(sNewRatio);

		// Assert
		assert.strictEqual(this.oSemanticPage.getTitleAreaShrinkRatio(), sNewRatio,
			"SemanticPage titleAreaShrinkRatio is " + sNewRatio + ".");
		assert.strictEqual(this.oSemanticPage._getTitle().getAreaShrinkRatio(), sNewRatio,
			"DynamicPageTitle areaShrinkRatio is " + sNewRatio + ".");
	});

	QUnit.test("test SemanticPage titleHeading aggregation methods", function (assert) {
		var oTitle = oFactory.getTitle(),
			vResult;

		// Assert default
		assert.equal(this.oSemanticPage.getTitleHeading(), null,
			"SemanticPage titleHeading is null by default.");

		// Аct: set titleHeading
		vResult = this.oSemanticPage.setTitleHeading(oTitle);

		// Assert
		assert.equal(this.oSemanticPage.getTitleHeading(), oTitle,
			"SemanticPage titleHeading is set and retrieved successfully.");
		assert.equal(this.oSemanticPage, vResult,
			"SemanticPage setTitleHeading returns the SemanticPage instance.");

		// Аct: destroy titleHeading
		vResult = this.oSemanticPage.destroyTitleHeading();

		// Assert
		assert.equal(this.oSemanticPage, vResult,
			"SemanticPage destroyTitleHeading returns the SemanticPage instance.");
		assert.equal(this.oSemanticPage.getTitleHeading(), null,
			"SemanticPage content is destroyed successfully.");
	});

	QUnit.test("test SemanticPage titleSnappedOnMobile is successfully forwarded", function (assert) {
		// Arrange
		var sForwardedAggregationName = this.oSemanticPage.getMetadata().getAggregationForwarder("titleSnappedOnMobile").targetAggregationName;

		// Assert
		assert.strictEqual(sForwardedAggregationName, "snappedTitleOnMobile",
				"DynamicPageTitle has successfully forwarded its snappedTitleOnMobile aggregation.");
	});

	QUnit.test("test SemanticPage titleExpandedHeading aggregation methods", function (assert) {
		var oTitle = oFactory.getTitle(),
			vResult;

		// Assert default
		assert.equal(this.oSemanticPage.getTitleExpandedHeading(), null,
			"SemanticPage titleExpandedHeading is null by default.");

		// Аct: set titleExpandedHeading
		vResult = this.oSemanticPage.setTitleExpandedHeading(oTitle);

		// Assert
		assert.equal(this.oSemanticPage.getTitleExpandedHeading(), oTitle,
			"SemanticPage titleExpandedHeading is set and retrieved successfully.");
		assert.equal(this.oSemanticPage, vResult,
			"SemanticPage setTitleExpandedHeading returns the SemanticPage instance.");

		// Аct: destroy titleExpandedHeading
		vResult = this.oSemanticPage.destroyTitleExpandedHeading();

		// Assert
		assert.equal(this.oSemanticPage, vResult,
			"SemanticPage destroyTitleExpandedHeading returns the SemanticPage instance.");
		assert.equal(this.oSemanticPage.getTitleExpandedHeading(), null,
			"SemanticPage content is destroyed successfully.");
	});

	QUnit.test("test SemanticPage titleSnappedHeading aggregation methods", function (assert) {
		var oTitle = oFactory.getTitle(),
			vResult;

		// Assert default
		assert.equal(this.oSemanticPage.getTitleSnappedHeading(), null,
			"SemanticPage titleSnappedHeading is null by default.");

		// Аct: set titleSnappedHeading
		vResult = this.oSemanticPage.setTitleSnappedHeading(oTitle);

		// Assert
		assert.equal(this.oSemanticPage.getTitleSnappedHeading(), oTitle,
			"SemanticPage titleSnappedHeading is set and retrieved successfully.");
		assert.equal(this.oSemanticPage, vResult,
			"SemanticPage setTitleSnappedHeading returns the SemanticPage instance.");

		// Аct: destroy titleSnappedHeading
		vResult = this.oSemanticPage.destroyTitleSnappedHeading();

		// Assert
		assert.equal(this.oSemanticPage, vResult,
			"SemanticPage destroyTitleSnappedHeading returns the SemanticPage instance.");
		assert.equal(this.oSemanticPage.getTitleSnappedHeading(), null,
			"SemanticPage content is destroyed successfully.");
	});

	QUnit.test("test SemanticPage titleBreadcrumbs aggregation methods", function (assert) {
		var oBreadcrumbs = oFactory.getBreadcrumbs(),
			vResult;

		// Assert default
		assert.equal(this.oSemanticPage.getTitleBreadcrumbs(), null,
			"SemanticPage titleBreadcrumbs is null by default.");

		// Аct: set titleHeading
		vResult = this.oSemanticPage.setTitleBreadcrumbs(oBreadcrumbs);

		// Assert
		assert.equal(this.oSemanticPage.getTitleBreadcrumbs(), oBreadcrumbs,
			"SemanticPage titleBreadcrumbs is set and retrieved successfully.");
		assert.equal(this.oSemanticPage, vResult,
			"SemanticPage setTitleBreadcrumbs returns the SemanticPage instance.");

		// Аct: destroy titleHeading
		vResult = this.oSemanticPage.destroyTitleBreadcrumbs();

		// Assert
		assert.equal(this.oSemanticPage, vResult,
			"SemanticPage destroyTitleBreadcrumbs returns the SemanticPage instance.");
		assert.equal(this.oSemanticPage.getTitleBreadcrumbs(), null,
			"SemanticPage titleBreadcrumbs is destroyed successfully.");
	});

	QUnit.test("test SemanticPage titleExpandedContent aggregation methods", function (assert) {
		var oMessageStrip = oFactory.getMessageStrip(1),
			oMessageStrip2 = oFactory.getMessageStrip(2),
			iContentCount = 0, iContentIdx = 0;

		// Assert default
		assert.equal(this.oSemanticPage.getTitleExpandedContent().length, iContentCount,
			"SemanticPage titleExpandedContent is empty by default - items count: " + iContentCount);

		// Act
		iContentCount++;
		this.oSemanticPage.addTitleExpandedContent(oMessageStrip);

		// Assert
		assert.equal(this.oSemanticPage.getTitleExpandedContent().length, iContentCount,
			"SemanticPage titleExpandedContent has one new item added - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfTitleExpandedContent(oMessageStrip), iContentIdx,
			"SemanticPage titleExpandedContent item added is on index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticPage.removeAllTitleExpandedContent();

		// Assert
		assert.equal(this.oSemanticPage.getTitleExpandedContent().length, iContentCount,
			"SemanticPage titleExpandedContent has been removed - items count: " + iContentCount);

		// Act
		iContentCount += 2;
		this.oSemanticPage.addTitleExpandedContent(oMessageStrip);
		this.oSemanticPage.insertTitleExpandedContent(oMessageStrip2, iContentIdx);

		// Assert
		assert.equal(this.oSemanticPage.getTitleExpandedContent().length, iContentCount,
			"SemanticPage titleExpandedContent has two items inserted - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfTitleExpandedContent(oMessageStrip2), iContentIdx,
			"SemanticPage titleExpandedContent second item is inserted on index: " + iContentIdx);

		// Act
		iContentCount -= 2;
		this.oSemanticPage.destroyTitleExpandedContent();

		// Assert
		assert.equal(this.oSemanticPage.getTitleExpandedContent().length, iContentCount,
			"SemanticPage titleExpandedContent has been destroyed - items count: " + iContentCount);
		assert.ok(oMessageStrip.bIsDestroyed, "SemanticPage item has been destroyed.");
		assert.ok(oMessageStrip2.bIsDestroyed, "SemanticPage item has been destroyed.");
	});

	QUnit.test("test SemanticPage titleSnappedContent aggregation methods", function (assert) {
		var oMessageStrip = oFactory.getMessageStrip(1),
			oMessageStrip2 = oFactory.getMessageStrip(2),
			iContentCount = 0, iContentIdx = 0;

		// Assert default
		assert.equal(this.oSemanticPage.getTitleSnappedContent().length, iContentCount,
			"SemanticPage titleSnappedContent is empty by default - items count: " + iContentCount);

		// Act
		iContentCount++;
		this.oSemanticPage.addTitleSnappedContent(oMessageStrip);

		// Assert
		assert.equal(this.oSemanticPage.getTitleSnappedContent().length, iContentCount,
			"SemanticPage titleSnappedContent has one new item added - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfTitleSnappedContent(oMessageStrip), iContentIdx,
			"SemanticPage titleSnappedContent item added is on index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticPage.removeAllTitleSnappedContent();

		// Assert
		assert.equal(this.oSemanticPage.getTitleSnappedContent().length, iContentCount,
			"SemanticPage titleSnappedContent has been removed - items count: " + iContentCount);

		// Act
		iContentCount += 2;
		this.oSemanticPage.addTitleSnappedContent(oMessageStrip);
		this.oSemanticPage.insertTitleSnappedContent(oMessageStrip2, iContentIdx);

		// Assert
		assert.equal(this.oSemanticPage.getTitleSnappedContent().length, iContentCount,
			"SemanticPage titleSnappedContent has two items inserted - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfTitleSnappedContent(oMessageStrip2), iContentIdx,
			"SemanticPage titleSnappedContent second item is inserted on index: " + iContentIdx);

		// Act
		iContentCount -= 2;
		this.oSemanticPage.destroyTitleSnappedContent();

		// Assert
		assert.equal(this.oSemanticPage.getTitleSnappedContent().length, iContentCount,
			"SemanticPage titleSnappedContent has been destroyed - items count: " + iContentCount);
		assert.ok(oMessageStrip.bIsDestroyed, "SemanticPage item has been destroyed.");
		assert.ok(oMessageStrip2.bIsDestroyed, "SemanticPage item has been destroyed.");
	});

	QUnit.test("test SemanticPage titleContent aggregation methods", function (assert) {
		var oMessageStrip = oFactory.getMessageStrip(1),
			oMessageStrip2 = oFactory.getMessageStrip(2),
			iContentCount = 0, iContentIdx = 0;

		// Assert default
		assert.equal(this.oSemanticPage.getTitleContent().length, iContentCount,
			"SemanticPage titleContent is empty by default - items count: " + iContentCount);

		// Act
		iContentCount++;
		this.oSemanticPage.addTitleContent(oMessageStrip);

		// Assert
		assert.equal(this.oSemanticPage.getTitleContent().length, iContentCount,
			"SemanticPage titleContent has one new item added - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfTitleContent(oMessageStrip), iContentIdx,
			"SemanticPage titleContent item added is on index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticPage.removeAllTitleContent();

		// Assert
		assert.equal(this.oSemanticPage.getTitleContent().length, iContentCount,
			"SemanticPage titleContent has been removed - items count: " + iContentCount);

		// Act
		iContentCount += 2;
		this.oSemanticPage.addTitleContent(oMessageStrip);
		this.oSemanticPage.insertTitleContent(oMessageStrip2, iContentIdx);

		// Assert
		assert.equal(this.oSemanticPage.getTitleContent().length, iContentCount,
			"SemanticPage titleContent has two items inserted - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfTitleContent(oMessageStrip2), iContentIdx,
			"SemanticPage titleContent second item is inserted on index: " + iContentIdx);

		// Act
		iContentCount -= 2;
		this.oSemanticPage.destroyTitleContent();

		// Assert
		assert.equal(this.oSemanticPage.getTitleContent().length, iContentCount,
			"SemanticPage titleContent has been destroyed - items count: " + iContentCount);
		assert.ok(oMessageStrip.bIsDestroyed, "SemanticPage item has been destroyed.");
		assert.ok(oMessageStrip2.bIsDestroyed, "SemanticPage item has been destroyed.");
	});

	QUnit.test("test SemanticPage headerContent aggregation methods", function (assert) {
		var oMessageStrip = oFactory.getMessageStrip(1),
			oMessageStrip2 = oFactory.getMessageStrip(2),
			iContentCount = 0, iContentIdx = 0;

		// Assert default
		assert.equal(this.oSemanticPage.getHeaderContent().length, iContentCount,
			"SemanticPage headerContent is empty by default - items count: " + iContentCount);

		// Act
		iContentCount++;
		this.oSemanticPage.addHeaderContent(oMessageStrip);

		// Assert
		assert.equal(this.oSemanticPage.getHeaderContent().length, iContentCount,
			"SemanticPage headerContent has one new item added - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfHeaderContent(oMessageStrip), iContentIdx,
			"SemanticPage headerContent item added is on index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticPage.removeAllHeaderContent();

		// Assert
		assert.equal(this.oSemanticPage.getHeaderContent().length, iContentCount,
			"SemanticPage headerContent has been removed - items count: " + iContentCount);

		// Act
		iContentCount += 2;
		this.oSemanticPage.addHeaderContent(oMessageStrip);
		this.oSemanticPage.insertHeaderContent(oMessageStrip2, iContentIdx);

		// Assert
		assert.equal(this.oSemanticPage.getHeaderContent().length, iContentCount,
			"SemanticPage headerContent has two items inserted - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfHeaderContent(oMessageStrip2), iContentIdx,
			"SemanticPage headerContent second item is inserted on index: " + iContentIdx);

		// Act
		iContentCount -= 2;
		this.oSemanticPage.destroyHeaderContent();

		// Assert
		assert.equal(this.oSemanticPage.getHeaderContent().length, iContentCount,
			"SemanticPage headerContent has been destroyed - items count: " + iContentCount);
		assert.ok(oMessageStrip.bIsDestroyed, "SemanticPage item has been destroyed.");
		assert.ok(oMessageStrip2.bIsDestroyed, "SemanticPage item has been destroyed.");
	});


	QUnit.test("test SemanticPage content aggregation methods", function (assert) {
		var oMessageStrip = oFactory.getMessageStrip(1);

		// Assert default
		assert.equal(this.oSemanticPage.getContent(), null,
			"SemanticPage content is null by default.");

		// Аct - add content
		this.oSemanticPage.setContent(oMessageStrip);

		// Assert
		assert.equal(this.oSemanticPage.getContent(), oMessageStrip,
			"SemanticPage content aggregation is set and retrieved successfully.");

		// Аct - destroy content
		this.oSemanticPage.destroyContent();

		// Assert
		assert.equal(this.oSemanticPage.getContent(), null,
			"SemanticPage content aggregation is destroyed successfully.");
	});


	QUnit.test("test SemanticPage footerCustomActions aggregation methods", function (assert) {
		var oButton = oFactory.getAction(),
			oButton2 = oFactory.getAction(),
			iContentCount = 0, iContentIdx = 0;

		// Assert default
		assert.equal(this.oSemanticPage.getFooterCustomActions().length, iContentCount,
			"SemanticPage footerCustomActions is empty by default - items count: " + iContentCount);

		// Act
		iContentCount++;
		this.oSemanticPage.addFooterCustomAction(oButton);

		// Assert
		assert.equal(this.oSemanticPage.getFooterCustomActions().length, iContentCount,
			"SemanticPage footerCustomActions has one new item added - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfFooterCustomAction(oButton), iContentIdx,
			"SemanticPage footerCustomActions item added is on index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticPage.removeAllFooterCustomActions();

		// Assert
		assert.equal(this.oSemanticPage.getFooterCustomActions().length, iContentCount,
			"SemanticPage footerCustomActions has been removed - items count: " + iContentCount);

		// Act
		iContentCount += 2;
		this.oSemanticPage.addFooterCustomAction(oButton);
		this.oSemanticPage.insertFooterCustomAction(oButton2, iContentIdx);

		// Assert
		assert.equal(this.oSemanticPage.getFooterCustomActions().length, iContentCount,
			"SemanticPage footerCustomActions has two items inserted - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfFooterCustomAction(oButton2), iContentIdx,
			"SemanticPage footerCustomActions second item is inserted on index: " + iContentIdx);

		// Act
		iContentCount -= 2;
		this.oSemanticPage.destroyFooterCustomActions();

		// Assert
		assert.equal(this.oSemanticPage.getFooterCustomActions().length, iContentCount,
			"SemanticPage footerCustomActions has been destroyed - items count: " + iContentCount);
		assert.ok(oButton.bIsDestroyed, "SemanticPage item has been destroyed.");
		assert.ok(oButton2.bIsDestroyed, "SemanticPage item has been destroyed.");
	});

	QUnit.test("test SemanticPage titleCustomTextActions aggregation methods", function (assert) {
		var oButton = oFactory.getAction(),
			oButton2 = oFactory.getAction(),
			iContentCount = 0, iContentIdx = 0;

		// Assert default
		assert.equal(this.oSemanticPage.getTitleCustomTextActions().length, iContentCount,
			"SemanticPage titleCustomTextActions is empty by default - items count: " + iContentCount);

		// Act
		iContentCount++;
		this.oSemanticPage.addTitleCustomTextAction(oButton);

		// Assert
		assert.equal(this.oSemanticPage.getTitleCustomTextActions().length, iContentCount,
			"SemanticPage titleCustomTextActions has one new item added - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfTitleCustomTextAction(oButton), iContentIdx,
			"SemanticPage titleCustomTextActions item added is on index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticPage.removeAllTitleCustomTextActions();

		// Assert
		assert.equal(this.oSemanticPage.getTitleCustomTextActions().length, iContentCount,
			"SemanticPage titleCustomTextActions has been removed - items count: " + iContentCount);

		// Act
		iContentCount += 2;
		this.oSemanticPage.addTitleCustomTextAction(oButton);
		this.oSemanticPage.insertTitleCustomTextAction(oButton2, iContentIdx);

		// Assert
		assert.equal(this.oSemanticPage.getTitleCustomTextActions().length, iContentCount,
			"SemanticPage titleCustomTextActions has two items inserted - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfTitleCustomTextAction(oButton2), iContentIdx,
			"SemanticPage titleCustomTextActions second item is inserted on index: " + iContentIdx);

		// Act
		iContentCount -= 2;
		this.oSemanticPage.destroyTitleCustomTextActions();

		// Assert
		assert.equal(this.oSemanticPage.getTitleCustomTextActions().length, iContentCount,
			"SemanticPage titleCustomTextActions has been destroyed - items count: " + iContentCount);
		assert.ok(oButton.bIsDestroyed, "SemanticPage item has been destroyed.");
		assert.ok(oButton2.bIsDestroyed, "SemanticPage item has been destroyed.");
	});

	QUnit.test("test SemanticPage titleCustomIconActions aggregation methods", function (assert) {
		var oButton = oFactory.getAction(),
			oButton2 = oFactory.getAction(),
			iContentCount = 0, iContentIdx = 0;

		// Assert default
		assert.equal(this.oSemanticPage.getTitleCustomIconActions().length, iContentCount,
			"SemanticPage titleCustomIconActions is empty by default - items count: " + iContentCount);

		// Act
		iContentCount++;
		this.oSemanticPage.addTitleCustomIconAction(oButton);

		// Assert
		assert.equal(this.oSemanticPage.getTitleCustomIconActions().length, iContentCount,
			"SemanticPage titleCustomIconActions has one new item added - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfTitleCustomIconAction(oButton), iContentIdx,
			"SemanticPage titleCustomIconActions item added is on index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticPage.removeAllTitleCustomIconActions();

		// Assert
		assert.equal(this.oSemanticPage.getTitleCustomIconActions().length, iContentCount,
			"SemanticPage titleCustomIconActions has been removed - items count: " + iContentCount);

		// Act
		iContentCount += 2;
		this.oSemanticPage.addTitleCustomIconAction(oButton);
		this.oSemanticPage.insertTitleCustomIconAction(oButton2, iContentIdx);

		// Assert
		assert.equal(this.oSemanticPage.getTitleCustomIconActions().length, iContentCount,
			"SemanticPage titleCustomIconActions has two items inserted - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfTitleCustomIconAction(oButton2), iContentIdx,
			"SemanticPage titleCustomIconActions second item is inserted on index: " + iContentIdx);

		// Act
		iContentCount -= 2;
		this.oSemanticPage.destroyTitleCustomIconActions();

		// Assert
		assert.equal(this.oSemanticPage.getTitleCustomIconActions().length, iContentCount,
			"SemanticPage titleCustomIconActions has been destroyed - items count: " + iContentCount);
		assert.ok(oButton.bIsDestroyed, "SemanticPage item has been destroyed.");
		assert.ok(oButton2.bIsDestroyed, "SemanticPage item has been destroyed.");
	});

	QUnit.test("test SemanticPage customShareActions aggregation methods", function (assert) {
		var oButton = oFactory.getAction(),
			oButton2 = oFactory.getAction(),
			iContentCount = 0, iContentIdx = 0;

		// Assert default
		assert.equal(this.oSemanticPage.getCustomShareActions().length, iContentCount,
			"SemanticPage customShareActions is empty by default - items count: " + iContentCount);

		// Act
		iContentCount++;
		this.oSemanticPage.addCustomShareAction(oButton);

		// Assert
		assert.equal(this.oSemanticPage.getCustomShareActions().length, iContentCount,
			"SemanticPage customShareActions has one new item added - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfCustomShareAction(oButton), iContentIdx,
			"SemanticPage customShareActions item added is on index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticPage.removeAllCustomShareActions();

		// Assert
		assert.equal(this.oSemanticPage.getCustomShareActions().length, iContentCount,
			"SemanticPage customShareActions has been removed - items count: " + iContentCount);

		// Act
		iContentCount += 2;
		this.oSemanticPage.addCustomShareAction(oButton);
		this.oSemanticPage.insertCustomShareAction(oButton2, iContentIdx);

		// Assert
		assert.equal(this.oSemanticPage.getCustomShareActions().length, iContentCount,
			"SemanticPage customShareActions has two items inserted - items count: " + iContentCount);
		assert.equal(this.oSemanticPage.indexOfCustomShareAction(oButton2), iContentIdx,
			"SemanticPage customShareActions second item is inserted on index: " + iContentIdx);

		// Act
		iContentCount -= 2;
		this.oSemanticPage.destroyCustomShareActions();

		// Assert
		assert.equal(this.oSemanticPage.getCustomShareActions().length, iContentCount,
			"SemanticPage customShareActions has been destroyed - items count: " + iContentCount);
		assert.ok(oButton.bIsDestroyed, "SemanticPage item has been destroyed.");
		assert.ok(oButton2.bIsDestroyed, "SemanticPage item has been destroyed.");
	});

	// This test is needed to ensure that the buttons added to customShareActions can be bound
	// the same way as other buttons
	// Due to the buttons being shown in the static UI area there might be issues with bindings
	QUnit.test("test SemanticPage customShareActions content bindings", function (assert) {
		var sButtonText = "Action 1";
		var aTexts = [];
		aTexts["action1"] = sButtonText;

		var oMockResourceBundle = {
			getText: function(sKey, aArgs, bIgnoreKeyFallback) {
				return aTexts[sKey];
			}
		};

		var i18n = new ResourceModel({
			bundle: oMockResourceBundle
		});

		this.oSemanticPage.setModel(i18n, "i18n");


		var oCustomShareButton = new sap.m.Button({
			icon: "sap-icon://excel-attachment",
			text: "{i18n>action1}"
		});

		this.oSemanticPage.addCustomShareAction(oCustomShareButton);

		Core.applyChanges();

		assert.strictEqual(oCustomShareButton.getText(), sButtonText, "Expected text from binding in button is there");
	});

	QUnit.test("test SemanticPage customShareActions *delayed* content bindings", function (assert) {
		var sButtonText = "Action 1";
		var aTexts = [];
		aTexts["action1"] = sButtonText;

		var oMockResourceBundle = {
			getText: function(sKey, aArgs, bIgnoreKeyFallback) {
				return aTexts[sKey];
			}
		};

		var i18n = new ResourceModel({
			bundle: oMockResourceBundle
		});


		var oCustomShareButton = new sap.m.Button({
			icon: "sap-icon://excel-attachment",
			text: "{i18n>action1}"
		});

		this.oSemanticPage.addCustomShareAction(oCustomShareButton);

		this.oSemanticPage.setModel(i18n, "i18n");

		Core.applyChanges();

		assert.strictEqual(oCustomShareButton.getText(), sButtonText, "Expected text from binding in button is there");
	});

	QUnit.test("test adding of CSS SemanticPage class not mentioned in CONTENT_PADDING_CLASSES_TO_FORWARD," +
			" to its _dynamicPage aggregation", function (assert) {

		// Arrange
		var oDynamicPage = this.oSemanticPage.getAggregation("_dynamicPage");

		// Act
		this.oSemanticPage.addStyleClass("NOT_EXISTING_CSS_CLASS");

		// Assert
		assert.strictEqual(oDynamicPage.aCustomStyleClasses.indexOf("NOT_EXISTING_CSS_CLASS"), -1,
				"NOT_EXISTING_CSS_CLASS CSS class not added to _dynamicPage aggregation.");
	});

	QUnit.test("test adding of CSS SemanticPage classes mentioned in CONTENT_PADDING_CLASSES_TO_FORWARD," +
			" to its _dynamicPage aggregation", function (assert) {

		// Arrange
		var oDynamicPage = this.oSemanticPage.getAggregation("_dynamicPage");

		// Act
		this.oSemanticPage.addStyleClass("sapUiNoContentPadding");
		this.oSemanticPage.addStyleClass("sapUiContentPadding");
		this.oSemanticPage.addStyleClass("sapUiResponsiveContentPadding");

		// Assert
		assert.ok(oDynamicPage.aCustomStyleClasses.indexOf("sapUiNoContentPadding"),
				"sapUiNoContentPadding CSS class applied to _dynamicPage aggregation.");
		assert.ok(oDynamicPage.aCustomStyleClasses.indexOf("sapUiContentPadding"),
				"sapUiContentPadding CSS class applied to _dynamicPage aggregation.");
		assert.ok(oDynamicPage.aCustomStyleClasses.indexOf("sapUiResponsiveContentPadding"),
				"sapUiResponsiveContentPadding CSS class applied to _dynamicPage aggregation.");
	});

	QUnit.test("test removing of CSS SemanticPage classes mentioned in CONTENT_PADDING_CLASSES_TO_FORWARD," +
			" to its _dynamicPage aggregation", function (assert) {

		// Arrange
		var oDynamicPage = this.oSemanticPage.getAggregation("_dynamicPage");

		// Act
		this.oSemanticPage.addStyleClass("sapUiNoContentPadding");
		this.oSemanticPage.addStyleClass("sapUiContentPadding");
		this.oSemanticPage.addStyleClass("sapUiResponsiveContentPadding");
		this.oSemanticPage.removeStyleClass("sapUiNoContentPadding");
		this.oSemanticPage.removeStyleClass("sapUiContentPadding");
		this.oSemanticPage.removeStyleClass("sapUiResponsiveContentPadding");

		// Assert
		assert.strictEqual(oDynamicPage.aCustomStyleClasses.indexOf("sapUiNoContentPadding"), -1,
				"sapUiNoContentPadding CSS class removed from _dynamicPage aggregation.");
		assert.strictEqual(oDynamicPage.aCustomStyleClasses.indexOf("sapUiContentPadding"), -1,
				"sapUiContentPadding CSS class removed from _dynamicPage aggregation.");
		assert.strictEqual(oDynamicPage.aCustomStyleClasses.indexOf("sapUiResponsiveContentPadding"), -1,
				"sapUiResponsiveContentPadding CSS class removed from _dynamicPage aggregation.");
	});

	QUnit.test("test SemanticPage destroy method", function (assert) {
		var oPage = this.oSemanticPage._getPage(),
			oTitle = this.oSemanticPage._getTitle(),
			oHeader = this.oSemanticPage._getHeader(),
			oFooter = this.oSemanticPage._getFooter();

		// Act
		this.oSemanticPage.destroy();

		// Assert default
		assert.ok(oPage.bIsDestroyed, "SemanticPage page has been destroyed.");
		assert.ok(oTitle.bIsDestroyed, "SemanticPage page title has been destroyed.");
		assert.ok(oHeader.bIsDestroyed, "SemanticPage page header has been destroyed.");
		assert.ok(oFooter.bIsDestroyed, "SemanticPage page footer has been destroyed.");
	});

	aSemanticActionsMetadata.forEach(function(oSemanticActionMetaData){
		QUnit.test("test " + oSemanticActionMetaData.className, function (assert) {
			var oSemanticClass = oSemanticActionMetaData.constructor,
				sSemanticClassName = oSemanticActionMetaData.className,
				/*eslint-disable new-cap*/
				oSemanticAction = new oSemanticClass(), oInternalControl;
				/*eslint-enable new-cap*/

			// Act
			this.oSemanticPage["set" + sSemanticClassName](oSemanticAction);
			oInternalControl = oSemanticAction._getControl ? oSemanticAction._getControl() : oSemanticAction;

			// Assert
			assert.equal(this.oSemanticPage["get" + sSemanticClassName](), oSemanticAction, sSemanticClassName + " has been set");
			assert.ok(oInternalControl, sSemanticClassName + " internal control has been created.");

			// Act
			this.oSemanticPage["destroy" + sSemanticClassName]();

			// Assert
			assert.equal(this.oSemanticPage["get" + sSemanticClassName](), null, sSemanticClassName + " does not exist anymore");
			assert.ok(oSemanticAction.bIsDestroyed, sSemanticClassName + " has been destroyed.");
			assert.ok(oInternalControl.bIsDestroyed, sSemanticClassName + " internal control has been destroyed.");
		});
	});

	QUnit.test("test saveAsTileAction aggregation", function (assert) {
		var oSaveAsTileAction = oFactory.getAction();

		// Act
		this.oSemanticPage.setSaveAsTileAction(oSaveAsTileAction);

		// Assert
		assert.equal(this.oSemanticPage.getSaveAsTileAction(), oSaveAsTileAction, "saveAsTileAction aggregation has been set");

		// Act
		this.oSemanticPage.destroySaveAsTileAction();

		// Assert
		assert.equal(this.oSemanticPage.getSaveAsTileAction(), null, "saveAsTileAction aggregation does not exist anymore");
		assert.ok(oSaveAsTileAction.bIsDestroyed, "oSaveAsTileAction button has been destroyed.");
	});

	QUnit.test("SemanticPage landmark info is set correctly", function (assert) {
		var oLandmarkInfo = new DynamicPageAccessibleLandmarkInfo({
			rootRole: "Region",
			rootLabel: "Root",
			contentRole: "Main",
			contentLabel: "Content",
			headerRole: "Banner",
			headerLabel: "Header",
			footerRole: "Region",
			footerLabel: "Footer"
		});

		this.oSemanticPage.setLandmarkInfo(oLandmarkInfo);
		Core.applyChanges();

		assert.strictEqual(this.oSemanticPage.$("page").attr("role"), "region", "Root role is set correctly.");
		assert.strictEqual(this.oSemanticPage.$("page").attr("aria-label"), "Root", "Root label is set correctly.");
		assert.strictEqual(this.oSemanticPage.$("page-content").attr("role"), "main", "Content role is set correctly.");
		assert.strictEqual(this.oSemanticPage.$("page-content").attr("aria-label"), "Content", "Content label is set correctly.");
		assert.strictEqual(this.oSemanticPage.$("page-header").attr("role"), "banner", "Header role is set correctly.");
		assert.strictEqual(this.oSemanticPage.$("page-header").attr("aria-label"), "Header", "Header label is set correctly.");
		assert.strictEqual(this.oSemanticPage.$("page-footerWrapper").attr("role"), "region", "Footer role is set correctly.");
		assert.strictEqual(this.oSemanticPage.$("page-footerWrapper").attr("aria-label"), "Footer", "Footer label is set correctly.");
	});

	QUnit.test("MessagesIndicator aria-labelledby is correct", function (assert) {
		var oMessagesIndicator = new sap.f.semantic.MessagesIndicator(),
			sAriaLabelledBy = oMessagesIndicator._getControl().getAriaLabelledBy()[0],
			sTextId = InvisibleText.getStaticId("sap.f", "SEMANTIC_CONTROL_MESSAGES_INDICATOR");

		assert.strictEqual(sAriaLabelledBy, sTextId, "MessagesIndicator button aria-labelledby is set correctly.");
	});

	/* --------------------------- SemanticPage Rendering ---------------------------------- */
	QUnit.module("SemanticPage - Rendering", {
		beforeEach: function () {
			this.oSemanticPage = oFactory.getSemanticPage();
			oUtil.renderObject(this.oSemanticPage);
			this.$semanicPage = this.oSemanticPage.$();
		},
		afterEach: function () {
			this.oSemanticPage.destroy();
			this.oSemanticPage = null;
			this.$semanicPage = null;
		}
	});

	QUnit.test("test SemanticPage DOM presents", function (assert) {
		// Assert
		assert.ok(this.$semanicPage.length > 0,
			"SemanticPage is rendered successfully with id: " + this.$semanicPage.attr("id"));
		assert.ok(this.$semanicPage.hasClass("sapFSemanticPage"),
			"SemanticPage has the expected css class: " + this.$semanicPage.attr("class"));
	});

	/* --------------------------- Semantic Configuration  ---------------------------------- */
	QUnit.module("SemanticConfiguration", {});

	QUnit.test("test isKnownSemanticType method", function (assert) {
		var sSemanticType = "sap.f.semantic.AddAction",
			sInvalidSemanticType = "INVALID_TYPE";

		// Assert
		assert.equal(oSemanticConfiguration.isKnownSemanticType(sSemanticType), true,
			sSemanticType + " is known Semantic Type");
		assert.equal(oSemanticConfiguration.isKnownSemanticType(sInvalidSemanticType), false,
			sInvalidSemanticType + " is not know Semantic Type");
	});

	QUnit.test("test getOrder method", function (assert) {
		var sSemanticAddType = "sap.f.semantic.AddAction",
			iSemanticAddTypeOrder = 4,
			sSemanticDeleteType = "sap.f.semantic.DeleteAction",
			iSemanticDeleteTypeOrder = 2;

		// Assert
		assert.equal(oSemanticConfiguration.getOrder(sSemanticAddType), iSemanticAddTypeOrder,
			sSemanticAddType + " has the correct order: " + iSemanticAddTypeOrder);
		assert.equal(oSemanticConfiguration.getOrder(sSemanticDeleteType), iSemanticDeleteTypeOrder,
			sSemanticDeleteType + " has the correct order: " + iSemanticDeleteTypeOrder);
	});

	QUnit.test("test getPlacement method", function (assert) {
		var sSemanticAddType = "sap.f.semantic.AddAction",
			sSemanticAddTypePlacement = "titleText",
			sSemanticMessagesIndicatorType = "sap.f.semantic.MessagesIndicator",
			sSemanticMessagesIndicatorTypePlacement = "footerLeft";

		// Assert
		assert.equal(oSemanticConfiguration.getPlacement(sSemanticAddType), sSemanticAddTypePlacement,
			sSemanticAddType + " has the correct placement: " + sSemanticAddTypePlacement);
		assert.equal(oSemanticConfiguration.getPlacement(sSemanticMessagesIndicatorType), sSemanticMessagesIndicatorTypePlacement,
			sSemanticMessagesIndicatorType + " has the correct placement: " + sSemanticMessagesIndicatorTypePlacement);
	});

	QUnit.test("test getConstraints method", function (assert) {
		var sSemanticAddType = "sap.f.semantic.AddAction",
			sSemanticCloseType = "sap.f.semantic.CloseAction",
			sSemanticCloseConstraintType = "IconOnly";

		// Assert
		assert.equal(oSemanticConfiguration.getConstraints(sSemanticAddType), null,
			sSemanticAddType + " has no Constraint");
		assert.equal(oSemanticConfiguration.getConstraints(sSemanticCloseType), sSemanticCloseConstraintType,
			sSemanticCloseType + " has the correct Constraint: " + sSemanticCloseConstraintType);
	});

	QUnit.test("test isMainAction method", function (assert) {
		var sSemanticAddType = "sap.f.semantic.AddAction",
			sSemanticTitleMainActionType = "sap.f.semantic.TitleMainAction";

		// Assert
		assert.equal(oSemanticConfiguration.isMainAction(sSemanticAddType), false,
			sSemanticAddType + " is not a Main Action");
		assert.equal(oSemanticConfiguration.isMainAction(sSemanticTitleMainActionType), true,
			sSemanticTitleMainActionType + " is a Main Action");
	});

	QUnit.test("test isNavigationAction method", function (assert) {
		var sSemanticAddType = "sap.f.semantic.AddAction",
			sSemanticCloseType = "sap.f.semantic.CloseAction";

		// Assert
		assert.equal(oSemanticConfiguration.isNavigationAction(sSemanticAddType), false,
			sSemanticAddType + " is not a Navigation Action");
		assert.equal(oSemanticConfiguration.isNavigationAction(sSemanticCloseType), true,
			sSemanticCloseType + " is a Navigation Action");
	});

	QUnit.test("test if a SemanticControl should be preprocessed", function (assert) {
		var sSemanticDraftIndicatorType = "sap.m.DraftIndicator",
			sSemanticAddType = "sap.f.semantic.AddAction";

		// Assert
		assert.equal(oSemanticConfiguration.shouldBePreprocessed(sSemanticDraftIndicatorType), true,
			sSemanticDraftIndicatorType + " should be preprocessed");
		assert.equal(oSemanticConfiguration.shouldBePreprocessed(sSemanticAddType), false,
			sSemanticAddType + " should not be preprocessed");
	});

});
