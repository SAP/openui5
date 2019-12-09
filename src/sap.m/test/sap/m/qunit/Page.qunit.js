/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/HTML",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/Bar",
	"sap/m/SearchField",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/OverflowToolbar",
	"sap/ui/Device",
	"sap/ui/qunit/utils/waitForThemeApplied",
	"sap/ui/core/theming/Parameters",
	"jquery.sap.global"
], function(
	qutils,
	createAndAppendDiv,
	HTML,
	Button,
	Page,
	Bar,
	SearchField,
	coreLibrary,
	JSONModel,
	OverflowToolbar,
	Device,
	waitForThemeApplied,
	Parameters,
	jQuery
) {
	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	createAndAppendDiv("content");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"#bigButton {" +
		"	height: 2000px;" +
		"}" +
		"#p2content {" +
		"	width: 2000px;" +
		"	height: 2000px;" +
		"}" +
		"html," +
		"#content," +
		"#p3content," +
		"#p4content {" +
		"	width: 100%;" +
		"	height: 100%;" +
		"}";
	document.head.appendChild(styleElement);



	var oHtml = new HTML({
		content : '<h1 id="qunit-header">Header</h1><h2 id="qunit-banner"></h2><h2 id="qunit-userAgent"></h2><ol id="qunit-tests"></ol>'
	});
	var oButton = new Button("bigButton", {
		text: "Test",
		width: "2000px"
	});

	var oPage = new Page("myFirstPage", {
		backgroundDesign: "Standard",
		title : "Test",
		showNavButton : true,
		icon: "../images/SAPUI5.jpg",
		enableScrolling : false,
		content : oHtml,
		headerContent: [new Button("hdrbtn",{text:"HDRBTN"})]
	}).placeAt("content");
	oPage.setSubHeader(new Bar("mySubHeader",{contentMiddle: [new SearchField("SFB1", {placeholder: "search for...", width: "100%"})]}));
	oPage.setFooter(new Bar("myFooter", { contentMiddle: [ new Button('FooterBtn', {text: "Footer Btn"})]}));

	var oPage2 = new Page("mySecondPage", {
		title : "Test 2",
		showNavButton : false,
		content : [new HTML({
			content : "<div id='p2content'>test content</div>"
		}), oButton]
	}).placeAt("content");

	var oPage3 = new Page("myThirdPage", {
		showHeader : false,
		enableScrolling : false,
		content : new HTML({
			content : "<div id='p3content'>another test content</div>"
		})
	}).placeAt("content");


	sap.ui.jsview("busyTestView", {
		createContent: function() {
			return new Page("busyTestPage1", {
				title : "TestView",
				showNavButton : true,
				headerContent: [new Button({text:"HDRBTN"})],
				content : new HTML({
					content : "<div id='p4content'>yet another test content</div>"
				})
			});
		}
	});

	var oView = sap.ui.view({id:"testView1", viewName:"busyTestView", type:ViewType.JS});
	oView.placeAt("content");


	jQuery(document).ready(function() {

	});

	QUnit.module("Initial Check");

	QUnit.test("Page rendered", function(assert) {
		assert.ok(document.getElementById("myFirstPage"), "Page should be rendered");
		assert.ok(document.getElementById("myFirstPage-intHeader"), "header should be rendered");
		assert.ok(document.getElementById("hdrbtn"), "header right button should be rendered");
		assert.ok(document.getElementById("mySubHeader"), "Sub header should be rendered");
		assert.ok(document.getElementById("myFirstPage-navButton"), "nav button should be rendered");
		var sNavButtonTooltip = jQuery("#myFirstPage-navButton").attr("title");
		assert.ok(sNavButtonTooltip && (sNavButtonTooltip.length > 0), "nav button should have a tooltip by default");
		assert.ok(document.getElementById("qunit-header"), "Page content should be rendered");
		assert.ok(sap.ui.getCore().byId("myFirstPage-intHeader").$().parent().is("header"), "header should be rendered as header tag");
		assert.ok(sap.ui.getCore().byId("myFooter").$().parent().is("footer"), "footer should be rendered as footer tag");

		// The following qunit is removed because of
		// BCP: 1670157998
		// It checks visual appearance and such a test can be made in visual test
		// because it causes issues with browser reporting distances + rounding
		/*assert.ok(parseInt(sap.ui.getCore().byId("mySubHeader").$().position().top, 10) >= parseInt(sap.ui.getCore().byId("myFirstPage-intHeader").$().position().top, 10) + parseInt(sap.ui.getCore().byId("myFirstPage-intHeader").$().outerHeight(), 10),
					"subHeader should be directly below header");*/

		assert.ok(sap.ui.getCore().byId("myFirstPage-intHeader").$().hasClass("sapMHeader-CTX"), "header should contain header context");
		assert.ok(!sap.ui.getCore().byId("mySubHeader").$().hasClass("sapMHeader-CTX"), "subHeader should not contain header context");
		assert.ok(sap.ui.getCore().byId("myFooter").$().hasClass("sapMFooter-CTX"), "footer should contain footer context");
		assert.ok(!sap.ui.getCore().byId("myFirstPage").$().hasClass("sapMPageBgList"), "Page content should not have list gray background color");
		oPage.setBackgroundDesign("List");
		assert.ok(sap.ui.getCore().byId("myFirstPage").$().hasClass("sapMPageBgList"), "Page content should have list background color");
		oPage.setBackgroundDesign("Standard");
		assert.ok(sap.ui.getCore().byId("myFirstPage").$().hasClass("sapMPageBgStandard"), "Page content should have standard background color");
		assert.ok(!sap.ui.getCore().byId("myFirstPage").$().hasClass("sapMPageBgList"), "Page content should not have list background color");
		oPage.setBackgroundDesign("Solid");
		assert.ok(sap.ui.getCore().byId("myFirstPage").$().hasClass("sapMPageBgSolid"), "Page content should have a solid background color");
		oPage.setBackgroundDesign("Transparent");
		assert.ok(sap.ui.getCore().byId("myFirstPage").$().hasClass("sapMPageBgTransparent"), "Page content should be transparent");
		assert.equal(oPage.$("cont").hasClass("sapMPageEnableScrolling"), false, "In a page with scrolling disabled, no scroll-related class should be added");
	});

	QUnit.test("Page 2 rendered", function(assert) {
		assert.ok(document.getElementById("mySecondPage"), "Page should be rendered");
		assert.ok(document.getElementById("mySecondPage-intHeader"), "header should be rendered");
		assert.equal(document.getElementById("mySecondPage-navButton"), undefined, "nav button should not be rendered");
		assert.ok(document.getElementById("p2content"), "Page 2 content should be rendered");
		oPage2.setBackgroundDesign("List");
		assert.ok(sap.ui.getCore().byId("mySecondPage").$().hasClass("sapMPageBgList"), "Page 2 content should have list background color");
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

	QUnit.test("render once only", function(assert) { // regression test for issue 1570014242
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
		sap.ui.getCore().applyChanges();
		assert.equal(iRenderCounter, 1, "Page should be rendered only once");

		oRenderOncePage.rerender();
		assert.equal(iRenderCounter, 2, "Page should be rendered twice after another forced rerendering");

		oRenderOncePage.destroy();
	});

	QUnit.test("render once only with combinatorics", function(assert) { // regression test for issue 1570014242
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
		sap.ui.getCore().applyChanges();
		assert.equal(iRenderCounter, 1, "Page should be rendered only once");

		oRenderOncePage.rerender();
		assert.equal(iRenderCounter, 2, "Page should be rendered twice after another forced rerendering");

		oRenderOncePage.destroy();
	});

	QUnit.test("Page with footer and unescaped id", function (assert) {
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
		sap.ui.getCore().applyChanges();

		var oPageContentRef = oPage.getDomRef("cont");
		var hasScroll = oPageContentRef.getBoundingClientRect().height < oPageContentRef.scrollHeight;

		assert.ok(document.getElementById("my.Page"), "Page should be rendered");
		assert.ok(document.getElementById("p4content"), "Page content should be rendered");
		assert.equal(hasScroll, false, "Content should be correctly checked for scroll");

		oPage.destroy();
		oPage = null;
	});

	QUnit.module("Properties Check");

	QUnit.test("Title escaping", function(assert) {
		//Setup
		var oModel = new JSONModel({"test": "{hello}"});
		var oPage = new Page({
			title:'{/test}'
		});
		oPage.setModel(oModel);
		oPage.placeAt('content');
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oPage.getTitle(), oPage.$("title-inner").text(), "Title should be escaped properly when using curly braces.");

		// Cleanup
		oPage.destroy();
		oModel.destroy();
	});

	QUnit.test("showSubHeader", function(assert) {
		var oSubHeader = sap.ui.getCore().byId("mySubHeader");
		assert.ok(oSubHeader.$().length, "subHeader should be rendered");


		oPage.setShowSubHeader(false);
		sap.ui.getCore().applyChanges();
		assert.equal(document.getElementById("mySubHeader"), undefined, "subHeader should not be rendered when 'showSubHeader' is false");
		assert.equal(jQuery("#myFirstPage-cont").css("top"), "48px", "top of Page content with subHeader not shown should be 48px (3rem)");

		oPage.setShowSubHeader(true);
		sap.ui.getCore().applyChanges();
		assert.ok(document.getElementById("mySubHeader"), "subHeader should be rendered");
		assert.equal(jQuery("#myFirstPage-cont").css("top"), "96px", "top of Page content with subHeader shown should be 96px (6rem)");
	});

	QUnit.test("showFooter when floatingFooter=true and showFooter=false initially", function(assert) {
		var oPage = new Page({
			id: "idPage",
			floatingFooter: true,
			showFooter: false,
			footer: [ new OverflowToolbar({id: "idFooter", content: [new Button()]}) ]
		});

		oPage.placeAt("content");

		sap.ui.getCore().applyChanges();

		assert.equal(!!document.getElementById("myFooter"), true, "footer should be rendered");
		assert.equal(oPage.getFooter().$().parent().hasClass("sapUiHidden"), true, "footer is hidden");

		oPage.destroy();
	});

	QUnit.test("Page properly applies classNames to the footer", function (assert) {
		var oPage = new Page({
			id: "idPage",
			floatingFooter: true,
			showFooter: true,
			footer: [new OverflowToolbar({id: "idFooter", content: [new Button()]})]
		}),
		done = assert.async(2);

		oPage.placeAt("content");
		sap.ui.getCore().applyChanges();

		var $footer = oPage.$().find(".sapMPageFooter").last();

		assert.equal($footer.hasClass("sapUiHidden"), false, "Footer is hidden.");

		//Act
		oPage.setShowFooter(false);
		sap.ui.getCore().applyChanges();

		setTimeout(function() {
			//Assert
			assert.equal($footer.hasClass("sapUiHidden"), true, "Footer is hidden.");

			//Cleanup
			oPage.destroy();
			done();
		}, Page.FOOTER_ANIMATION_DURATION + 50);
	});

	QUnit.test("showFooter toggling with floatingFooter disabled", function (assert) {
		// Setup
		var oBar = new Bar({
				contentRight: new Button({text: "Hello World"})
			}),
			oPage = new Page({
				showFooter: false,
				footer: oBar
			}).placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oBar.$().parent().hasClass("sapUiHidden"), "Footer is there, but is hidden.");
		assert.equal(oPage.$().hasClass("sapMPageWithFooter"), false,
				"The class .sapMPageWithFooter is not applied, although a footer exists, the showFooter is false");

		// Act
		oPage.setShowFooter(true);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!oBar.$().parent().hasClass("sapUiHidden"), "Footer is visible.");
		assert.equal(oPage.$().hasClass("sapMPageWithFooter"), true,
				"The class .sapMPageWithFooter is applied, when a footer exists and showFooter is true.");

		// Act
		oPage.setShowFooter(false);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oBar.$().parent().hasClass("sapUiHidden"), "Footer is there, but is hidden.");
		assert.equal(oPage.$().hasClass("sapMPageWithFooter"), false,
				"The class .sapMPageWithFooter is not applied, although the footer exists, the showFooter is false.");

		// Act
		oPage.setShowFooter(true);
		oPage.setFooter(null);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oPage.$().hasClass("sapMPageWithFooter"), false,
				"The class .sapMPageWithFooter is not applied, although the showFooter is true, the footer does not exist.");

		// Cleanup
		oBar = null;

		oPage.destroy();
		oPage = null;
	});

	QUnit.test("contentOnlyBusy property", function (assert) {
		// Setup
		var oBusyIndicator, oBusyIndicatorInner,
				clock = sinon.useFakeTimers(),
				oPage = new Page("myPage");

		oPage.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Act
		oPage.setBusy(true);
		sap.ui.getCore().applyChanges();
		clock.tick(1000);

		oBusyIndicator = [].filter.call(oPage.getDomRef().childNodes, function (oChild) {
			return oChild.id.indexOf("busyIndicator") > -1;
		})[0];

		// Assert
		assert.ok(oBusyIndicator, "Busy indicator is right inside Page's root.");

		// Setup & Act
		oPage.setBusy(false);
		sap.ui.getCore().applyChanges();
		clock.tick(1000);

		oPage.setContentOnlyBusy(true);
		oPage.setBusy(true);
		sap.ui.getCore().applyChanges();
		clock.tick(1000);

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
		clock.restore();
	});

	QUnit.test("setNavButtonType should propagate to internal button", function (assert) {
		var oPage = new Page();

		oPage.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.notOk(oPage._navBtn, "Button should not be initialized");

		oPage.setShowNavButton(true);
		sap.ui.getCore().applyChanges();

		assert.ok(oPage._navBtn, "Button should be initialized");
		assert.strictEqual(oPage.getNavButtonType(), oPage._navBtn.getType(), "Default button type 'Back' should be propagated");

		oPage.setShowNavButton(false);
		sap.ui.getCore().applyChanges();

		assert.notOk(oPage._navBtn.getDomRef(), "Button should not be rendered");

		oPage.setShowNavButton(true);
		oPage.setNavButtonType("Up");
		oPage.setNavButtonText("Up");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oPage.getNavButtonType(), oPage._navBtn.getType(), "Type 'Up' should be set to the nav button");
		assert.strictEqual(oPage._navBtn.getType(), "Up", "Up should be propagated to nav button of the page");
		assert.strictEqual(oPage._navBtn.getText(), "Up", "Up text should be propagated to nav button of the page");

		oPage.destroy();
	});

	// scrolling tests only for non-IE8 browsers
	if (Device.browser.mozilla || Device.browser.safari || Device.browser.chrome
			|| (Device.browser.msie && Device.browser.version >= 9) /* TODO remove after 1.62 version */) {

		QUnit.module("Scrolling");

		var getScrollPos = function(sPageId) {
			var fScrollLeft, scrollEnablement = sap.ui.getCore().byId(sPageId).getScrollDelegate();

			if (scrollEnablement._scroller) { // iScroll
				$Scroll = sap.ui.getCore().byId(sPageId + "-scroll").$();
				if (Device.browser.mozilla) {
					fScrollLeft = $Scroll.css("-moz-transform").split(" ")[5]; // "matrix(1, 0, 0, 1, 0, -99.9999)" => "99.9999)"
				} else if (Device.browser.safari || Device.browser.chrome) {
					fScrollLeft = $Scroll.css("-webkit-transform").split(" ")[5];
				} else if (Device.browser.msie && Device.browser.version >= 9) { /* TODO remove after 1.62 version */
					fScrollLeft = $Scroll.css("left");
				}
				return Math.round(parseFloat(s));

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
			oPage2.scrollTo(100, 0);
			assert.equal(getScrollPos("mySecondPage"), -100, "Page 2 should be scrolled to position 100");
		});

		QUnit.test("ScrollToElement", function(assert) {

			var oPage4 = new Page("myFourthPage",{
				content:[
					new HTML({
						content : "<div style='height: 1200px'>1200px height div</div>"
					}),
					this.oTestButton = new Button(),
					new HTML({
						content : "<div style='height: 2000px'>2000px height div</div>"
					})
				]
			});
			oPage4.placeAt("content");
			sap.ui.getCore().applyChanges();

			oPage4.scrollToElement(this.oTestButton);

			var scrollAsExpected = getScrollPos("myFourthPage") - -1200 > -1 || getScrollPos("myFourthPage") - -1200 < 2;

			assert.ok(scrollAsExpected, "Page 2 should be scrolled to position 1200");

			oPage4.destroy();
		});

		QUnit.test("ScrollToElement Parameters forwarding", function(assert) {
			var oButton = new Button();
				oPage5 = new Page("myPage",{
					content:[
						oButton
					]
				});

			oPage5.placeAt("content");
			sap.ui.getCore().applyChanges();

			var oScrollEnablement = oPage5.getScrollDelegate(),
				oSpy = sinon.spy(oScrollEnablement, "scrollToElement");

			oPage5.scrollToElement(oButton, 200, [0, -100]);

			assert.ok(oSpy.calledWith(oButton.getDomRef(), 200, [0, -100]), "scrollToElement's params forwarded correctly to scroll delegate.");

			oSpy.restore();
			oPage5.destroy();
		});

		QUnit.test("Restoring scrolling state after rendering", function(assert) {
			assert.expect(1); // event should not be fired after rerendering
			oPage2.rerender();
			assert.equal(getScrollPos("mySecondPage"), -100, "Page 2 should be scrolled to position 100");
		});

		QUnit.test("Container Padding Classes", function(assert) {
			// System under Test + Act
			/* eslint-disable no-nested-ternary */
			var oContainer = new Page(), sContentSelector = "section", sResponsiveSize = (Device.resize.width <= 599 ? "0px"
					: (Device.resize.width <= 1023 ? "16px" : "16px 32px")), aResponsiveSize = sResponsiveSize.split(" "), $container, $containerContent;
			/* eslint-enable no-nested-ternary */

			// Act
			oContainer.placeAt("content");
			sap.ui.getCore().applyChanges();
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
		afterEach : function() {
			oPage.setBusy(false);
		}
	});

	QUnit.test("Busy Indication within Page (only content area)", function(assert){
		var done = assert.async();
		var sDesiredZIndex = "3";

		oPage.setBusy(true);

		jQuery.sap.delayedCall(1200, this, function() {
			var $busyIndicator = jQuery('.sapUiLocalBusyIndicator')[0];
			var sZIndex = jQuery('.sapUiLocalBusyIndicator').css('z-index');
			assert.strictEqual(sZIndex, sDesiredZIndex, "z-index of the BusyIndicator is set correctly for Page with header/footer also covered");

			done();
		});
	});

	QUnit.test("Busy Indication within Page (also covering header/footer)", function(assert){
		var done = assert.async();
		var sDesiredZIndex = "auto";

		oPage.setContentOnlyBusy(true);
		oPage.setBusy(true);

		jQuery.sap.delayedCall(2300, this, function() {
			var $busyIndicator = jQuery('.sapUiLocalBusyIndicator').get(0);
			var sZIndex = jQuery('.sapUiLocalBusyIndicator').css('z-index');

			assert.strictEqual(sZIndex, sDesiredZIndex, "z-index of the BusyIndicator is set correctly for Page with only content covered");

			done();
		});
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

	return waitForThemeApplied();
});