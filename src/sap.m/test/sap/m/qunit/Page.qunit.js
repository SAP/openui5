/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/HTML",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/m/Bar",
	"sap/m/SearchField",
	"sap/f/ShellBar",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/OverflowToolbar",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/includeStylesheet",
	"require",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Element,
	createAndAppendDiv,
	HTML,
	Button,
	Page,
	PageAccessibleLandmarkInfo,
	Bar,
	SearchField,
	ShellBar,
	mobileLibrary,
	coreLibrary,
	JSONModel,
	OverflowToolbar,
	Device,
	jQuery,
	includeStylesheet,
	require,
	nextUIUpdate
) {
	"use strict";

	createAndAppendDiv("content");

	var pStyleLoaded = includeStylesheet({
		url: require.toUrl("./Page.qunit.css")
	});


	var TitleAlignment = mobileLibrary.TitleAlignment;


	async function createPageControls(oContext) {
		oContext.oHtml = new HTML({
			content: '<h1 id="qunit-header">Header</h1><h2 id="qunit-banner"></h2><h2 id="qunit-userAgent"></h2><ol id="qunit-tests"></ol>'
		});

		oContext.oButton = new Button("bigButton", {
			text: "Test",
			width: "2000px"
		});

		oContext.oPage = new Page("myFirstPage", {
			backgroundDesign: "Standard",
			title: "Test",
			showNavButton: true,
			enableScrolling: false,
			content: oContext.oHtml,
			headerContent: [new Button("hdrbtn", { text: "HDRBTN" })]
		}).placeAt("content");

		oContext.oPage.setSubHeader(new Bar("mySubHeader", { contentMiddle: [new SearchField("SFB1", { placeholder: "search for...", width: "100%" })] }));
		oContext.oPage.setFooter(new Bar("myFooter", { contentMiddle: [new Button('FooterBtn', { text: "Footer Btn" })] }));

		oContext.oPage2 = new Page("mySecondPage", {
			title: "Test 2",
			showNavButton: false,
			content: [new HTML({
				content: "<div id='p2content'>test content</div>"
			}), oContext.oButton]
		}).placeAt("content");

		oContext.oPage3 = new Page("myThirdPage", {
			showHeader: false,
			enableScrolling: false,
			content: new HTML({
				content: "<div id='p3content'>another test content</div>"
			})
		}).placeAt("content");

		await nextUIUpdate();
	}

	function destroyControls(oContext) {
		oContext.oPage.destroy();
		oContext.oPage2.destroy();
		oContext.oPage3.destroy();
		oContext.oButton.destroy();
		oContext.oHtml.destroy();
	}


	QUnit.module("Initial Check", {
		beforeEach: async function () {
			await createPageControls(this);
		},
		afterEach: function () {
			destroyControls(this);
		}
	});

	QUnit.test("Page rendered", function(assert) {
		assert.ok(document.getElementById("myFirstPage"), "Page should be rendered");
		assert.ok(document.getElementById("myFirstPage-intHeader"), "header should be rendered");
		assert.ok(document.getElementById("hdrbtn"), "header right button should be rendered");
		assert.ok(document.getElementById("mySubHeader"), "Sub header should be rendered");
		assert.ok(document.getElementById("myFirstPage-navButton"), "nav button should be rendered");
		var sNavButtonTooltip = jQuery("#myFirstPage-navButton").attr("title");
		assert.ok(sNavButtonTooltip && (sNavButtonTooltip.length > 0), "nav button should have a tooltip by default");
		assert.ok(document.getElementById("qunit-header"), "Page content should be rendered");
		assert.ok(Element.getElementById("myFirstPage-intHeader").$().parent().is("header"), "header should be rendered as header tag");
		assert.ok(Element.getElementById("myFooter").$().parent().is("footer"), "footer should be rendered as footer tag");

		// The following qunit is removed because of
		// BCP: 1670157998
		// It checks visual appearance and such a test can be made in visual test
		// because it causes issues with browser reporting distances + rounding
		/*assert.ok(parseInt(sap.ui.getCore().byId("mySubHeader").$().position().top, 10) >= parseInt(sap.ui.getCore().byId("myFirstPage-intHeader").$().position().top, 10) + parseInt(sap.ui.getCore().byId("myFirstPage-intHeader").$().outerHeight(), 10),
					"subHeader should be directly below header");*/

		assert.ok(Element.getElementById("myFirstPage-intHeader").$().hasClass("sapMHeader-CTX"), "header should contain header context");
		assert.ok(!Element.getElementById("mySubHeader").$().hasClass("sapMHeader-CTX"), "subHeader should not contain header context");
		assert.ok(Element.getElementById("myFooter").$().hasClass("sapMFooter-CTX"), "footer should contain footer context");
		assert.ok(!Element.getElementById("myFirstPage").$().hasClass("sapMPageBgList"), "Page content should not have list gray background color");
		this.oPage.setBackgroundDesign("List");
		assert.ok(Element.getElementById("myFirstPage").$().hasClass("sapMPageBgList"), "Page content should have list background color");
		this.oPage.setBackgroundDesign("Standard");
		assert.ok(Element.getElementById("myFirstPage").$().hasClass("sapMPageBgStandard"), "Page content should have standard background color");
		assert.ok(!Element.getElementById("myFirstPage").$().hasClass("sapMPageBgList"), "Page content should not have list background color");
		this.oPage.setBackgroundDesign("Solid");
		assert.ok(Element.getElementById("myFirstPage").$().hasClass("sapMPageBgSolid"), "Page content should have a solid background color");
		this.oPage.setBackgroundDesign("Transparent");
		assert.ok(Element.getElementById("myFirstPage").$().hasClass("sapMPageBgTransparent"), "Page content should be transparent");
		assert.equal(this.oPage.$("cont").hasClass("sapMPageEnableScrolling"), false, "In a page with scrolling disabled, no scroll-related class should be added");
	});

	QUnit.test("Page 2 rendered", function(assert) {
		assert.ok(document.getElementById("mySecondPage"), "Page should be rendered");
		assert.ok(document.getElementById("mySecondPage-intHeader"), "header should be rendered");
		assert.equal(document.getElementById("mySecondPage-navButton"), undefined, "nav button should not be rendered");
		assert.ok(document.getElementById("p2content"), "Page 2 content should be rendered");
		this.oPage2.setBackgroundDesign("List");
		assert.ok(Element.getElementById("mySecondPage").$().hasClass("sapMPageBgList"), "Page 2 content should have list background color");
	});

	QUnit.test("Page 3 rendered with no header", function(assert) {
		assert.ok(document.getElementById("myThirdPage"), "Page should be rendered");
		assert.equal(document.getElementById("myThirdPage-intHeader"), undefined, "header should not be rendered");
		assert.equal(document.getElementById("myThirdPage-navButton"), undefined, "nav button should not be rendered");
		var p3c = document.getElementById("p3content");
		assert.ok(p3c, "Page 3 content should be rendered");

		//var $p3c = jQuery(p3c);
		var $p3c = jQuery(p3c).parent();
		assert.equal($p3c.height(), jQuery(window).height(), "Page 3 content height should cover the whole screen");
		assert.equal($p3c.width(), jQuery(window).width(), "Page 3 content width should cover the whole screen");
	});

	QUnit.test("render once only", async function(assert) { // regression test for issue 1570014242
		var iRenderCounter = 0;
		var oDelegate = {
			onAfterRendering : function() {
				iRenderCounter++;
			}
		};

		var oRenderOncePage = new Page();
		oRenderOncePage.addDelegate(oDelegate);
		assert.equal(iRenderCounter, 0, "Page should not be rendered directly after instantiation");

		oRenderOncePage.placeAt("content");
		await nextUIUpdate();
		assert.equal(iRenderCounter, 1, "Page should be rendered only once");

		oRenderOncePage.invalidate();
		await nextUIUpdate();
		assert.equal(iRenderCounter, 2, "Page should be rendered twice after another forced rerendering");

		oRenderOncePage.destroy();
	});

	QUnit.test("render once only with combinatorics", async function(assert) { // regression test for issue 1570014242
		// the mechanism that avoids double rendering is different depending on whether there is a title/navbutton or not, hence this test
		var iRenderCounter = 0;
		var oDelegate = {
			onAfterRendering : function() {
				iRenderCounter++;
			}
		};

		var oRenderOncePage = new Page({showNavButton: true, title: "Test Page"});
		oRenderOncePage.addDelegate(oDelegate);
		assert.equal(iRenderCounter, 0, "Page should not be rendered directly after instantiation");

		oRenderOncePage.placeAt("content");
		await nextUIUpdate();
		assert.equal(iRenderCounter, 1, "Page should be rendered only once");

		oRenderOncePage.invalidate();
		await nextUIUpdate();
		assert.equal(iRenderCounter, 2, "Page should be rendered twice after another forced rerendering");

		oRenderOncePage.destroy();
	});

	QUnit.test("Page with footer and unescaped id", async function (assert) {
		var oPage = new Page("my.Page", {
			footer: new Bar({
				contentMiddle: [
					new Button({text: "Footer Btn"})
				]
			}),
			content: new HTML({
				content: "<div id='p4content'>another test content</div>"
			})
		}).placeAt("content");
		await nextUIUpdate();

		var oPageContentRef = oPage.getDomRef("cont");
		var hasScroll = oPageContentRef.getBoundingClientRect().height < oPageContentRef.scrollHeight;

		assert.ok(document.getElementById("my.Page"), "Page should be rendered");
		assert.ok(document.getElementById("p4content"), "Page content should be rendered");
		assert.equal(hasScroll, false, "Content should be correctly checked for scroll");

		oPage.destroy();
		oPage = null;
	});

	QUnit.test("Page with ShellBar in 'subHeader' aggregation", async function (assert) {
		// Setup
		var oPage = new Page("my.Page.Shellbar", {
			subHeader: new ShellBar({
				title: "Title"
			}),
			content: new Button({
				text: "Button"
			})
		}).placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.ok(oPage.hasStyleClass(Page.SHELLBAR_IN_HEADER_CLASS), "Page has 'sapFShellBar-CTX' class");

		// Act
		oPage.destroySubHeader();

		// Assert
		assert.notOk(oPage.hasStyleClass(Page.SHELLBAR_IN_HEADER_CLASS), "Page does not have 'sapFShellBar-CTX' class");

		// Cleanup
		oPage.destroy();
	});

	QUnit.test("Page with ShellBar in 'customHeader' aggregation", async function (assert) {
		// Setup
		var oPage = new Page("my.Page.Shellbar", {
			customHeader: new ShellBar({
				title: "Title"
			}),
			content: new Button({
				text: "Button"
			})
		}).placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.ok(oPage.hasStyleClass(Page.SHELLBAR_IN_HEADER_CLASS), "Page has 'sapFShellBar-CTX' class");

		// Act
		oPage.destroyCustomHeader();

		// Assert
		assert.notOk(oPage.hasStyleClass(Page.SHELLBAR_IN_HEADER_CLASS), "Page does not have 'sapFShellBar-CTX' class");

		// Cleanup
		oPage.destroy();
	});


	QUnit.module("Properties Check");

	QUnit.test("Title escaping", async function(assert) {
		//Setup
		var oModel = new JSONModel({"test": "{hello}"});
		var oPage = new Page({
			title:'{/test}'
		});
		oPage.setModel(oModel);
		oPage.placeAt('content');
		await nextUIUpdate();
		// Assert
		assert.equal(oPage.getTitle(), oPage.$("title-inner").text(), "Title should be escaped properly when using curly braces.");

		// Cleanup
		oPage.destroy();
		oModel.destroy();
	});

	QUnit.test("showSubHeader", async function(assert) {
		var oHtml = new HTML({
			content: '<h1 id="qunit-header">Header</h1><h2 id="qunit-banner"></h2><h2 id="qunit-userAgent"></h2><ol id="qunit-tests"></ol>'
		});

		const oPage = new Page("myFirstPage", {
			backgroundDesign: "Standard",
			title: "Test",
			showNavButton: true,
			enableScrolling: false,
			content: oHtml,
			headerContent: [new Button("hdrbtn", { text: "HDRBTN" })]
		}).placeAt("content");
		await nextUIUpdate();

		oPage.setSubHeader(new Bar("mySubHeader", { contentMiddle: [new SearchField("SFB1", { placeholder: "search for...", width: "100%" })] }));
		oPage.setFooter(new Bar("myFooter", { contentMiddle: [new Button('FooterBtn', { text: "Footer Btn" })] }));
		await nextUIUpdate();

		var oSubHeader = Element.getElementById("mySubHeader");
		assert.ok(oSubHeader.$().length, "subHeader should be rendered");

		oPage.setShowSubHeader(false);
		await nextUIUpdate();
		assert.equal(document.getElementById("mySubHeader"), undefined, "subHeader should not be rendered when 'showSubHeader' is false");

		oPage.setShowSubHeader(true);
		await nextUIUpdate();
		assert.ok(document.getElementById("mySubHeader"), "subHeader should be rendered");

		oPage.destroy();
	});

	QUnit.test("showFooter when floatingFooter=true and showFooter=false initially", async function(assert) {
		var oPage = new Page({
			id: "idPage",
			floatingFooter: true,
			showFooter: false,
			footer: [ new OverflowToolbar({id: "idFooter", content: [new Button()]}) ]
		});

		oPage.placeAt("content");
		await nextUIUpdate();

		assert.equal(!!document.getElementById("idFooter"), true, "footer should be rendered");
		assert.equal(oPage.getFooter().$().parent().hasClass("sapUiHidden"), true, "footer is hidden");

		oPage.destroy();
	});

	QUnit.test("Page properly applies classNames to the footer", async function (assert) {
		var oPage = new Page({
			id: "idPage",
			floatingFooter: true,
			showFooter: true,
			footer: [new OverflowToolbar({id: "idFooter", content: [new Button()]})]
		}),
		done = assert.async();

		oPage.placeAt("content");
		await nextUIUpdate();

		var $footer = oPage.$().find(".sapMPageFooter").last();

		assert.equal($footer.hasClass("sapUiHidden"), false, "Footer is hidden.");

		//Act
		oPage.setShowFooter(false);

		setTimeout(function() {
			//Assert
			assert.equal($footer.hasClass("sapUiHidden"), true, "Footer is hidden.");

			//Cleanup
			oPage.destroy();
			done();
		}, Page.FOOTER_ANIMATION_DURATION + 50);
	});

	QUnit.test("showFooter toggling with floatingFooter disabled", async function (assert) {
		// Setup
		var oBar = new Bar({
				contentRight: new Button({text: "Hello World"})
			}),
			oPage = new Page({
				showFooter: false,
				footer: oBar
			}).placeAt("content");

		await nextUIUpdate();

		// Assert
		assert.ok(oBar.$().parent().hasClass("sapUiHidden"), "Footer is there, but is hidden.");
		assert.equal(oPage.$().hasClass("sapMPageWithFooter"), false,
				"The class .sapMPageWithFooter is not applied, although a footer exists, the showFooter is false");

		// Act
		oPage.setShowFooter(true);
		await nextUIUpdate();

		// Assert
		assert.ok(!oBar.$().parent().hasClass("sapUiHidden"), "Footer is visible.");
		assert.equal(oPage.$().hasClass("sapMPageWithFooter"), true,
				"The class .sapMPageWithFooter is applied, when a footer exists and showFooter is true.");

		// Act
		oPage.setShowFooter(false);
		await nextUIUpdate();

		// Assert
		assert.ok(oBar.$().parent().hasClass("sapUiHidden"), "Footer is there, but is hidden.");
		assert.equal(oPage.$().hasClass("sapMPageWithFooter"), false,
				"The class .sapMPageWithFooter is not applied, although the footer exists, the showFooter is false.");

		// Act
		oPage.setShowFooter(true);
		oPage.setFooter(null);
		await nextUIUpdate();

		// Assert
		assert.equal(oPage.$().hasClass("sapMPageWithFooter"), false,
				"The class .sapMPageWithFooter is not applied, although the showFooter is true, the footer does not exist.");

		// Cleanup
		oBar = null;

		oPage.destroy();
		oPage = null;
	});

	QUnit.test("calling twice showFooter with false and true", async function(assert) {
		// Setup
		var oBar = new Bar();
		var oPage = new Page({
			showFooter: false,
			footer: oBar,
			floatingFooter: true
		}).placeAt("content");
		var oClock = sinon.useFakeTimers();

		oPage.placeAt("content");
		await nextUIUpdate(oClock);

		// Act
		oPage.setShowFooter(false);
		oClock.tick(1000);
		oPage.setShowFooter(true);
		oClock.tick(1000);
		await nextUIUpdate(oClock);

		// Assert
		assert.ok(!oBar.$().parent().hasClass("sapUiHidden"), "Footer is visible.");

		oBar.destroy();
		oPage.destroy();
		oClock.runAll();
		oClock.restore();
	});

	QUnit.test("contentOnlyBusy property", async function (assert) {
		// Setup
		var oBusyIndicator, oBusyIndicatorInner,
			clock = sinon.useFakeTimers(),
			oPage = new Page("myPage");

		oPage.placeAt("content");

		await nextUIUpdate(clock);

		// Act
		oPage.setBusy(true);
		clock.tick(1000);
		nextUIUpdate(clock);
		oBusyIndicator = [].filter.call(oPage.getDomRef().childNodes, function (oChild) {
			return oChild.id.indexOf("busyIndicator") > -1;
		})[0];

		// Assert
		assert.ok(oBusyIndicator, "Busy indicator is right inside Page's root.");

		// Setup & Act
		oPage.setBusy(false);
		clock.tick(1000);

		nextUIUpdate(clock);
		oPage.setContentOnlyBusy(true);
		oPage.setBusy(true);
		clock.tick(1000);

		nextUIUpdate(clock);
		oBusyIndicator = [].filter.call(oPage.getDomRef().childNodes, function (oChild) {
			return oChild.id.indexOf("busyIndicator") > -1;
		})[0];

		oBusyIndicatorInner = [].filter.call(oPage.getDomRef('cont').childNodes, function (oChild) {
			return oChild.id.indexOf("busyIndicator") > -1;
		})[0];

		// Assert
		assert.ok(!oBusyIndicator, "Busy indicator is removed from Page's root.");
		assert.ok(oBusyIndicatorInner, "Busy indicator is inside Page's content.");

		oPage.destroy();
		await nextUIUpdate(clock);
		clock.runAll();
		clock.restore();
	});

	// scrolling tests only for non-IE8 browsers
	if (Device.browser.mozilla || Device.browser.safari || Device.browser.chrome) {

		QUnit.module("Scrolling", {
			before: async function() { await createPageControls( this ); },
			after: function() {	 destroyControls( this ); }
		});

		var getScrollPos = function(sPageId) {
			var fScrollLeft, scrollEnablement = Element.getElementById(sPageId).getScrollDelegate();

			if (scrollEnablement._scroller) { // iScroll
				var $Scroll = Element.getElementById(sPageId + "-scroll").$();
				if (Device.browser.mozilla) {
					fScrollLeft = $Scroll.css("-moz-transform").split(" ")[5]; // "matrix(1, 0, 0, 1, 0, -99.9999)" => "99.9999)"
				} else if (Device.browser.safari || Device.browser.chrome) {
					fScrollLeft = $Scroll.css("-webkit-transform").split(" ")[5];
				}
				return Math.round(parseFloat(fScrollLeft));

			} else { // NativeMouseScroller
				fScrollLeft = document.getElementById(sPageId + "-cont").scrollTop;
				return -fScrollLeft;
			}
		};

		QUnit.test("Scroll area rendered", function(assert) {
			assert.ok(document.getElementById("myFirstPage-cont"), "Scroll container should be rendered for Page 1");
			assert.ok(document.getElementById("mySecondPage-cont"), "Scroll container should be rendered for Page 2");
			assert.ok(document.getElementById("myThirdPage-cont"), "Scroll container should be rendered for Page 3");
		});

		QUnit.test("Scrolling", function(assert) {
			assert.expect(2);
			assert.equal(getScrollPos("mySecondPage"), 0, "Page 2 should be scrolled to position 0");
			this.oPage2.scrollTo(100, 0);
			assert.equal(getScrollPos("mySecondPage"), -100, "Page 2 should be scrolled to position 100");
		});

		QUnit.test("ScrollToElement", async function(assert) {

			var oPage4 = new Page("myFourthPage",{
				content:[
					new HTML({
						content : "<div class='height1200'>1200px height div</div>"
					}),
					this.oTestButton = new Button(),
					new HTML({
						content : "<div class='height2000'>2000px height div</div>"
					})
				]
			});
			oPage4.placeAt("content");
			await nextUIUpdate();

			oPage4.scrollToElement(this.oTestButton);

			var scrollAsExpected = getScrollPos("myFourthPage") - -1200 > -1 || getScrollPos("myFourthPage") - -1200 < 2;

			assert.ok(scrollAsExpected, "Page 2 should be scrolled to position 1200");

			oPage4.destroy();
		});

		QUnit.test("ScrollToElement Parameters forwarding", async function(assert) {
			var oButton = new Button(),
				oPage5 = new Page("myPage",{
					content:[
						oButton
					]
				});

			oPage5.placeAt("content");
			await nextUIUpdate();

			var oScrollEnablement = oPage5.getScrollDelegate(),
				oSpy = sinon.spy(oScrollEnablement, "scrollToElement");

			oPage5.scrollToElement(oButton, 200, [0, -100]);

			assert.ok(oSpy.calledWith(oButton.getDomRef(), 200, [0, -100]), "scrollToElement's params forwarded correctly to scroll delegate.");

			oSpy.restore();
			oPage5.destroy();
		});

		QUnit.test("Restoring scrolling state after rendering", async function(assert) {
			assert.expect(1); // event should not be fired after rerendering
			this.oPage2.invalidate();
			await nextUIUpdate();
			assert.equal(getScrollPos("mySecondPage"), -100, "Page 2 should be scrolled to position 100");
		});

		QUnit.test("Container Padding Classes", async function(assert) {
			// System under Test + Act
			/* eslint-disable no-nested-ternary */
			var oContainer = new Page(), sContentSelector = "section", sResponsiveSize = (Device.resize.width <= 599 ? "0px"
					: (Device.resize.width <= 1023 ? "16px" : "16px 32px")), aResponsiveSize = sResponsiveSize.split(" "), $containerContent;
			/* eslint-enable no-nested-ternary */

			// Act
			oContainer.placeAt("content");
			await nextUIUpdate();
			oContainer.addStyleClass("sapUiNoContentPadding");
			$containerContent = oContainer.$().find(sContentSelector);

			// Assert
			assert.strictEqual($containerContent.css("padding-left"), "0px",
					"The container has no left content padding when class \"sapUiNoContentPadding\" is set");
			assert.strictEqual($containerContent.css("padding-right"), "0px",
					"The container has no right content padding when class \"sapUiNoContentPadding\" is set");
			assert.strictEqual($containerContent.css("padding-top"), "0px",
					"The container has no top content padding when class \"sapUiNoContentPadding\" is set");
			assert.strictEqual($containerContent.css("padding-bottom"), "0px",
					"The container has no bottom content padding when class \"sapUiNoContentPadding\" is set");

			// Act
			oContainer.removeStyleClass("sapUiNoContentPadding");
			oContainer.addStyleClass("sapUiContentPadding");

			// Assert
			assert.strictEqual($containerContent.css("padding-left"), "16px",
					"The container has 1rem left content padding when class \"sapUiContentPadding\" is set");
			assert.strictEqual($containerContent.css("padding-right"), "16px",
					"The container has 1rem right content padding when class \"sapUiContentPadding\" is set");
			assert.strictEqual($containerContent.css("padding-top"), "16px",
					"The container has 1rem top content padding when class \"sapUiContentPadding\" is set");
			assert.strictEqual($containerContent.css("padding-bottom"), "16px",
					"The container has 1rem bottom content padding when class \"sapUiContentPadding\" is set");

			// Act
			oContainer.removeStyleClass("sapUiContentPadding");
			oContainer.addStyleClass("sapUiResponsiveContentPadding");

			// Assert
			assert.strictEqual($containerContent.css("padding-left"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]),
					"The container has " + sResponsiveSize
							+ " left content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
			assert.strictEqual(
					$containerContent.css("padding-right"),
					(aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]),
					"The container has "
							+ sResponsiveSize
							+ " right content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
			assert.strictEqual($containerContent.css("padding-top"), aResponsiveSize[0], "The container has " + sResponsiveSize
					+ " top content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
			assert.strictEqual($containerContent.css("padding-bottom"), aResponsiveSize[0], "The container has " + sResponsiveSize
					+ " bottom content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");

			// Cleanup
			oContainer.destroy();
		});
	} // end of scrolling test "if" which filters out IE8

	QUnit.module("Busy Indication", {
		before: async function () {
			var oHtml = new HTML({
				content: '<h1 id="qunit-header">Header</h1><h2 id="qunit-banner"></h2><h2 id="qunit-userAgent"></h2><ol id="qunit-tests"></ol>'
			});

			this.oPage = new Page("myFirstPage", {
				backgroundDesign: "Standard",
				title: "Test",
				showNavButton: true,
				enableScrolling: false,
				content: oHtml,
				headerContent: [new Button("hdrbtn", { text: "HDRBTN" })]
			}).placeAt("content");

			await nextUIUpdate();
		},
		afterEach: function () {
			this.oPage.setBusy(false);
		},
		after: function () {	// cleanup
			this.oPage.destroy();
		}
	});

	QUnit.test("Busy Indication within Page (only content area)", function(assert){
		var done = assert.async();
		var sDesiredZIndex = "3";

		this.oPage.setBusy(true);

		setTimeout(function() {
			var sZIndex = jQuery('.sapUiLocalBusyIndicator').css('z-index');
			assert.strictEqual(sZIndex, sDesiredZIndex, "z-index of the BusyIndicator is set correctly for Page with header/footer also covered");

			done();
		}, 1200);
	});

	QUnit.test("Busy Indication within Page (also covering header/footer)", function(assert){
		var done = assert.async();
		var sDesiredZIndex = "auto";

		this.oPage.setContentOnlyBusy(true);
		this.oPage.setBusy(true);

		setTimeout(function() {
			var sZIndex = jQuery('.sapUiLocalBusyIndicator').css('z-index');

			assert.strictEqual(sZIndex, sDesiredZIndex, "z-index of the BusyIndicator is set correctly for Page with only content covered");

			done();
		}, 2300);
	});

	QUnit.module("Title ID propagation");

	QUnit.test("_initTitlePropagationSupport is called on init", function (assert) {
		// Arrange
		var oSpy = sinon.spy(Page.prototype, "_initTitlePropagationSupport"),
			oControl;

		// Act
		oControl = new Page();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Method _initTitlePropagationSupport called on init of control");
		assert.ok(oSpy.calledOn(oControl), "The spy is called on the tested control instance");

		// Cleanup
		oSpy.restore();
		oControl.destroy();
	});

	QUnit.module("Title Alignment");

	QUnit.test("setTitleAlignment test", async function (assert) {

		var oPage = new Page({
				title: "Header"
			}),
			sAlignmentClass = "sapMBarTitleAlign",
			setTitleAlignmentSpy = this.spy(oPage, "setTitleAlignment"),
			sInitialAlignment,
			sAlignment;

		oPage.placeAt("content");
		await nextUIUpdate();
		sInitialAlignment = oPage.getTitleAlignment();

		// initial titleAlignment test depending on theme
		assert.ok(oPage._getAnyHeader().hasStyleClass(sAlignmentClass + sInitialAlignment),
					"The default titleAlignment is '" + sInitialAlignment + "', there is class '" + sAlignmentClass + sInitialAlignment + "' applied to the Header");

		// check if all types of alignment lead to apply the proper CSS class
		for (sAlignment in TitleAlignment) {
			oPage.setTitleAlignment(sAlignment);
			await nextUIUpdate();
			assert.ok(oPage._getAnyHeader().hasStyleClass(sAlignmentClass + sAlignment),
						"titleAlignment is set to '" + sAlignment + "', there is class '" + sAlignmentClass + sAlignment + "' applied to the Header");
		}

		// check how many times setTitleAlignment method is called
		assert.strictEqual(setTitleAlignmentSpy.callCount, Object.keys(TitleAlignment).length,
			"'setTitleAlignment' method is called total " + setTitleAlignmentSpy.callCount + " times");

		// cleanup
		oPage.destroy();
	});

	QUnit.module("Accessibility", {
		beforeEach: async function () {
			this.oPage = new Page({
				backgroundDesign: "Standard",
				title : "Accessibility Test",
				showNavButton: true,
				showFooter: true,
				showHeader: true,
				footer: new Bar({ contentRight: [new Button({ text: "Button" })] })
			});
			this.oPage.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oPage.destroy();
			this.oPage = null;
		}
	});

	QUnit.test("Verifies that the invisible text element is correctly associated with the header via the aria-labelledby attribute", function(assert) {
		// Setup
		var oPage = this.oPage,
			oHeader = oPage._getAnyHeader(),
			invisibleText = document.getElementById(oHeader.getId() + "-InvisibleText");

		// Assert
		assert.ok(invisibleText, "Invisible text is rendered");
		assert.strictEqual(oHeader.$().attr("aria-labelledby"), invisibleText.id, "Invisible text is set as aria-labelledby on the header");
	});

	QUnit.test("Verifies that the invisible text element is correctly associated with the footer via the aria-labelledby attribute", function(assert) {
		// Setup
		var oPage = this.oPage,
			oFooter = oPage.getFooter(),
			invisibleText = document.getElementById(oFooter.getId() + "-InvisibleText");

		// Assert
		assert.ok(invisibleText, "Invisible text is rendered");
		assert.strictEqual(oFooter.$().attr("aria-labelledby"), invisibleText.id, "Invisible text is set as aria-labelledby on the footer");
	});

	QUnit.module("LandmarkInfo", {
		beforeEach: function () {
			this.oPage = new Page();
		},
		testElementTag: function (sPropertyName, sLandmark, sTagGeter, sExtectedTag, assert) {
			var oSetting = {};

			oSetting[sPropertyName] = sLandmark;

			this.oPage.setLandmarkInfo(new PageAccessibleLandmarkInfo(oSetting));

			assert.ok(this.oPage[sTagGeter](), sExtectedTag);
		}
	});

	QUnit.test("Div element should be rendered for header landmark info is provided", function(assert) {
		this.testElementTag("headerRole", coreLibrary.AccessibleLandmarkRole.Region, "_getHeaderTag", "div", assert);
	});

	QUnit.test("Div element should be rendered for subheader landmark info is provided", function(assert) {
		this.testElementTag("subHeaderRole", coreLibrary.AccessibleLandmarkRole.Region, "_getSubHeaderTag", "div", assert);
	});

	QUnit.test("Div element should be rendered for footer landmark info is provided", function(assert) {
		this.testElementTag("footerRole", coreLibrary.AccessibleLandmarkRole.Region, "_getFooterTag", "div", assert);
	});

	return pStyleLoaded;
});