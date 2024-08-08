/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/core/IconPool",
	"sap/ui/core/Popup",
	"sap/m/Dialog",
	"sap/m/Bar",
	"sap/m/SearchField",
	"sap/ui/core/HTML",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/thirdparty/jquery",
	"sap/m/Page",
	"sap/m/App",
	"sap/m/ScrollContainer",
	"sap/m/Text",
	"sap/m/OverflowToolbar",
	"sap/m/Toolbar",
	"sap/m/Input",
	"sap/ui/core/library",
	"sap/m/StandardListItem",
	"sap/m/List",
	"sap/m/Table",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/InstanceManager",
	"sap/ui/model/json/JSONModel",
	"sap/ui/events/KeyCodes",
	"sap/m/Title",
	"sap/ui/dom/units/Rem"
], function(
	Library,
	qutils,
	createAndAppendDiv,
	nextUIUpdate,
	Device,
	Element,
	IconPool,
	Popup,
	Dialog,
	Bar,
	SearchField,
	HTML,
	Button,
	mobileLibrary,
	jQuery,
	Page,
	App,
	ScrollContainer,
	Text,
	OverflowToolbar,
	Toolbar,
	Input,
	coreLibrary,
	StandardListItem,
	List,
	Table,
	ColumnListItem,
	Column,
	InstanceManager,
	JSONModel,
	KeyCodes,
	Title,
	Rem
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.m.DialogRoleType
	var DialogRoleType = mobileLibrary.DialogRoleType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.TitleAlignment
	var TitleAlignment = mobileLibrary.TitleAlignment;

	var DRAGRESIZE_STEP = Rem.toPx(1);

	createAndAppendDiv("content");

	function marginCompare(value1, value2, margin) {
		var _margin = margin || 2;
		return (Math.abs(value1 - value2)) < _margin;
	}

	function isTextTruncated($element) {
		var iTolerance = 5;

		return $element[0].scrollWidth > ($element.innerWidth() + iTolerance);
	}

	/**
	 * Possible error for fractions comparison
	 */
	var EPS = 0.2;

	QUnit.module("Initial Check");

	QUnit.test("Initialization", function (assert) {
		// Arrange
		var oDialog = new Dialog("dialog");

		// Assert
		assert.ok(!document.getElementById("dialog"), "Dialog is not rendered before it's ever opened.");
		assert.equal(oDialog.oPopup._sF6NavMode, "SCOPE", "Dialog's popup navigation mode is set to SCOPE.");

		// Clean up
		oDialog.destroy();
	});

	QUnit.module("Rendering");

	QUnit.test("Rendering of invisible footer", function (assert) {
		// Arrange
		var oDialog = new Dialog({
			beginButton: new Button({
				text: "Hello"
			})
		});
		oDialog._getToolbar().setVisible(false);

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		assert.strictEqual(oDialog.$().find("footer").length, 0, "Footer is not rendered when not visible");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Stretched dialog's position", function (assert) {
		var oDialog = new Dialog({
			stretch: true,
			content: new Text({text: "test"})
		});

		oDialog.open();
		this.clock.tick(100);

		// Assert
		var oDomRef = oDialog.getDomRef();
		assert.ok(oDomRef.style.left, "dialog's left position is set");
		assert.strictEqual(oDomRef.style.right, "", "dialog's right position is not set");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Stretched dialog's position in RTL", function (assert) {
		var oDialog = new Dialog({
			stretch: true,
			content: new Text({text: "test"})
		});
		// simulate RTL mode
		oDialog._bRTL = true;

		oDialog.open();
		this.clock.tick(100);

		// Assert
		var oDomRef = oDialog.getDomRef();
		assert.ok(oDomRef.style.right, "dialog's right position is set in RTL");
		assert.strictEqual(oDomRef.style.left, "", "dialog's left position is not set");

		oDialog.destroy();
	});

	QUnit.test("Stretched dialog with inner footer max height", function (assert) {
		var oDialog = new Dialog({
			stretch: true,
			content: new Page({
				title: "Dialog Test",
				content: new Text({text: "Content"}),
				footer: new Bar({
					contentRight: new Button({
						text: "Some text"
					})
				})
			})
		});

		oDialog.open();
		this.clock.tick(100);

		// Assert
		var oDomRef = oDialog.getDomRef(),
			iMaxHeight = parseFloat(oDomRef.style.maxHeight);

		oDialog.getContent()[0].destroyFooter();
		oDialog.setEndButton(new Button({
			text: "Some text"
		}));

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.ok(iMaxHeight > parseFloat(oDomRef.style.maxHeight), "dialog max height is bigger when there is no dialog footer.");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Resize handler", function (assert) {
		var oDialog = new Dialog({
			resizable: true,
			title: "Dialog Test",
			content: new Text({text: "Content"})
		});

		oDialog.open();
		this.clock.tick(100);

		// Assert
		var oIconDomRef = oDialog.getDomRef().querySelector(".sapMDialogResizeHandle");
		assert.strictEqual(oIconDomRef.getAttribute("title"), null, "title attribute is not set");
		assert.strictEqual(oIconDomRef.getAttribute("aria-label"), null, "aria-label attribute is not set");

		// Clean up
		oDialog.destroy();
	});

	QUnit.module("Content preservation", {
		beforeEach: function() {
			sinon.config.useFakeTimers = false;
		},
		afterEach: function() {
			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test("Preserve Dialog Content", function(assert) {
		var done = assert.async();
		var bRendered = false;
		var oDialog = new Dialog();
		var oHtml = new HTML({
			content: "<div id='htmlControl'>test</div>",
			preferDOM : true,
			afterRendering : function(oEvent) {
				if (!bRendered) {
					document.querySelector("#htmlControl").setAttribute("data-some-attribute", "some-value");
					bRendered = true;
				}
			}
		});
		oDialog.addContent(oHtml);

		var fnOpened2 = function() {
			oDialog.detachAfterOpen(fnOpened2);

			assert.ok(oDialog.isOpen(), "Dialog is open");
			assert.ok(!!document.querySelector("#htmlControl"), "HTML control rendered");
			assert.equal(document.querySelector("#htmlControl").getAttribute("data-some-attribute"), "some-value", "DOM attribute value set correctly");

			oDialog.close();
			done();
		};

		var fnClosed1 = function() {
			oDialog.detachAfterClose(fnClosed1);

			assert.ok(!oDialog.isOpen(), "Dialog is closed");
			assert.equal(document.querySelector("#htmlControl").parentElement.id, "sap-ui-preserve", "HTML control rendered (preserved)");

			oDialog.attachAfterOpen(fnOpened2);

			oDialog.open();
		};

		var fnOpened1 = function() {
			oDialog.detachAfterOpen(fnOpened1);

			assert.ok(oDialog.isOpen(), "Dialog is open");
			assert.ok(!!document.querySelector("#htmlControl"), "HTML control rendered");
			assert.equal(document.querySelector("#htmlControl").getAttribute("data-some-attribute"), "some-value", "DOM attribute value set correctly");

			oDialog.attachAfterClose(fnClosed1);

			oDialog.close();
		};


		assert.equal(document.querySelector("#htmlControl"), null, "HTML control not rendered");

		oDialog.attachAfterOpen(fnOpened1);
		oDialog.open();
	});

	QUnit.module("Content resize", {
		beforeEach: function() {
			var that = this;

			this.SCROLL_TOP = 1000;
			this.dialog = new Dialog({
				content: [
					new ScrollContainer({width: "200px", height: "1000px"}),
					new ScrollContainer({width: "200px", height: "1000px"}),
					new ScrollContainer({width: "200px", height: "1000px"}),
					new ScrollContainer({width: "200px", height: "1000px"}),
					new ScrollContainer("lastSC", {width: "200px", height: "1000px", visible: false})
				]
			});
			this.button = new Button({
				press: function() {
					that.dialog.open();
				}
			});
		},
		afterEach: function() {
			this.dialog.destroy();
			this.button.destroy();
		}
	});

	QUnit.test("Dialog scroll position", function(assert) {
		// act
		this.dialog.open();
		this.clock.tick(500);
		this.dialog.$('cont').scrollTop(1000);
		this.clock.tick(500);
		Element.getElementById("lastSC").setVisible(true);
		this.dialog._onResize();

		// assert
		assert.ok(Math.abs(this.dialog.$('cont').scrollTop() - this.SCROLL_TOP) < EPS, "Content's scroll position should be preserved");
	});

	QUnit.module("Resizing on mobile while using OverflowToolbar", {
		beforeEach: function() {
			// noop
		},
		afterEach: function() {
			this.oDialog.destroy();
		}
	});

	QUnit.test("OverflowToolbar expected to rerender on mobile", function (assert) {
		// arrange
		var oSystem = {
				desktop: false,
				tablet: false,
				phone: true
			},
			iCallsCount;

		this.stub(Device, "system", oSystem);

		this.oDialog = new Dialog({
			content: [
				new Text({
					text: 'Dialog content'
				})
			],

			contentWidth: '800px',

			buttons: [
				new Button({ text: 'Go'}),
				new Button({ text: 'Cancel'}),
				new Button({ text: 'Restore'}),
				new Button({ text: 'Save'})
			]
		});

		var oRerenderSpy = this.spy(OverflowToolbar.prototype, "_resetAndInvalidateToolbar");

		// act
		this.oDialog.open();
		iCallsCount = oRerenderSpy.callCount;
		this.oDialog._oToolbar._handleResize();

		// assert
		assert.equal(oRerenderSpy.callCount, iCallsCount + 1, "OverflowToolbar is reseted and invalidated when on mobile in Dialog");
	});

	QUnit.test("OverflowToolbar expected to not rerender on desktop", function (assert) {
		// arrange
		var oSystem = {
				desktop: true,
				tablet: false,
				phone: false
			},
			iCallsCount;

		this.stub(Device, "system", oSystem);

		this.oDialog = new Dialog({
			content: [
				new Text({
					text: 'Dialog content'
				})
			],

			contentWidth: '800px',

			buttons: [
				new Button({ text: 'Go'}),
				new Button({ text: 'Cancel'}),
				new Button({ text: 'Restore'}),
				new Button({ text: 'Save'})
			]
		});

		var oRerenderSpy = this.spy(OverflowToolbar.prototype, "_resetAndInvalidateToolbar");

		// act
		this.oDialog.open();
		iCallsCount = oRerenderSpy.callCount;
		this.oDialog._oToolbar._handleResize();

		// assert
		assert.equal(oRerenderSpy.callCount, iCallsCount, "OverflowToolbar is not reseted and invalidated when on desktop in Dialog");
	});

	QUnit.module("Open and Close", {
		beforeEach: function () {
			this.oDialog = new Dialog("dialog", {
				title: "World Domination",
				subHeader: new Bar({
					contentMiddle: [
						new SearchField({
							placeholder: "Search ...",
							width: "100%"
						})
					]
				}),
				content: [
					new HTML({content: "<p>Do you want to start a new world domination campaign?</p>"})
				],
				icon: "../images/SAPUI5Icon.png",
				beginButton: new Button("leftButton", {
					text: "Reject",
					type: ButtonType.Reject,
					press: function () {
						this.oDialog.close();
					}.bind(this)
				}),
				endButton: new Button("rightButton", {
					text: "Accept",
					type: ButtonType.Accept,
					press: function () {
						this.oDialog.close();
					}.bind(this)
				})
			});

			this.oButton = new Button({
				text: "Open Dialog",
				press: function () {
					this.oDialog.open();
				}.bind(this)
			});

			var oPage = new Page("myFirstPage", {
				title: "Dialog Test",
				showNavButton: true,
				enableScrolling: true,
				content: this.oButton
			});

			this.oApp = new App("myApp", {
				initialPage: "myFirstPage",
				pages: [
					oPage
				]
			});

			this.oApp.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oDialog.destroy();
		}
	});

	QUnit.test("Open Dialog", function (assert) {
		// Arrange
		this.oDialog.attachBeforeOpen(function () {
			assert.ok(jQuery("#dialog").css("visibility") !== "visible", "Dialog should be hidden before it's opened");
		});

		this.oDialog.attachAfterOpen(function () {
			assert.equal(jQuery("#dialog").css("visibility"), "visible", "Dialog should be visible after it's opened");
		});

		this.oButton.firePress();
		assert.ok(this.oDialog.isOpen(), "Dialog is already open");
		this.clock.tick(600);
		var $Dialog = jQuery("#dialog"),
			$ScrollDiv = this.oDialog.$("scroll"),
			oTitleDom = this.oDialog.getDomRef("title"),
			oSubHeaderDom = $Dialog.children("header").children(".sapMDialogSubHeader")[0],
			oIconDom = this.oDialog.getDomRef("icon"),
			oSearchField = Element.getElementById("__field0").getFocusDomRef();
		assert.ok(document.getElementById("dialog"), "dialog is rendered after it's opened.");
		assert.ok($Dialog.closest("#sap-ui-static")[0], "dialog should be rendered inside the static uiArea.");
		assert.ok(oSubHeaderDom, "Sub header should be rendered inside the dialog");
		assert.equal($ScrollDiv.css("display"), "inline-block", "Scroll div should always have display: inline-block");

		if (!Device.support.touch) {
			assert.equal(oSearchField, document.activeElement, "searchfield should have the focus");
		}

		if (Device.support.touch) {
			assert.expect(9);
		} else {
			assert.expect(10);
		}
		assert.ok(oIconDom, "Icon should be rendered.");
		assert.ok(oTitleDom, "Title should be rendered");
	});

	QUnit.test("Close Dialog. Test set origin parameter value", function (assert) {
		// Arrange
		assert.expect(4);
		this.oDialog.attachBeforeClose(function () {
			// Assert 1
			assert.equal(jQuery("#dialog").css("visibility"), "visible", "Dialog should be visible after it's opened");
		});
		this.oDialog.attachAfterClose(function (oEvent) {
			// Assert 2,3,4
			assert.equal(jQuery("#dialog").length, 0, "Dialog content is not rendered anymore");
			assert.ok(oEvent.getParameter("origin") !== null, "Origin parameter should be set");
			assert.ok(!this.oDialog.isOpen(), "Dialog is already closed");
		}.bind(this));

		// Act
		this.oButton.firePress();
		this.oDialog.getBeginButton().$().trigger("tap");
		this.clock.tick(500);
	});

	QUnit.test("Open Message Dialog on phone", function (assert) {
		var oSystem = {
			desktop: false,
			tablet: false,
			phone: true
		};

		this.stub(Device, "system", oSystem);

		var oDialog = new Dialog({
			type: DialogType.Message,
			stretch: false
		});

		oDialog.open();
		assert.ok(oDialog.isOpen(), "Dialog is already open");
		this.clock.tick(500);
		assert.ok(oDialog.$().outerWidth() <= (jQuery(window).width() - 32), "Dialog adapts to the screen on phone");

		oDialog.destroy();
	});

	QUnit.module("Message dialog");

	QUnit.test("Footer rendering", function (assert) {

		var oDialog = new Dialog({
			type: DialogType.Message,
			buttons: [
				new Button({ text: "Cancel"})
			]
		});

		oDialog.open();
		this.clock.tick(500);

		oDialog._oToolbar.invalidate();
		this.clock.tick(500);

		var $toolbar = oDialog._oToolbar.$();
		var bContrastApplied = $toolbar.hasClass("sapContrast") || $toolbar.hasClass("sapContrastPlus");

		assert.notOk(bContrastApplied, "Should NOT have contrast classes applied on footer for message dialog.");

		oDialog.destroy();
	});

	QUnit.module("Set properties");

	QUnit.test("Set vertical/horizontal scrolling to false", function (assert) {
		var oDialog = new Dialog({
			content: new HTML({
				content: "<div style='width: 1000px;height: 1000px'></div>"
			})
		});
		oDialog.open();
		this.clock.tick(500);

		oDialog.setVerticalScrolling(false);
		oDialog.setHorizontalScrolling(false);

		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(oDialog.getDomRef().className.indexOf("sapMDialogVerScrollDisabled") != -1, true, "verticalScrolling should be disabled");
		assert.equal(oDialog.getDomRef().className.indexOf("sapMDialogHorScrollDisabled") != -1, true, "horizontalScrolling should be disabled");
		assert.equal(oDialog.getVerticalScrolling(), false, "verticalScrolling should be disabled");
		assert.equal(oDialog.getVerticalScrolling(), false, "horizontalScrolling should be disabled");
		oDialog.destroy();
	});

	QUnit.test("Set vertical/horizontal scrolling to true", function (assert) {
		var oDialog = new Dialog({
			content: new HTML({
				content: "<div style='width: 1000px;height: 1000px'></div>"
			})
		});
		oDialog.open();
		this.clock.tick(500);

		oDialog.setVerticalScrolling(true);
		oDialog.setHorizontalScrolling(true);

		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(oDialog.getDomRef().className.indexOf("sapMPopoverVerScrollDisabled") == -1, true, "verticalScrolling should be enabled");
		assert.equal(oDialog.getDomRef().className.indexOf("sapMPopoverHorScrollDisabled") == -1, true, "horizontalScrolling should be enabled");
		assert.equal(oDialog.getVerticalScrolling(), true, "verticalScrolling should be enabled");
		assert.equal(oDialog.getVerticalScrolling(), true, "horizontalScrolling should be enabled");
		oDialog.destroy();
	});

	QUnit.test("Should adjust the scrolling pane if content is bigger than container", function (assert) {
		//Arrange
		this.stub(Device, "system", {desktop: true});

		this.stub(Device, "os", {
			android: false,
			ios: false
		});

		var resultingContentWidth,
			resultingScrollPaneWidth;

		//System under Test
		var sut = new Dialog({
			contentWidth: "500px",
			content: new Text({
				text: "This is just a sample text with width set to 700 px. We are testing vertical scrolling of wider content.",
				width: "700px"})
		});

		//Act
		sut.open();
		this.clock.tick(500);

		//Assert
		resultingScrollPaneWidth = sut._$scrollPane.width();
		resultingContentWidth = sut._$content.width();
		assert.ok(resultingScrollPaneWidth >= resultingContentWidth, "scroll pane width: " + resultingScrollPaneWidth + " was bigger than or equal to the contentWidth - we are able to scroll");

		assert.ok(resultingContentWidth >= 398 && resultingContentWidth <= 500, "content width should be within the set value and minimum value of dialog");
		sut.destroy();
	});

	QUnit.test("ShouldAdjustTheScrollingPaneIfContentIsSmallerThanContainer", function (assert) {
		jQuery("html").addClass("sap-desktop");
		//Arrange
		this.stub(Device, "system", {desktop: true});

		this.stub(Device, "os", {
			android: false,
			ios: false
		});

		var resultingContentWidth,
			resultingScrollPaneWidth,
			//System under Test
			sut = new Dialog({
				content: new HTML({content: '<p style="width: 90px"></p>'})
			});

		//Act
		sut.open();
		this.clock.tick(500);

		resultingScrollPaneWidth = sut._$scrollPane.width();
		resultingContentWidth = sut.$("scrollCont").width();
		assert.strictEqual(resultingScrollPaneWidth, resultingContentWidth, "scroll pane width " + resultingScrollPaneWidth + " was as bis as the content: " + resultingContentWidth);
		assert.ok(resultingScrollPaneWidth >= 90, "The content fits in the scollpane");
		sut.destroy();
		// Removing the sap-desktop breaks the focus tests
		// jQuery("html").removeClass("sap-desktop");
	});

	QUnit.test("Dialog: set stretch to true", function (assert) {
		jQuery("html").css("overflow", "hidden"); // hide scrollbar during test
		var oDialog = new Dialog({
			stretch: true,
			content: new HTML({
				content: "<div style='width: 1000px; height: 1000px'></div>"
			})
		});
		oDialog.open();
		this.clock.tick(500);

		var $Dialog = oDialog.$();
		assert.ok(marginCompare($Dialog.width(), oDialog._$content.width()), "content should be as wide as dialog");
		assert.ok(oDialog.getDomRef('scrollCont').classList.contains('sapMDialogStretchContent'), "Stretched dialog should have class sapMDialogStretchContent");
		oDialog.destroy();
		jQuery("html").css("overflow", ""); // restore scrollbar after test
	});

	QUnit.test("Dialog: set contentWidth when stretch set to true", function (assert) {
		jQuery("html").css("overflow", "hidden"); // hide scrollbar during test
		var oDialog = new Dialog({
			stretch: true,
			content: new HTML({
				content: "<div style='width: 1000px; height: 1000px'></div>"
			}),
			contentWidth: "600px"
		});
		oDialog.open();
		this.clock.tick(500);

		var $Dialog = oDialog.$();
		assert.ok(marginCompare($Dialog.width(), oDialog._$content.width()), "content should be as wide as dialog");
		oDialog.destroy();
		jQuery("html").css("overflow", ""); // restore scrollbar after test
	});

	QUnit.test("Set contentWidth to a fixed value on desktop", function (assert) {
		var oSystem = {
			desktop: true,
			tablet: false,
			phone: false
		};

		this.stub(Device, "system", oSystem);

		var oDialog = new Dialog({
				content: new HTML({
					content: "<div style='width: 1000px; height: 1000px'></div>"
				}),
				contentWidth: "500px"
			}),
			iValue = 500;

		oDialog.open();
		this.clock.tick(500);

		var $Dialog = oDialog.$();

		assert.ok(marginCompare(oDialog._$content.width(), iValue), "contentWidth should be set to content div");
		assert.ok(marginCompare($Dialog.width(), iValue), "dialog should also be as big as content");
		oDialog.destroy();
	});

	// this test is designed for phone
	QUnit.test("Set contentWidth to a fixed value on phone", function (assert) {
		var oSystem = {
			desktop: false,
			tablet: false,
			phone: true
		};

		var oLandscape = {
			landscape: true,
			portrait: false
		}, oPortrait = {
			landscape: false,
			portrait: true
		};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oLandscape);

		var oDialog = new Dialog({
			content: new HTML({
				content: "<div style='width: 1000px; height: 1000px'></div>"
			}),
			contentWidth: "500px"
		}), iValue = 500;

		oDialog.open();
		this.clock.tick(500);

		var $Dialog = oDialog.$();

		assert.ok(marginCompare(oDialog._$content.width(), iValue), "Landscape: contentWidth should be set to content div");
		assert.ok(marginCompare($Dialog.width(), iValue), "Landscape: dialog should also be as big as content");

		oDialog.close();
		this.clock.tick(500);

		this.stub(Device, "orientation", oPortrait);

		oDialog.open();
		this.clock.tick(500);

		$Dialog = oDialog.$();

		assert.ok(marginCompare(oDialog._$content.width(), iValue), "Portrait: contentWidth should be set to content div");
		assert.ok(marginCompare($Dialog.width(), iValue), "Portrait: dialog should also be as big as content");
		oDialog.destroy();
	});

	QUnit.test("set ContentWidth/ContentHeight to percentage value", function (assert) {
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};

		this.stub(Device, "system", oSystem);

		var oDialog = new Dialog({
			contentWidth: "50%",
			contentHeight: "50%"
		});

		oDialog.open();
		assert.ok(marginCompare(oDialog._$content.width(), jQuery(window).width() * 0.5) || (oDialog._$content.width() === 398), "Dialog content width " + oDialog._$content.width() + " is equal or less than part of window width " + jQuery(window).width() * 0.5);
		assert.ok(marginCompare(oDialog._$content.height(), jQuery(window).height() * 0.5), "Dialog content height " + oDialog._$content.height() + " is equal or less than part of window height " + jQuery(window).height() * 0.5);
		assert.ok(oDialog.getDomRef('scrollCont').classList.contains('sapMDialogStretchContent'), "Dialog with contentHeight set should have class sapMDialogStretchContent");

		oDialog.destroy();
	});

	QUnit.test("set escapeHandler property", function (assert) {
		assert.expect(3);

		var done = assert.async();
		// arrange
		var escapeHandlerFunction = function (oPromise) {
				oPromise.resolve();
			},

			fnEscapeHandlerFunctionSpy = this.spy(escapeHandlerFunction),

			oDialog = new Dialog('escapeDialog', {
				escapeHandler: fnEscapeHandlerFunctionSpy,
				afterClose: function (oEvent) {
					assert.strictEqual(oDialog.isOpen(), false, 'Dialog should be closed.');
					assert.notOk(oEvent.getParameter("origin"), 'Origin should not be set.');

					oDialog.destroy();
					oDialog = null;

					done();
					done = null;
				}
			});

		// act
		oDialog.open();
		this.clock.tick(250);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oDialog._oCloseTrigger = 'some button';

		qutils.triggerKeydown(oDialog.getDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(250);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.strictEqual(fnEscapeHandlerFunctionSpy.callCount, 1, 'escapeHandler function should be called');
	});

	QUnit.test("beginButton, endButton, buttons on desktop or tablet", function (assert) {
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};

		this.stub(Device, "system", oSystem);

		var oBBtn = new Button("beginButton", { text: "beginButton" });
		var oEBtn = new Button("endButton", { text: "endButton" });
		var aButtons = [
			new Button("buttons1", { text: "buttons1" }),
			new Button("buttons2", { text: "buttons2" }),
			new Button("buttons3", { text: "buttons3" })
		];

		// instantiate dialog with begin and endButton
		var oDialog = new Dialog("testDialog", {
			beginButton: oBBtn,
			endButton: oEBtn
		});

		oDialog.open();
		assert.ok(oDialog._oToolbar, "Toolbar instance is created");
		assert.ok(oDialog._oToolbar.getDomRef(), "Toolbar is rendered");
		assert.equal(oDialog._oToolbar.getContent().length, 3, "Toolbar contains 2 buttons");
		assert.notEqual(oDialog._oToolbar.indexOfContent(oBBtn), -1, "Toolbar contains beginButton");
		assert.notEqual(oDialog._oToolbar.indexOfContent(oEBtn), -1, "Toolbar contains endButton");
		assert.equal(oDialog.getBeginButton(), oBBtn, "Getter of beginButton should return the button itself");
		assert.equal(oDialog.getEndButton(), oEBtn, "Getter of endButton should return the button itself");

		// add button into "buttons" aggregation while begin/endButton are set
		aButtons.forEach(function (oButton) {
			oDialog.addButton(oButton);
		});
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(oDialog._oToolbar.getContent().length, 4, "Toolbar contains 3 new buttons");
		assert.equal(oDialog._oToolbar.indexOfContent(oBBtn), -1, "Toolbar doesn't contain beginButton");
		assert.equal(oDialog._oToolbar.indexOfContent(oEBtn), -1, "Toolbar doesn't contain endButton");

		// remove begin/endButton
		oDialog.setBeginButton(null);
		oDialog.setEndButton(null);
		assert.equal(oDialog._oToolbar.getContent().length, 4, "Toolbar still contains 3 buttons");
		assert.equal(oDialog.getBeginButton(), null, "Getter of beginButton should return null");
		assert.equal(oDialog.getEndButton(), null, "Getter of endButton should return null");

		// set begin/endButton back and remove "buttons" aggregation
		oDialog.setBeginButton(oBBtn);
		oDialog.setEndButton(oEBtn);
		oDialog.removeAllButtons();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(oDialog._oToolbar.getContent().length, 3, "Toolbar contains 2 buttons");
		assert.equal(oDialog._oToolbar.indexOfContent(oBBtn), 1, "Toolbar contains beginButton");
		assert.equal(oDialog._oToolbar.indexOfContent(oEBtn), 2, "Toolbar contains endButton");

		// destroy
		oDialog.destroy();
		assert.ok(oBBtn.bIsDestroyed, "beginButton should also be destroyed");
		assert.ok(oEBtn.bIsDestroyed, "endButton should also be destroyed");
		aButtons.forEach(function (oButton) {
			oButton.destroy();
		});
	});

	QUnit.test("beginButton, endButton, buttons on phone", function (assert) {
		var oSystem = {
			desktop: false,
			phone: true,
			tablet: false
		};

		jQuery("html").addClass("sap-phone");

		this.stub(Device, "system", oSystem);

		var oBBtn = new Button("beginButton", { text: "beginButton" });
		var oEBtn = new Button("endButton", { text: "endButton" });
		var aButtons = [
			new Button("buttons1", { text: "buttons1" }),
			new Button("buttons2", { text: "buttons2" }),
			new Button("buttons3", { text: "buttons3" })
		];

		// instantiate dialog with begin/endButton
		var oDialog = new Dialog("testDialog", {
			beginButton: oBBtn,
			endButton: oEBtn
		});

		oDialog.open();
		this.clock.tick(500);
		assert.ok(oDialog._oToolbar, "Toolbar instance is not created");
		assert.ok(oDialog.getDomRef(), "Dialog is rendered");
		assert.equal(oDialog.getBeginButton(), oBBtn, "Getter of beginButton should return the button itself");
		assert.equal(oDialog.getEndButton(), oEBtn, "Getter of endButton should return the button itself");

		// add button to "buttons" aggregation while begin/endButton are set
		aButtons.forEach(function (oButton) {
			oDialog.addButton(oButton);
		});
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(oDialog._oToolbar, "Toolbar instance is created");
		assert.equal(oDialog._oToolbar.getContent().length, 4, "Toolbar contains 3 new buttons");

		// remove begin/endButton
		oDialog.setBeginButton(null);
		oDialog.setEndButton(null);
		assert.equal(oDialog._oToolbar.getContent().length, 4, "Toolbar still contains 3 new buttons");
		assert.equal(oDialog.getBeginButton(), null, "Getter of beginButton should return null");
		assert.equal(oDialog.getEndButton(), null, "Getter of endButton should return null");

		// set begin/endButton back and remove "buttons" aggregation
		oDialog.setBeginButton(oBBtn);
		oDialog.setEndButton(oEBtn);
		oDialog.removeAllButtons();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(oBBtn.$().closest(".sapMIBar").length, "BeginButton should be rendered");
		assert.ok(oEBtn.$().closest(".sapMIBar").length, "EndButton should be rendered");

		//destroy
		oDialog.destroy();
		assert.ok(oBBtn.bIsDestroyed, "beginButton should also be destroyed");
		assert.ok(oEBtn.bIsDestroyed, "endButton should also be destroyed");
		aButtons.forEach(function (oButton) {
			oButton.destroy();
		});

		jQuery("html").removeClass("sap-phone");
	});

	QUnit.test("Set role", function (assert) {
		// Arrange
		var oDialog = new Dialog();
		oDialog.setProperty("role", DialogRoleType.AlertDialog);

		// Act
		oDialog.open();

		// Assert
		assert.strictEqual(oDialog.$().attr("role"), DialogRoleType.AlertDialog, "Should be able to set the role of the dialog.");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Set closeOnNavigation", function (assert) {
		// Arrange
		var oDialog = new Dialog();

		// Act
		oDialog.open();
		this.clock.tick(500);

		assert.ok(oDialog.isOpen(), "Dialog is opened");

		InstanceManager.closeAllDialogs();
		this.clock.tick(500);

		// Assert
		assert.notOk(oDialog.isOpen(), "Dialog is closed");

		oDialog.setCloseOnNavigation(false);

		// Act
		oDialog.open();
		this.clock.tick(500);

		assert.ok(oDialog.isOpen(), "Dialog is opened");

		InstanceManager.closeAllDialogs();
		this.clock.tick(500);

		assert.ok(oDialog.isOpen(), "Dialog remains opened when closeOnNavigation=false");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Should have default icon", function (assert) {
		// Arrange
		var mIcons = {},
			oDialog = new Dialog();

		mIcons[ValueState.Success] = IconPool.getIconURI("sys-enter-2");
		mIcons[ValueState.Warning] = IconPool.getIconURI("alert");
		mIcons[ValueState.Error] = IconPool.getIconURI("error");
		mIcons[ValueState.Information] = IconPool.getIconURI("information");
		mIcons[ValueState.None] = "";

		oDialog.open();

		for (var sState in mIcons) {
			// Act
			oDialog.setState(sState);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Assert
			assert.strictEqual(oDialog.getIcon(), mIcons[sState], "Dialog has the correct icon for state " + sState);
		}

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Should not have default icon if state is None", function (assert) {
		// Arrange
		var oDialog = new Dialog({
			state: ValueState.None
		});

		// Act
		oDialog.open();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.notOk(oDialog.getIcon(), "Dialog does not have a default icon if state is None");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Custom icon should override default icon", function (assert) {
		// Arrange
		var sCustomIcon = IconPool.getIconURI("appointment"),
			oDialog = new Dialog({
				state: ValueState.Warning,
				icon: sCustomIcon
			});

		// Act
		oDialog.open();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(oDialog.getIcon(), sCustomIcon, "Custom icon overrides default icon");

		// Clean up
		oDialog.destroy();
	});

	QUnit.module("Initial focus");

	QUnit.test("Association initialFocus", function (assert) {
		// Arrange
		var oInput1 = new Input();
		var oInput2 = new Input();
		var oDialog = new Dialog({
			content: [oInput1, oInput2],
			initialFocus: oInput2
		});

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = Element.closestTo(document.activeElement);
		assert.strictEqual(oFocusedControl.getId(), oInput2.getId(), "oInput2 has focus.");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Association ariaLabelledBy", function (assert) {
		// Arrange
		var TEXT_ID = "qunitText";
		var oText = new Text(TEXT_ID, {text : "Qunit test"});
		var oDialog = new Dialog({
			title: "Qunit test",
			content: [oText],
			subHeader: new Bar({
				contentMiddle: [
					new SearchField({
						placeholder: "Search ...",
						width: "100%"
					})
				]
			}),
			ariaLabelledBy: [TEXT_ID]
		});

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var dialogTitleId = oDialog.$().find('header .sapMDialogTitleGroup > .sapMBar .sapMTitle').attr('id');
		var subHeaderId = oDialog.$().find('.sapMDialogSubHeader > .sapMBar .sapMTitle').attr('id');
		var dialogAriaLabelledBy = oDialog.getAriaLabelledBy();
		assert.strictEqual(oDialog.getDomRef().getAttribute('aria-labelledby'), dialogTitleId + ' ' + TEXT_ID);
		assert.strictEqual(dialogAriaLabelledBy.length, 2);
		assert.strictEqual(dialogAriaLabelledBy.indexOf(dialogTitleId), 0);
		assert.strictEqual(dialogAriaLabelledBy.indexOf(subHeaderId), -1);
		assert.strictEqual(dialogAriaLabelledBy.indexOf(TEXT_ID), 1);

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Focusable elements in content area", function (assert) {
		// Arrange
		var oInput1 = new Input();
		var oInput2 = new Input();
		var oDialog = new Dialog({
			content: [oInput1, oInput2]
		});

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = Element.closestTo(document.activeElement);
		assert.strictEqual(oFocusedControl.getId(), oInput1.getId(), "oInput1 has focus.");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Focusable elements in content area without an id", function (assert) {
		// Arrange
		var oHtml = new HTML({content: "<div><div tabindex='0'>testFocus</div></div>"}),
			oDialog = new Dialog({
				content: [oHtml]
			}),
			oFocusedElement;

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		oFocusedElement = document.activeElement;
		assert.strictEqual(oFocusedElement.innerHTML, "testFocus", "First focusable element has the focus.");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test('Aggregations "beginButton" and "endButton" - both visible', function (assert) {
		// Arrange
		var oButton1 = new Button();
		var oButton2 = new Button();
		var oDialogInitialFocus = new Dialog({
			beginButton: oButton1,
			endButton: oButton2
		});

		// Act
		oDialogInitialFocus.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = Element.closestTo(document.activeElement);
		assert.strictEqual(oFocusedControl.getId(), oButton1.getId(), "oButton1 has focus.");

		// Clean up
		oDialogInitialFocus.destroy();
	});

	QUnit.test('Aggregations "beginButton" and "endButton" - only endButton visible', function (assert) {
		// Arrange
		var oButton1 = new Button({visible: false});
		var oButton2 = new Button();
		var oDialog = new Dialog({
			beginButton: oButton1,
			endButton: oButton2
		});

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = Element.closestTo(document.activeElement);
		assert.strictEqual(oFocusedControl.getId(), oButton2.getId(), "oButton2 has focus.");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Aggregation \"buttons\" - two visible buttons", function (assert) {
		// Arrange
		var oButton1 = new Button();
		var oButton2 = new Button();
		var oDialog = new Dialog({
			buttons: [oButton1, oButton2]
		});

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = Element.closestTo(document.activeElement);
		assert.strictEqual(oFocusedControl.getId(), oButton1.getId(), "oButton1 has focus.");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Aggregation \"buttons\" - only second button is visible", function (assert) {
		// Arrange
		var oButton1 = new Button({visible: false});
		var oButton2 = new Button();
		var oDialog = new Dialog({
			buttons: [oButton1, oButton2]
		});

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = Element.closestTo(document.activeElement);
		assert.strictEqual(oFocusedControl.getId(), oButton2.getId(), "oButton2 has focus.");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("No interactive elements or buttons", function (assert) {
		// Arrange
		var oDialog = new Dialog();

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = Element.closestTo(document.activeElement);
		assert.strictEqual(oFocusedControl.getId(), oDialog.getId(), "oDialog has focus.");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("No phone special CSS class when runs on desktop", function (assert) {
		var oSystem = {
			desktop: true,
			tablet: false,
			phone: false
		};

		this.stub(Device, "system", oSystem);

		var oDialog = new Dialog();
		oDialog.open();
		assert.ok(!oDialog.$().hasClass("sapMDialogPhone"), "Dialog shouldn't have phone CSS class on desktop");

		oDialog.destroy();
	});

	QUnit.test("Initial focus shouldn't be set to input DOM element on mobile device", function (assert) {
		var oSystem = {
			desktop: false,
			tablet: true,
			mobile: true
		};

		this.stub(Device, "system", oSystem);

		var oDialog = new Dialog({
			content: new Input("inputWantsFocus"),
			initialFocus: "inputWantsFocus"
		});

		oDialog.open();
		this.clock.tick(300);

		var oFocusedControl = Element.closestTo(document.activeElement);

		assert.notEqual(oFocusedControl.getId(), "inputWantsFocus", "Input control shouldn't get the focus");
		assert.strictEqual(oFocusedControl.getId(), oDialog.getId(), "Dialog should get the focus");

		oDialog.destroy();
	});

	QUnit.test("Controls in custom header is also in tab chain", function (assert) {
		var oDialog = new Dialog({
			customHeader: new Bar({
				contentRight: [
					new Button("tabChainButton", {
						text: "Want Focus"
					})
				]
			}),
			buttons: [
				new Button("initialFocusButton", {
					text: "Initial Focus"
				})
			],
			initialFocus: "initialFocusButton"
		});

		oDialog.open();
		this.clock.tick(400);

		var oFocusedControl = Element.closestTo(document.activeElement);
		assert.equal(oFocusedControl.getId(), "initialFocusButton", "Initial focus should be set correctly");

		assert.strictEqual(oDialog.getCustomHeader().$().attr("aria-level"), "2", "Customer header should have aria-level= '2'");
		oDialog.$("lastfe").trigger("focus");
		oFocusedControl = Element.closestTo(document.activeElement);
		assert.equal(oFocusedControl.getId(), "tabChainButton", "Focus should be set to the button in custom header");

		oDialog.destroy();
	});

	QUnit.test("Controls in custom footer are also in tab chain", function (assert) {
		const oDialog = new Dialog({
			content: [
				new Button("initialFocusButton", {
					text: "Initial Focus"
				})
			],
			footer: new Toolbar({
				content: [
					new Button("tabChainButton", {
						text: "Want Focus"
					})
				]
				}),
				initialFocus: "initialFocusButton"
		});

		oDialog.open();
		this.clock.tick(400);

		oDialog.$("firstfe").trigger("focus");

		const oFocusedControl = Element.closestTo(document.activeElement);

		assert.strictEqual(oFocusedControl.getId(), "tabChainButton", "Focus should be set to the button in custom footer");

		oDialog.destroy();
	});

	QUnit.test("Container Padding Classes", function (assert) {
		// System under Test + Act
		var oContainer = new Dialog(),
			sContentSelector = "section > .sapMDialogScroll > .sapMDialogScrollCont",
			sResponsiveSize = (Device.resize.width <= 599 ? "0" : (Device.resize.width <= 1023 ? "16px" : "16px 32px")), // eslint-disable-line no-nested-ternary
			aResponsiveSize = sResponsiveSize.split(" "),
			$containerContent;

		// Act
		oContainer.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oContainer.addStyleClass("sapUiNoContentPadding");
		$containerContent = oContainer.$().find(sContentSelector);

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "0px", "The container has no left content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "0px", "The container has no right content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "0px", "The container has no top content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "0px", "The container has no bottom content padding when class \"sapUiNoContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiNoContentPadding");
		oContainer.addStyleClass("sapUiContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "16px", "The container has 1rem left content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "16px", "The container has 1rem right content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "16px", "The container has 1rem top content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "16px", "The container has 1rem bottom content padding when class \"sapUiContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiContentPadding");
		oContainer.addStyleClass("sapUiResponsiveContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " left content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-right"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " right content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-top"), aResponsiveSize[0], "The container has " + sResponsiveSize + " top content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-bottom"), aResponsiveSize[0], "The container has " + sResponsiveSize + " bottom content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");

		// Cleanup
		oContainer.destroy();
	});

	QUnit.test("Clear CSS property 'display' from scrolling area before size calculation", function (assert) {
		assert.expect(2);
		var oDialog = new Dialog({
			contentWidth: "450px",
			contentHeight: "400px"
		});

		oDialog.open();
		this.clock.tick(500);

		assert.ok(oDialog.isOpen(), "Dialog is opened");
		this.stub(oDialog, "_adjustScrollingPane", function () {
			assert.equal(oDialog.$("scroll").css("display"), "inline-block", "display: block is cleared before size calculation");
		});
		oDialog._adjustScrollingPane();
		oDialog.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("Check if ValueState is present", function (assert) {
		this.clock.restore();

		// Arrange
		var oDialogSuccess = new Dialog({
			state: ValueState.Success
		});
		var rb = Library.getResourceBundleFor("sap.m");
		var sValueState = rb.getText("LIST_ITEM_STATE_SUCCESS");

		// Act
		oDialogSuccess.open();

		var sInvisibleTextContent = oDialogSuccess.getAggregation("_valueState").getText();

		// Assert
		assert.strictEqual(sInvisibleTextContent, sValueState, "Success state value should be the same.");

		// Clean up
		oDialogSuccess.destroy();

		// Arrange
		var oDialogWarning = new Dialog({
			state: ValueState.Warning
		});

		sValueState = rb.getText("LIST_ITEM_STATE_WARNING");

		// Act
		oDialogWarning.open();
		sInvisibleTextContent = oDialogWarning.getAggregation("_valueState").getText();

		// Assert
		assert.strictEqual(sInvisibleTextContent, sValueState, "Warning state value should be the same.");

		// Clean up
		oDialogWarning.destroy();

		// Arrange
		var oDialogError = new Dialog({
			state: ValueState.Error
		});

		sValueState = rb.getText("LIST_ITEM_STATE_ERROR");

		// Act
		oDialogError.open();
		sInvisibleTextContent = oDialogError.getAggregation("_valueState").getText();

		// Assert
		assert.strictEqual(sInvisibleTextContent, sValueState, "Error state value should be the same.");

		// Clean up
		oDialogError.destroy();


		// Arrange
		var oDialogInformation = new Dialog({
			state: ValueState.Information
		});

		sValueState = rb.getText("LIST_ITEM_STATE_INFORMATION");

		// Act
		oDialogInformation.open();
		sInvisibleTextContent = oDialogInformation.getAggregation("_valueState").getText();

		// Assert
		assert.strictEqual(sInvisibleTextContent, sValueState, "Information state value should be the same.");

		// Clean up
		oDialogInformation.destroy();
	});

	QUnit.test("Heading rendering when 'title' property is used", function(assert) {
		// arrange
		var oDialog = new Dialog({
			title: "Some title"
		});

		// act
		oDialog.open();
		this.clock.tick(500);

		// assert
		assert.ok(oDialog.getDomRef("header").querySelector("h1"), "Semantic HTML heading is rendered for title");
		assert.notStrictEqual(oDialog._getAnyHeader().$().attr("role"), "heading", "The role of the header shouldn't be set to 'heading'");
		assert.notStrictEqual(oDialog._getAnyHeader().$().attr("aria-level"), "1", "There should be no aria-level be set to the header");

		// cleanup
		oDialog.destroy();
	});

	QUnit.test("Heading rendering when 'customHeader' aggregation is used without title", function(assert) {
		// arrange
		var oDialog = new Dialog({
			customHeader: new Bar({
				contentMiddle: [
					new Text({
						text: "Dialog custom header without heading semantic"
					})
				]
			})
		});

		// act
		oDialog.open();
		this.clock.tick(500);

		// assert
		assert.strictEqual(oDialog._getAnyHeader().$().attr("role"), "heading", "The role of the header should be set to 'heading'");
		assert.strictEqual(oDialog._getAnyHeader().$().attr("aria-level"), "2", "There should be aria-level set to the header");

		// cleanup
		oDialog.destroy();
	});

	QUnit.test("Heading rendering when 'customHeader' aggregation is used with title", function(assert) {
		// arrange
		var oDialog = new Dialog({
			customHeader: new Bar({
				contentMiddle: [
					new Title({
						text: "Dialog custom header with heading semantic"
					})
				]
			})
		});

		// act
		oDialog.open();
		this.clock.tick(500);

		// assert
		assert.notStrictEqual(oDialog._getAnyHeader().$().attr("role"), "heading", "The role of the header shouldn't be set to 'heading'");
		assert.notStrictEqual(oDialog._getAnyHeader().$().attr("aria-level"), "2", "There should be no aria-level be set to the header");

		// cleanup
		oDialog.destroy();
	});

	QUnit.test("Check if footer toolbar role is set correctly", function(assert) {
		// arrange
		var oDialog = new Dialog({
			title: "Some title",
			beginButton: new Button({text: 'button'})
		});

		// act
		oDialog.open();
		this.clock.tick(500);

		// assert
		assert.strictEqual(oDialog.$('footer').attr('role'), undefined,
			"When there is only one interactive Control (Button), role 'toolbar' should not be set");

		// cleanup
		oDialog.destroy();
	});

	QUnit.test("Dialog header actions toolbar should have aria-labelledby set correctly", function(assert) {
		// Arrange
		var oDialog = new Dialog({
			title: "Dialog Title",
			content: [
				new Text({
					text: "Dialog Content",
					textAlign: "Center"
				})
			]
		});

		oDialog.open();
		this.clock.tick(500);

		var oHeader = oDialog._getAnyHeader(),
			headerInvisibleText = document.getElementById("__headerActionsToolbar-invisibleText");

		// Assert
		assert.ok(headerInvisibleText, "Invisible text of the header actions toolbar is rendered in the static area");
		assert.strictEqual(oHeader.getAriaLabelledBy()[0], headerInvisibleText.id, "aria-labelledby is set correctly on the header actions toolbar");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Dialog footer actions toolbar should have aria-labelledby set correctly", function(assert) {
		// Arrange
		var oDialog = new Dialog({
			title: "Dialog Title",
			content: [
				new Text({
					text: "Dialog Content",
					textAlign: "Center"
				})
			]
		});

		oDialog.open();
		this.clock.tick(500);

		var oFooter = oDialog._oToolbar,
			footerInvisibleText = document.getElementById("__footerActionsToolbar-invisibleText");

		// Assert
		assert.ok(footerInvisibleText, "Invisible text of the footer actions toolbar is rendered in the static area");
		assert.strictEqual(oFooter.getAriaLabelledBy()[0], footerInvisibleText.id, "aria-labelledby is set correctly on the footer actions toolbar");

		// Cleanup
		oDialog.destroy();
	});

	QUnit.test("Dialog should have accessibility attribute aria-modal set to true", function(assert) {
		// arrange
		var oDialog = new Dialog();

		// act
		oDialog.open();
		this.clock.tick(500);

		// assert
		assert.strictEqual(oDialog.$().attr('aria-modal'), "true", 'aria-modal attribute is true');

		// cleanup
		oDialog.destroy();
	});

	QUnit.test("Dialog should have aria-labelledBy pointing to title inside the subheader", function(assert) {
		// arrange
		var oDialog = new Dialog({
			title: "Qunit test",
			subHeader: new Bar({
				contentMiddle: [
					new Title({
						text: "subtitle"
					})
				]
			})
		});

		// act
		oDialog.open();
		this.clock.tick(500);

		// assert
		var dialogTitleId = oDialog.$().find('header .sapMDialogTitleGroup > .sapMBar .sapMTitle').attr('id');
		var titleInSubHeaderId = oDialog.$().find('.sapMDialogSubHeader > .sapMBar .sapMTitle').attr('id');
		assert.strictEqual(oDialog.getDomRef().getAttribute('aria-labelledby'), dialogTitleId + ' ' + titleInSubHeaderId);

		// cleanup
		oDialog.destroy();
	});

	QUnit.test("Draggale/resizable dialog should have correct aria-roledescription for header", function(assert) {
		// arrange
		var oDialog = new Dialog({
			draggable: true,
			resizable: true
		});

		// act
		oDialog.open();
		this.clock.tick(500);

		// assert
		var sRenderedRoleDescription = oDialog.$().find('header .sapMDialogTitleGroup').attr('aria-roledescription');
		var oRb = Library.getResourceBundleFor("sap.m");
		var sExpectedRoleDescription = oRb.getText("DIALOG_HEADER_ARIA_ROLE_DESCRIPTION");
		assert.ok(sRenderedRoleDescription, "The aria-roledescription attrbute is present on a draggable/resizable dialog");
		assert.strictEqual(sRenderedRoleDescription, sExpectedRoleDescription, "Aria-roledescription text has the correct value");

		// cleanup
		oDialog.destroy();
	});

	QUnit.test("Header should not have the aria-roledescription and aria-describedby attributes if dialog is not draggable/resizable", function(assert) {
		// arrange
		var oDialog = new Dialog();

		// act
		oDialog.open();
		this.clock.tick(500);

		// assert
		assert.notOk(oDialog.$().find('header .sapMDialogTitleGroup').attr('aria-roledescription'), "Aria-roledescription attribute is not set");
		assert.notOk(oDialog.$().find('header .sapMDialogTitleGroup').attr('aria-describedby'), "Aria-describedby attribute is not set");

		// cleanup
		oDialog.destroy();
	});

	QUnit.test("Dialog should have aria-describedby pointing to the correct text", function(assert) {
		// arrange
		var oDialog = new Dialog({
			title: "Qunit test",
			draggable: true,
			resizable: true
		});

		// act
		oDialog.open();
		this.clock.tick(500);

		// assert
		var sAriaDescribedbyText = oDialog.$().find('header .sapMDialogTitleGroup > #' + oDialog.getId() + '-ariaDescribedbyText').attr('id');
		assert.ok(oDialog.$().find('header .sapMDialogTitleGroup').attr('aria-describedby'), "The aria-describedby attrbute is present on a draggable/resizable dialog");
		assert.strictEqual(oDialog.$().find('header .sapMDialogTitleGroup').attr('aria-describedby'), sAriaDescribedbyText, "The aria-describedby attrbute points to the correct span");

		// cleanup
		oDialog.destroy();
	});

	QUnit.module("Dragging");

	QUnit.test("Check if dialog size remain unchanged after dragging it", function(assert) {
		// arrange
		var oDialog = new Dialog({
			draggable: true,
			title: "Some title",
			beginButton: new Button({text: "button"}),
			content: [
				new Text({
					text: "Some looooooong looong looooong long text that shouldn't affect the dialog's size on drag Some looooooong looong looooong long text that shouldn't affect the dialog's size on drag"
				})
			]
		});

		// act
		oDialog.open();

		this.clock.tick(500);

		var oMockEvent = {
			clientX: 608,
			clientY: 646,
			offsetX: 177,
			offsetY: 35,
			preventDefault: function () {},
			stopPropagation: function () {},
			target: oDialog.getAggregation("_header").$().find(".sapMBarPH")[0]
		};

		var iInitialWidth = oDialog.$().width();
		var iInitialHeight = oDialog.$().height();

		oDialog.onmousedown(oMockEvent);

		this.clock.tick(500);

		var iAfterDragWidth = oDialog.$().width();
		var iAfterDragHeight = oDialog.$().height();

		// assert
		assert.ok(iInitialWidth === iAfterDragWidth, "The width of the dialog should not change after dragging it.");
		assert.ok(iInitialHeight === iAfterDragHeight, "The height of the dialog should not change after dragging it.");

		// cleanup
		jQuery(document).off("mouseup mousemove");
		oDialog.destroy();
	});

	QUnit.test("Check if dialog height is getting smaller after removing part of the content", function(assert) {
		// arrange
		var oDialog = new Dialog({
			draggable: true,
			title: "Some title",
			beginButton: new Button({text: "button"}),
			content: [
				// add 3 texts to avoid same height - because there is min height of 3 rems
				new Text({
					text: "Some looooooong looong looooong long text that shouldn't affect the dialog's size on drag Some looooooong looong looooong long text that shouldn't affect the dialog's size on drag"
				}),
				new Text({
					text: "Some looooooong looong looooong long text that shouldn't affect the dialog's size on drag Some looooooong looong looooong long text that shouldn't affect the dialog's size on drag"
				}),
				new Text("txt", {
					text: "Some looooooong looong looooong long text that shouldn't affect the dialog's size on drag Some looooooong looong looooong long text that shouldn't affect the dialog's size on drag"
				})
			]
		});

		// act
		oDialog.open();

		this.clock.tick(500);

		var oMockEvent = {
			clientX: 608,
			clientY: 646,
			offsetX: 177,
			offsetY: 35,
			preventDefault: function () {},
			stopPropagation: function () {},
			target: oDialog.getAggregation("_header").$().find(".sapMBarPH")[0]
		};

		var iInitialHeight = oDialog.$().height();

		oDialog.onmousedown(oMockEvent);

		this.clock.tick(500);

		Element.getElementById("txt").setVisible(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oDialog._onResize();

		var iAfterResizeHeight = oDialog.$().height();

		// assert
		assert.ok(iInitialHeight > iAfterResizeHeight, "The height of the dialog is smaller than the initial height.");

		// cleanup
		jQuery(document).off("mouseup mousemove");

		oDialog.destroy();
	});

	QUnit.test("Check if dialog is not dragged from a bar inside the content section", function(assert) {
		var oBar = new Bar();

		// arrange
		var oDialog = new Dialog({
			draggable: true,
			title: "Some title",
			beginButton: new Button({text: "button"}),
			content: [
				oBar
			]
		});

		// act
		oDialog.open();

		this.clock.tick(500);

		jQuery(document).off("mouseup mousemove");

		var oMockEvent = {
			clientX: 608,
			clientY: 646,
			offsetX: 177,
			offsetY: 35,
			preventDefault: function () {},
			stopPropagation: function () {},
			target: oBar.getDomRef()
		};

		oDialog.onmousedown(oMockEvent);

		var docEvents = jQuery._data(document, 'events');
		assert.notOk(docEvents.mousemove, 'document.mousemove is not attached');

		// cleanup
		jQuery(document).off("mouseup mousemove");
		oDialog.destroy();
	});

	QUnit.test("Check if dragging the dialog affects only its own event handlers", function(assert) {
		//Arrange
		var oDialog = new Dialog({
			draggable: true,
			title: "Some title",
			beginButton: new Button({text: "button"}),
			content: [
				new Text({
					text: "Some looooooong looong looooong long text that shouldn't affect the dialog's size on drag Some looooooong looong looooong long text that shouldn't affect the dialog's size on drag"
				})
			]
		});

		var spy = sinon.spy();

		jQuery(document).on("mousemove", spy);
		oDialog.open();


		var oMockEvent = {
			clientX: 608,
			clientY: 646,
			offsetX: 177,
			offsetY: 35,
			preventDefault: function () {},
			stopPropagation: function () {},
			target: oDialog.getAggregation("_header").$().find(".sapMBarPH")[0]
		};

		//Act
		oDialog.onmousedown(oMockEvent);
		qutils.triggerEvent("mouseup", document);

		qutils.triggerEvent("mousemove", document);

		//Assert
		assert.ok(spy.called, "Spy was called on mousemove");

		//Cleanup
		jQuery(document).off("mousemove", spy);
		oDialog.destroy();

	});

	QUnit.test("Check if the dialog doesn't go outside the view window", function(assert) {
		// arrange
		var oDialog = new Dialog({
			draggable: true,
			title: "Some title",
			content: [
				new Text({
					text: "Some text"
				})
			]
		});

		oDialog.open();
		this.clock.tick(500);

		var $document = jQuery(document),
			oMouseDownMockEvent = {
				clientX: 608,
				clientY: 646,
				offsetX: 177,
				offsetY: 35,
				preventDefault: function () {
				},
				stopPropagation: function () {
				},
				target: oDialog.getAggregation("_header").$().find(".sapMBarPH")[0]
			},
			oMouseMoveMockEvent = {
				clientX: -2000,
				clientY: -2000
			};

		// Act
		oDialog.onmousedown(oMouseDownMockEvent);

		$document.trigger(new jQuery.Event("mousemove", oMouseMoveMockEvent));
		this.clock.tick(500);

		assert.ok(oDialog._oManuallySetPosition.x >= 0, "_oManuallySetPosition.x is correct" + oDialog._oManuallySetPosition.x);
		assert.ok(oDialog._oManuallySetPosition.y >= 0, "_oManuallySetPosition.y is correct");

		$document.trigger(new jQuery.Event("mouseup", oMouseMoveMockEvent));

		oDialog.close();
		this.clock.tick(500);

		// clean up
		oDialog.destroy();
	});

	QUnit.test("Dragging works if the page is scrolled", function (assert) {
		// Arrange
		var oGrowingPageElement = createAndAppendDiv("growingPageElement");

		// make the element scrollable, and scroll it down
		oGrowingPageElement.style.height = "10000px";
		window.scrollTo(0, 10000);

		var oDialog = new Dialog({
			draggable: true,
			title: "Some title",
			content: [
				new Text({
					text: "Some text"
				})
			]
		});

		oDialog.open();
		this.clock.tick(500);

		var oMockEvent = {
			clientX: 608,
			clientY: 646,
			offsetX: 177,
			offsetY: 35,
			preventDefault: function () {},
			stopPropagation: function () {},
			target: oDialog._getFocusableHeader()
		};

		var oClientRect = oDialog.getDomRef().getBoundingClientRect();
		var iInitialTop = oClientRect.top;
		var iInitialLeft = oClientRect.left;

		oDialog.onmousedown(oMockEvent);

		this.clock.tick(500);

		oClientRect = oDialog.getDomRef().getBoundingClientRect();
		var iTopAfterDrag = oClientRect.top;
		var iLeftAfterDrag = oClientRect.left;

		// assert
		assert.strictEqual(iInitialTop, iTopAfterDrag, "The top position of the dialog should not change after dragging it.");
		assert.strictEqual(iInitialLeft, iLeftAfterDrag, "The left position of the dialog should not change after dragging it.");

		// cleanup
		window.scrollTo(0, 0);
		oGrowingPageElement.remove();
		jQuery(document).off("mouseup mousemove");
		oDialog.destroy();
	});

	QUnit.test("Selection is disabled during dragging", function(assert) {
		// arrange
		var oDialog = new Dialog({
			draggable: true,
			title: "Some title",
			content: [
				new Text({
					text: "Some text"
				})
			]
		});

		oDialog.open();
		this.clock.tick(500);

		var $document = jQuery(document),
			oMouseDownMockEvent = {
				clientX: 608,
				clientY: 646,
				offsetX: 177,
				offsetY: 35,
				preventDefault: function () {
				},
				stopPropagation: function () {
				},
				target: oDialog.getAggregation("_header").$().find(".sapMBarPH")[0]
			},
			oMouseMoveMockEvent = {
				clientX: -2000,
				clientY: -2000
			};

		// Act
		oDialog.onmousedown(oMouseDownMockEvent);

		// Assert
		assert.ok(oDialog.hasStyleClass("sapMDialogDisableSelection"), "Selection is disabled during dragging");

		$document.trigger(new jQuery.Event("mousemove", oMouseMoveMockEvent));
		this.clock.tick(500);

		// Act - end dragging
		$document.trigger(new jQuery.Event("mouseup", oMouseMoveMockEvent));

		// Assert
		assert.notOk(oDialog.hasStyleClass("sapMDialogDisableSelection"), "Selection is restored after dragging");

		oDialog.close();
		this.clock.tick(500);

		// clean up
		oDialog.destroy();
	});

	QUnit.test("Resizing works if the page is scrolled", function (assert) {
		// Arrange
		var oGrowingPageElement = createAndAppendDiv("growingPageElement");

		// make the element scrollable, and scroll it down
		oGrowingPageElement.style.height = "10000px";
		window.scrollTo(0, 10000);

		var oDialog = new Dialog({
			resizable: true,
			title: "Some title",
			content: [
				new Text({
					text: "Some text"
				})
			],
			contentHeight: "400px"
		});

		oDialog.open();
		this.clock.tick(500);

		var oMockEvent = {
			clientX: 435,
			clientY: 500,
			offsetX: 177,
			offsetY: 35,
			preventDefault: function () {},
			stopPropagation: function () {},
			target: oDialog.$().find(".sapMDialogResizeHandle")[0]
		};

		var oClientRect = oDialog.getDomRef().getBoundingClientRect();
		var fInitialHeight = oClientRect.height;

		// Act
		oDialog.onmousedown(oMockEvent);
		this.clock.tick(500);
		// resize width - move mouse right
		oMockEvent.clientX += 20;

		jQuery(document).trigger(new jQuery.Event("mousemove", oMockEvent));
		this.clock.tick(500);
		jQuery(document).trigger(new jQuery.Event("mouseup", oMockEvent));

		oClientRect = oDialog.getDomRef().getBoundingClientRect();
		var fHeightAfterResize = oClientRect.height;

		// assert
		assert.strictEqual(fHeightAfterResize, fInitialHeight, "The height of the dialog should not change after resized to the right.");

		// Clean up
		window.scrollTo(0, 0);
		oGrowingPageElement.remove();
		jQuery(document).off("mouseup mousemove");
		oDialog.destroy();
	});

	QUnit.test("Max sizes are set after dragging", function (assert) {
		// arrange
		var oDialog = new Dialog({
			draggable: true,
			title: "Some title",
			beginButton: new Button({text: "button"}),
			content: [
				new Text({
					text: "Some looooooong looong looooong long text that shouldn't affect the dialog's size on drag Some looooooong looong looooong long text that shouldn't affect the dialog's size on drag"
				})
			]
		});

		// act
		oDialog.open();

		this.clock.tick(500);

		var oMockEvent = {
			clientX: 608,
			clientY: 646,
			offsetX: 177,
			offsetY: 35,
			preventDefault: function () {},
			stopPropagation: function () {},
			target: oDialog.getAggregation("_header").$().find(".sapMBarPH")[0]
		};

		oDialog.onmousedown(oMockEvent);

		this.clock.tick(500);

		oDialog.invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.ok(oDialog.getDomRef().style.maxHeight, "max height is set");

		// cleanup
		jQuery(document).off("mouseup mousemove");
		oDialog.destroy();
	});

	QUnit.module("Drag and resize in custom Within Area", {
		beforeEach: function () {
			this.oDialog = new Dialog({
				title: "Some title",
				content: [
					new Text({
						text: "Some text"
					})
				]
			});
			this.oWithinArea = createAndAppendDiv("withinArea");
			var mStyles = {
				position: "absolute",
				backgroundColor: "black",
				top: "3rem",
				left: "3rem",
				width: "500px",
				height: "500px"
			};

			for (var sProp in mStyles) {
				this.oWithinArea.style[sProp] = mStyles[sProp];
			}

			Popup.setWithinArea(this.oWithinArea);
		},
		afterEach: function () {
			this.oDialog.destroy();
			this.oWithinArea.remove();
			Popup.setWithinArea(null);
		}
	});

	QUnit.test("Check if the dialog doesn't go outside the Within Area when dragged with mouse", function (assert) {
		// arrange
		this.oDialog.setDraggable(true).open();
		this.clock.tick(500);

		var $withinArea = jQuery(this.oWithinArea),
			oMouseDownMockEvent = {
				clientX: 608,
				clientY: 646,
				offsetX: 177,
				offsetY: 35,
				preventDefault: function () {
				},
				stopPropagation: function () {
				},
				target: this.oDialog.getAggregation("_header").$().find(".sapMBarPH")[0]
			},
			oMouseMoveMockEvent = {
				clientX: -2000,
				clientY: -2000
			};

		// Act
		this.oDialog.onmousedown(oMouseDownMockEvent);
		$withinArea.trigger(new jQuery.Event("mousemove", oMouseMoveMockEvent));
		this.clock.tick(500);

		// Assert
		assert.ok(this.oDialog.$().offset().left >= $withinArea.offset().left, "Dialog didn't go outside Within Area");
		assert.ok(this.oDialog.$().offset().top >= $withinArea.offset().top, "Dialog didn't go outside Within Area");

		// clean up
		$withinArea.trigger(new jQuery.Event("mouseup", oMouseMoveMockEvent));
	});

	QUnit.test("Check if the dialog doesn't go outside the Within Area when dragged with keyboard", function(assert) {
		// Arrange
		this.oDialog.setDraggable(true).open();
		this.clock.tick(500);
		var oTitle = this.oDialog._getFocusableHeader(),
			$withinArea = jQuery(this.oWithinArea);

		// Act
		for (var i = 0; i < 50; i++) {
			qutils.triggerKeydown(oTitle, KeyCodes.ARROW_UP);
		}
		this.clock.tick(500);

		// Assert
		assert.ok(this.oDialog.$().offset().top >= $withinArea.offset().top, "Dialog didn't go outside Within Area");
	});

	QUnit.test("Check if the dialog doesn't go outside the Within Area when resized with keyboard", function(assert) {
		// Arrange
		this.oDialog.setResizable(true).open();
		this.clock.tick(500);
		var $withinArea = jQuery(this.oWithinArea),
			oTitle = this.oDialog._getFocusableHeader();

		// Act
		for (var i = 0; i < 50; i++) {
			qutils.triggerKeydown(oTitle, KeyCodes.ARROW_DOWN, true);
		}

		// Assert
		var oDialogBottom = this.oDialog.$().offset().top + this.oDialog.$().outerHeight(true);
		assert.ok(oDialogBottom <= $withinArea.offset().top + $withinArea.height(), "Dialog didn't go outside Within Area");
	});

	QUnit.module("PopUp Position",{
		beforeEach: function() {
			this.scrollY = window.scrollY;
			this.oDialog = new Dialog({
				title: "Some title"
			});
			this.mockPosition = {};
		},
		afterEach: function() {
			this.oDialog.destroy();
			this.mockPosition = null;
			window.scrollY = this.scrollY;
		}
	});

	QUnit.test("Check if device is ios", function(assert) {
		this.stub(Device, "os", {ios: true});

		// act
		this.oDialog.open();

		this.clock.tick(500);

		window.scrollY = -50;

		this.oDialog.oPopup._applyPosition(this.mockPosition);

		// assert
		assert.strictEqual(this.mockPosition.at.top, Math.round((window.innerHeight - this.oDialog.$().outerHeight()) / 2), "The top position should not add additional pixels in scrollPosY ");
		assert.strictEqual(this.mockPosition.at.left, Math.round((window.innerWidth - this.oDialog.$().outerWidth()) / 2), "The left position should not add additional pixels in scrollPosX");

	});

	QUnit.module("Resizable Dialog",{
		beforeEach: function() {
			var aListItems = [];
			for (var i = 0; i < 10; i++) {
				aListItems.push(new StandardListItem({
					title : "Title" + i
				}));
			}
			this.oDialog = new Dialog({
				title: 'Available Products',
				resizable: true,
				contentWidth: "550px",
				contentHeight: "400px",
				content: new List({
					items: aListItems
				})
			});

			this.fnMockResizeEvent = function () {
				var oResizeHandler = this.oDialog.$().find(".sapMDialogResizeHandle")[0],
					oResizeHandlerRect = oResizeHandler.getBoundingClientRect();

				// event in which the mouse is on the resize handler
				return {
					clientX: oResizeHandlerRect.left,
					clientY: oResizeHandlerRect.top,
					offsetX: 5,
					offsetY: 5,
					preventDefault: function () {},
					stopPropagation: function () {},
					target: oResizeHandler
				};
			};
		},
		afterEach: function() {
			this.oDialog.destroy();
		}
	});

	QUnit.test("Check if resizing works", function(assert) {
		// Arrange
		this.oDialog.open();
		this.clock.tick(500);

		var $document = jQuery(document),
			oDialog = this.oDialog,
			$dialog = oDialog.$(),
			iWidth = $dialog.width(),
			iHeight = $dialog.height(),
			oMockEvent = this.fnMockResizeEvent();

		// Act
		oDialog.onmousedown(oMockEvent);

		// move mouse right and down
		oMockEvent.clientX += 20;
		oMockEvent.clientY += 20;

		$document.trigger(new jQuery.Event("mousemove", oMockEvent));
		this.clock.tick(500);
		$document.trigger(new jQuery.Event("mouseup", oMockEvent));

		// Assert
		assert.strictEqual($dialog.width(), iWidth + 20, "The width is resized.");
		assert.strictEqual($dialog.height(), iHeight + 20, "The height is resized.");
	});

	QUnit.test("Resize dialog content section above max height", function(assert) {
		// Arrange
		this.oDialog.setContentHeight(window.innerHeight + "px"); // simulate max height dialog
		this.oDialog.open();
		this.clock.tick(500);

		var $document = jQuery(document),
			oDialog = this.oDialog,
			$dialog = oDialog.$(),
			$dialogContentSection = $dialog.find(".sapMDialogSection"),
			oMockEvent = this.fnMockResizeEvent();

		// Act
		oDialog.onmousedown(oMockEvent);

		// move mouse down
		oMockEvent.clientY += 1000;

		$document.trigger(new jQuery.Event("mousemove", oMockEvent));
		this.clock.tick(500);
		$document.trigger(new jQuery.Event("mouseup", oMockEvent));

		// Assert
		assert.strictEqual($dialogContentSection.height(), $dialog.height(), "The height of the content section is equal to the height of the dialog.");
	});

	QUnit.module("Keyboard drag and resize",{
		beforeEach: function() {
			var aListItems = [];
			for (var i = 0; i < 10; i++) {
				aListItems.push(new StandardListItem({
					title : "Title" + i
				}));
			}
			this.oDialog = new Dialog({
				title: 'Available Products',
				draggable: true,
				resizable: true,
				contentWidth: "550px",
				contentHeight: "400px",
				content: new List({
					items: aListItems
				})
			});
		},
		afterEach: function() {
			this.oDialog.destroy();
		}
	});

	QUnit.test("header focus", function(assert) {
		// act
		this.oDialog.open();
		this.clock.tick(500);

		var oTitle = this.oDialog._getFocusableHeader();

		assert.strictEqual(document.activeElement, oTitle, "header is focused");

		// act
		this.oDialog.close();
		this.clock.tick(500);

		// act
		this.oDialog.setResizable(false);
		this.oDialog.setDraggable(false);
		this.oDialog.open();
		this.clock.tick(500);

		oTitle = this.oDialog._getFocusableHeader();

		assert.notOk(oTitle, "header is not focused");
	});

	QUnit.test("drag", function(assert) {
		// act
		this.oDialog.open();
		this.clock.tick(500);

		var oTitle = this.oDialog._getFocusableHeader();
		var mOffset1 = this.oDialog.$().offset();

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		var mOffset2 = this.oDialog.$().offset();
		assert.ok(mOffset1.top < mOffset2.top, "the dialog is moved");

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_UP);
		this.clock.tick(500);
		mOffset1 = this.oDialog.$().offset();
		assert.ok(mOffset1.top < mOffset2.top, "the dialog is moved");

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_RIGHT);
		this.clock.tick(500);
		mOffset2 = this.oDialog.$().offset();
		assert.ok(mOffset1.left < mOffset2.left, "the dialog is moved");

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_LEFT);
		this.clock.tick(500);
		mOffset1 = this.oDialog.$().offset();
		assert.ok(mOffset1.left < mOffset2.left, "the dialog is moved");
	});

	QUnit.test("resize", function(assert) {
		// act
		this.oDialog.open();
		this.clock.tick(500);

		var oTitle = this.oDialog._getFocusableHeader();
		var width1 = this.oDialog.$().width();
		var height1 = this.oDialog.$().height();

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_DOWN, true);
		this.clock.tick(500);
		var height2 = this.oDialog.$().height();
		assert.ok(height2 > height1, "dialog is resized");

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_UP, true);
		this.clock.tick(500);
		height1 = this.oDialog.$().height();
		assert.ok(height2 > height1, "dialog is resized");

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_RIGHT, true);
		this.clock.tick(500);
		var width2 = this.oDialog.$().width();
		assert.ok(width2 > width1, "dialog is resized");

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_LEFT, true);
		this.clock.tick(500);
		width1 = this.oDialog.$().width();
		assert.ok(width2 > width1, "dialog is resized");
	});

	QUnit.test("change draggable/resizable", function(assert) {

		this.oDialog.setDraggable(false);

		// act
		this.oDialog.open();
		this.clock.tick(500);

		var oTitle = this.oDialog._getFocusableHeader();
		var mOffset = this.oDialog.$().offset();
		var height = this.oDialog.$().height();

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		assert.strictEqual(mOffset.top, this.oDialog.$().offset().top, "dialog is not moved");

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_DOWN, true);
		this.clock.tick(500);
		assert.ok(height < this.oDialog.$().height(), "dialog is resized");

		this.oDialog.setResizable(false);
		this.oDialog.setDraggable(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oTitle = this.oDialog._getFocusableHeader();

		mOffset = this.oDialog.$().offset();
		height = this.oDialog.$().height();

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		assert.ok(mOffset.top < this.oDialog.$().offset().top, "dialog is moved");

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_DOWN, true);
		this.clock.tick(500);
		assert.strictEqual(height, this.oDialog.$().height(), "dialog is not resized");


		this.oDialog.setDraggable(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oTitle = this.oDialog._getFocusableHeader();

		mOffset = this.oDialog.$().offset();
		height = this.oDialog.$().height();

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		assert.strictEqual(mOffset.top, this.oDialog.$().offset().top, "dialog is not moved");

		qutils.triggerKeydown(oTitle, KeyCodes.ARROW_DOWN, true);
		this.clock.tick(500);
		assert.strictEqual(height, this.oDialog.$().height(), "dialog is not resized");
	});

	QUnit.test("Dragging with keyboard works if the page is scrolled", function (assert) {
		// Arrange
		var oGrowingPageElement = createAndAppendDiv("growingPageElement");

		// make the element scrollable, and scroll it down
		oGrowingPageElement.style.height = "10000px";
		window.scrollTo(0, 10000);

		this.oDialog.open();
		this.clock.tick(500);

		var oClientRect = this.oDialog.getDomRef().getBoundingClientRect();
		var iInitialTop = oClientRect.top;
		var iInitialLeft = oClientRect.left;

		qutils.triggerKeydown(this.oDialog._getFocusableHeader(), KeyCodes.ARROW_DOWN);
		this.clock.tick(500);

		oClientRect = this.oDialog.getDomRef().getBoundingClientRect();
		var iTopAfterDrag = oClientRect.top;
		var iLeftAfterDrag = oClientRect.left;

		// assert
		assert.strictEqual(iInitialTop + DRAGRESIZE_STEP, iTopAfterDrag, "The top position of the dialog should have changed with exactly " + DRAGRESIZE_STEP);
		assert.strictEqual(iInitialLeft, iLeftAfterDrag, "The left position of the dialog should not change after dragging it");

		// cleanup
		window.scrollTo(0, 0);
		oGrowingPageElement.remove();
	});

	QUnit.module("Setting Dialogs button origin",{
		beforeEach: function() {
			this.oCloseButton = new Button("closeButton", {
				text: "Close Dialog",
				press: function (event) {
					this.oDialog.close();
				}.bind(this)
			});
			this.oDialog = new Dialog({
				title: 'Available Products',
				endButton: this.oCloseButton,
				beforeClose: function(oEvent) {
					this.oBeforeCloseOrigin = oEvent.getParameter('origin');
				}.bind(this),
				afterClose: function(oEvent) {
					this.oAfterCloseOrigin = oEvent.getParameter('origin');
				}.bind(this)
			});
		},
		afterEach: function() {
			this.oDialog.destroy();
			this.oCloseButton.destroy();
			this.oBeforeCloseOrigin.destroy();
			this.oAfterCloseOrigin.destroy();
		}
	});

	QUnit.test("On using space to trigger close of dialog the origin should be set", function(assert) {
		// act
		this.oDialog.open();
		this.clock.tick(500);
		qutils.triggerKeyup(this.oCloseButton.getDomRef(), KeyCodes.SPACE);
		this.clock.tick(500);


		// assert
		assert.strictEqual(this.oBeforeCloseOrigin, this.oCloseButton, "Before close origin should be the oCloseButton");
		assert.strictEqual(this.oAfterCloseOrigin, this.oCloseButton, "After close origin should be the oCloseButton");
	});

	QUnit.test("On using enter to trigger close of dialog the origin should be set", function(assert) {
		// act
		this.oDialog.open();
		this.clock.tick(500);
		qutils.triggerKeydown(this.oCloseButton.getDomRef(), KeyCodes.ENTER);
		this.clock.tick(500);


		// assert
		assert.strictEqual(this.oBeforeCloseOrigin, this.oCloseButton, "Before close origin should be the oCloseButton");
		assert.strictEqual(this.oAfterCloseOrigin, this.oCloseButton, "After close origin should be the oCloseButton");
	});

	QUnit.test("On using click/tap to trigger close of dialog the origin should be set", function(assert) {
		// act
		this.oDialog.open();
		this.clock.tick(500);
		this.oCloseButton.$().trigger('tap');
		this.clock.tick(500);


		// assert
		assert.strictEqual(this.oBeforeCloseOrigin, this.oCloseButton, "Before close origin should be the oCloseButton");
		assert.strictEqual(this.oAfterCloseOrigin, this.oCloseButton, "After close origin should be the oCloseButton");
	});

	QUnit.module("Title ID propagation");

	QUnit.test("_initTitlePropagationSupport is called on init", function (assert) {
		// Arrange
		var oSpy = sinon.spy(Dialog.prototype, "_initTitlePropagationSupport"),
			oControl;

		// Act
		oControl = new Dialog();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Method _initTitlePropagationSupport called on init of control");
		assert.ok(oSpy.calledOn(oControl), "The spy is called on the tested control instance");

		// Cleanup
		oSpy.restore();
		oControl.destroy();
	});

	QUnit.module("Dialog with vertical scroll and list items", {
		beforeEach: function() {
			this.oDialog = new Dialog({
				title: 'Will have vertical scroll',
				contentHeight: "10rem", // ensure that we have a vertical scroll
				content: [
					new List({
						items: [
							new StandardListItem({
								title: "Item 1"
							}),
							new StandardListItem({
								title: "Item 2"
							}),
							new StandardListItem({
								title: "Item 3"
							}),
							new StandardListItem({
								id: "longTextItem", // this item has to be visible without truncation by default
								title: "Item with some long text. Item with some long text."
							}),
							new StandardListItem({
								title: "Item 4"
							})
						]
					})
				]
			});

			sinon.config.useFakeTimers = false;
		},
		afterEach: function() {
			sinon.config.useFakeTimers = true;
			this.oDialog.destroy();
		}
	});

	QUnit.test("Content width is smaller than the min-width of the dialog", function (assert) {
		var done = assert.async();
		// Arrange
		// Set the long title to something shorter.
		this.oDialog.getContent()[0].getItems()[3].setTitle("Item 3.5");
		var iScrollWidth = 18;

		this.oDialog.attachAfterOpen(function () {
			var bContentGrowsToFitContainer = this.oDialog.$("scroll").width() + iScrollWidth >= this.oDialog.$().width();

			// Assert
			assert.equal(this.oDialog.$().css("width"), this.oDialog.$().css("min-width"), "Should have minimum width when content width is smaller.");
			assert.ok(bContentGrowsToFitContainer, "Content should grow to fit the container when its width is smaller than the minimum width of the dialog.");

			done();
		}.bind(this));

		// Act
		this.oDialog.open();
	});

	QUnit.test("Item texts are not truncated when width is auto", function(assert) {
		var done = assert.async();
		this.oDialog.attachAfterOpen(function () {

			var $longTextItem = this.oDialog.$().find("#longTextItem .sapMSLITitleOnly");

			// assert
			assert.strictEqual(isTextTruncated($longTextItem), false, "Long text is not truncated when width is auto");

			done();
		}.bind(this));

		this.oDialog.open();
	});

	QUnit.test("Text is truncated when width is too small", function(assert) {
		var done = assert.async();
		// make the dialog very small to ensure truncation
		this.oDialog.setContentWidth("20rem");

		this.oDialog.attachAfterOpen(function () {
			var $longTextItem = this.oDialog.$().find("#longTextItem .sapMSLITitleOnly");

			// assert
			assert.strictEqual(isTextTruncated($longTextItem), true, "Text is truncated when width is small");

			done();
		}.bind(this));

		this.oDialog.open();
	});

	QUnit.test("When the content of the dialog is changed and scrollbar is not needed the 'sapMDialogVerticalScrollIncluded' class should be removed (all browsers except Chrome) BCP: 2270156416", function(assert) {
		var done = assert.async();

		this.oDialog.attachAfterOpen(async function () {
			if (!Device.browser.chrome) {
				assert.ok(this.oDialog.$().hasClass("sapMDialogVerticalScrollIncluded"),  "Initially the class is added");
			}

			// remove the list and add new one with only one item (no need of vertical scrollbar)
			this.oDialog.destroyContent();
			this.oDialog.addContent(new List({ items: [new StandardListItem({title: "Item 1"})]}));
			await nextUIUpdate();

			// assert
			assert.notOk(this.oDialog.$().hasClass("sapMDialogVerticalScrollIncluded"),  "Class is successfully removed");

			done();
		}.bind(this));

		this.oDialog.open();
	});

	QUnit.module("Dialog with specific tool bar design");

	QUnit.test("Toolbar with design - Info", function(assert) {
		this.oDialog = new Dialog({
			title: "Header",
			subHeader: new Toolbar({
				design:"Info",
				content: new Text({ text: "Sub header" })
			}),
			content: new Text({ text: "Content" }),
			draggable: true
		});

		this.oDialog.open();
		this.clock.tick(500);

		// assert
		assert.ok(this.oDialog.$().hasClass("sapMDialogSubHeaderInfoBar"), "Dialog must have specific class which adjust the height");
		this.oDialog.destroy();
	});

	QUnit.test("Toolbar with design - Auto", function(assert) {
		this.oDialog = new Dialog({
			title: "Header",
			subHeader: new Toolbar({
				content: new Text({ text: "Sub header" })
			}),
			content: new Text({ text: "Content" }),
			draggable: true
		});
		this.oDialog.open();
		this.clock.tick(500);

		// assert
		assert.ok(!this.oDialog.$().hasClass("sapMDialogSubHeaderInfoBar"), "Dialog must not have specific class which adjust the height");
		this.oDialog.destroy();
	});

	QUnit.test("Toolbar visibility", function(assert) {
		this.oDialog = new Dialog({
			title: "Header",
			subHeader: this.subheader = new Toolbar({
				design:"Info",
				content: new Text({ text: "Sub header" }),
				visible: false
			}),
			content: new Text({ text: "Content" })
		});

		this.oDialog.open();
		this.clock.tick(500);

		// assert
		assert.notOk(this.oDialog.$().hasClass("sapMDialogWithSubHeader"), "Dialog subheader should not be visible");

		this.subheader.setVisible(true);
		this.clock.tick(500);

		// assert
		assert.ok(this.oDialog.$().hasClass("sapMDialogWithSubHeader"), "Dialog subheader should be visible");
		this.oDialog.destroy();
	});

	QUnit.module("Dialog sizing", {
		beforeEach: function() {
			this.oDialog = new Dialog({
				title: "Header",
				buttons: [ new Button() ]
			});

			sinon.config.useFakeTimers = false;
		},
		afterEach: function() {
			this.oDialog.destroy();
			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test("Dialog with lazy loaded content", function (assert) {
		// arrange
		var done = assert.async();
		var oTable = new Table({
			growing: true,
			columns: [
				new Column(),
				new Column(),
				new Column(),
				new Column()
			]
		});

		var oData = {
			items: [
				{firstName: "Peter", lastName: "Mueller"},
				{firstName: "Petra", lastName: "Maier"},
				{firstName: "Thomas", lastName: "Smith"},
				{firstName: "John", lastName: "Williams"},
				{firstName: "Maria", lastName: "Jones"},
				{firstName: "Peter", lastName: "Mueller"},
				{firstName: "Petra", lastName: "Maier"},
				{firstName: "Thomas", lastName: "Smith"},
				{firstName: "John", lastName: "Williams"},
				{firstName: "Peter", lastName: "Mueller"},
				{firstName: "Petra", lastName: "Maier"},
				{firstName: "Thomas", lastName: "Smith"},
				{firstName: "John", lastName: "Williams"},
				{firstName: "Peter", lastName: "Mueller"},
				{firstName: "Petra", lastName: "Maier"},
				{firstName: "Thomas", lastName: "Smith"},
				{firstName: "John", lastName: "Williams"},
				{firstName: "Peter", lastName: "Mueller"},
				{firstName: "Petra", lastName: "Maier"},
				{firstName: "Thomas", lastName: "Smith"},
				{firstName: "John", lastName: "Williams"},
				{firstName: "Peter", lastName: "Mueller"},
				{firstName: "Petra", lastName: "Maier"},
				{firstName: "Thomas", lastName: "Smith"},
				{firstName: "John", lastName: "Williams"},
				{firstName: "Peter", lastName: "Mueller"},
				{firstName: "Petra", lastName: "Maier"},
				{firstName: "Thomas", lastName: "Smith"},
				{firstName: "John", lastName: "Williams"}
			]
		};

		var oModel = new JSONModel();

		this.oDialog.addContent(oTable);
		oTable.setModel(oModel);

		var oBindingInfo = {
			path: "/items",
			template: new ColumnListItem({
				cells: [
					new Text({text: "{firstName}"}),
					new Text({text: "{firstName}"}),
					new Text({text: "{firstName}"}),
					new Text({text: "{firstName}"})
				]
			})
		};

		oTable.bindAggregation("items", oBindingInfo);

		this.oDialog.open();

		setTimeout(function () {
			// act
			oModel.setData(oData);

			setTimeout(function () {
				// assert
				assert.ok(this.oDialog.$().offset().top > 0, "Dialog should NOT be out of the viewport");
				done();

			}.bind(this), 1000);
		}.bind(this), 1000);

	});

	QUnit.module("Title Alignment");

	QUnit.test("setTitleAlignment test", async function (assert) {
		this.clock.restore();
		const oDialog = new Dialog({
			title: "Header",
			buttons: [ new Button() ]
		});
		const sAlignmentClass = "sapMBarTitleAlign";
		const setTitleAlignmentSpy = this.spy(oDialog, "setTitleAlignment");

		oDialog.open();
		await nextUIUpdate();

		const sInitialAlignment = oDialog.getTitleAlignment();

		// initial titleAlignment test depending on theme
		assert.ok(oDialog._header.hasStyleClass(sAlignmentClass + sInitialAlignment),
					"The default titleAlignment is '" + sInitialAlignment + "', there is class '" + sAlignmentClass + sInitialAlignment + "' applied to the Header");

		// ensure that setTitleAlignment won't be called again with the initial value and will always invalidate
		const aRemainingTitleAlignments = Object.values(TitleAlignment).filter((sAlignment) => sAlignment !== sInitialAlignment);

		// check if all types of alignment lead to apply the proper CSS class
		await aRemainingTitleAlignments.reduce(async (pPrevAlignmentTest, sAlignment) => {
			await pPrevAlignmentTest;
			oDialog.setTitleAlignment(sAlignment);
			await nextUIUpdate();

			assert.ok(oDialog._header.hasStyleClass(sAlignmentClass + sAlignment),
							"titleAlignment is set to '" + sAlignment + "', there is class '" + sAlignmentClass + sAlignment + "' applied to the Header");
		}, Promise.resolve());

		// check how many times setTitleAlignment method is called
		assert.strictEqual(setTitleAlignmentSpy.callCount, aRemainingTitleAlignments.length,
			"'setTitleAlignment' method is called total " + setTitleAlignmentSpy.callCount + " times");

		// cleanup
		oDialog.destroy();
	});

	QUnit.module("Responsive padding support");

	QUnit.test("_initResponsivePaddingsEnablement is called on init", function (assert) {
		// Arrange
		var oResponsivePaddingSpy = this.spy(Dialog.prototype, "_initResponsivePaddingsEnablement");
		var oDialog = new Dialog("responsivePaddingsDialog",{
			title: "Title",
			buttons: new Button({ text: "Button" })
		});

		// Act
		oDialog.open();

		// Assert
		assert.strictEqual(oResponsivePaddingSpy.callCount, 1, "_initResponsivePaddingsEnablement should be called once");

		// Clean up
		oDialog.destroy();
		oResponsivePaddingSpy.restore();
	});

	QUnit.test("Correct Responsive padding is applied", function (assert) {
		// Arrange
		var oDialog = new Dialog({
				title: "Header",
				subHeader: new OverflowToolbar({
					content: new Text({ text: "Subheader text" })
				}),
				content: new List({
					items: [
						new StandardListItem({ title: "Item" })
					]
				}),
				buttons: new Button({ text: "Button" })
			}),
			fnHasClass = function (sSelector, sClass) {
				return oDialog.$().find(sSelector).hasClass(sClass);
			},
			fnAssertCorrectPaddingsAppliedOnBreakpoint = function (sBreakpoint) {
				var sClass = "sapUi-Std-Padding" + sBreakpoint;
				assert.ok(fnHasClass(".sapMDialogTitleGroup .sapMIBar", sClass), "Header has correct responsive padding class applied on " + sBreakpoint + " breakpoint");
				assert.ok(fnHasClass(".sapMDialogSubHeader .sapMIBar", sClass), "Subheader has correct responsive padding class applied on " + sBreakpoint + " breakpoint");
				assert.ok(fnHasClass(".sapMDialogScrollCont", sClass), "Content section has correct responsive padding class applied on " + sBreakpoint + " breakpoint");
				assert.ok(fnHasClass(".sapMDialogFooter .sapMIBar", sClass), "Buttons have correct responsive padding class applied on " + sBreakpoint + " breakpoint");
			};
		this.stub(window, "requestAnimationFrame", function (fnCallback) {
			fnCallback();
		});
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oDialog.addStyleClass("sapUiResponsivePadding--header");
		oDialog.addStyleClass("sapUiResponsivePadding--subHeader");
		oDialog.addStyleClass("sapUiResponsivePadding--content");
		oDialog.addStyleClass("sapUiResponsivePadding--footer");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oDialog.open();

		// Arrange for size S
		oDialog.setContentWidth("0%");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.clock.tick(500);

		// Assert for size S
		fnAssertCorrectPaddingsAppliedOnBreakpoint("S");

		// Arrange for size M
		oDialog.setContentWidth("600px");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.clock.tick(500);

		// Assert for size M
		fnAssertCorrectPaddingsAppliedOnBreakpoint("M");

		// Arrange for size S
		oDialog.setContentWidth("0%");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.clock.tick(500);

		// Assert for size S
		fnAssertCorrectPaddingsAppliedOnBreakpoint("S");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Correct Responsive padding is applied on custom footer", function (assert) {
		// Arrange
		var oDialog = new Dialog({
				title: "Header",
				footer: new Toolbar({
					content: [
						new Button({ text: "custom footer button" })
					]
				})
			}),
			fnHasClass = function (sSelector, sClass) {
				return oDialog.$().find(sSelector).hasClass(sClass);
			},
			fnAssertCorrectPaddingsAppliedOnBreakpoint = function (sBreakpoint) {
				var sClass = "sapUi-Std-Padding" + sBreakpoint;
				assert.ok(fnHasClass(".sapMDialogFooter .sapMIBar", sClass), "Custom footer should have correct responsive padding class applied on " + sBreakpoint + " breakpoint");
			};
		this.stub(window, "requestAnimationFrame", function (fnCallback) {
			fnCallback();
		});

		oDialog.addStyleClass("sapUiResponsivePadding--footer");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oDialog.open();

		// Arrange for size S
		oDialog.setContentWidth("0%");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.clock.tick(500);

		// Assert for size S
		fnAssertCorrectPaddingsAppliedOnBreakpoint("S");

		// Arrange for size M
		oDialog.setContentWidth("600px");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.clock.tick(500);

		// Assert for size M
		fnAssertCorrectPaddingsAppliedOnBreakpoint("M");

		// Arrange for size S
		oDialog.setContentWidth("0%");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.clock.tick(500);

		// Assert for size S
		fnAssertCorrectPaddingsAppliedOnBreakpoint("S");

		// Clean up
		oDialog.destroy();
	});

	QUnit.module("Close Dialog with ESC", {
		beforeEach: function() {
			this.oDialog = new Dialog({
				title: 'Test close with ESC'
			});
		},
		afterEach: function() {
			this.oDialog.destroy();
		}
	});

	QUnit.test("Pressing ESC should close the dialog", function (assert) {
		// Arrange
		this.oDialog.open();
		this.clock.tick(500);

		// Act
		qutils.triggerKeydown(this.oDialog.getDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(500);

		// Assert
		assert.notOk(this.oDialog.isOpen(), "Dialog is closed after pressing ESC");
	});

	QUnit.test("Pressing SPACE/ENTER + ESC should not close the dialog", function (assert) {
		// Arrange
		this.oDialog.open();
		this.clock.tick(500);

		[KeyCodes.SPACE, KeyCodes.ENTER].forEach(function (iCancelKey) {
			// Act
			qutils.triggerKeydown(this.oDialog.getDomRef(), iCancelKey);
			qutils.triggerKeydown(this.oDialog.getDomRef(), KeyCodes.ESCAPE);
			this.clock.tick(500);

			// Assert
			assert.ok(this.oDialog.isOpen(), "Dialog is not closed after holding SPACE/ENTER with ESC");
		}.bind(this));
	});

	QUnit.test("Releasing SPACE/ENTER and then pressing ESC should close the dialog", function (assert) {
		// Arrange
		this.oDialog.open();
		this.clock.tick(500);

		[KeyCodes.SPACE, KeyCodes.ENTER].forEach(function (iCancelKey) {
			// Act
			qutils.triggerKeydown(this.oDialog.getDomRef(), iCancelKey);
			qutils.triggerKeyup(this.oDialog.getDomRef(), iCancelKey);
			qutils.triggerKeydown(this.oDialog.getDomRef(), KeyCodes.ESCAPE);
			this.clock.tick(500);

			// Assert
			assert.notOk(this.oDialog.isOpen(), "Dialog is closed after releasing SPACE/ENTER and than pressing ESC");
		}.bind(this));
	});

	QUnit.module("Pressing Accept/Emphasized footer button with Ctrl+Enter" , {
		beforeEach: function() {
			this.oDialog = new Dialog({
				title: 'Test Ctrl+Enter shortcut'
			});
		},
		afterEach: function() {
			this.oDialog.destroy();
		}
	});

	QUnit.test("Pressing Ctrl+Enter should press 'Accept' button", function (assert) {
		// Arrange
		this.oDialog.setBeginButton(new Button({
			type: "Accept",
			press: function () {
				this.oDialog.close();
			}.bind(this)
		}));

		this.oDialog.open();
		this.clock.tick(500);

		// Act
		qutils.triggerKeydown(this.oDialog.getDomRef(), KeyCodes.ENTER, false, false, true);
		this.clock.tick(500);

		// Assert
		assert.notOk(this.oDialog.isOpen(), "Dialog is closed after pressing Ctrl+Enter");
	});

	QUnit.test("Pressing Ctrl+Enter should press 'Emphasized' button", function (assert) {
		// Arrange
		this.oDialog.setEndButton(new Button({
			type: "Emphasized",
			press: function () {
				this.oDialog.close();
			}.bind(this)
		}));

		this.oDialog.open();
		this.clock.tick(500);

		// Act
		qutils.triggerKeydown(this.oDialog.getDomRef(), KeyCodes.ENTER, false, false, true);
		this.clock.tick(500);

		// Assert
		assert.notOk(this.oDialog.isOpen(), "Dialog is closed after pressing Ctrl+Enter");
	});

	QUnit.test("Pressing Ctrl+Enter should press 'Accept' button whe there are 'Accept' and 'Emphasized' buttons ('Accept' is added first)", function (assert) {
		// Arrange
		var oButton1 = new Button({
			type: "Accept",
			press: function () {
				this.oDialog.close();
			}.bind(this)
			});
		var oButton2 = new Button({
				type: "Emphasized"
			});
		this.oDialog.addButton(oButton1);
		this.oDialog.addButton(oButton2);

		this.oDialog.open();
		this.clock.tick(500);

		// Act
		qutils.triggerKeydown(this.oDialog.getDomRef(), KeyCodes.ENTER, false, false, true);
		this.clock.tick(500);

		// Assert
		assert.notOk(this.oDialog.isOpen(), "Dialog is closed after pressing Ctrl+Enter");
	});

	QUnit.test("Pressing Ctrl+Enter shouldn't press 'Reject' button", function (assert) {
		// Arrange
		this.oDialog.setBeginButton(new Button({
			type: "Reject",
			press: function () {
				this.oDialog.close();
			}.bind(this)
		}));

		this.oDialog.open();
		this.clock.tick(500);

		// Act
		qutils.triggerKeydown(this.oDialog.getDomRef(), KeyCodes.ENTER, false, false, true);
		this.clock.tick(500);

		// Assert
		assert.ok(this.oDialog.isOpen(), "Dialog is NOT closed after pressing Ctrl+Enter");
	});

	QUnit.module("Within Area", {
		beforeEach: function () {
			this.oDialog = new Dialog();
			this.oWithinArea = createAndAppendDiv("withinArea");
		},
		afterEach: function () {
			this.oDialog.destroy();
			this.oWithinArea.remove();
			Popup.setWithinArea(null);
		},
		styleWithinArea: function (mStyles) {
			var _mStyles = Object.assign({
				position: "absolute",
				backgroundColor: "black"
			}, mStyles);

			for (var sProp in _mStyles) {
				this.oWithinArea.style[sProp] = _mStyles[sProp];
			}
		},
		assertIsInsideWithinArea: function (assert) {
			var oStyles = this.oDialog.getDomRef().style,
				fTop = parseFloat(oStyles.getPropertyValue("top")),
				fLeft = parseFloat(oStyles.getPropertyValue("left")),
				$withinArea = jQuery(this.oWithinArea),
				oWithinAreaPos = $withinArea.offset();

			// Assert
			assert.ok(fTop >= oWithinAreaPos.top + parseInt($withinArea.css("border-top-width")), "Dialog is inside Within Area vertically");
			assert.ok(fLeft >= oWithinAreaPos.left + parseInt($withinArea.css("border-left-width")), "Dialog is inside Within Area horizontally");
			assert.ok(this.oDialog.$().outerHeight(true) <= $withinArea.innerHeight(), "Dialog isn't higher than Within Area");
			assert.ok(this.oDialog.$().outerWidth(true) <= $withinArea.innerWidth(), "Dialog isn't wider than Within Area");
		}
	});

	QUnit.test("Centering based on Window", function (assert) {
		// Arrange
		Popup.setWithinArea(null);
		this.oDialog.open();
		this.clock.tick(500);
		var $dialog = this.oDialog.$(),
			fExpectedTop = Math.round((window.innerHeight - $dialog.outerHeight()) / 2),
			fExpectedLeft = Math.round((window.innerWidth - $dialog.outerWidth()) / 2);

		// Assert
		assert.ok(Math.abs($dialog.offset().top - fExpectedTop) < EPS, "Top coordinate is correctly calculated based on Window");
		assert.ok(
			Math.abs($dialog.offset().left - fExpectedLeft) < EPS,
			"Left coordinate is correctly calculated based on Window. " +
			"Expected " + fExpectedLeft  + " , actual is " + $dialog.offset().left + " . Possible error is " + EPS
		);
	});

	QUnit.test("Custom Within Area. 'top' and 'left' of Within Area should be included", function (assert) {
		// Arrange
		Popup.setWithinArea(this.oWithinArea);
		this.styleWithinArea({
			top: "5rem",
			left: "1rem",
			bottom: "5rem",
			right: "5rem"
		});
		this.oDialog.open();
		this.clock.tick(500);

		// Assert
		this.assertIsInsideWithinArea(assert);
	});

	QUnit.test("Custom Within Area. 'width' and 'height' of Within Area should be included", function (assert) {
		// Arrange
		Popup.setWithinArea(this.oWithinArea);
		this.styleWithinArea({
			width: "500px",
			height: "500px"
		});
		this.oDialog.open();
		this.clock.tick(500);

		// Assert
		this.assertIsInsideWithinArea(assert);
	});

	QUnit.test("Custom Within Area. Dialog bigger than available space", function (assert) {
		// Arrange
		this.oDialog.setContentHeight("1000px").setContentWidth("1000px");
		Popup.setWithinArea(this.oWithinArea);
		this.styleWithinArea({
			width: "500px",
			height: "500px"
		});
		this.oDialog.open();
		this.clock.tick(500);

		// Assert
		this.assertIsInsideWithinArea(assert);
	});

	QUnit.test("Custom Within Area. Stretched dialog", function (assert) {
		// Arrange
		this.oDialog.setStretch(true);
		Popup.setWithinArea(this.oWithinArea);
		this.styleWithinArea({
			top: "2rem",
			left: "2rem",
			width: "500px",
			height: "500px"
		});
		this.oDialog.open();
		this.clock.tick(500);

		var $dialog = this.oDialog.$(),
			$withinArea = jQuery(this.oWithinArea),
			iExpectedMargin = 10;

		// Assert
		this.assertIsInsideWithinArea(assert);
		assert.ok(Math.abs($dialog.outerWidth() - $withinArea.width()) > iExpectedMargin, "There is margin around the dialog");
		assert.ok(Math.abs($dialog.outerHeight() - $withinArea.height()) > iExpectedMargin, "There is margin around the dialog");
	});

	QUnit.test("Custom Within Area. Stretched dialog on mobile", function (assert) {
		// Arrange
		this.oDialog.setStretch(true);
		Popup.setWithinArea(this.oWithinArea);
		this.styleWithinArea({
			top: "2rem",
			left: "2rem",
			width: "200px",
			height: "200px"
		});
		var oSystem = {
			desktop: false,
			tablet: false,
			phone: true
		};
		this.stub(Device, "system", oSystem);
		this.oDialog.open();
		this.clock.tick(500);

		var $dialog = this.oDialog.$(),
			oDialogPos = $dialog.offset(),
			$withinArea = jQuery(this.oWithinArea),
			oWithinAreaPos = $withinArea.offset();

		// Assert
		this.assertIsInsideWithinArea(assert);
		assert.strictEqual(oDialogPos.top, oWithinAreaPos.top, "Positions of dialog and Within Area are the same");
		assert.strictEqual(oDialogPos.left, oWithinAreaPos.left, "Positions of dialog and Within Area are the same");
		assert.strictEqual($dialog.outerWidth(), $withinArea.width(), "Dialog takes full width");
		assert.strictEqual($dialog.outerHeight(), $withinArea.height(), "Dialog takes full height");
	});

	QUnit.test("Custom Within Area. Borders of Within Area should be included", function (assert) {
		// Arrange
		this.oDialog.setStretch(true);
		Popup.setWithinArea(this.oWithinArea);
		this.styleWithinArea({
			border: "2rem solid red",
			top: "2rem",
			left: "2rem",
			width: "500px",
			height: "500px"
		});
		this.oDialog.open();
		this.clock.tick(500);

		// Assert
		this.assertIsInsideWithinArea(assert);
	});

	QUnit.module("Resize of Within Area", {
		beforeEach: function () {
			this.oDialog = new Dialog();
		},
		afterEach: function () {
			this.oDialog.destroy();
		}
	});

	QUnit.test("Stretched dialog on Desktop, max width is recalculated when window is resized", function (assert) {
		// Arrange
		var oWindowDimensions = this.oDialog._getAreaDimensions(),
			iNewWindowWidth = oWindowDimensions.width - 200;
		this.oDialog.setStretch(true).open();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		this.clock.tick(500);

		var oStub = this.stub(this.oDialog, "_getAreaDimensions").returns(
			Object.assign(
				oWindowDimensions,
				{ width: iNewWindowWidth }
			)
		);

		// Act
		this.oDialog._onResize();
		this.clock.tick(500);

		// Assert
		assert.ok(this.oDialog.$().width() < iNewWindowWidth, "max-width of the dialog wasn't recalculated on resize of window");

		oStub.restore();
	});

	QUnit.test("Stretched dialog on Desktop, max height is recalculated when window is resized", function (assert) {
		// Arrange
		var oWindowDimensions = this.oDialog._getAreaDimensions(),
			iNewWindowHeight = oWindowDimensions.height - 200;
		this.oDialog.setStretch(true).open();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		this.clock.tick(500);

		var oStub = this.stub(this.oDialog, "_getAreaDimensions").returns(
			Object.assign(
				oWindowDimensions,
				{ height: iNewWindowHeight }
			)
		);

		// Act
		this.oDialog._onResize();
		this.clock.tick(500);

		// Assert
		assert.ok(this.oDialog.$().height() < iNewWindowHeight, "max-height of the dialog wasn't recalculated on resize of window");

		oStub.restore();
	});

	QUnit.module("Footer", {
		beforeEach: function () {
			this.oDialog = new Dialog({
				content: new HTML({
					content: '<div>Lipsum limple text</div>'
				}),
				buttons: [
					new Button({
						text: "Accept"
					}),
					new Button({
						text: "Reject",
						icon: "sap-icon://employee"
					})
				],
				footer: new Toolbar({
					content: [new Button({
							icon: "sap-icon://error",
							type: "Negative",
							text: "2"
						}),
						new Button({
							type: "Emphasized",
							text: "Accept",
							press: function () {
								this.getParent().getParent().close();
							}
						}),
						new Button({
							text: "Reject"
						})
					]
				})
			});
		},
		afterEach: function () {
			this.oDialog.destroy();
		}
	});

	QUnit.test("Test Footer aggregation", function (assert) {
		// Arrange

		this.oDialog.open();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		this.clock.tick(500);

		// Act
		this.oDialog._onResize();
		this.clock.tick(500);

		// Assert
		assert.ok(this.oDialog.getAggregation("footer"), "Dialog has aggregation footer");

		assert.notOk(this.oDialog.getAggregation("buttons")[0].getDomRef(), "Dialog does not have the first button from buttons aggregation rendered");
		assert.notOk(this.oDialog.getAggregation("buttons")[1].getDomRef(), "Dialog does not have the second button from buttons aggregation rendered");

		assert.ok(this.oDialog.getAggregation("footer").getDomRef().classList.contains("sapMFooter-CTX"), "Dialog footer is rendered with correct class");
		assert.strictEqual(this.oDialog.getAggregation("footer").getContent()[0].getText(), "2", "Dialog footer has correct first button");
		assert.strictEqual(this.oDialog.getAggregation("footer").getContent()[1].getText(), "Accept", "Dialog footer has correct second button");
		assert.strictEqual(this.oDialog.getAggregation("footer").getContent()[2].getText(), "Reject", "Dialog footer has correct third button");

		// Act
		qutils.triggerKeydown(this.oDialog.getDomRef(), KeyCodes.ENTER, false, false, true);
		this.clock.tick(500);

		// Assert
		assert.notOk(this.oDialog.isOpen(), "Dialog is closed after pressing Ctrl+Enter if footer has emphasized button");

	});
});
