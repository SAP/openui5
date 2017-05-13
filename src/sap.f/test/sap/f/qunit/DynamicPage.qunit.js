/* global QUnit,sinon*/

(function ($, QUnit, sinon, DynamicPage, DynamicPageTitle, DynamicPageHeader) {
	"use strict";

	sinon.config.useFakeTimers = false;
	$.sap.require("sap.f.DynamicPage");
	$.sap.require("sap.f.DynamicPageHeader");

	var core = sap.ui.getCore(),
		TESTS_DOM_CONTAINER = "qunit-fixture",
		oFactory = {
			getResourceBundle: function () {
				return sap.ui.getCore().getLibraryResourceBundle("sap.f");
			},
			getDynamicPage: function () {
				return new DynamicPage({
					showFooter: true,
					title: this.getDynamicPageTitle(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(100),
					footer: this.getFooter()
				});
			},
			getDynamicPageWithBigContent: function () {
				return new DynamicPage({
					showFooter: true,
					title: this.getDynamicPageTitle(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(300),
					footer: this.getFooter()
				});
			},
			getDynamicPageWithPreserveHeaderOnScroll: function () {
				return new DynamicPage({
					preserveHeaderStateOnScroll: true,
					title: this.getDynamicPageTitle(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(100)
				});
			},
			getDynamicPageWithEmptyHeader: function () {
				return new DynamicPage({
					title: this.getDynamicPageTitle(),
					header: this.getDynamicPageHeader([]),
					content: this.getContent(100)
				});
			},
			getDynamicPageNoHeader: function () {
				return new DynamicPage({
					title: this.getDynamicPageTitle(),
					content: this.getContent(100)
				});
			},
			getDynamicPageNoTitle: function () {
				return new DynamicPage({
					header: this.getDynamicPageHeader(),
					content: this.getContent(100)
				});
			},
			getDynamicPageWithExpandSnapContent: function () {
				return new DynamicPage({
					title: this.getDynamicPageTitleWithExpandSnapContent(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(200)
				});
			},
			getDynamicPageNoTitleAndHeader: function () {
				return new DynamicPage({
					content: this.getContent(20)
				});
			},
			getDynamicPageTitle: function () {
				return new DynamicPageTitle({
					heading: new sap.m.Title({
						text: "Anna Maria Luisa"
					})
				});
			},
			getDynamicPageTitleWithExpandSnapContent: function () {
				return new DynamicPageTitle({
					heading: new sap.m.Title({
						text: "Anna Maria Luisa"
					}),
					snappedContent: [
						this.getLabel("Snapped Content")
					],
					expandedContent: [
						this.getLabel("Expanded Content")
					]
				});
			},
			getDynamicPageHeader: function (aContent) {
				return new DynamicPageHeader({
					pinnable: true,
					content: aContent || this.getContent(5)
				});
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
				});
			},
			getContent: function (iNumber) {
				return new sap.ui.layout.Grid({
					defaultSpan: "XL2 L3 M4 S6",
					content: this.getMessageStrips(iNumber)
				});
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
			getLabel: function (sText) {
				return new sap.m.Label({
					text: sText
				});
			}
		},
		oUtil = {
			renderObject: function (oObject) {
				oObject.placeAt(TESTS_DOM_CONTAINER);
				core.applyChanges();
				return oObject;
			},
			exists: function (vObject) {
				if (arguments.length === 1) {
					return vObject && ("length" in vObject) ? vObject.length > 0 : !!vObject;
				}

				return Array.prototype.slice.call(arguments).every(function (oObject) {
					return this.exists(oObject);
				});
			},
			toMobileMode: function () {
				$("html").removeClass("sapUiMedia-Std-Desktop")
					.removeClass("sapUiMedia-Std-Tablet")
					.addClass("sapUiMedia-Std-Phone");
				sap.ui.Device.system.desktop = false;
				sap.ui.Device.system.tablet = false;
				sap.ui.Device.system.phone = true;
			},
			toTabletMode: function () {
				$("html").removeClass("sapUiMedia-Std-Desktop")
					.removeClass("sapUiMedia-Std-Phone")
					.addClass("sapUiMedia-Std-Tablet");
				sap.ui.Device.system.desktop = false;
				sap.ui.Device.system.phone = false;
				sap.ui.Device.system.tablet = true;
			},
			toDesktopMode: function () {
				$("html").addClass("sapUiMedia-Std-Desktop")
					.removeClass("sapUiMedia-Std-Tablet")
					.removeClass("sapUiMedia-Std-Phone");
				sap.ui.Device.system.desktop = true;
				sap.ui.Device.system.tablet = false;
				sap.ui.Device.system.phone = false;
			}
		};

	/* --------------------------- DynamicPage API -------------------------------------- */
	QUnit.module("DynamicPage - API ", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("Instantiation", function (assert) {
		assert.ok(this.oDynamicPage, "The DynamicPage has instantiated successfully");
		assert.ok(this.oDynamicPage.getTitle(), "The DynamicPage Title has instantiated successfully");
		assert.ok(this.oDynamicPage.getHeader(), "The DynamicPage Header has instantiated successfully");
	});

	QUnit.test("Enabling preserveHeaderStateOnScroll should mutate headerExpanded", function (assert) {
		this.oDynamicPage._snapHeader();

		assert.ok(!this.oDynamicPage.getHeaderExpanded(), "The DynamicPage`s headerExpanded is false, header collapsed");
		assert.ok(!this.oDynamicPage.getPreserveHeaderStateOnScroll(), "The DynamicPage preserveHeaderStateOnScroll is false");

		this.oDynamicPage.setPreserveHeaderStateOnScroll(true);
		assert.ok(!this.oDynamicPage.getHeaderExpanded(), "The DynamicPage`s headerExpanded is preserved");
		assert.ok(this.oDynamicPage.getPreserveHeaderStateOnScroll(), "The DynamicPage preserveHeaderStateOnScroll is true");
	});

	/* --------------------------- DynamicPage Title API ---------------------------------- */
	QUnit.module("DynamicPage Title - API ", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			this.oDynamicPageTitle = this.oDynamicPage.getTitle();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
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
		core.applyChanges();
		iActualSnappedContentNumber = this.oDynamicPageTitle.getSnappedContent().length;

		assert.equal(iActualSnappedContentNumber, iExpectedSnappedContentNumber, "Snapped Content added successfully");


		// Remove label
		iExpectedSnappedContentNumber--;
		this.oDynamicPageTitle.removeSnappedContent(oLabel);
		core.applyChanges();
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

	QUnit.test("Add/Remove dynamically Actions", function (assert) {
		var oAction = oFactory.getAction(),
			iExpectedActionsNumber = 0,
			iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "No Actions");

		// Add Action
		iExpectedActionsNumber++;
		this.oDynamicPageTitle.addAction(oAction);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "Action added successfully");
		assert.equal(this.oDynamicPageTitle.getActions()[0].getId(), oAction.getId(), "The action is correctly positioned in the aggregation");
		assert.equal(oAction.getParent().getId(), this.oDynamicPageTitle.getId(), "Action returns the correct parent");

		// insert action at the end
		iExpectedActionsNumber++;
		this.oDynamicPageTitle.insertAction(oAction, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "Action inserted successfully");
		assert.equal(this.oDynamicPageTitle.getActions()[1].getId(), oAction.getId(), "The action is correctly positioned in the aggregation");

		// insert action at the beginning
		iExpectedActionsNumber++;
		this.oDynamicPageTitle.insertAction(oAction, 0);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "Action inserted successfully");
		assert.equal(this.oDynamicPageTitle.getActions()[0].getId(), oAction.getId(), "The action is correctly positioned in the aggregation");

		// insert action in the middle
		iExpectedActionsNumber++;
		this.oDynamicPageTitle.insertAction(oAction, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "Action inserted successfully");
		assert.equal(this.oDynamicPageTitle.getActions()[1].getId(), oAction.getId(), "The action is correctly positioned in the aggregation");

		// Remove Action
		iExpectedActionsNumber--;
		this.oDynamicPageTitle.removeAction(oAction);
		assert.equal(oAction.getParent(), null, "The action returns no parent after removed from the Title");
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Remove All actions
		iExpectedActionsNumber = 0;
		this.oDynamicPageTitle.removeAllActions();
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "Action removed successfully");
	});

	/* --------------------------- DynamicPage Title API ---------------------------------- */
	QUnit.module("DynamicPage Header - API ", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.toDesktopMode(); //ensure the test will execute correctly even on mobile devices
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Header pinnable and not pinnable", function (assert) {
		var oHeader = this.oDynamicPage.getHeader(),
			oPinButton = oHeader.getAggregation("_pinButton");

		oHeader.setPinnable(false);
		core.applyChanges();

		assert.ok(!oPinButton.$()[0],
			"The DynamicPage Header Pin Button not rendered");

		oHeader.setPinnable(true);
		core.applyChanges();

		assert.ok(oPinButton.$()[0],
			"The DynamicPage Header Pin Button rendered");

		assert.equal(oPinButton.$().hasClass("sapUiHidden"), false,
			"The DynamicPage Header Pin Button is visible");
	});

	QUnit.test("DynamicPage Header - expanding/collapsing through the API", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			sSnappedClass = "sapFDynamicPageTitleSnapped",
			oSetPropertySpy = this.spy(oDynamicPage, "setProperty");

		this.oDynamicPage._bHeaderInTitleArea = true;

		assert.ok(oDynamicPage.getHeaderExpanded(), "initial value for the headerExpanded prop is true");
		assert.ok(!oDynamicPage.$titleArea.hasClass(sSnappedClass));

		oDynamicPage.setHeaderExpanded(false);
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "setting it to false under regular conditions works");
		assert.ok(oDynamicPage.$titleArea.hasClass(sSnappedClass));
		assert.ok(oSetPropertySpy.calledWith("headerExpanded", false, true));

		oSetPropertySpy.reset();

		oDynamicPage.setHeaderExpanded(true);
		assert.ok(oDynamicPage.getHeaderExpanded(), "header converted to expanded");
		assert.ok(!oDynamicPage.$titleArea.hasClass(sSnappedClass));
		assert.ok(oSetPropertySpy.calledWith("headerExpanded", true, true));

		oSetPropertySpy.reset();

		oDynamicPage._snapHeader();
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "setting it to false via user interaction");
		assert.ok(oDynamicPage.$titleArea.hasClass(sSnappedClass));
		assert.ok(oSetPropertySpy.calledWith("headerExpanded", false, true));
	});

	QUnit.test("DynamicPage Header - expanding/collapsing by clicking the title", function (assert) {

		var oDynamicPage = this.oDynamicPage,
			oDynamicPageTitle = oDynamicPage.getTitle(),
			oFakeEvent = {
				srcControl: oDynamicPageTitle
			};

		this.oDynamicPage._bHeaderInTitleArea = true;

		assert.equal(oDynamicPage.getHeaderExpanded(), true, "Initially the header is expanded");
		assert.equal(oDynamicPage.getToggleHeaderOnTitleClick(), true, "Initially toggleHeaderOnTitleClick = true");

		oDynamicPageTitle.ontap(oFakeEvent);

		assert.equal(oDynamicPage.getHeaderExpanded(), false, "After one click, the header is collapsed");

		oDynamicPage.setToggleHeaderOnTitleClick(false);

		oDynamicPageTitle.ontap(oFakeEvent);
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "The header is still collapsed, because toggleHeaderOnTitleClick = false");

		oDynamicPage.setToggleHeaderOnTitleClick(true);

		oDynamicPageTitle.ontap(oFakeEvent);
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "After restoring toggleHeaderOnTitleClick to true, the header again expands on click");
	});

	/* --------------------------- DynamicPage Rendering ---------------------------------- */
	QUnit.module("DynamicPage - Rendering", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.toDesktopMode(); //ensure the test will execute correctly even on mobile devices
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Page, Title and Header rendered", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oDynamicPageTitle = oDynamicPage.getTitle(),
			oDynamicPageHeader = oDynamicPage.getHeader(),
			oDynamicPageFooter = oDynamicPage.getFooter(),
			$oDynamicPageHeader = oDynamicPageHeader.$();

		assert.ok(oUtil.exists(oDynamicPage), "The DynamicPage has rendered successfully");
		assert.ok(oUtil.exists(oDynamicPageTitle), "The DynamicPage Title has rendered successfully");
		assert.ok(oUtil.exists(oDynamicPageHeader), "The DynamicPage Header has rendered successfully");
		assert.ok(oUtil.exists(oDynamicPageFooter), "The DynamicPage Footer has rendered successfully");
		assert.ok(oUtil.exists(oDynamicPageHeader.getAggregation("_pinButton").$()),
			"The DynamicPage Header Pin Button has rendered successfully");

		assert.ok($oDynamicPageHeader.hasClass("sapFDynamicPageHeaderWithContent"),
			"The DynamicPage Header is not empty - sapFDynamicPageHeaderWithContent is added");
		assert.ok(!oDynamicPage.$titleArea.hasClass("sapFDynamicPageTitleOnly"),
			"The DynamicPage Header is not empty - sapFDynamicPageTitleOnly is not added");
	});

	QUnit.test("DynamicPage ScrollBar rendered", function (assert) {
		assert.ok(this.oDynamicPage.$("vertSB")[0], "DynamicPage ScrollBar has rendered successfully");
	});


	QUnit.module("DynamicPage - Rendering - No Title", {
		beforeEach: function () {
			this.oDynamicPageNoTitle = oFactory.getDynamicPageNoTitle();
			oUtil.renderObject(this.oDynamicPageNoTitle);
		},
		afterEach: function () {
			this.oDynamicPageNoTitle.destroy();
			this.oDynamicPageNoTitle = null;
		}
	});

	QUnit.test("DynamicPage Title not rendered", function (assert) {
		assert.ok(!oUtil.exists(this.oDynamicPageNoTitle.getTitle()), "The DynamicPage Title has not successfully");
	});


	QUnit.module("DynamicPage - Rendering - Header State Preserved On Scroll", {
		beforeEach: function () {
			this.oDynamicPageWithPreserveHeaderStateOnScroll = oFactory.getDynamicPageWithPreserveHeaderOnScroll();
			oUtil.renderObject(this.oDynamicPageWithPreserveHeaderStateOnScroll);
		},
		afterEach: function () {
			this.oDynamicPageWithPreserveHeaderStateOnScroll.destroy();
			this.oDynamicPageWithPreserveHeaderStateOnScroll = null;
		}
	});

	QUnit.test("DynamicPage Header rendered within Header Wrapper", function (assert) {
		var $headerWrapper = this.oDynamicPageWithPreserveHeaderStateOnScroll.$("header"),
			sHeaderId = this.oDynamicPageWithPreserveHeaderStateOnScroll.getHeader().getId();

		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The Header is in the Header Wrapper");
	});

	QUnit.test("DynamicPage Pin button is hidden", function (assert) {
		var $pinButton = this.oDynamicPageWithPreserveHeaderStateOnScroll.getHeader().getAggregation("_pinButton").$();

		assert.ok($pinButton.hasClass("sapUiHidden"), "The DynamicPage Header Pin Button not rendered");
	});


	QUnit.module("DynamicPage - Rendering - No Header", {
		beforeEach: function () {
			this.oDynamicPageNoHeader = oFactory.getDynamicPageNoHeader();
			oUtil.renderObject(this.oDynamicPageNoHeader);
		},
		afterEach: function () {
			this.oDynamicPageNoHeader.destroy();
			this.oDynamicPageNoHeader = null;
		}
	});

	QUnit.test("DynamicPage Header not rendered", function (assert) {
		assert.ok(!oUtil.exists(this.oDynamicPageNoHeader.getHeader()), "The DynamicPage Header does not exist.");
	});

	QUnit.module("DynamicPage - Rendering - Empty Header", {
		beforeEach: function () {
			this.oDynamicPageWithEmptyHeader = oFactory.getDynamicPageWithEmptyHeader();
			oUtil.renderObject(this.oDynamicPageWithEmptyHeader);
		},
		afterEach: function () {
			this.oDynamicPageWithEmptyHeader.destroy();
			this.oDynamicPageWithEmptyHeader = null;
		}
	});

	QUnit.test("DynamicPage Header style classes", function (assert) {
		var oDynamicPage = this.oDynamicPageWithEmptyHeader,
			$oDynamicPageHeader = oDynamicPage.$();

		assert.ok(!$oDynamicPageHeader.hasClass("sapFDynamicPageHeaderWithContent"),
			"The DynamicPage Header is empty - sapFDynamicPageHeaderWithContent not added");
		assert.ok(!$oDynamicPageHeader.hasClass("sapFDynamicPageHeaderPinnable"),
			"The DynamicPage Header is pinnable, but it`s empty - sapFDynamicPageHeaderPinnable not added");
		assert.ok(oDynamicPage.$titleArea.hasClass("sapFDynamicPageTitleOnly"),
			"The DynamicPage Header is empty and has Title only - sapFDynamicPageTitleOnly is added");
	});

	QUnit.module("DynamicPage - Rendering - No Title and No Header", {
		beforeEach: function () {
			this.oDynamicPageNoTitleAndHeader = oFactory.getDynamicPageNoTitleAndHeader();
			oUtil.renderObject(this.oDynamicPageNoTitleAndHeader);
		},
		afterEach: function () {
			this.oDynamicPageNoTitleAndHeader.destroy();
			this.oDynamicPageNoTitleAndHeader = null;
		}
	});

	QUnit.test("DynamicPage Title and Header not rendered", function (assert) {
		assert.ok(!oUtil.exists(this.oDynamicPageNoTitleAndHeader.getTitle()), "The DynamicPage Title has not rendered");
		assert.ok(!oUtil.exists(this.oDynamicPageNoTitleAndHeader.getHeader()), "The DynamicPage Header has not rendered ");
	});


	QUnit.module("DynamicPage - Rendering - Title Expanded/Snapped Content", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithExpandSnapContent();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Title Expanded/Snapped Content initial visibility", function (assert) {
		var $titleSnap = this.oDynamicPage.getTitle().$("snapped-wrapper"),
			$titleExpand = this.oDynamicPage.getTitle().$("expand-wrapper");

		assert.equal($titleSnap.hasClass("sapUiHidden"), true, "Snapped Content is not visible initially");
		assert.equal($titleExpand.hasClass("sapUiHidden"), false, "Expanded Content is visible initially");
	});

	QUnit.module("DynamicPage - Rendering - Footer Visibility", {
		beforeEach: function () {
			sinon.config.useFakeTimers = true;
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			sinon.config.useFakeTimers = false;
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Footer visibility", function (assert) {
		var $footerWrapper = this.oDynamicPage.$("footerWrapper"),
			oFooter = this.oDynamicPage.getFooter(),
			$footer = oFooter.$();

		assert.equal($footerWrapper.hasClass("sapUiHidden"), false, "Footer is visible initially");

		this.oDynamicPage.setShowFooter(false);
		this.clock.tick(1000);
		core.applyChanges();

		assert.equal($footerWrapper.hasClass("sapUiHidden"), true, "Footer is not visible");
		assert.equal($footer.hasClass("sapFDynamicPageActualFooterControlHide"), true, "Footer is not visible");

		this.oDynamicPage.setShowFooter(true);
		this.clock.tick(1000);
		core.applyChanges();

		assert.equal($footerWrapper.hasClass("sapUiHidden"), false, "Footer is visible again");
	});

	/* --------------------------- DynamicPage Mobile Rendering ---------------------------------- */
	QUnit.module("DynamicPage - Rendering - Mobile", {
		beforeEach: function () {
			sinon.config.useFakeTimers = true;
			oUtil.toMobileMode();
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			sinon.config.useFakeTimers = false;
			oUtil.toDesktopMode();
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Pin button not rendered on mobile", function (assert) {
		assert.ok(!this.oDynamicPage.getHeader().getAggregation("_pinButton").$()[0],
			"The DynamicPage Header Pin Button not rendered");
	});

	QUnit.test("DynamicPage ScrollBar not rendered on mobile", function (assert) {
		assert.ok(!this.oDynamicPage.$("vertSB")[0], "DynamicPage ScrollBar not rendered");
	});

	QUnit.test("DynamicPage Header on tablet with header height bigger than 60% of DP height override 'preserveHeaderStateOnScroll' property", function (assert) {
		var oDynamicPage = this.oDynamicPage;
		oDynamicPage.setPreserveHeaderStateOnScroll(true);

		oUtil.renderObject(this.oDynamicPage);
		sap.ui.getCore().applyChanges();
		this.clock.tick();

		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(300);
		oDynamicPage.getHeader().$().height(300);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		assert.ok(oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), "preserveHeaderStateOnScroll should be overridden with 60% or bigger height");

		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(200);
		oDynamicPage.getHeader().$().height(200);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		assert.ok(!oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), "preserveHeaderStateOnScroll should NOT be overridden with less than 60% height");
	});
	/* --------------------------- DynamicPage Tablet Rendering ---------------------------------- */

	QUnit.module("DynamicPage - Rendering - Tablet", {
		beforeEach: function () {
			sinon.config.useFakeTimers = true;
			oUtil.toTabletMode();
			this.oDynamicPage = oFactory.getDynamicPage();
		},
		afterEach: function () {
			sinon.config.useFakeTimers = false;
			oUtil.toDesktopMode();
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Header on tablet with header height bigger than 60% of DP height override 'preserveHeaderStateOnScroll' property", function (assert) {
		var oDynamicPage = this.oDynamicPage;
		oDynamicPage.setPreserveHeaderStateOnScroll(true);

		oUtil.renderObject(this.oDynamicPage);
		sap.ui.getCore().applyChanges();
		this.clock.tick();

		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(300);
		oDynamicPage.getHeader().$().height(300);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		assert.ok(oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), "preserveHeaderStateOnScroll should be overridden with 60% or bigger height");

		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(200);
		oDynamicPage.getHeader().$().height(200);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		assert.ok(!oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), "preserveHeaderStateOnScroll should NOT be overridden with less than 60% height");
	});

	/* --------------------------- DynamicPage Events and Handlers ---------------------------------- */
	QUnit.module("DynamicPage Events, Handlers", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithBigContent();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage On Title Press: title press handler should be called", function (assert) {
		var oTitlePressSpy = this.spy(sap.f.DynamicPage.prototype, "_titleExpandCollapseWhenAllowed"),
			oTitle = this.oDynamicPage.getTitle();

		oUtil.renderObject(this.oDynamicPage);
		oTitle.fireEvent("_titlePress");

		assert.ok(oTitlePressSpy.calledOnce, "Title Pin Press Handler is called");
	});

	QUnit.test("DynamicPage On Pin Button Press", function (assert) {
		var oPinPressSpy = this.spy(sap.f.DynamicPage.prototype, "_onPinUnpinButtonPress"),
			oPinButton = this.oDynamicPage.getHeader()._getPinButton();

		oUtil.renderObject(this.oDynamicPage);
		oPinButton.firePress();

		assert.ok(oPinPressSpy.calledOnce, "Title Pin Press Handler is called");
	});

	/* --------------------------- DynamicPage Private functions ---------------------------------- */
	QUnit.module("DynamicPage On Title Press when Header State Preserved On Scroll", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithPreserveHeaderOnScroll();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage On Title Press", function (assert) {
		var oTitle = this.oDynamicPage.getTitle(),
			oHeader = this.oDynamicPage.getHeader();

		oUtil.renderObject(this.oDynamicPage);

		assert.ok(!oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), "Header visible by default");

		oTitle.fireEvent("_titlePress");
		assert.ok(oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), "Header snapped and hidden");

		oTitle.fireEvent("_titlePress");
		assert.ok(!oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), "Header expanded and visible again");
	});

	/* --------------------------- DynamicPage Private functions ---------------------------------- */
	QUnit.module("DynamicPage - Private functions", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithExpandSnapContent();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage _expandHeader() should hide Snapped Content and show Expand Content", function (assert) {
		var $titleSnap = this.oDynamicPage.getTitle().$("snapped-wrapper"),
			$titleExpand = this.oDynamicPage.getTitle().$("expand-wrapper");

		this.oDynamicPage._expandHeader();

		assert.equal($titleSnap.hasClass("sapUiHidden"), true, "Snapped Content is not visible initially");
		assert.equal($titleExpand.hasClass("sapUiHidden"), false, "Expanded Content is visible initially");
	});

	QUnit.test("DynamicPage _snapHeader() should show Snapped Content and hide Expand Content", function (assert) {
		var $titleSnap = this.oDynamicPage.getTitle().$("snapped-wrapper"),
			$titleExpand = this.oDynamicPage.getTitle().$("expand-wrapper");

		this.oDynamicPage._snapHeader();

		assert.equal($titleSnap.hasClass("sapUiHidden"), false, "Snapped Content is visible initially");
		assert.equal($titleExpand.hasClass("sapUiHidden"), true, "Expanded Content is not visible initially");
	});

	QUnit.test("DynamicPage _moveHeaderToContentArea() should move the Header from title are to content area", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper;

		assert.equal($wrapper.find($header).length > 0, true, "Header is in content area initially");

		oDynamicPage._moveHeaderToTitleArea();
		assert.equal($wrapper.find($header).length === 0, true, "Header is in not in the content area");

		oDynamicPage._moveHeaderToContentArea();
		assert.equal($wrapper.find($header).length > 0, true, "Header is back in the content area");
	});

	QUnit.test("DynamicPage _moveHeaderToContentArea(true) should offset the scroll position of the content", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$header = this.oDynamicPage.getHeader().$(),
			$wrapper = oDynamicPage.$wrapper,
			iHeaderHeight = $header.outerHeight(),
			iScrollPositionBefore = iHeaderHeight + 100, // pick position greater than snapping height
			iExpectedScrollPositionAfter = iScrollPositionBefore + iHeaderHeight; // add iHeaderHeight as the header will be moved into the content area

		//setup
		oDynamicPage._moveHeaderToTitleArea();
		oDynamicPage.getScrollDelegate().scrollTo(0, iScrollPositionBefore);

		//act
		oDynamicPage._moveHeaderToContentArea(true);

		//check
		assert.equal(Math.round($wrapper.scrollTop()), iExpectedScrollPositionAfter, "scroll position of content is offset");
	});

	QUnit.test("DynamicPage _moveHeaderToContentArea(true) should offset the top scroll position of the content", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper,
			iHeaderHeight = $header.outerHeight(),
			iScrollPositionBefore = 0,
			iExpectedScrollPositionAfter = iHeaderHeight; // header height is added

		// setup
		oDynamicPage._moveHeaderToTitleArea();
		assert.strictEqual($wrapper.scrollTop(), iScrollPositionBefore, "Scroll position is the top of the content area");

		//act
		oDynamicPage._moveHeaderToContentArea(true);

		//assert
		assert.equal(Math.ceil($wrapper.scrollTop()), iExpectedScrollPositionAfter, "Scroll position is correctly offset");
	});

	QUnit.test("DynamicPage _moveHeaderToTitleArea() should move the header from the content area to the title area", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			$titleWrapper = oDynamicPage.$("header"),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper;

		assert.equal($wrapper.find($header).length > 0, true, "Header is in the content area initially");

		oDynamicPage._moveHeaderToTitleArea();

		assert.equal($wrapper.find($header).length === 0, true, "Header is in not in the content area");
		assert.equal($titleWrapper.find($header).length > 0, true, "Header is in not in the title area");
	});

	QUnit.test("DynamicPage _moveHeaderToTitleArea(true) should offset the scroll position of the content", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper,
			iHeaderHeight = $header.outerHeight(),
			iScrollPositionBefore = iHeaderHeight + 100,
			iExpectedScrollPositionAfter = 100; // iHeaderHeight should be substracted

		//arrange
		oDynamicPage.getScrollDelegate().scrollTo(0, iScrollPositionBefore);

		//act
		oDynamicPage._moveHeaderToTitleArea(true);

		//assert
		assert.equal(Math.round($wrapper.scrollTop()), iExpectedScrollPositionAfter, "Scroll position of the content area is correctly offset");
	});

	QUnit.test("DynamicPage _moveHeaderToTitleArea(true) should preserve the top scroll position of the content", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$wrapper = oDynamicPage.$wrapper,
			iScrollPositionBefore = 0,
			iExpectedScrollPositionAfter = 0; // should remain 0 as the header is still expanded

		assert.strictEqual(iScrollPositionBefore, 0, "Scroll position is the top of the content area");

		//act
		oDynamicPage._moveHeaderToTitleArea(true);

		//assert
		assert.equal($wrapper.scrollTop(), iExpectedScrollPositionAfter, "Scroll position is still the top of the content area");
	});

	QUnit.test("DynamicPage _toggleHeaderVisibility() should show/hide the DynamicPAge`s Header", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$();

		assert.ok(!$header.hasClass("sapFDynamicPageHeaderHidden"), false, "Header is visible initially");

		oDynamicPage._toggleHeaderVisibility(false);
		assert.ok($header.hasClass("sapFDynamicPageHeaderHidden"), true, "Header is not visible");

		oDynamicPage._toggleHeaderVisibility(true);
		assert.ok(!$header.hasClass("sapFDynamicPageHeaderHidden"), true, "Header is visible again");
	});

	QUnit.test("DynamicPage _pin()/_unPin()", function (assert) {
		var $headerWrapper = this.oDynamicPage.$("header"),
			$contentWrapper = this.oDynamicPage.$("contentWrapper"),
			sHeaderId = this.oDynamicPage.getHeader().getId(),
			oPinSpy = this.spy(this.oDynamicPage, "_updateScrollBar");

		assert.equal($contentWrapper.find("#" + sHeaderId).length, 1, "The header is in the Content wrapper initially");

		this.oDynamicPage._pin();
		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The header is in the Header wrapper when pinned");
		assert.ok(oPinSpy.called, "The ScrollBar is updated");

		this.oDynamicPage._unPin();
		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The header remains in the header wrapper when unpinned until scroll");
	});

	QUnit.test("DynamicPage _canSnapHeaderOnScroll() should return the correct value", function (assert) {
		assert.equal(this.oDynamicPage._canSnapHeaderOnScroll(), true, "The header can snap");
	});

	QUnit.test("DynamicPage _shouldExpand() returns false initially", function (assert) {
		assert.equal(this.oDynamicPage._shouldExpand(), false, "DynamicPage should not expand initially");
	});

	QUnit.test("DynamicPage _shouldSnap() returns false initially", function (assert) {
		assert.equal(this.oDynamicPage._shouldSnap(), false, "DynamicPage should not snap initially");
	});

	QUnit.test("DynamicPage _getTitleHeight() returns the correct Title height", function (assert) {
		assert.equal(this.oDynamicPage._getTitleHeight(), this.oDynamicPage.getTitle().$().outerHeight(),
			"DynamicPage Title height is correct");
	});

	QUnit.test("DynamicPage _getHeaderHeight() returns the correct Header height", function (assert) {
		assert.equal(this.oDynamicPage._getHeaderHeight(), this.oDynamicPage.getHeader().$().outerHeight(),
			"DynamicPage Header height is correct");
	});

	QUnit.test("DynamicPage _getSnappingHeight() returns the correct Snapping height", function (assert) {
		var iSnappingHeight = this.oDynamicPage.getHeader().$().outerHeight() || this.oDynamicPage.getTitle().$().outerHeight();

		assert.equal(this.oDynamicPage._getSnappingHeight(), iSnappingHeight,
			"DynamicPage snapping height is correct");
	});

	QUnit.test("DynamicPage _getScrollPosition() returns the correct initial Scroll position", function (assert) {
		assert.equal(this.oDynamicPage._getScrollPosition(), 0,
			"DynamicPage Scroll position is correct");
	});

	QUnit.test("DynamicPage _getScrollPosition() returns the correct scroll position upon custom scrollBar scroll", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar");

		//arrange
		oDynamicPageScrollBar.setScrollPosition(iExpectedScrollPosition);

		//act
		this.oDynamicPage._onScrollBarScroll();

		//assert
		assert.equal(Math.ceil(this.oDynamicPage._getScrollPosition()), iExpectedScrollPosition, "DynamicPage Scroll position is correct");
	});

	QUnit.test("DynamicPage _getScrollPosition() returns the correct scroll position upon wrapper scroll", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar");

		//arrange
		this.oDynamicPage.$wrapper.scrollTop(iExpectedScrollPosition);

		//act
		this.oDynamicPage._onWrapperScroll({target: {scrollTop: 500}});

		//assert
		assert.equal(oDynamicPageScrollBar.getScrollPosition(), iExpectedScrollPosition, "custom scrollBar scrollPosition is correct");
	});

	QUnit.test("DynamicPage scrollbar.setScrollPosition() is called once after wrapper scroll", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPage = this.oDynamicPage,
			$wrapper = oDynamicPage.$wrapper,
			oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar"),
			oScrollPositionSpy = sinon.spy(oDynamicPageScrollBar, "setScrollPosition");

		//arrange
		$wrapper.scrollTop(iExpectedScrollPosition);

		//act
		oDynamicPage._onWrapperScroll({target: {scrollTop: 500}});

		//assert
		assert.equal(oDynamicPageScrollBar.getScrollPosition(), iExpectedScrollPosition, "ScrollBar Scroll position is correct");

		//act
		oDynamicPage._onScrollBarScroll();

		//assert
		assert.equal(oScrollPositionSpy.calledOnce, true, "scrollBar scrollPosition setter is not called again");
	});

	QUnit.test("DynamicPage scrollbar.setScrollPosition() is not called again after custom scrollBar scroll", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPage = this.oDynamicPage,
			oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar"),
			oScrollPositionSpy;

		//arrange
		oDynamicPageScrollBar.setScrollPosition(iExpectedScrollPosition);
		oScrollPositionSpy = sinon.spy(oDynamicPageScrollBar, "setScrollPosition");

		//act
		oDynamicPage._onScrollBarScroll();

		//assert
		assert.equal(Math.ceil(oDynamicPage._getScrollPosition()), iExpectedScrollPosition, "DynamicPage Scroll position is correct");

		//act
		oDynamicPage._onWrapperScroll({target: {scrollTop: 500}});

		//assert
		assert.equal(oScrollPositionSpy.called, false, "scrollBar scrollPosition setter is not called again");
	});

	QUnit.test("DynamicPage _headerSnapAllowed() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage;


		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed initially");

		oDynamicPage._pin();
		assert.ok(!oDynamicPage._headerSnapAllowed(), "Header snapping not allowed because header is pinned");

		oDynamicPage._unPin();
		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed after unpinning");

		oDynamicPage.setPreserveHeaderStateOnScroll(true);
		assert.ok(!oDynamicPage._headerSnapAllowed(), "Header snapping not allowed because preserveHeaderStateOnScroll is true");

		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed because preserveHeaderStateOnScroll is false");

		oDynamicPage._snapHeader(true);
		assert.ok(!oDynamicPage._headerSnapAllowed(), "Header snapping not allowed because header is snapped already");

		oDynamicPage._expandHeader(true);
		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed after expanding");
	});

	QUnit.test("DynamicPage _headerScrolledOut() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oHeader = oDynamicPage.getHeader(),
			iScrolledOutPoint = oTitle.$().outerHeight() + oHeader.$().outerHeight();

		assert.ok(!oDynamicPage._headerScrolledOut(), "Header is not scrolled out initially");

		oDynamicPage._setScrollPosition(iScrolledOutPoint);
		core.applyChanges();

		assert.ok(oDynamicPage._headerScrolledOut(), "Header is scrolled out after scrolling to the header`s very bottom");
	});

	QUnit.test("DynamicPage _headerBiggerThanAllowedToPin() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oSandBox = sinon.sandbox.create(),
			fnStubConfig = function (iHeaderHeight, iDynamicPageHeight) {
				oSandBox.stub(oDynamicPage, "_getEntireHeaderHeight").returns(iHeaderHeight);
				oSandBox.stub(oDynamicPage, "_getOwnHeight").returns(iDynamicPageHeight);
			};

		fnStubConfig(700, 999);

		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToPin(), true,
			"DynamicPage Header is bigger than allowed");

		oSandBox.restore();

		fnStubConfig(100, 999);

		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToPin(), false,
			"DynamicPage Header is not bigger than allowed");
	});

	QUnit.test("DynamicPage _getEntireHeaderHeight() return correct values", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oHeader = oDynamicPage.getHeader();

		assert.equal(oDynamicPage._getEntireHeaderHeight(),
			oTitle.$().outerHeight() + oHeader.$().outerHeight(), "correct with both header and title");

		oDynamicPage.setTitle(null);
		assert.equal(oDynamicPage._getEntireHeaderHeight(), oHeader.$().outerHeight(), "correct with only header");

		oDynamicPage.setTitle(oTitle);
		oDynamicPage.setHeader(null);
		assert.equal(oDynamicPage._getEntireHeaderHeight(), oTitle.$().outerHeight(), "correct with only title");

		oDynamicPage.setTitle(null);
		oDynamicPage.setHeader(null);
		assert.equal(oDynamicPage._getEntireHeaderHeight(), 0, "correct with no header and no title");
	});

	/* --------------------------- DynamicPage Toggle Header On Scroll ---------------------------------- */
	QUnit.module("DynamicPage - Toggle Header On Scroll", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithExpandSnapContent();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage _toggleHeaderOnScroll for position <= snapping height preserves expanded state", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$header = this.oDynamicPage.getHeader().$(),
			$wrapper = oDynamicPage.$wrapper,
			iSnappingHeight = oDynamicPage._getSnappingHeight();

		//arrange
		$wrapper.scrollTop(iSnappingHeight - 1);

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "header is still expanded");
		assert.equal($wrapper.find($header).length > 0, true, "Header is still in the content area");
	});

	QUnit.test("DynamicPage _toggleHeaderOnScroll for position > snapping height snaps the header", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$header = this.oDynamicPage.getHeader().$(),
			$wrapper = oDynamicPage.$wrapper,
			iSnappingHeight = oDynamicPage._getSnappingHeight();

		//arrange
		oDynamicPage.getScrollDelegate().scrollTo(0, iSnappingHeight + 1);

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "header is snapped");
		assert.equal($wrapper.find($header).length > 0, true, "Header is still in the content area");
	});

	QUnit.test("DynamicPage _toggleHeaderOnScroll for position <= snapping height when header in title preserves the expanded state", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$header = this.oDynamicPage.getHeader().$(),
			$wrapper = oDynamicPage.$wrapper,
			iHeaderHeight = $header.outerHeight();

		//setup
		oDynamicPage._moveHeaderToTitleArea();
		$wrapper.scrollTop(iHeaderHeight - 10); // scroll to expand

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "header is expanded");
		assert.equal($wrapper.find($header).length > 0, true, "Header is still in the content area");
	});

	QUnit.test("Scrolling from expanded header in title to position > snapping height snaps the header", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$header = this.oDynamicPage.getHeader().$(),
			$wrapper = oDynamicPage.$wrapper,
			iHeaderHeight = $header.outerHeight(),
			iTestScrollPosition = iHeaderHeight + 100, // pick position greater than snapping height => will require snap
			iExpectedScrollPosition = iTestScrollPosition + iHeaderHeight;

		//setup
		oDynamicPage._moveHeaderToTitleArea();
		oDynamicPage.getScrollDelegate().scrollTo(0, iTestScrollPosition);

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "header is snapped");
		assert.equal($wrapper.find($header).length > 0, true, "Header is in the content area");
		assert.equal(Math.ceil($wrapper.scrollTop()), iExpectedScrollPosition, "Scroll position is correctly offset");
	});

	QUnit.module("DynamicPage - Header initially collapsed", { //TODO: may rework this structure to match existing structure
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: true}", function (assert) {
		var sSnappedClass = "sapFDynamicPageTitleSnapped",
			oHeader = this.oDynamicPage.getHeader();

		//arrange
		this.oDynamicPage.setHeaderExpanded(false);
		this.oDynamicPage.setPreserveHeaderStateOnScroll(true); // will toggle the value of headerExpanded
		this.oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap

		//act
		oUtil.renderObject(this.oDynamicPage);

		assert.strictEqual(this.oDynamicPage.getHeaderExpanded(), false, "The DynamicPage getHeaderExpanded is still false");
		assert.strictEqual(this.oDynamicPage.$titleArea.hasClass(sSnappedClass), true);
		assert.strictEqual(oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), true, "Header is hidden");
	});

	function assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition) {

		var sSnappedClass = "sapFDynamicPageTitleSnapped",
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper,
			$titleWrapper = oDynamicPage.$("header");

		iExpectedScrollPosition = iExpectedScrollPosition || 0;

		assert.strictEqual(oDynamicPage.getHeaderExpanded(), false, "The DynamicPage getHeaderExpanded is false");
		assert.ok(oDynamicPage.$titleArea.hasClass(sSnappedClass), "title has snapped css-class");
		assert.strictEqual(oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), !bExpectedHeaderInContent, "Header visibility is correct");
		assert.equal($titleWrapper.find($header).length > 0, !bExpectedHeaderInContent, "Header in the title value is correct");
		assert.equal($wrapper.find($header).length > 0, bExpectedHeaderInContent, "Header in the content value is correct");
		assert.equal($wrapper.scrollTop(), iExpectedScrollPosition, "Scroll position is correct");
	}

	function assertHeaderExpanded(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition) {

		var sSnappedClass = "sapFDynamicPageTitleSnapped",
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper,
			$titleWrapper = oDynamicPage.$("header");

		iExpectedScrollPosition = iExpectedScrollPosition || 0;

		assert.strictEqual(oDynamicPage.getHeaderExpanded(), true, "The DynamicPage getHeaderExpanded is true");
		assert.strictEqual(oDynamicPage.$titleArea.hasClass(sSnappedClass), false, "title does not have snapped css-class");
		assert.strictEqual(oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), false, "Header visibility is correct");
		assert.equal($titleWrapper.find($header).length > 0, !bExpectedHeaderInContent, "Header in the title value is correct");
		assert.equal($wrapper.find($header).length > 0, bExpectedHeaderInContent, "Header in the content value is correct");
		assert.equal($wrapper.scrollTop(), iExpectedScrollPosition, "Scroll position is correct");
	}

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: false; _canSnapHeaderOnScroll: true}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = true,
			iExpectedScrollPosition;

		//arrange
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap

		//act
		oUtil.renderObject(oDynamicPage);

		iExpectedScrollPosition = oDynamicPage._getSnappingHeight();

		//assert
		assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
	});

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: true; _canSnapHeaderOnScroll: true}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = false,
			iExpectedScrollPosition = 0;

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(true);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap

		//act
		oUtil.renderObject(oDynamicPage);

		//assert
		assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
	});

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: true; _canSnapHeaderOnScroll: false}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = false,
			iExpectedScrollPosition = 0;

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(true);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to allow snap

		//act
		oUtil.renderObject(oDynamicPage);

		//assert
		assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
	});

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: false; _canSnapHeaderOnScroll: false}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = false,
			iExpectedScrollPosition = 0;

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to allow snap

		//act
		oUtil.renderObject(oDynamicPage);

		//assert
		assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
	});

	QUnit.test("onAfterRendering can enable headerExpanded when {_canSnapHeaderOnScroll: false}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = false,
			iExpectedScrollPosition = 0,
			done = assert.async();

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to allow snap
		oDynamicPage.addEventDelegate({
			onAfterRendering: function() {
				//assert
				assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
				oDynamicPage.setHeaderExpanded(true);
				assertHeaderExpanded(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
				done();
			}
		});
		//act
		oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
	});

	QUnit.test("onAfterRendering can enable headerExpanded when {_canSnapHeaderOnScroll: true}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bHeaderInContent = true,
			iExpectedScrollPosition,
			done = assert.async();

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap
		oDynamicPage.addEventDelegate({
			onAfterRendering: function() {
			iExpectedScrollPosition = oDynamicPage._getSnappingHeight();
				//assert
				assertHeaderSnapped(assert, bHeaderInContent, oDynamicPage, iExpectedScrollPosition);
				oDynamicPage.setHeaderExpanded(true);
				iExpectedScrollPosition = 0;
				assertHeaderExpanded(assert, !bHeaderInContent, oDynamicPage, iExpectedScrollPosition);
				done();
			}
		});
		//act
		oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
	});

	QUnit.test("onAfterRendering can modify preserveHeaderStateOnScroll when {_canSnapHeaderOnScroll: false}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bHeaderInContent = true,
			iExpectedScrollPosition = 0,
			done = assert.async(),
			oDelegateFirstRendering = {
				onAfterRendering: function() {
					//assert
					assertHeaderSnapped(assert, !bHeaderInContent, oDynamicPage, iExpectedScrollPosition);
					oDynamicPage.removeEventDelegate(oDelegateFirstRendering);
					oDynamicPage.setPreserveHeaderStateOnScroll(true); // causes invalidation, so check in next rendering:
					core.applyChanges();
					assertHeaderSnapped(assert, !bHeaderInContent, oDynamicPage, iExpectedScrollPosition);
					done();
				}
			};

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to allow snap
		oDynamicPage.addEventDelegate(oDelegateFirstRendering);

		//act
		oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
	});

	QUnit.test("DynamicPage._setScrollPosition dependency on scroll delegate", function (assert) {

		var oDynamicPage = this.oDynamicPage,
			done = assert.async(),
			iNewScrollPosition = 10,
			oDelegate;

		oDelegate = {
			onAfterRendering: function() {
				setTimeout(function() {
					//check
					assert.ok(oDynamicPage.getScrollDelegate().hasOwnProperty("_$Container"), "scroll delegate has property _$Container");
					assert.strictEqual(oDynamicPage.getScrollDelegate()._$Container.length, 1, "scroll delegate obtained reference to page container");
					assert.strictEqual(oDynamicPage.getScrollDelegate()._$Container[0], oDynamicPage.$wrapper[0], "scroll delegate container reference is wrapper reference");

					//act
					oDynamicPage._setScrollPosition(iNewScrollPosition);
					//check
					assert.strictEqual(oDynamicPage.$wrapper.scrollTop(), iNewScrollPosition, "scroll position is correct");
					done();
				}, 0);
			}
		};

		oDynamicPage.addEventDelegate(oDelegate);
		oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
	});

	/* --------------------------- DynamicPage ARIA ---------------------------------- */
	QUnit.module("DynamicPage - ARIA State", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Title has the correct Aria state", function (assert) {
		var $title = this.oDynamicPage.getTitle().$(),
			sRole = "heading",
			sLevel = "2";

		assert.equal($title.attr("role"), sRole,
			"DynamicPage Title role 'heading'");
		assert.equal($title.attr("aria-level"), sLevel,
			"DynamicPage Title is heading level 2");
	});

	QUnit.test("DynamicPage Header has the correct Aria state", function (assert) {
		var $header = this.oDynamicPage.getHeader().$(),
			sRole = "region",
			sAriaExpandedValue = "true",
			sAriaLabelValue = oFactory.getResourceBundle().getText("EXPANDED_HEADER");
		this.stub(this.oDynamicPage, "_shouldSnap", function () {
			return true;
		});
		this.stub(this.oDynamicPage, "_canSnapHeaderOnScroll", function () {
			return true;
		});

		assert.equal($header.attr("role"), sRole,
			"DynamicPage Header role 'region'");
		assert.equal($header.attr("aria-expanded"), sAriaExpandedValue,
			"DynamicPage Header aria-expanded 'true'");
		assert.equal($header.attr("aria-label"), sAriaLabelValue,
			"DynamicPage Header aria-label is 'Header expanded'");

		sAriaExpandedValue = "false";
		sAriaLabelValue = oFactory.getResourceBundle().getText("SNAPPED_HEADER");
		this.oDynamicPage._toggleHeaderOnScroll();

		assert.equal($header.attr("aria-expanded"), sAriaExpandedValue,
			"DynamicPage Header aria-expanded 'true'");
		assert.equal($header.attr("aria-label"), sAriaLabelValue,
			"DynamicPage Header aria-label is 'Header expanded'");
	});

	QUnit.test("DynamicPage Header Pin button has the correct Aria state", function (assert) {
		var $pinButton = this.oDynamicPage.getHeader()._getPinButton().$(),
			sAriaPressedValue = "false",
			sAriaControlsValue = this.oDynamicPage.getHeader().getId();

		assert.equal($pinButton.attr("aria-controls"), sAriaControlsValue,
			"DynamicPage Header Pin button aria-controls points to the Header");
		assert.equal($pinButton.attr("aria-pressed"), sAriaPressedValue,
			"DynamicPage Header  Pin button aria-pressed 'false'");

		$pinButton.trigger('tap');
		sAriaPressedValue = "true";

		assert.equal($pinButton.attr("aria-pressed"), sAriaPressedValue,
			"DynamicPage Header  Pin button aria-pressed 'true'");
	});

	QUnit.test("DynamicPage Header Pin button has the correct tooltip when pin and unpin", function (assert) {
		var oPinButton = this.oDynamicPage.getHeader()._getPinButton(),
			sPinTooltip = oFactory.getResourceBundle().getText("PIN_HEADER"),
			sUnPinTooltip = oFactory.getResourceBundle().getText("UNPIN_HEADER");

		this.oDynamicPage._pin();
		assert.equal(oPinButton.getTooltip(), sUnPinTooltip, "The tooltip is correct");

		this.oDynamicPage._unPin();
		assert.equal(oPinButton.getTooltip(), sPinTooltip, "The tooltip is correct");
	});

	QUnit.test("DynamicPage Header Pin button has the correct tooltip when changing preserveHeaderStateOnScroll", function (assert) {
		var oPinButton = this.oDynamicPage.getHeader()._getPinButton(),
			sPinTooltip = oFactory.getResourceBundle().getText("PIN_HEADER"),
			sUnPinTooltip = oFactory.getResourceBundle().getText("UNPIN_HEADER");

		this.oDynamicPage._pin();
		assert.equal(oPinButton.getTooltip(), sUnPinTooltip,
			"The tooltip is correct");

		this.oDynamicPage.setPreserveHeaderStateOnScroll(true);
		core.applyChanges();
		assert.equal(oPinButton.getTooltip(), sUnPinTooltip,
			"The tooltip is correct: unchanged when preserveHeaderStateOnScroll is true");

		this.oDynamicPage.setPreserveHeaderStateOnScroll(false);
		core.applyChanges();
		assert.equal(oPinButton.getTooltip(), sPinTooltip,
			"The tooltip is correct: resetted when preserveHeaderStateOnScroll is false");
	});
}(jQuery, QUnit, sinon, sap.f.DynamicPage, sap.f.DynamicPageTitle, sap.f.DynamicPageHeader));
