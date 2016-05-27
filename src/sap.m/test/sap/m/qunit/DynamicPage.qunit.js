(function ($, QUnit, sinon, DynamicPage, DynamicPageTitle, DynamicPageHeader) {
	"use strict";

	sinon.config.useFakeTimers = false;
	$.sap.require("sap.m.DynamicPage");
	$.sap.require("sap.m.DynamicPageHeader");

	var core = sap.ui.getCore(),
		TESTS_DOM_CONTAINER = "qunit-fixture",
		oFactory = {
			getResourceBundle: function () {
				return sap.ui.getCore().getLibraryResourceBundle("sap.m");
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
			getDynamicPageWithNonScrollableHeader: function () {
				return new DynamicPage({
					headerScrollable: false,
					title: this.getDynamicPageTitle(),
					header: this.getDynamicPageHeader(),
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
					content: this.getContent(100)
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
			getDynamicPageHeader: function () {
				return new DynamicPageHeader({
					pinnable: true,
					content: this.getContent(5)
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
					return Array.isArray(vObject) ? vObject.length > 0 : !!vObject;
				}

				return Array.prototype.slice.call(arguments).every(function (oObject) {
					return exists(oObject);
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

		assert.equal(iActualSnappedContentNumber, iExpectedSnappedContentNumber, "Snapped Content removed successfully")
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

		assert.equal(iActualExpandedContentNumber, iExpectedExpandedContentNumber, "Expanded Content removed successfully")
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

		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "Action removed successfully")
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
		var oHeader = this.oDynamicPage.getHeader();

		oHeader.setPinnable(false);
		core.applyChanges();

		assert.ok(!this.oDynamicPage.getHeader().getAggregation("_pinButton").$()[0],
			"The DynamicPage Header Pin Button not rendered");

		oHeader.setPinnable(true);
		core.applyChanges();

		assert.ok(this.oDynamicPage.getHeader().getAggregation("_pinButton").$()[0],
			"The DynamicPage Header Pin Button rendered");

		assert.equal(oHeader.getAggregation("_pinButton").$().hasClass("sapUiHidden"), false,
			"The DynamicPage Header Pin Button is visible");
	});

	QUnit.test("DynamicPage Header - expanding/collapsing through the API", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			sSnappedClass = "sapMDynamicPageTitleSnapped",
			oSetPropertySpy = this.spy(oDynamicPage, "setProperty");

		this.stub(this.oDynamicPage, "_headerBiggerThanAllowedToExpandWithACommand").returns(false);
		this.stub(this.oDynamicPage, "_headerScrolledOut").returns(true);

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

	QUnit.test("DynamicPage Header - expanding/collapsing through the API when not allowed because of header size", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			sSnappedClass = "sapMDynamicPageTitleSnapped",
			oSetPropertySpy = this.spy(oDynamicPage, "setProperty");

		this.stub(this.oDynamicPage, "_headerBiggerThanAllowedToExpandWithACommand").returns(true);
		this.stub(this.oDynamicPage, "_headerScrolledOut").returns(true);

		assert.ok(oDynamicPage.getHeaderExpanded(), "initial value for the headerExpanded prop is true");
		assert.ok(!oDynamicPage.$titleArea.hasClass(sSnappedClass));

		oDynamicPage.setHeaderExpanded(false);
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "collapsing it when no space for the entire header fails");
		assert.ok(!oDynamicPage.$titleArea.hasClass(sSnappedClass));
		assert.ok(oSetPropertySpy.neverCalledWith("headerExpanded", false, true));

		oDynamicPage.setHeaderExpanded(true);
		assert.ok(oSetPropertySpy.neverCalledWith("headerExpanded", true, true));
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "setting it to true again does nothing");
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
		assert.ok(oUtil.exists(this.oDynamicPage), "The DynamicPage has rendered successfully");
		assert.ok(oUtil.exists(this.oDynamicPage.getTitle()), "The DynamicPage Title has rendered successfully");
		assert.ok(oUtil.exists(this.oDynamicPage.getHeader()), "The DynamicPage Header has rendered successfully");
		assert.ok(oUtil.exists(this.oDynamicPage.getFooter()), "The DynamicPage Footer has rendered successfully");
		assert.ok(oUtil.exists(this.oDynamicPage.getHeader().getAggregation("_pinButton").$()),
			"The DynamicPage Header Pin Button has rendered successfully");
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


	QUnit.module("DynamicPage - Rendering - Header not Scrollable", {
		beforeEach: function () {
			this.oDynamicPageWithNonScrollableHeader = oFactory.getDynamicPageWithNonScrollableHeader();
			oUtil.renderObject(this.oDynamicPageWithNonScrollableHeader);
		},
		afterEach: function () {
			this.oDynamicPageWithNonScrollableHeader.destroy();
			this.oDynamicPageWithNonScrollableHeader = null;
		}
	});

	QUnit.test("DynamicPage Header rendered within Header Wrapper", function (assert) {
		var $headerWrapper = this.oDynamicPageWithNonScrollableHeader.$("header"),
			sHeaderId = this.oDynamicPageWithNonScrollableHeader.getHeader().getId();

		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The Header is in the Header Wrapper");
	});

	QUnit.test("DynamicPage Pin button is hidden", function (assert) {
		var $pinButton = this.oDynamicPageWithNonScrollableHeader.getHeader().getAggregation("_pinButton").$();

		assert.ok($pinButton.hasClass("sapUiHidden"), "The DynamicPage Header Pin Button not rendered");
	});

	QUnit.test("DynamicPage ScrollBar not rendered", function (assert) {
		assert.ok(!this.oDynamicPageWithNonScrollableHeader.$("vertSB")[0], "DynamicPage ScrollBar not rendered");
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
		assert.ok(!oUtil.exists(this.oDynamicPageNoHeader.getHeader()), "The DynamicPage Header has not successfully");
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
		assert.equal($footer.hasClass("sapMDynamicPageActualFooterControlHide"), true, "Footer is not visible");

		this.oDynamicPage.setShowFooter(true);
		this.clock.tick(1000);
		core.applyChanges();

		assert.equal($footerWrapper.hasClass("sapUiHidden"), false, "Footer is visible again");
		assert.equal($footer.hasClass("sapMDynamicPageActualFooterControlShow"), true, "Footer is visible again");
	});

	/* --------------------------- DynamicPage Mobile Rendering ---------------------------------- */
	QUnit.module("DynamicPage - Rendering - Mobile", {
		beforeEach: function () {
			oUtil.toMobileMode();
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
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
		var oTitlePressSpy = this.spy(sap.m.DynamicPage.prototype, "_titleExpandCollapseWhenAllowed"),
			oTitle = this.oDynamicPage.getTitle();

		oUtil.renderObject(this.oDynamicPage);
		oTitle.fireEvent("_titlePress");

		assert.ok(oTitlePressSpy.calledOnce, "Title Pin Press Handler is called");
	});

	QUnit.test("DynamicPage On Title Press: _scrollToSnapHeader should be called", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oScrollToSnapHeaderSpy = this.spy(sap.m.DynamicPage.prototype, "_scrollToSnapHeader");

		oUtil.renderObject(oDynamicPage);
		oTitle.fireEvent("_titlePress");

		assert.ok(oScrollToSnapHeaderSpy.calledOnce, "First click on the title should scroll the page to the snapping point");
	});

	QUnit.test("DynamicPage On Pin Button Press", function (assert) {
		var oPinPressSpy = this.spy(sap.m.DynamicPage.prototype, "_onPinUnpinButtonPress"),
			oPinButton = this.oDynamicPage.getHeader()._getPinButton();

		oUtil.renderObject(this.oDynamicPage);
		oPinButton.firePress();

		assert.ok(oPinPressSpy.calledOnce, "Title Pin Press Handler is called");
	});

	/* --------------------------- DynamicPage Private functions ---------------------------------- */
	QUnit.module("DynamicPage On Title Press when Header Always Expanded", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithNonScrollableHeader();
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

		assert.ok(!oHeader.$().hasClass("sapMDynamicPageHeaderHidden"), "Header visible by default");

		oTitle.fireEvent("_titlePress");
		assert.ok(oHeader.$().hasClass("sapMDynamicPageHeaderHidden"), "Header snapped and hidden");

		oTitle.fireEvent("_titlePress");
		assert.ok(!oHeader.$().hasClass("sapMDynamicPageHeaderHidden"), "Header expanded and visible again");
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
			oTitle = oDynamicPage.getTitle(),
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper;

		assert.equal($wrapper.find($header).length > 0, true, "Header is in content area initially");

		oDynamicPage._moveHeaderToTitleArea();
		assert.equal($wrapper.find($header).length === 0, true, "Header is in not in the content area");

		oDynamicPage._moveHeaderToContentArea();
		assert.equal($wrapper.find($header).length > 0, true, "Header is back in the content area");
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

	QUnit.test("DynamicPage _toggleHeaderVisibility() should show/hide the DynamicPAge`s Header", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$();

		assert.ok(!$header.hasClass("sapMDynamicPageHeaderHidden"), false, "Header is visible initially");

		oDynamicPage._toggleHeaderVisibility(false);
		assert.ok($header.hasClass("sapMDynamicPageHeaderHidden"), true, "Header is not visible");

		oDynamicPage._toggleHeaderVisibility(true);
		assert.ok(!$header.hasClass("sapMDynamicPageHeaderHidden"), true, "Header is visible again");
	});

	QUnit.test("DynamicPage _pin()/_unPin()", function (assert) {
		var $headerWrapper = this.oDynamicPage.$("header"),
			$contentWrapper = this.oDynamicPage.$("contentWrapper"),
			sHeaderId = this.oDynamicPage.getHeader().getId();

		assert.equal($contentWrapper.find("#" + sHeaderId).length, 1, "The header is in the Content wrapper, e.g unpinned");

		this.oDynamicPage._pin();
		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The header is in the Header wrapper, e.g. pinned");

		this.oDynamicPage._unPin();
		assert.equal($contentWrapper.find("#" + sHeaderId).length, 1, "The header is in the Content wrapper, e.g unpinned");
	});

	QUnit.test("DynamicPage _canSnap() should return the correct value", function (assert) {
		assert.equal(this.oDynamicPage._canSnap(), true, "The header can snap");
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

	QUnit.test("DynamicPage _getScrollPosition() returns the correct Scroll position", function (assert) {
		assert.equal(this.oDynamicPage._getScrollPosition(), 0,
			"DynamicPage Scroll position is correct");
	});

	QUnit.test("DynamicPage _getScrollPosition() returns the correct Scroll position", function (assert) {
		var iExpectedScrollPosition = 500;
		var oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar");
		oDynamicPageScrollBar.setScrollPosition(iExpectedScrollPosition);
		core.applyChanges();

		assert.equal(this.oDynamicPage._getScrollPosition(), iExpectedScrollPosition, "DynamicPage Scroll position is correct");
	});

	QUnit.test("DynamicPage _headerSnapAllowed() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage;


		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed initially");

		oDynamicPage._pin();
		assert.ok(!oDynamicPage._headerSnapAllowed(), "Header snapping not allowed because header is pinned");

		oDynamicPage._unPin();
		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed after unpinning");

		oDynamicPage.setHeaderScrollable(false);
		assert.ok(!oDynamicPage._headerSnapAllowed(), "Header snapping not allowed because headerScrollable is false");

		oDynamicPage.setHeaderScrollable(true);
		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed because headerScrollable is true");

		oDynamicPage._snapHeader(true);
		assert.ok(!oDynamicPage._headerSnapAllowed(), "Header snapping not allowed because header is snapped already");

		oDynamicPage._expandHeader(true);
		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed after expanding");
	});

	QUnit.test("DynamicPage _headerScrolledOut() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oHeader = oDynamicPage.getHeader(),
			oDynamicPageScrollBar = oDynamicPage.getAggregation("_scrollBar"),
			iScrolledOutPoint = oTitle.$().outerHeight() + oHeader.$().outerHeight();

		assert.ok(!oDynamicPage._headerScrolledOut(), "Header is not scrolled out initially");

		oDynamicPageScrollBar.setScrollPosition(iScrolledOutPoint);
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

	QUnit.test("DynamicPage _headerBiggerThanAllowedToExpandWithACommand() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oSandBox = sinon.sandbox.create(),
			fnStubConfig = function (iHeaderHeight, iDynamicPageHeight) {
				oSandBox.stub(oDynamicPage, "_getEntireHeaderHeight").returns(iHeaderHeight),
					oSandBox.stub(oDynamicPage, "_getOwnHeight").returns(iDynamicPageHeight);
			};

		fnStubConfig(1000, 999);

		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToExpandWithACommand(), true,
			"DynamicPage Header is bigger than allowed");

		oSandBox.restore();

		fnStubConfig(100, 999);

		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToExpandWithACommand(), false,
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

		assert.equal($header.attr("role"), sRole,
			"DynamicPage Header role 'region'");
		assert.equal($header.attr("aria-expanded"), sAriaExpandedValue,
			"DynamicPage Header aria-expanded 'true'");
		assert.equal($header.attr("aria-label"), sAriaLabelValue,
			"DynamicPage Header aria-label is 'Header expanded'");

		sAriaExpandedValue = "false";
		sAriaLabelValue = oFactory.getResourceBundle().getText("SNAPPED_HEADER");
		this.oDynamicPage._toggleHeader();

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

}(jQuery, QUnit, sinon, sap.m.DynamicPage, sap.m.DynamicPageTitle, sap.m.DynamicPageHeader));
