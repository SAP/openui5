(function ($, QUnit, sinon, SemanticPage) {
	"use strict";

	sinon.config.useFakeTimers = false;

	var core = sap.ui.getCore(),
		TESTS_DOM_CONTAINER = "qunit-fixture",
		oFactory = {
			getSemanticPage: function () {
				return new SemanticPage();
			},
			getSemanticAction: function (sType, oConfig) {
				oConfig = oConfig || {};
				return new sType(oConfig);
			},

			getFooter: function () {
				return new sap.m.OverflowToolbar({
					content: [
						new sap.m.ToolbarSpacer(),
						new sap.m.Button({
							text: "Accept",
							type: "Accept"
						}),
						new sap.m.Button({
							text: "Reject",
							type: "Reject"
						})
					]
				})
			},
			getContent: function (iNumber) {
				return new sap.ui.layout.Grid({
					defaultSpan: "XL2 L3 M4 S6",
					content: this.getMessageStrips(iNumber)
				})
			},
			getMessageStrip: function (iNumber) {
				return new sap.m.MessageStrip({
					text: "Content " + ++iNumber
				});
			},
			getMessageStrips: function (iNumber) {
				var aMessageStrips = [];

				for (var i = 0; i < iNumber; i++) {
					aMessageStrips.push(this.getMessageStrip(i));
				}
				return aMessageStrips;
			},
			getAction: function () {
				return new sap.m.Button({
					text: "Action"
				});
			},
			getTitle: function (sText) {
				return new sap.m.Title({
					text: sText || "Default Title"
				});
			},
			getLabel: function (sText) {
				return new sap.m.Label({
					text: sText || "Default Label"
				});
			}
		},
		oUtil = {
			renderObject: function (oObject) {
				oObject.placeAt(TESTS_DOM_CONTAINER);
				core.applyChanges();
				return oObject;
			}
		};

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
			"SemanticPage headerExpanded set to true and retrieved successfully.")
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
			"SemanticPage headerPinnable set to true and retrieved successfully.")
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
			"SemanticPage preserveHeaderStateOnScroll set to true and retrieved successfully.")
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
			"SemanticPage toggleHeaderOnTitleClick set to true and retrieved successfully.")
	});


	QUnit.test("test SemanticPage titleHeading aggregation methods", function (assert) {
		var oTitle = oFactory.getTitle();

		// Assert default
		assert.equal(this.oSemanticPage.getTitleHeading(), null,
			"SemanticPage titleHeading is null by default.");

		// Аct - set titleHeading
		this.oSemanticPage.setTitleHeading(oTitle);

		// Assert
		assert.equal(this.oSemanticPage.getTitleHeading(), oTitle,
			"SemanticPage titleHeading is set and retrieved successfully.");

		// Аct - destroy content
		this.oSemanticPage.destroyTitleHeading();

		// Assert
		assert.equal(this.oSemanticPage.getTitleHeading(), null,
			"SemanticPage content is destroyed successfully.");
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

	QUnit.test("test DeleteAction", function (assert) {
		var oSemanticAction = new sap.f.semantic.DeleteAction(), oInternalControl;

		this.oSemanticPage.setDeleteAction(oSemanticAction);
		assert.equal(this.oSemanticPage.getDeleteAction(), oSemanticAction, "DeleteAction has been set");

		this.oSemanticPage.destroyDeleteAction();
		oInternalControl = oSemanticAction._getControl();

		assert.equal(this.oSemanticPage.getDeleteAction(), null, "DeleteAction does not exist anymore");
		assert.ok(oSemanticAction.bIsDestroyed, "DeleteAction has been destroyed.");
		assert.ok(oInternalControl.bIsDestroyed, "DeleteAction internal control has been destroyed.");
	});

	/* --------------------------- DynamicPage Rendering ---------------------------------- */
	QUnit.module("DynamicPage - Rendering", {
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

})(jQuery, QUnit, sinon, sap.f.semantic.SemanticPage);
