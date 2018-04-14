/*global QUnit,sinon*/

(function ($, QUnit, sinon, Importance, library) {
	"use strict";

	jQuery.sap.registerModulePath("view", "view");

	var iRenderingDelay = 2000;
	var ANCHORBAR_CLASS_SELECTOR = ".sapUxAPAnchorBar";
	var HIERARCHICAL_CLASS_SELECTOR = ".sapUxAPHierarchicalSelect";

	QUnit.module("properties", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.anchorBarView = sap.ui.xmlview("UxAP-69_anchorBar", {
				viewName: "view.UxAP-69_AnchorBar"
			});
			this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
			this.anchorBarView.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
			this.clock.tick(iRenderingDelay);
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			this.clock.restore();
		}
	});

	QUnit.test("Show/Hide Bar", function (assert) {
		assert.expect(3); //number of assertions

		// test whether it is visible by default
		assert.strictEqual(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0, true, "anchorBar visible by default");

		// hide the anchor bar
		this.oObjectPage.setShowAnchorBar(false);

		// allow for re-render
		sap.ui.getCore().applyChanges();

		// test whether it is hidden
		assert.strictEqual(jQuery(ANCHORBAR_CLASS_SELECTOR).length, 0, "anchorBar hidden");

		// show the anchor bar back
		this.oObjectPage.setShowAnchorBar(true);

		// allow for re-render
		sap.ui.getCore().applyChanges();
		assert.strictEqual(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0, true, "anchorBar displayed");

	});

	QUnit.test("Show/Hide popover", function (assert) {
		//no longer show the popover
		this.oObjectPage.setShowAnchorBarPopover(false);
		this.oObjectPage.getAggregation("_anchorBar").getContent()[1].firePress();

		// allow for re-render
		this.clock.tick(iRenderingDelay);

		assert.strictEqual(jQuery(".sapUxAPAnchorBarPopover").length, 0, "don't show popover");
	});

	QUnit.test("Selected button", function (assert) {
		//select button programatically
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			aAnchorBarContent = oAnchorBar.getContent(),
			oFirstSectionButton = aAnchorBarContent[0],
			oLastSectionButton = aAnchorBarContent[aAnchorBarContent.length - 1];

		oAnchorBar.setSelectedButton(oLastSectionButton);

		// allow for scroling
		this.clock.tick(iRenderingDelay);

		assert.strictEqual(oLastSectionButton.$().hasClass("sapUxAPAnchorBarButtonSelected"), true, "select button programmatically");
		assert.strictEqual(oLastSectionButton.$().attr("aria-checked"), "true", "ARIA checked state should be true for the selected button");
		assert.strictEqual(oFirstSectionButton.$().attr("aria-checked"), "false", "ARIA checked state should be false for the unselected button");
	});

	QUnit.test("Custom button", function (assert) {
		//select button programatically
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oCustomButton = this.oObjectPage.getSections()[0].getCustomAnchorBarButton(),
			aAnchorBarContent = oAnchorBar.getContent(),
			oFirstSectionButton = aAnchorBarContent[0];

		oCustomButton.setEnabled(false);

		// allow for scroling
		this.clock.tick(iRenderingDelay);

		assert.strictEqual(oFirstSectionButton.$().hasClass("sapUxAPAnchorBarButtonSelected"), true, "selection is preserved");
		assert.strictEqual(oFirstSectionButton.getEnabled(), false, "property change is propagated");
	});

	QUnit.test("Submenu button accessibility", function (assert) {
		var	oButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1],
			sSubSectionId = this.oObjectPage.getSections()[1].getSubSections()[0].getId();

		oButton.firePress();

		// allow for re-render
		this.clock.tick(iRenderingDelay);

		assert.strictEqual(jQuery(".sapUxAPAnchorBarPopover").find(".sapUxAPAnchorBarButton").first().attr("aria-controls"), sSubSectionId,
				"ARIA controls attribute should match the corresponding SubSection ID");
	});

	QUnit.test("Phone view", function (assert) {
		//display hierarchical select
		jQuery("html")
			.removeClass("sapUiMedia-Std-Phone sapUiMedia-Std-Desktop sapUiMedia-Std-Tablet")
			.addClass("sapUiMedia-Std-Phone");
		this.oObjectPage.invalidate();

		// allow for re-render
		this.clock.tick(iRenderingDelay);

		assert.ok(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0 && jQuery(HIERARCHICAL_CLASS_SELECTOR).is(":visible") == true, "display hierarchical select");
	});

	QUnit.test("Anchors for sections with multiple subsection must have arrow-down icon", function (assert) {
		var $arrowDownIcons;

		$arrowDownIcons = this.oObjectPage.$().find(".sapUxAPAnchorBar .sapUxAPAnchorBarButton .sapMBtnIcon");
		assert.ok($arrowDownIcons.length === 1, "Anchorbar has 1 button with arrow-down icon");
	});

	QUnit.test("Arrow left nad arrow right buttons should have correct tooltips", function (assert) {
		var oArrowLeft = this.anchorBarView.byId("ObjectPageLayout-anchBar-arrowScrollLeft"),
			oArrowRight = this.anchorBarView.byId("ObjectPageLayout-anchBar-arrowScrollRight"),
			oRB = library.i18nModel.getResourceBundle(),
			sArrowLeftTooltip = oRB.getText("TOOLTIP_OP_SCROLL_LEFT_ARROW"),
			sArrowRightTooltip = oRB.getText("TOOLTIP_OP_SCROLL_RIGHT_ARROW");

		//assert
		assert.ok(oArrowLeft.getTooltip() === sArrowLeftTooltip, "Arrow left button should have tooltip '" + sArrowLeftTooltip + "'");
		assert.ok(oArrowRight.getTooltip() === sArrowRightTooltip, "Arrow left button should have tooltip '" + sArrowRightTooltip + "'");

		//act
		sap.ui.getCore().getConfiguration().setRTL(true);
		sap.ui.getCore().applyChanges();

		//assert
		assert.ok(oArrowLeft.getTooltip() === sArrowLeftTooltip, "Arrow left button should have tooltip '" + sArrowLeftTooltip + "' in RTL mode");
		assert.ok(oArrowRight.getTooltip() === sArrowRightTooltip, "Arrow left button should have tooltip '" + sArrowRightTooltip + "' in RTL mode");

		//cleanup
		sap.ui.getCore().getConfiguration().setRTL(false);
	});

	QUnit.test("When using the objectPageNavigation the 'navigate' event is fired with the appropriate arguments", function (assert) {
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oExpectedSection = this.oObjectPage.getSections()[0],
			oExpectedSubSection = oExpectedSection.getSubSections()[0],
			navigateSpy = this.spy(this.oObjectPage, "fireNavigate");

		this.oObjectPage.setShowAnchorBarPopover(false);
		oAnchorBar.getContent()[0].firePress();

		assert.ok(navigateSpy.calledWithMatch(sinon.match.has("section", oExpectedSection)), "Event fired has the correct section parameter attached");
		assert.ok(navigateSpy.calledWithMatch(sinon.match.has("subSection", oExpectedSubSection)), "Event fired has the correct subSection parameter attached");
	});

	var oModel = new sap.ui.model.json.JSONModel({
		sections: [
			{title: "my first section"},
			{title: "my second section"},
			{title: "my third section"},
			{title: "my fourth section"}
		],
		compositeTitle: "Title({0})",
		objectCount: 1
	});

	QUnit.module("simple binding", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.anchorBarView = sap.ui.xmlview("UxAP-69_anchorBarBinding", {
				viewName: "view.UxAP-69_AnchorBarBinding"
			});
			this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
			this.anchorBarView.setModel(oModel);
			this.anchorBarView.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
			this.clock.tick(iRenderingDelay);
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			this.oLastSectionButton = null;
			this.clock.restore();
		}
	});

	QUnit.test("Simple binding initialized from view", function (assert) {
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0];

		assert.strictEqual(oSectionButton.getText(), "my first section", "binding in view correctly initialized");
	});

	QUnit.test("Update by model change", function (assert) {
		//section title binding updates anchor bar button
		oModel.setProperty("/sections/0/title", "my updated title");
		oModel.refresh(true);

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0];

		assert.strictEqual(oSectionButton.getText(), "my updated title", "section title binding updates anchor bar button");
	});

	QUnit.test("Update by setTitle", function (assert) {

		var oSection = this.oObjectPage.getSections()[0];

		oSection.setTitle("my updated title again");
		this.clock.tick(iRenderingDelay);

		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0];

		assert.strictEqual(oSectionButton.getText(), "my updated title again", "section title set updates anchor bar button");
	});

	QUnit.test("Dynamic bind property", function(assert) {
		var oSection = this.oObjectPage.getSections()[3];

		oSection.bindProperty("title", "/sections/3/title");

		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];

		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "Property must return model value");
	});

	QUnit.test("Dynamic bind property OneTime", function(assert) {
		var oSection = this.oObjectPage.getSections()[3];

		oSection.bindProperty("title", {
			path: "/sections/3/title",
			mode: "OneTime"
		});

		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];

		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "Property must return model value");

		oModel.setProperty("/sections/3/title", "newvalue");

		this.clock.tick(iRenderingDelay);

		oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];
		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "New model value must not be reflected");
		oModel.setProperty("/sections/3/title", "my fourth section");
	});

	QUnit.test("Dynamic bind property", function(assert) {
		var oSection = this.oObjectPage.getSections()[3];

		oSection.bindProperty("title", {
			path: "/sections/3/title"
		});

		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];

		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "Property must return model value");

		oModel.setProperty("/sections/3/title", "newvalue");

		this.clock.tick(iRenderingDelay);

		oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];
		assert.equal(oSectionButton.getProperty("text"), "newvalue", "New model value must not be reflected");
	});

	QUnit.module("complex binding", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.anchorBarView = sap.ui.xmlview("UxAP-69_anchorBarBinding", {
				viewName: "view.UxAP-69_AnchorBarBinding"
			});
			this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
			this.anchorBarView.setModel(oModel);
			this.anchorBarView.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
			this.clock.tick(iRenderingDelay);
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			this.oLastSectionButton = null;
			this.clock.restore();
		}
	});

	QUnit.test("Complex binding initialized from view", function (assert) {
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

		assert.strictEqual(oSectionButton.getText(), "Title(1)", "complex title binding correct");
	});

	QUnit.test("Update by model change", function (assert) {
		//section title binding updates anchor bar button
		oModel.setProperty("/objectCount", 2);
		oModel.refresh(true);
		sap.ui.getCore().applyChanges();

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

		assert.strictEqual(oSectionButton.getText(), "Title(2)", "section title binding updates anchor bar button");
	});

	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.anchorBarView = sap.ui.xmlview("UxAP-69_anchorBarBinding", {
				viewName: "view.UxAP-69_AnchorBarBinding"
			});
			this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
			this.anchorBarView.setModel(oModel);
			this.anchorBarView.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Count information", function (assert) {
		var aAnchorBarContent = this.oObjectPage.getAggregation("_anchorBar").getContent(),
			iAnchorBarContentLength = aAnchorBarContent.length,
			$oCurrentButtonDomRef,
			iIndex;

		for (iIndex = 0; iIndex < iAnchorBarContentLength; iIndex++) {
			$oCurrentButtonDomRef = aAnchorBarContent[iIndex].$();
			// Convert the numbers to strings, since .attr would return a string
			// We need to add '+ 1' to the index for posinset, since posinset starts from 1, rather than 0
			assert.strictEqual($oCurrentButtonDomRef.attr("aria-setsize"), iAnchorBarContentLength.toString(), "aria-setsize indicates anchorBar's length correctly");
			assert.strictEqual($oCurrentButtonDomRef.attr("aria-posinset"), (iIndex + 1).toString(), "aria-posinset indicates the correct position of the button");
		}
	});


}(jQuery, QUnit, sinon, sap.uxap.Importance, sap.uxap));
