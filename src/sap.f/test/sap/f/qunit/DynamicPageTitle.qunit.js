/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/f/DynamicPage",
	"sap/f/DynamicPageTitle",
	"qunit/DynamicPageUtil",
	"sap/ui/core/Core",
	"sap/m/Link",
	"sap/m/Title"
],
function (
	$,
	Device,
	DynamicPage,
	DynamicPageTitle,
	DynamicPageUtil,
	Core,
	Link,
	Title
) {
	"use strict";

	var oFactory = DynamicPageUtil.oFactory,
		oUtil = DynamicPageUtil.oUtil;

	/* --------------------------- DynamicPage Title Rendering ---------------------------------- */
	QUnit.module("DynamicPage - Rendering - Title", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithExpandSnapContent();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});
	QUnit.test("DynamicPage Title - Expanded/Snapped Content initial visibility", function (assert) {
		var $titleSnap = this.oDynamicPage.getTitle().$("snapped-wrapper"),
				$titleExpand = this.oDynamicPage.getTitle().$("expand-wrapper");

		assert.equal($titleSnap.hasClass("sapUiHidden"), true, "Snapped Content is not visible initially");
		assert.equal($titleExpand.hasClass("sapUiHidden"), false, "Expanded Content is visible initially");
	});

	QUnit.test("DynamicPage Title - Content", function (assert) {
		var oTitle = this.oDynamicPage.getTitle();

		// Assert: DynamicPageTitle content aggregation is not empty
		assert.equal(oTitle.$().hasClass("sapFDynamicPageTitleWithoutContent"), false,
				"The css class hasn`t been added as the content aggregation is not empty");

		// Act: remove the content
		oTitle.removeAllContent();
		Core.applyChanges();

		// Assert: DynamicPageTitle content aggregation is empty
		assert.equal(oTitle.$("main").hasClass("sapFDynamicPageTitleMainNoContent"), true,
				"The css class has been added as the content aggregation is empty");
	});

	QUnit.module("DynamicPage - Rendering - Title with Breadcrumbs", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithBreadCrumbs();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage - Rendering - Title with Breadcrumbs", function (assert) {
		var oTitle = this.oDynamicPage.getTitle(),
				oBreadcrumbs = oTitle.getAggregation("breadcrumbs"),
				$oTitleTopDOM = oTitle.$("top");

		// Assert: DynamicPageTitle content aggregation is not empty
		assert.equal($oTitleTopDOM.length > 0, true, "sapFDynamicPageTitleTop element is rendered");
		assert.equal($oTitleTopDOM.hasClass("sapFDynamicPageTitleTop"), true, "sapFDynamicPageTitleTop class is added");
		assert.equal(oBreadcrumbs.$().length > 0, true, "Title Breadcrumbs DOM is rendered");
		assert.equal($oTitleTopDOM.hasClass("sapFDynamicPageTitleTopBreadCrumbsOnly"), true, "sapFDynamicPageTitleNavActionsOnly class is added");

		// Act: remove breadCrumbs aggregation
		oTitle.setBreadcrumbs(null);
		Core.applyChanges();

		// Assert: DynamicPageTitle content aggregation is empty
		assert.equal(oTitle.$("top").length > 0, false, "Title top DOM element is not rendered");
	});

	QUnit.test("DynamicPage - Rendering - Title with Invisible Breadcrumbs", function (assert) {
		//Arrange
		var oTitle = this.oDynamicPage.getTitle(),
			oBreadcrumbs = oTitle.getAggregation("breadcrumbs");

		// Act
		oBreadcrumbs.setVisible(false);
		this.oDynamicPage.setVisible(false);
		this.oDynamicPage.setVisible(true);
		Core.applyChanges();

		//
		assert.ok(oTitle.$("top").hasClass("sapUiHidden"));
	});

	QUnit.module("DynamicPage - Rendering - Title with navigationActions", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithNavigationActions();
			this.oDynamicPageTitle = this.oDynamicPage.getTitle();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
			this.oDynamicPageTitle = null;
		}
	});

	QUnit.test("DOM elements and classes", function (assert) {
		var oTitle = this.oDynamicPageTitle,
				$oTitleTopDOM = oTitle.$("top"),
				$oTitleTopNavigationAreaDOM = oTitle.$("topNavigationArea"),
				$oTitleMainNavigationAreaDOM = oTitle.$("mainNavigationArea");

		assert.equal($oTitleTopDOM.length > 0, true,
				"sapFDynamicPageTitleTop element is rendered.");
		assert.equal($oTitleTopDOM.hasClass("sapFDynamicPageTitleTop"), true,
				"sapFDynamicPageTitleTop class is added.");
		assert.equal($oTitleTopNavigationAreaDOM.length > 0, true,
				"top navigation area element is rendered.");
		assert.equal($oTitleMainNavigationAreaDOM.length > 0, true,
				"main navigation area element is rendered.");
		assert.equal($oTitleTopNavigationAreaDOM.hasClass("sapFDynamicPageTitleTopRight"), true,
				"sapFDynamicPageTitleTopRight class is add.");
		assert.equal($oTitleMainNavigationAreaDOM.hasClass("sapFDynamicPageTitleMainNavigationAreaInner"), true,
				"sapFDynamicPageTitleMainNavigationAreaInner class is added.");
		assert.equal($oTitleTopDOM.hasClass("sapFDynamicPageTitleTopNavActionsOnly"), true,
				"sapFDynamicPageTitleNavActionsOnly class is added.");
	});

	QUnit.test("Separator visibility on resize", function (assert) {
		var oTitle = this.oDynamicPageTitle,
				oTitlePressSpy = this.spy(DynamicPageTitle.prototype, "_toggleNavigationActionsPlacement"),
				iTitleLargeWidth = 1400,
				iTitleSmallWidth = 900,
				oSeparator = oTitle.getAggregation("_navActionsToolbarSeparator"),
				$oSeparator = oSeparator.$();

		// Arrange
		// Ensure the Title is bigger than 1280px, then navigationAction are in the Title`s main area.
		oTitle._onResize(iTitleLargeWidth);

		// Assert
		// Separator should be rendered.
		// Separator should not be visible as there are no actions added.
		assert.equal($oSeparator.length > 0, true, "Toolbar Separator element is rendered.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), true, "Toolbar Separator element is not visible.");

		// Act: Add an action.
		oTitle.addAction(oFactory.getAction());

		// Assert: Separator should be visible as there are both actions and navigationActions
		assert.equal(oTitle._shouldShowSeparator(), true,
				"Toolbar Separator should be visible, there are actions and navigationActions.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), false, "Toolbar Separator element is visible.");

		// Act: Simulate shrinking of the Page`s width to less than 1280px.
		oTitlePressSpy.reset();
		oTitle._onResize(iTitleSmallWidth);

		// Assert
		// Title`s width is less than 1280px,
		// the navigationActions are in the Title`s top area and the separator should not be visible.
		assert.ok(oTitlePressSpy.calledOnce, "Actions layout is toggled.");
		assert.equal(oTitle._shouldShowSeparator(), false, "Toolbar Separator should not be visible.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), true,
				"Toolbar Separator element is not visible, when the navigationActions are in top area.");

		// Act: Remove all actions.
		oTitlePressSpy.reset();
		oTitle.removeAllNavigationActions();
		oTitle._onResize(iTitleLargeWidth);

		// Assert: if there are no navigation actions -> no toggling
		assert.ok(!oTitlePressSpy.calledOnce, "Actions layout is not toggled.");
	});

	QUnit.test("Separator visibility upon actions and navigation actions change", function (assert) {
		var oTitle = this.oDynamicPageTitle,
				oAction1 = oFactory.getAction(),
				oAction2 = oFactory.getAction(),
				oAction3 = oFactory.getAction(),
				oSeparator = oTitle.getAggregation("_navActionsToolbarSeparator"),
				$oSeparator = oSeparator.$(),
				iTitleLargeWidth = 1400;

		// Arrange:
		oTitle.addAction(oAction1);
		oTitle.addAction(oAction2);
		// Ensure the Title is bigger than 1280px, then navigationAction are in the Title`s main area.
		oTitle._onResize(iTitleLargeWidth);

		// Assert
		assert.equal(oTitle._shouldShowSeparator(), true,
				"Toolbar Separator should be visible, there are both actions and navigationActions.");

		// Act: hide both actions (oAction1 and oAction2)
		oAction1.setVisible(false);
		oAction2.setVisible(false);

		// Assert
		assert.equal(oTitle._shouldShowSeparator(), false,
				"Toolbar Separator should not be visible, there are no visible actions.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), true, "Toolbar Separator element is not visible.");


		// Act: show one of the action (oAction1)
		oAction1.setVisible(true);
		// Ensure the Title is bigger than 1280px, then navigationAction are in the Title`s main area.
		oTitle._onResize(iTitleLargeWidth);

		// Assert
		assert.equal(oTitle._shouldShowSeparator(), true,
				"Toolbar Separator should be visible, there are both actions (although 1) and navigationActions.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), false, "Toolbar Separator element is visible.");


		// Act: remove all navigationActions
		oTitle.removeAllNavigationActions();

		// Assert
		assert.equal(oTitle._shouldShowSeparator(), false,
				"Toolbar Separator should not be visible, there are actions, but no navigationActions.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), true, "Toolbar Separator element is not visible.");


		// Act: add a navigationAction (oAction3)
		oTitle.addNavigationAction(oAction3);
		// Ensure the Title is bigger than 1280px, then navigationAction are in the Title`s main area.
		oTitle._onResize(iTitleLargeWidth);

		// Assert
		assert.equal(oTitle._shouldShowSeparator(), true,
				"Toolbar Separator should be visible, there are one action and one navigationAction.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), false, "Toolbar Separator element is visible.");


		// Act: hide the navigationAction (oAction3)
		oAction3.setVisible(false);

		// Assert
		assert.equal(oTitle._shouldShowSeparator(), false,
				"Toolbar Separator should be visible, there are one visible action, but no visible navigationAction.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), true, "Toolbar Separator element is not visible.");

		// Clean
		oAction1.destroy();
		oAction2.destroy();
		oAction3.destroy();
	});

	QUnit.module("DynamicPage - Rendering - Title with navigationActions and breadcrumbs", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithNavigationActionsAndBreadcrumbs();
			this.oDynamicPageTitle = this.oDynamicPage.getTitle();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
			this.oDynamicPageTitle = null;
		}
	});

	QUnit.test("Top area visibility upon breadcrumbs change", function (assert) {
		var oTitle = this.oDynamicPageTitle,
				oBreadcrumbs = oTitle.getBreadcrumbs(),
				$TitleTopArea = oTitle.$("top"),
				$TitleMainArea = oTitle.$("main"),
				iTitleLargeWidth = 1400,
				iTitleSmallWidth = 900;

		// Ensure the Title is bigger than 1280px, then navigationAction are in the Title`s main area.
		oTitle._onResize(iTitleLargeWidth);

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), false, "Large screen: Top area should be visible when there are visible breadcrumbs.");
		assert.equal($TitleMainArea.has(".sapFDynamicPageTitleActionsBar").length, 1, "Large screen: Navigation actions should be in the main title area");

		// Act
		oBreadcrumbs.setVisible(false);

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), true, "Large screen: Top area should not be visible when there are no visible breadcrumbs.");

		// Act
		oTitle._onResize(iTitleSmallWidth);

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), true,
				"Small screen: Top area should not be visible when there are no visible breadcrumbs and actions");
		assert.equal($TitleMainArea.has(".sapFDynamicPageTitleActionsBar").length, 1, "Small screen: Navigation actions should be in the main title area");

		// Act
		oBreadcrumbs.setVisible(true);

		// Assert
		assert.equal($TitleTopArea.has(".sapFDynamicPageTitleActionsBar").length, 1,
				"Small screen: Navigation actions should be in the top title area when there are visible breadcrumbs");
	});

	QUnit.test("Top area visibility upon navigation actions aggregation change", function (assert) {
		var oTitle = this.oDynamicPageTitle,
				$TitleTopArea = oTitle.$("top"),
				iTitleSmallWidth = 900;

		// Ensure the Title is smaller than 1280px, then navigationAction are in the Title`s top area.
		oTitle._onResize(iTitleSmallWidth);

		// Act
		oTitle.setBreadcrumbs(null);
		oTitle.removeAllNavigationActions();

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), true, "Top area should not be visible when all aggregations are removed");
	});

	QUnit.module("DynamicPage - Rendering - Title with navigationActions and actions", {
		beforeEach: function () {
			this.oDynamicPageStandardAndNavigationActions = oFactory.getDynamicPageWithStandardAndNavigationActions();
			this.oDynamicPageTitle = this.oDynamicPageStandardAndNavigationActions.getTitle();
			oUtil.renderObject(this.oDynamicPageStandardAndNavigationActions);
		},
		afterEach: function () {
			this.oDynamicPageStandardAndNavigationActions.destroy();
			this.oDynamicPageStandardAndNavigationActions = null;
			this.oDynamicPageTitle = null;
		}
	});

	QUnit.test("Top area visibility upon navigation actions visibility change", function (assert) {
		var oTitle = this.oDynamicPageStandardAndNavigationActions.getTitle(),
				$TitleTopArea = oTitle.$("top"),
				iTitleSmallWidth = 900;

		// Ensure the Title is smaller than 1280px, then navigationAction are in the Title`s top area.
		oTitle._onResize(iTitleSmallWidth);

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), false,
				"Top area should be visible when there is at least one visible navigation action");

		// Act (1) - hide all navigation actions
		oTitle.getNavigationActions().forEach(function(oAction) {
			oAction.setVisible(false);
		});

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), true,
				"Top area should not be visible when there are no visible navigation actions");

		// Act (2) - show random navigation action
		oTitle.getNavigationActions()[0].setVisible(true);

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), false,
				"Top area should be visible when there is at least one visible navigation action");
	});

	QUnit.test("Move actions to top/main area preserves focus", function (assert) {
		var oTitle = this.oDynamicPageStandardAndNavigationActions.getTitle(),
			iTitleSmallWidth = 900,
			iTitleBigWidth = 1500,
			oActionToFocus = oTitle.getNavigationActions()[0].getDomRef(),
			oSandbox = sinon.sandbox.create(),
			oMoveToTopSpy = oSandbox.spy(oTitle, "_showNavigationActionsInTopArea"),
			oMoveToMainSpy = oSandbox.spy(oTitle, "_showNavigationActionsInMainArea");

		oActionToFocus.focus();

		oTitle._onResize(iTitleBigWidth);

		assert.strictEqual(oMoveToMainSpy.callCount, 1, "move actions to main is called");
		assert.strictEqual(document.activeElement, oActionToFocus, "focus is preserved");

		// Ensure the Title is smaller than 1280px, then navigationAction are in the Title`s top area.
		oTitle._onResize(iTitleSmallWidth);

		assert.strictEqual(oMoveToTopSpy.callCount, 1, "move actions to top is called");
		assert.strictEqual(document.activeElement, oActionToFocus, "focus is preserved");

		oSandbox.restore();
	});

	QUnit.module("DynamicPage - Rendering - Title heading, snappedHeading and expandedHeading");

	QUnit.test("No heading at all", function (assert) {
		var oDynamicPageTitle = new DynamicPageTitle({}),
				oDynamicPage = new DynamicPage({
					title: oDynamicPageTitle,
					header: oFactory.getDynamicPageHeader(),
					content: oFactory.getContent(100),
					footer: oFactory.getFooter()
				});
		oUtil.renderObject(oDynamicPage);

		var $heading = oDynamicPageTitle.$("left-inner").find(".sapFDynamicPageTitleMainHeadingInner");
		assert.ok($heading.length === 1, "Heading area is rendered");
		assert.ok($heading.children().length === 0, "Heading area is empty");

		oDynamicPage.destroy();
	});

	QUnit.test("Only heading given", function (assert) {
		var oTitle = oFactory.getTitle(),
				oDynamicPageTitle = new DynamicPageTitle({
					heading: oTitle
				}),
				oDynamicPage = new DynamicPage({
					title: oDynamicPageTitle,
					header: oFactory.getDynamicPageHeader(),
					content: oFactory.getContent(100),
					footer: oFactory.getFooter()
				});
		oUtil.renderObject(oDynamicPage);

		var $heading = oDynamicPageTitle.$("left-inner").find(".sapFDynamicPageTitleMainHeadingInner");
		assert.ok($heading.length === 1, "Heading area is rendered");
		assert.ok($heading.children().length === 1, "Heading area has one child rendered");
		assert.ok($heading.children()[0] === oTitle.getDomRef(), "This child is the title");

		oDynamicPage.destroy();
	});

	QUnit.test("heading in combination with snappedHeading/expandedHeading given", function (assert) {
		var oTitle = oFactory.getTitle(),
				oDynamicPageTitle = new DynamicPageTitle({
					heading: oTitle,
					expandedHeading: oFactory.getTitle(),
					snappedHeading: oFactory.getTitle()
				}),
				oDynamicPage = new DynamicPage({
					title: oDynamicPageTitle,
					header: oFactory.getDynamicPageHeader(),
					content: oFactory.getContent(100),
					footer: oFactory.getFooter()
				}),
				sAriaLabelledBy = oDynamicPageTitle.getHeading().getId();

		oUtil.renderObject(oDynamicPage);

		var $heading = oDynamicPageTitle.$("left-inner").find(".sapFDynamicPageTitleMainHeadingInner");
		assert.ok($heading.length === 1, "Heading area is rendered");
		assert.ok($heading.children().length === 1, "Heading area has one child rendered");
		assert.ok($heading.children()[0] === oTitle.getDomRef(), "This child is the title");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "true", sAriaLabelledBy, "Heading aria-labelledby references should be set");

		oDynamicPage.destroy();
	});

	QUnit.test("Only snappedHeading given", function (assert) {
		var oDynamicPageTitle = new DynamicPageTitle({
					snappedHeading: oFactory.getTitle()
				}),
				oDynamicPage = new DynamicPage({
					title: oDynamicPageTitle,
					header: oFactory.getDynamicPageHeader(),
					content: oFactory.getContent(100),
					footer: oFactory.getFooter()
				});
		oUtil.renderObject(oDynamicPage);

		assert.ok(oDynamicPageTitle.$("snapped-heading-wrapper").length === 1, "Snapped heading wrapper is rendered");
		assert.ok(oDynamicPageTitle.$("snapped-heading-wrapper").hasClass("sapUiHidden"), "Snapped heading wrapper is hidden");

		oDynamicPage.destroy();
	});

	QUnit.test("Only expandedHeading given", function (assert) {
		var oDynamicPageTitle = new DynamicPageTitle({
					expandedHeading: oFactory.getTitle()
				}),
				oDynamicPage = new DynamicPage({
					title: oDynamicPageTitle,
					header: oFactory.getDynamicPageHeader(),
					content: oFactory.getContent(100),
					footer: oFactory.getFooter()
				});
		oUtil.renderObject(oDynamicPage);

		assert.ok(oDynamicPageTitle.$("expand-heading-wrapper").length === 1, "Expanded heading wrapper is rendered");
		assert.ok(!oDynamicPageTitle.$("expand-heading-wrapper").hasClass("sapUiHidden"), "Expanded heading wrapper is visible");

		oDynamicPage.destroy();
	});

	QUnit.test("Both snappedHeading and expandedHeading given", function (assert) {
		var oDynamicPageTitle = new DynamicPageTitle({
					snappedHeading: oFactory.getTitle(),
					expandedHeading: oFactory.getTitle()
				}),
				oDynamicPage = new DynamicPage({
					title: oDynamicPageTitle,
					header: oFactory.getDynamicPageHeader(),
					content: oFactory.getContent(100),
					footer: oFactory.getFooter()
				}),
				sAriaLabelledByExpanded = oDynamicPageTitle.getExpandedHeading().getId(),
				sAriaLabelledBySnapped = oDynamicPageTitle.getSnappedHeading().getId();

		oUtil.renderObject(oDynamicPage);

		assert.ok(oDynamicPageTitle.$("snapped-heading-wrapper").length === 1, "Snapped heading wrapper is rendered");
		assert.ok(oDynamicPageTitle.$("snapped-heading-wrapper").hasClass("sapUiHidden"), "Snapped heading wrapper is hidden");

		assert.ok(oDynamicPageTitle.$("expand-heading-wrapper").length === 1, "Expanded heading wrapper is rendered");
		assert.ok(!oDynamicPageTitle.$("expand-heading-wrapper").hasClass("sapUiHidden"), "Expanded heading wrapper is visible");

		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "true", sAriaLabelledByExpanded, "Expanded aria-labelledby references should be set");

		oDynamicPage.setHeaderExpanded(false);

		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "false", sAriaLabelledBySnapped, "Snapped aria-labelledby references should be set");

		oDynamicPage.destroy();
	});

	/* --------------------------- DynamicPage Title API ---------------------------------- */
	QUnit.module("DynamicPage Title - API ", {
		beforeEach: function () {
			sinon.config.useFakeTimers = true;
			this.oDynamicPage = oFactory.getDynamicPage();
			this.oDynamicPageTitle = this.oDynamicPage.getTitle();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			sinon.config.useFakeTimers = false;
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
			this.oDynamicPageTitle = null;
		}
	});

	QUnit.test("Add/Remove dynamically Snapped content", function (assert) {
		var oLabel = oFactory.getLabel("New Label"),
				iExpectedSnappedContentNumber = 0,
				iActualSnappedContentNumber = this.oDynamicPageTitle.getExpandedContent().length;

		assert.equal(iActualSnappedContentNumber, iExpectedSnappedContentNumber, "No Snapped Content");

		// Add label
		iExpectedSnappedContentNumber++;
		this.oDynamicPageTitle.addSnappedContent(oLabel);
		Core.applyChanges();
		iActualSnappedContentNumber = this.oDynamicPageTitle.getSnappedContent().length;

		assert.equal(iActualSnappedContentNumber, iExpectedSnappedContentNumber, "Snapped Content added successfully");


		// Remove label
		iExpectedSnappedContentNumber--;
		this.oDynamicPageTitle.removeSnappedContent(oLabel);
		Core.applyChanges();
		iActualSnappedContentNumber = this.oDynamicPageTitle.getSnappedContent().length;

		assert.equal(iActualSnappedContentNumber, iExpectedSnappedContentNumber, "Snapped Content removed successfully");
	});

	QUnit.test("Add/Remove dynamically Expanded content", function (assert) {
		var oLabel = oFactory.getLabel("New Label"),
				iExpectedExpandedContentNumber = 0,
				iActualExpandedContentNumber = this.oDynamicPageTitle.getExpandedContent().length;

		assert.equal(iActualExpandedContentNumber, iExpectedExpandedContentNumber, "No Expanded Content");

		// Add label
		iExpectedExpandedContentNumber++;
		this.oDynamicPageTitle.addExpandedContent(oLabel);
		iActualExpandedContentNumber = this.oDynamicPageTitle.getExpandedContent().length;

		assert.equal(iActualExpandedContentNumber, iExpectedExpandedContentNumber, "Expanded Content added successfully");


		// Remove label
		iExpectedExpandedContentNumber--;
		this.oDynamicPageTitle.removeExpandedContent(oLabel);
		iActualExpandedContentNumber = this.oDynamicPageTitle.getExpandedContent().length;

		assert.equal(iActualExpandedContentNumber, iExpectedExpandedContentNumber, "Expanded Content removed successfully");
	});

	QUnit.test("Add/Remove dynamically actions", function (assert) {
		var oAction = oFactory.getAction(),
				oAction1 = oFactory.getAction(),
				oAction2 = oFactory.getAction(),
				oAction3 = oFactory.getAction(),
				iExpectedActionsNumber = 0,
				iActualActionsNumber = this.oDynamicPageTitle.getActions().length,
				vResult = null;

		// Assert default state
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "There are no actions.");

		// Act: add Action
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.addAction(oAction);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is added successfully.");
		assert.equal(this.oDynamicPageTitle.getActions()[0].getId(), oAction.getId(), "The action is correctly positioned in the aggregation.");
		assert.equal(oAction.getParent().getId(), this.oDynamicPageTitle.getId(), "The action returns the correct parent.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert an existing action at the end
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.insertAction(oAction, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.ok(iActualActionsNumber !== iExpectedActionsNumber, "The action is not inserted.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert action at the end
		vResult = this.oDynamicPageTitle.insertAction(oAction1, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is inserted successfully.");
		assert.equal(this.oDynamicPageTitle.getActions()[1].getId(), oAction1.getId(), "The action is correctly positioned in the aggregation");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert action at the beginning
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.insertAction(oAction2, 0);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is inserted successfully.");
		assert.equal(this.oDynamicPageTitle.getActions()[0].getId(), oAction2.getId(), "The action is correctly positioned in the aggregation.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert action in the middle
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.insertAction(oAction3, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is inserted successfully.");
		assert.equal(this.oDynamicPageTitle.getActions()[1].getId(), oAction3.getId(), "The action is correctly positioned in the aggregation.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: remove Action
		vResult = this.oDynamicPageTitle.removeAction(oAction);
		iExpectedActionsNumber--;
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(oAction.getParent(), null, "The action returns no parent after removed from the DynamicPageTitle.");
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is removed successfully.");
		assert.equal(vResult, oAction, "The action is returned after removal.");

		// Act: add actions and remove All actions
		this.oDynamicPageTitle.addAction(oAction1);
		this.oDynamicPageTitle.addAction(oAction2);
		this.oDynamicPageTitle.removeAllActions();
		iExpectedActionsNumber = 0;
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "All Actions are removed successfully.");

		// Act: add two actions and then destroy all actions
		this.oDynamicPageTitle.addAction(oAction1);
		this.oDynamicPageTitle.addAction(oAction2);
		vResult = this.oDynamicPageTitle.destroyActions();
		iExpectedActionsNumber = 0;
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "All actions are destroyed successfully.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");
		assert.equal(oAction1.bIsDestroyed, true, "The action is destroyed successfully.");
		assert.equal(oAction1.bIsDestroyed, true, "The action is destroyed successfully.");

		// clean
		vResult = null;
	});

	QUnit.test("Add/Remove dynamically navigationActions", function (assert) {
		var oAction = oFactory.getAction(),
				oAction1 = oFactory.getAction(),
				oAction2 = oFactory.getAction(),
				oAction3 = oFactory.getAction(),
				iExpectedActionsNumber = 0,
				iExpectedIndex = 0,
				iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length,
				vResult = null;

		// Assert default state
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "There are no navActions.");

		// Act: add Action
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.addNavigationAction(oAction);
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action added successfully.");
		assert.equal(this.oDynamicPageTitle.indexOfNavigationAction(oAction), iExpectedIndex, "The action is correctly positioned in the aggregation");
		assert.equal(oAction.getParent().getId(), this.oDynamicPageTitle.getId(), "The action returns the correct parent");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert an existing action at the end
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.insertNavigationAction(oAction, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.ok(iActualActionsNumber !== iExpectedActionsNumber, "The action is not inserted.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert action at the end
		vResult = this.oDynamicPageTitle.insertNavigationAction(oAction1, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is inserted successfully.");
		assert.equal(this.oDynamicPageTitle.getNavigationActions()[1].getId(), oAction1.getId(), "The action is correctly positioned in the aggregation.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert action at the beginning
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.insertNavigationAction(oAction2, 0);
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is inserted successfully.");
		assert.equal(this.oDynamicPageTitle.getNavigationActions()[0].getId(), oAction2.getId(), "The action is correctly positioned in the aggregation.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert action in the middle
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.insertNavigationAction(oAction3, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action inserted successfully.");
		assert.equal(this.oDynamicPageTitle.getNavigationActions()[1].getId(), oAction3.getId(), "The action is correctly positioned in the aggregation.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: remove Action
		iExpectedActionsNumber--;
		vResult = this.oDynamicPageTitle.removeNavigationAction(oAction);
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(oAction.getParent(), null, "The action returns no parent after removed from the DynamicPageTitle.");
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "One action removed successfully.");
		assert.equal(vResult, oAction, "The action is returned after removal.");

		// Act: add actions and remove All actions
		this.oDynamicPageTitle.addNavigationAction(oAction1);
		this.oDynamicPageTitle.addNavigationAction(oAction2);
		this.oDynamicPageTitle.removeAllNavigationActions();
		iExpectedActionsNumber = 0;
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "All actions removed successfully.");

		// Act: add two actions and then destroy all actions
		this.oDynamicPageTitle.addNavigationAction(oAction1);
		this.oDynamicPageTitle.addNavigationAction(oAction2);
		vResult = this.oDynamicPageTitle.destroyNavigationActions();
		iExpectedActionsNumber = 0;
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "All Actions are destroyed successfully.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");
		assert.equal(oAction1.bIsDestroyed, true, "The action is destroyed successfully.");
		assert.equal(oAction1.bIsDestroyed, true, "The action is destroyed successfully.");

		// clean
		vResult = null;
	});

	QUnit.test("test primaryArea", function (assert) {
		var oDynamicPageTitle = this.oDynamicPageTitle,
				sBeginArea = sap.f.DynamicPageTitleArea.Begin;

		// Assert default: primary area is "Begin"
		assert.equal(oDynamicPageTitle.getPrimaryArea(), sBeginArea, "is the default one");
	});

	QUnit.test("test areaShrinkRatio", function (assert) {
		var oDynamicPageTitle = this.oDynamicPageTitle;

		// Assert default: Heading:Content:Actions - "1:1.6:1.6"
		assert.equal(oDynamicPageTitle.getAreaShrinkRatio(), "1:1.6:1.6", "is the default one");

		// Act
		oDynamicPageTitle.setAreaShrinkRatio("0:0:0");

		// Assert
		assert.equal(oDynamicPageTitle.getAreaShrinkRatio(), "0:0:0", "shrink factors are correct");
	});

	QUnit.test("Adding an OverflowToolbar to the content sets flex-basis and removing it resets it", function (assert) {
		var oToolbar = oFactory.getOverflowToolbar();

		// Act
		this.oDynamicPageTitle.addContent(oToolbar);
		Core.applyChanges();
		this.clock.tick(1000);

		// Assert
		var sFlexBasis = this.oDynamicPageTitle.$("content").css("flex-basis");
		assert.notEqual(sFlexBasis, "auto", "Adding an OverflowToolbar sets flex-basis");

		// Act
		this.oDynamicPageTitle.removeAllContent();
		Core.applyChanges();
		this.clock.tick(1000);

		// Assert
		var sFlexBasis = this.oDynamicPageTitle.$("content").css("flex-basis");
		assert.equal(sFlexBasis, "auto", "Removing an OverflowToolbar resets flex-basis");
	});

	QUnit.test("Adding a control, other than OverflowToolbar to the content does not set flex-basis", function (assert) {
		var oLabel = oFactory.getLabel("test");

		// Act
		this.oDynamicPageTitle.addContent(oLabel);
		Core.applyChanges();
		this.clock.tick(1000);

		// Assert
		var sFlexBasis = this.oDynamicPageTitle.$("content").css("flex-basis");
		assert.equal(sFlexBasis, "auto", "No flex-basis set");
	});

	QUnit.test("Actions toolbar is extended when its label content extends", function (assert) {
		var oLabel = oFactory.getLabel("");
		this.oDynamicPageTitle.addAction(oLabel);
		Core.applyChanges();
		this.clock.tick(1000);

		var iFlexBasisBefore = parseInt(this.oDynamicPageTitle.$("mainActions").css("flex-basis"));

		// Act
		oLabel.setText("Some non-empty text");
		Core.applyChanges();
		this.clock.tick(1000);

		// Assert
		var sFlexBasisAfter = parseInt(this.oDynamicPageTitle.$("mainActions").css("flex-basis"));
		assert.ok(sFlexBasisAfter > iFlexBasisBefore + 50, "Flex-basis increased to show the new text");
	});

	QUnit.test("Actions toolbar is extended when its link content extends", function (assert) {
		var oLink = new Link();
		this.oDynamicPageTitle.addAction(oLink);
		Core.applyChanges();
		this.clock.tick(1000);

		var iFlexBasisBefore = parseInt(this.oDynamicPageTitle.$("mainActions").css("flex-basis"));

		// Act
		oLink.setText("Some non-empty text");
		Core.applyChanges();
		this.clock.tick(1000);

		// Assert
		var sFlexBasisAfter = parseInt(this.oDynamicPageTitle.$("mainActions").css("flex-basis"));
		assert.ok(sFlexBasisAfter > iFlexBasisBefore + 50, "Flex-basis increased to show the new text");
	});

	QUnit.test("DynamicPage Title - backgroundDesign", function(assert) {
		var $oDomRef = this.oDynamicPageTitle.$();

		// assert
		assert.equal(this.oDynamicPageTitle.getBackgroundDesign(), null, "Default value of backgroundDesign property = null");

		// act
		this.oDynamicPageTitle.setBackgroundDesign("Solid");
		Core.applyChanges();

		// assert
		assert.ok($oDomRef.hasClass("sapFDynamicPageTitleSolid"), "Should have sapFDynamicPageTitleSolid class");
		assert.strictEqual(this.oDynamicPageTitle.getBackgroundDesign(), "Solid", "Should have backgroundDesign property = 'Solid'");

		// act
		this.oDynamicPageTitle.setBackgroundDesign("Transparent");
		Core.applyChanges();

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageTitleSolid"), "Should not have sapFDynamicPageTitleSolid class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageTitleTransparent"), "Should have sapFDynamicPageTitleTransparent class");
		assert.strictEqual(this.oDynamicPageTitle.getBackgroundDesign(), "Transparent", "Should have backgroundDesign property = 'Transparent'");

		// act
		this.oDynamicPageTitle.setBackgroundDesign("Translucent");
		Core.applyChanges();

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageTitleTransparent"), "Should not have sapFDynamicPageTitleTransparent class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageTitleTranslucent"), "Should have sapFDynamicPageTitleTranslucent class");
		assert.strictEqual(this.oDynamicPageTitle.getBackgroundDesign(), "Translucent", "Should have backgroundDesign property = 'Translucent'");
	});

	QUnit.test("title clone includes actions", function (assert) {
		var oLink = new Link(),
				oTitleClone,
				iExpectedActionsCount = 1;
		this.oDynamicPageTitle.addAction(oLink);
		assert.strictEqual(this.oDynamicPageTitle.getActions().length, iExpectedActionsCount, "title has expected actions count"); // assert state before act

		// Act
		oTitleClone = this.oDynamicPageTitle.clone();

		// Check
		assert.strictEqual(oTitleClone.getActions().length, iExpectedActionsCount, "title clone also has the same actions count");
	});

	QUnit.test("title clone includes navigation actions", function (assert) {
		var oLink = new Link(),
				oTitleClone,
				iExpectedNavActionsCount = 1;
		this.oDynamicPageTitle.addNavigationAction(oLink);
		assert.strictEqual(this.oDynamicPageTitle.getNavigationActions().length, iExpectedNavActionsCount, "title has expected nav actions count"); // assert state before act

		// Act
		oTitleClone = this.oDynamicPageTitle.clone();

		// Check
		assert.strictEqual(oTitleClone.getNavigationActions().length, iExpectedNavActionsCount, "title clone also has the same nav actions count");
	});

	/* --------------------------- DynamicPage Title Aggregations ---------------------------------- */
	QUnit.module("DynamicPage Title - SnappedTitleOnMobile Aggregation", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			this.oDynamicPage.setHeaderExpanded(false);
			this.oDynamicPageTitle = this.oDynamicPage.getTitle();
			this.oDynamicPageTitle.setAggregation("snappedTitleOnMobile", new Title({text: "Test"}));
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
			this.oDynamicPageTitle = null;
		}
	});

	QUnit.test("SnappedTitleOnMobile on Phone", function (assert) {
		// Arrange
		oUtil.toMobileMode();
		oUtil.renderObject(this.oDynamicPage);

		var $TopArea = this.oDynamicPageTitle.$topArea,
			$MainArea = this.oDynamicPageTitle.$mainArea,
			bIsExpandButtonVisible = this.oDynamicPageTitle._getShowExpandButton(),
			$STOMWrapper = this.oDynamicPageTitle.$snappedTitleOnMobileWrapper,
			oSnappedWrapper = this.oDynamicPageTitle.$snappedWrapper.context,
			$titleWrapper = this.oDynamicPage.$("header");

		// Assert
		assert.notOk($titleWrapper.hasClass("sapFDynamicPageTitleSnapped"), "DynamicPageTitleWrapper hasn't the sapFDynamicPageTitleSnapped CSS class.");
		assert.ok($titleWrapper.hasClass("sapFDynamicPageTitleSnappedTitleOnMobile"),
				"DynamicPageTitleWrapper has the sapFDynamicPageTitleSnappedTitleOnMobile CSS class.");
		assert.ok($STOMWrapper, "SnappedTitleOnMobile wrapper exists.");
		assert.notOk(oSnappedWrapper, "Snapped wrapper does not exist.");
		assert.notOk($STOMWrapper.hasClass("sapUiHidden"), "SnappedTitleOnMobile is visible.");
		assert.ok($MainArea.hasClass("sapUiHidden"), "Dynamic Page Title Main area isn't visible while SnappedTitleOnMobile is.");
		assert.notOk(bIsExpandButtonVisible, "Expand Button isn't visible while SnappedTitleOnMobile is.");

		// Act
		Device.orientation.landscape = true;
		Device.orientation.portrait = false;

		// Assert
		assert.notOk($titleWrapper.hasClass("sapFDynamicPageTitleSnapped"), "DynamicPageTitleWrapper hasn't the sapFDynamicPageTitleSnapped CSS class.");
		assert.ok($titleWrapper.hasClass("sapFDynamicPageTitleSnappedTitleOnMobile"),
				"DynamicPageTitleWrapper has the sapFDynamicPageTitleSnappedTitleOnMobile CSS class.");

		// Act
		this.oDynamicPage.setHeaderExpanded(true);
		bIsExpandButtonVisible = this.oDynamicPageTitle._getShowExpandButton();

		// Assert
		assert.ok($STOMWrapper.hasClass("sapUiHidden"), "SnappedTitleOnMobile is hidden while title is expanded.");
		assert.notOk($TopArea.hasClass("sapUiHidden"), "Dynamic Page Title Top area is visible while SnappedTitleOnMobile isn't.");
		assert.notOk($MainArea.hasClass("sapUiHidden"), "Dynamic Page Title Main area is visible while SnappedTitleOnMobile isn't.");
		assert.notOk(bIsExpandButtonVisible, "Expand Button isn't visible while SnappedTitleOnMobile is.");
		assert.notOk(oSnappedWrapper, "SnappedTitleOnMobile does not exist.");

		// Cleanup
		oUtil.toDesktopMode();
		Device.orientation.landscape = false;
		Device.orientation.portrait = true;
	});

	QUnit.test("No SnappedTitleOnMobile on Phone", function (assert) {
		// Arrange
		oUtil.toMobileMode();
		this.oDynamicPageTitle.setAggregation("snappedTitleOnMobile", null);
		oUtil.renderObject(this.oDynamicPage);

		var $TopArea = this.oDynamicPageTitle.$topArea,
			$MainArea = this.oDynamicPageTitle.$mainArea,
			bIsExpandButtonVisible = this.oDynamicPageTitle._getShowExpandButton(),
			oSTOMWrapper = this.oDynamicPageTitle.$snappedTitleOnMobileWrapper.context,
			$SnappedWrapper = this.oDynamicPageTitle.$snappedWrapper,
			$titleWrapper = this.oDynamicPage.$("header");

		// Assert
		assert.ok($titleWrapper.hasClass("sapFDynamicPageTitleSnapped"), "DynamicPageTitleWrapper has the sapFDynamicPageTitleSnapped CSS class.");
		assert.notOk($titleWrapper.hasClass("sapFDynamicPageTitleSnappedTitleOnMobile"),
				"DynamicPageTitleWrapper hasn't the sapFDynamicPageTitleSnappedTitleOnMobile CSS class.");
		assert.notOk(oSTOMWrapper, "SnappedTitleOnMobile wrapper does not exist.");
		assert.ok($SnappedWrapper, "Snapped wrapper exists.");
		assert.notOk($SnappedWrapper.hasClass("sapUiHidden"), "Snapped wrapper is visible.");
		assert.notOk($MainArea.hasClass("sapUiHidden"), "Dynamic Page Title Main area is visible while snapped.");
		assert.ok(bIsExpandButtonVisible, "Expand Button is visible while Snapped wrapper is.");

		// Act
		Device.orientation.landscape = true;
		Device.orientation.portrait = false;

		// Assert
		assert.ok($titleWrapper.hasClass("sapFDynamicPageTitleSnapped"), "DynamicPageTitleWrapper has the sapFDynamicPageTitleSnapped CSS class.");
		assert.notOk($titleWrapper.hasClass("sapFDynamicPageTitleSnappedTitleOnMobile."),
				"DynamicPageTitleWrapper hasn't the sapFDynamicPageTitleSnappedTitleOnMobile CSS class");

		// Act
		this.oDynamicPage.setHeaderExpanded(true);
		bIsExpandButtonVisible = this.oDynamicPageTitle._getShowExpandButton();

		// Assert
		assert.notOk(oSTOMWrapper, "SnappedTitleOnMobile wrapper does not exist.");
		assert.ok($SnappedWrapper, "Snapped wrapper exists.");
		assert.notOk($TopArea.hasClass("sapUiHidden"), "Dynamic Page Title Top area is visible while Snapped Wrapper isn't.");
		assert.notOk($MainArea.hasClass("sapUiHidden"), "Dynamic Page Title Main area is visible while Snapped Wrapper isn't.");
		assert.notOk(bIsExpandButtonVisible, "Expand Button isn't visible while Snapped wrapper isn't.");

		// Cleanup
		oUtil.toDesktopMode();
		Device.orientation.landscape = false;
		Device.orientation.portrait = true;
	});

	QUnit.test("SnappedTitleOnMobile on Tablet", function (assert) {
		// Arrange
		oUtil.toTabletMode();
		oUtil.renderObject(this.oDynamicPage);

		var $TopArea = this.oDynamicPageTitle.$topArea,
			$MainArea = this.oDynamicPageTitle.$mainArea,
			bIsExpandButtonVisible = this.oDynamicPageTitle._getShowExpandButton(),
			oSTOMWrapper = this.oDynamicPageTitle.$snappedTitleOnMobileWrapper.context,
			$SnappedWrapper = this.oDynamicPageTitle.$snappedWrapper,
			$titleWrapper = this.oDynamicPage.$("header");

		// Assert
		assert.ok($titleWrapper.hasClass("sapFDynamicPageTitleSnapped"), "DynamicPageTitleWrapper has the sapFDynamicPageTitleSnapped CSS class.");
		assert.notOk($titleWrapper.hasClass("sapFDynamicPageTitleSnappedTitleOnMobile"),
				"DynamicPageTitleWrapper hasn't the sapFDynamicPageTitleSnappedTitleOnMobile CSS class.");
		assert.notOk(oSTOMWrapper, "SnappedTitleOnMobile wrapper does not exist.");
		assert.ok($SnappedWrapper, "Snapped wrapper exists.");
		assert.notOk($SnappedWrapper.hasClass("sapUiHidden"), "Snapped wrapper is visible.");
		assert.notOk($MainArea.hasClass("sapUiHidden"), "Dynamic Page Title Main area is visible while snapped.");
		assert.ok(bIsExpandButtonVisible, "Expand Button is visible while Snapped wrapper is.");

		// Act
		Device.orientation.landscape = true;
		Device.orientation.portrait = false;

		// Assert
		assert.ok($titleWrapper.hasClass("sapFDynamicPageTitleSnapped"), "DynamicPageTitleWrapper has the sapFDynamicPageTitleSnapped CSS class.");
		assert.notOk($titleWrapper.hasClass("sapFDynamicPageTitleSnappedTitleOnMobile."),
				"DynamicPageTitleWrapper hasn't the sapFDynamicPageTitleSnappedTitleOnMobile CSS class");

		// Act
		this.oDynamicPage.setHeaderExpanded(true);
		bIsExpandButtonVisible = this.oDynamicPageTitle._getShowExpandButton();

		// Assert
		assert.notOk(oSTOMWrapper, "SnappedTitleOnMobile wrapper does not exist.");
		assert.ok($SnappedWrapper, "Snapped wrapper exists.");
		assert.notOk($TopArea.hasClass("sapUiHidden"), "Dynamic Page Title Top area is visible while Snapped Wrapper isn't.");
		assert.notOk($MainArea.hasClass("sapUiHidden"), "Dynamic Page Title Main area is visible while Snapped Wrapper isn't.");
		assert.notOk(bIsExpandButtonVisible, "Expand Button isn't visible while Snapped wrapper isn't.");

		// Cleanup
		oUtil.toDesktopMode();
		Device.orientation.landscape = false;
		Device.orientation.portrait = true;
	});

	QUnit.test("SnappedTitleOnMobile on Desktop", function (assert) {
		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		var $TopArea = this.oDynamicPageTitle.$topArea,
			$MainArea = this.oDynamicPageTitle.$mainArea,
			bIsExpandButtonVisible = this.oDynamicPageTitle._getShowExpandButton(),
			oSTOMWrapper = this.oDynamicPageTitle.$snappedTitleOnMobileWrapper.context,
			$SnappedWrapper = this.oDynamicPageTitle.$snappedWrapper,
			$titleWrapper = this.oDynamicPage.$("header");

		// Assert
		assert.ok($titleWrapper.hasClass("sapFDynamicPageTitleSnapped"), "DynamicPageTitleWrapper has the sapFDynamicPageTitleSnapped CSS class.");
		assert.notOk($titleWrapper.hasClass("sapFDynamicPageTitleSnappedTitleOnMobile"),
				"DynamicPageTitleWrapper hasn't the sapFDynamicPageTitleSnappedTitleOnMobile CSS class.");
		assert.notOk(oSTOMWrapper, "SnappedTitleOnMobile wrapper does not exist.");
		assert.ok($SnappedWrapper, "Snapped wrapper exists.");
		assert.notOk($SnappedWrapper.hasClass("sapUiHidden"), "Snapped wrapper is visible.");
		assert.notOk($MainArea.hasClass("sapUiHidden"), "Dynamic Page Title Main area is visible while snapped.");
		assert.ok(bIsExpandButtonVisible, "Expand Button is visible while Snapped wrapper is.");

		// Act
		this.oDynamicPage.setHeaderExpanded(true);
		bIsExpandButtonVisible = this.oDynamicPageTitle._getShowExpandButton();

		// Assert
		assert.notOk(oSTOMWrapper, "SnappedTitleOnMobile wrapper does not exist.");
		assert.ok($SnappedWrapper, "Snapped wrapper exists.");
		assert.notOk($TopArea.hasClass("sapUiHidden"), "Dynamic Page Title Top area is visible while Snapped Wrapper isn't.");
		assert.notOk($MainArea.hasClass("sapUiHidden"), "Dynamic Page Title Main area is visible while Snapped Wrapper isn't.");
		assert.notOk(bIsExpandButtonVisible, "Expand Button isn't visible while Snapped wrapper isn't.");
	});

	QUnit.module("DynamicPage Title - Events", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			this.oDynamicPageTitle = this.oDynamicPage.getTitle();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
			this.oDynamicPageTitle = null;
		}
	});

	QUnit.test("MouseOut/MouseOver events should be prevented when target is child", function (assert) {
		var oTitle = this.oDynamicPageTitle,
			oTitleMouseOverSpy = this.spy(this.oDynamicPage, "_onTitleMouseOver"),
			oTitleMouseOutSpy = this.spy(this.oDynamicPage, "_onTitleMouseOut"),
			oEventOnMouseOut = {};

		// Act
		oUtil.renderObject(this.oDynamicPage);

		oEventOnMouseOut.relatedTarget = oTitle.getHeading().getDomRef();
		oTitle.onmouseover();

		// Assert
		assert.ok(oTitleMouseOverSpy.calledOnce, "mouseover event was not fired");

		// Act
		oTitle.onmouseout(oEventOnMouseOut);

		// Assert
		assert.ok(oTitleMouseOutSpy.notCalled, "mouseout event was not fired because target element is child of title");

		// Act
		oTitle.onmouseover();

		// Assert
		assert.ok(oTitleMouseOverSpy.calledOnce, "mouseover event was not fired because event source is child of title");

		// Act
		oEventOnMouseOut.relatedTarget = this.oDynamicPage.getContent().getDomRef();
		oTitle.onmouseout(oEventOnMouseOut);

		// Assert
		assert.ok(oTitleMouseOverSpy.calledOnce, "_titleMouseOver was fired only once");
		assert.ok(oTitleMouseOutSpy.calledOnce, "_titleMouseOut was fired only once");
	});
});
