/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/ui/core/IconPool",
	"sap/m/Dialog",
	"sap/m/Bar",
	"sap/m/SearchField",
	"sap/ui/core/HTML",
	"sap/m/Button",
	"sap/m/library",
	"jquery.sap.global",
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
	"jquery.sap.keycodes"
], function(
	qutils,
	createAndAppendDiv,
	Device,
	Core,
	IconPool,
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
	JSONModel
) {
	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.m.DialogRoleType
	var DialogRoleType = mobileLibrary.DialogRoleType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	createAndAppendDiv("content");

	function marginCompare(value1, value2, margin) {
		var _margin = margin || 2;
		return (Math.abs(value1 - value2)) < _margin;
	}

	function overwriteAnimationIE(oDialog) {// TODO remove after 1.62 version
		if (Device.browser.msie) {
			// Sinon fake timer doesn't work correctly with jQuery fadeIn. The fadeIn Animation which is used in IE9
			// can't be controlled by the sinon fake timer. Therefore the animation has to be overwritten with no
			// animation when runs in IE9
			oDialog.oPopup.setAnimations(
				function ($Ref, iDuration, fnOpen) {
					fnOpen();
				}, function ($Ref, iDuration, fnClosed) {
					fnClosed();
				}
			);
		}
	}

	function isTextTruncated($element) {
		var iTolerance = 5;

		return $element[0].scrollWidth > ($element.innerWidth() + iTolerance);
	}

	var oDialog = new Dialog("dialog", {
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
				oDialog.close();
			}
		}),
		endButton: new Button("rightButton", {
			text: "Accept",
			type: ButtonType.Accept,
			press: function () {
				oDialog.close();
			}
		}),
		beforeOpen: function () {
			assert.ok(jQuery.sap.byId("dialog").css("visibility") !== "visible", "Dialog should be hidden before it's opened");
		},
		afterOpen: function () {
			assert.equal(jQuery.sap.byId("dialog").css("visibility"), "visible", "Dialog should be visible after it's opened");
		},
		beforeClose: function () {
			assert.equal(jQuery.sap.byId("dialog").css("visibility"), "visible", "Dialog should be visible after it's opened");
		},
		afterClose: function (oEvent) {
			assert.equal(jQuery.sap.byId("dialog").length, 0, "Dialog content is not rendered anymore");
			assert.ok(oEvent.getParameter("origin") !== null, "Origin parameter should be set");
			assert.ok(!oDialog.isOpen(), "Dialog is already closed");
		}
	});

	var oButton = new Button({
		text: "Open Dialog",
		press: function () {
			oDialog.open();
		}
	});

	var page = new Page("myFirstPage", {
		title: "Dialog Test",
		showNavButton: true,
		enableScrolling: true,
		content: oButton
	});

	var app = new App("myApp", {
		initialPage: "myFirstPage"
	});

	app.addPage(page).placeAt("qunit-fixture");

	QUnit.module("Initial Check");

	QUnit.test("Initialization", function (assert) {
		assert.ok(!jQuery.sap.domById("dialog"), "Dialog is not rendered before it's ever opened.");
		assert.equal(oDialog.oPopup._sF6NavMode, "SCOPE", "Dialog's popup navigation mode is set to SCOPE.");
	});

	QUnit.module("Content preservation");

	QUnit.test("Preserve Dialog Content", function(assert) {
		var done = assert.async();
		this.clock.restore();

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

			oDialog.attachAfterClose(start);

			oDialog.close();
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
		sap.ui.getCore().byId("lastSC").setVisible(true);
		this.dialog._onResize();

		// assert
		assert.equal(this.dialog.$('cont').scrollTop(), this.SCROLL_TOP, "Content's scroll position should be preserved");

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

	QUnit.module("Open and Close");

	QUnit.test("Open Dialog", function (assert) {
		oButton.firePress();
		assert.ok(oDialog.isOpen(), "Dialog is already open");
		this.clock.tick(600);
		var $Dialog = jQuery.sap.byId("dialog"),
			$ScrollDiv = oDialog.$("scroll"),
			oTitleDom = jQuery.sap.domById(oDialog.getId() + "-title"),
			oSubHeaderDom = $Dialog.children(".sapMDialogSubHeader")[0],
			oIconDom = jQuery.sap.domById(oDialog.getId() + "-icon"),
			oSearchField = sap.ui.getCore().byId("__field0").getFocusDomRef();
		assert.ok(jQuery.sap.domById("dialog"), "dialog is rendered after it's opened.");
		assert.ok($Dialog.closest("#sap-ui-static")[0], "dialog should be rendered inside the static uiArea.");
		assert.ok(oSubHeaderDom, "Sub header should be rendered inside the dialog");
		assert.equal($ScrollDiv.css("display"), "inline-block", "Scroll div should always have display: inline-block");

		if (!jQuery.support.touch && !jQuery.sap.simulateMobileOnDesktop) {
			assert.equal(oSearchField, document.activeElement, "searchfield should have the focus");
		}

		if (jQuery.support.touch || jQuery.sap.simulateMobileOnDesktop) {
			assert.expect(9);
		} else {
			assert.expect(10);
		}
		assert.ok(oIconDom, "Icon should be rendered.");
		assert.ok(oTitleDom, "Title should be rendered");
	});

	QUnit.test("Close Dialog. Test set origin parameter value", function (assert) {
		assert.expect(4);
		oDialog.getBeginButton().$().trigger("tap");
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

		oDialog._oToolbar.rerender();
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

		sap.ui.getCore().applyChanges();
		assert.equal(jQuery.sap.domById(oDialog.getId()).className.indexOf("sapMDialogVerScrollDisabled") != -1, true, "verticalScrolling should be disabled");
		assert.equal(jQuery.sap.domById(oDialog.getId()).className.indexOf("sapMDialogHorScrollDisabled") != -1, true, "horizontalScrolling should be disabled");
		assert.equal(oDialog.getVerticalScrolling(), false, "verticalScrolling should be disabled");
		assert.equal(oDialog.getVerticalScrolling(), false, "horizontalScrolling should be disabled");
		oDialog.destroy();
	});

	QUnit.test("Set vertical/horizontal scrolling to false", function (assert) {
		var oDialog = new Dialog({
			content: new HTML({
				content: "<div style='width: 1000px;height: 1000px'></div>"
			})
		});
		oDialog.open();
		this.clock.tick(500);

		oDialog.setVerticalScrolling(true);
		oDialog.setHorizontalScrolling(true);

		sap.ui.getCore().applyChanges();
		assert.equal(jQuery.sap.domById(oDialog.getId()).className.indexOf("sapMPopoverVerScrollDisabled") == -1, true, "verticalScrolling should be enabled");
		assert.equal(jQuery.sap.domById(oDialog.getId()).className.indexOf("sapMPopoverHorScrollDisabled") == -1, true, "horizontalScrolling should be enabled");
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
		sut = new Dialog({
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

	QUnit.test("Dialog: set stretchOnPhone to true should not stretch on desktop", function (assert) {
		var oDialog = new Dialog({
			stretchOnPhone: true
		});

		oDialog.open();
		assert.ok(oDialog.isOpen(), "Dialog is already open");
		this.clock.tick(500);
		assert.ok(!oDialog.$().hasClass("sapMDialogStretched"), "Dilog should not has sapMDialogStretched class");

		oDialog.destroy();
	});

	QUnit.test("Dialog: set stretchOnPhone to true should stretch on phone", function (assert) {
		var oSystem = {
			desktop: false,
			tablet: false,
			phone: true
		};

		this.stub(Device, "system", oSystem);

		var oDialog = new Dialog({
			stretchOnPhone: true
		});

		oDialog.open();
		assert.ok(oDialog.isOpen(), "Dialog is already open");
		this.clock.tick(500);
		assert.ok(oDialog.$().hasClass("sapMDialogStretched"), "Dilog should has sapMDialogStretched class");

		oDialog.destroy();
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
		sap.ui.getCore().applyChanges();

		oDialog._oCloseTrigger = 'some button';

		qutils.triggerKeydown(oDialog.getDomRef(), jQuery.sap.KeyCodes.ESCAPE);
		this.clock.tick(250);
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();
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
		sap.ui.getCore().applyChanges();
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
		assert.equal(oBBtn.$().width(), oEBtn.$().width(), "BeginButton and EndButton are with equal width");

		// add button to "buttons" aggregation while begin/endButton are set
		aButtons.forEach(function (oButton) {
			oDialog.addButton(oButton);
		});
		sap.ui.getCore().applyChanges();
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
		sap.ui.getCore().applyChanges();
		assert.ok(oBBtn.$().closest(".sapMIBar").length, "BeginButton should be rendered");
		assert.ok(oEBtn.$().closest(".sapMIBar").length, "EndButton should be rendered");

		//destroy
		oDialog.destroy();
		assert.ok(oBBtn.bIsDestroyed, "beginButton should also be destroyed");
		assert.ok(oEBtn.bIsDestroyed, "endButton should also be destroyed");
		aButtons.forEach(function (oButton) {
			oButton.destroy();
		});

		jQuery("html").addClass("sap-phone");
	});

	QUnit.test("Setting starting and ending buttons", function (assert) {
		// Arrange
		var oDialog = new Dialog();
		var testButton = new Button();
		var testButton2 = new Button();

		// Act
		oDialog.setLeftButton(testButton);
		oDialog.setRightButton(testButton2);

		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oDialog.getLeftButton(), testButton.getId(), 'Setting the left button');
		assert.strictEqual(oDialog.getRightButton(), testButton2.getId(), 'Setting the left button');

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("Setting name aggregation title", function (assert) {
		// Arrange
		var oDialog = new Dialog();

		// Assert
		assert.strictEqual(oDialog._composeAggreNameInHeader('Begin'), 'contentLeft', '"Begin" should set the dialog in right position');
		assert.strictEqual(oDialog._composeAggreNameInHeader('End'), 'contentRight', '"End" should set the dialog in right position');
		assert.strictEqual(oDialog._composeAggreNameInHeader('-different'), 'content-different', 'Custom position will set custom header');

		// Clean up
		oDialog.destroy();
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

		mIcons[ValueState.Success] = IconPool.getIconURI("message-success");
		mIcons[ValueState.Warning] = IconPool.getIconURI("message-warning");
		mIcons[ValueState.Error] = IconPool.getIconURI("message-error");
		mIcons[ValueState.Information] = IconPool.getIconURI("hint");
		mIcons[ValueState.None] = "";

		oDialog.open();

		for (var sState in mIcons) {
			// Act
			oDialog.setState(sState);
			Core.applyChanges();

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
		Core.applyChanges();

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
		Core.applyChanges();

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

		overwriteAnimationIE(oDialog);

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = jQuery(document.activeElement).control(0);
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
		var dialogTitleId = oDialog.$().find('header > .sapMBar .sapMTitle').attr('id');
		var subHeaderId = oDialog.$().find('.sapMDialogSubHeader > .sapMBar').attr('id');
		var dialogAriaLabelledBy = oDialog.getAriaLabelledBy();
		assert.strictEqual(oDialog.getDomRef().getAttribute('aria-labelledby'), dialogTitleId + ' ' + subHeaderId +
			' ' + TEXT_ID);
		assert.strictEqual(dialogAriaLabelledBy.length, 3);
		assert.strictEqual(dialogAriaLabelledBy.indexOf(dialogTitleId), 0);
		assert.strictEqual(dialogAriaLabelledBy.indexOf(subHeaderId), 1);
		assert.strictEqual(dialogAriaLabelledBy.indexOf(TEXT_ID), 2);

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

		overwriteAnimationIE(oDialog);

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = jQuery(document.activeElement).control(0);
		assert.strictEqual(oFocusedControl.getId(), oInput1.getId(), "oInput1 has focus.");

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

		overwriteAnimationIE(oDialogInitialFocus);

		// Act
		oDialogInitialFocus.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = jQuery(document.activeElement).control(0);
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

		overwriteAnimationIE(oDialog);

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = jQuery(document.activeElement).control(0);
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

		overwriteAnimationIE(oDialog);

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = jQuery(document.activeElement).control(0);
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

		overwriteAnimationIE(oDialog);

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = jQuery(document.activeElement).control(0);
		assert.strictEqual(oFocusedControl.getId(), oButton2.getId(), "oButton2 has focus.");

		// Clean up
		oDialog.destroy();
	});

	QUnit.test("No interactive elements or buttons", function (assert) {
		// Arrange
		var oDialog = new Dialog();
		overwriteAnimationIE(oDialog);

		// Act
		oDialog.open();
		this.clock.tick(500);

		// Assert
		var oFocusedControl = jQuery(document.activeElement).control(0);
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

		overwriteAnimationIE(oDialog);

		oDialog.open();
		this.clock.tick(300);

		var $FocusedElement = jQuery(document.activeElement);
		var oFocusedControl = $FocusedElement.control(0);

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

		overwriteAnimationIE(oDialog);

		oDialog.open();
		this.clock.tick(400);

		var oFocusedControl = jQuery(document.activeElement).control(0);
		assert.equal(oFocusedControl.getId(), "initialFocusButton", "Initial focus should be set correctly");

		assert.strictEqual(oDialog.getCustomHeader().$().attr("aria-level"), "2", "Customer header should have aria-level= '2'");
		oDialog.$("lastfe").focus();
		oFocusedControl = jQuery(document.activeElement).control(0);
		assert.equal(oFocusedControl.getId(), "tabChainButton", "Focus should be set to the button in custom header");

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
		sap.ui.getCore().applyChanges();
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
		oDialog._reapplyPosition();
		oDialog.destroy();
	});


	setTimeout(function () {
		jQuery('html').css('overflow', 'auto');
	}, 1000);

	QUnit.module("Accessibility");

	QUnit.test("Check if ValueState is present", function (assert) {
		// Arrange
		var oDialogSuccess = new Dialog({
			state: ValueState.Success
		});
		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		var sValueState = rb.getText("LIST_ITEM_STATE_SUCCESS");

		overwriteAnimationIE(oDialogSuccess);

		// Act
		oDialogSuccess.open();
		this.clock.tick(1500);

		var sInvisibleTextContent = oDialogSuccess.getAggregation("_valueState").getText();

		// Assert
		assert.strictEqual(sInvisibleTextContent, sValueState, "Success state value should be the same.");

		// Clean up
		oDialogSuccess.destroy();

		// Arrange
		var oDialogWarning = new Dialog({
			state: ValueState.Warning
		});
		overwriteAnimationIE(oDialogWarning);
		sValueState = rb.getText("LIST_ITEM_STATE_WARNING");

		// Act
		oDialogWarning.open();
		this.clock.tick(500);
		sInvisibleTextContent = oDialogWarning.getAggregation("_valueState").getText();

		// Assert
		assert.strictEqual(sInvisibleTextContent, sValueState, "Warning state value should be the same.");

		// Clean up
		oDialogWarning.destroy();

		// Arrange
		var oDialogError = new Dialog({
			state: ValueState.Error
		});
		overwriteAnimationIE(oDialogError);
		sValueState = rb.getText("LIST_ITEM_STATE_ERROR");

		// Act
		oDialogError.open();
		this.clock.tick(500);
		sInvisibleTextContent = oDialogError.getAggregation("_valueState").getText();

		// Assert
		assert.strictEqual(sInvisibleTextContent, sValueState, "Error state value should be the same.");

		// Clean up
		oDialogError.destroy();


		// Arrange
		var oDialogInformation = new Dialog({
			state: ValueState.Information
		});
		overwriteAnimationIE(oDialogInformation);
		sValueState = rb.getText("LIST_ITEM_STATE_INFORMATION");

		// Act
		oDialogInformation.open();
		this.clock.tick(500);
		sInvisibleTextContent = oDialogInformation.getAggregation("_valueState").getText();

		// Assert
		assert.strictEqual(sInvisibleTextContent, sValueState, "Information state value should be the same.");

		// Clean up
		oDialogInformation.destroy();
	});

	QUnit.test("Check if header toolbar role is set correctly", function(assert) {
		// arrange
		var oDialog = new Dialog({
			title: "Some title",
			beginButton: new Button({text: 'button'})
		});

		// act
		oDialog.open();
		this.clock.tick(500);

		// assert
		assert.strictEqual(oDialog.$('header').attr('role'), "heading", "The role of the header should be set to 'heading'");
		assert.strictEqual(oDialog.$('header').attr('aria-level'), "2", "aria-level  should be set to the header");

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
		assert.strictEqual(oDialog.$('footer').attr('role'), "toolbar", "The role of the header should be set to 'heading'");

		// cleanup
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
			pageX: 608,
			pageY: 646,
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
			pageX: 608,
			pageY: 646,
			offsetX: 177,
			offsetY: 35,
			preventDefault: function () {},
			stopPropagation: function () {},
			target: oDialog.getAggregation("_header").$().find(".sapMBarPH")[0]
		};

		var iInitialHeight = oDialog.$().height();

		oDialog.onmousedown(oMockEvent);

		this.clock.tick(500);

		sap.ui.getCore().byId("txt").setVisible(false);
		sap.ui.getCore().applyChanges();
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
			pageX: 608,
			pageY: 646,
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

		},
		afterEach: function() {
			this.oDialog.destroy();
		}
	});

	QUnit.test("Check if after double click on header dialog has the right height", function(assert) {
		// act
		this.oDialog.open();
		this.clock.tick(500);
		var $dialogContent = this.oDialog.$('cont'),
			$dialogHeader = this.oDialog._header.$(),
			oCssStyles = {"height": 150,"width":540};
		$dialogContent.css(oCssStyles);

		assert.strictEqual($dialogContent.height(), 150, "Dialog height should be 150px");

		$dialogHeader.dblclick();

		// assert
		assert.strictEqual($dialogContent.height(), 400, "Dialog height should be 400px");
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
		qutils.triggerKeyup(this.oCloseButton.getDomRef(), jQuery.sap.KeyCodes.SPACE);
		this.clock.tick(500);


		// assert
		assert.strictEqual(this.oBeforeCloseOrigin, this.oCloseButton, "Before close origin should be the oCloseButton");
		assert.strictEqual(this.oAfterCloseOrigin, this.oCloseButton, "After close origin should be the oCloseButton");
	});

	QUnit.test("On using enter to trigger close of dialog the origin should be set", function(assert) {
		// act
		this.oDialog.open();
		this.clock.tick(500);
		qutils.triggerKeydown(this.oCloseButton.getDomRef(), jQuery.sap.KeyCodes.ENTER);
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
					new sap.m.List({
						items: [
							new sap.m.StandardListItem({
								title: "Item 1"
							}),
							new sap.m.StandardListItem({
								title: "Item 2"
							}),
							new sap.m.StandardListItem({
								title: "Item 3"
							}),
							new sap.m.StandardListItem({
								id: "longTextItem", // this item has to be visible without truncation by default
								title: "Item with some long text. Item with some long text."
							}),
							new sap.m.StandardListItem({
								title: "Item 4"
							})
						]
					})
				]
			});
		},
		afterEach: function() {
			this.oDialog.destroy();
		}
	});

	QUnit.test("Content width is smaller than the min-width of the dialog", function (assert) {

		// Arrange
		// Set the long title to something shorter.
		this.oDialog.getContent()[0].getItems()[3].setTitle("Item 3.5");
		var iScrollWidth = 18;

		// Act
		this.oDialog.open();
		this.clock.tick(500);

		var bContentGrowsToFitContainer = this.oDialog.$("scroll").width() + iScrollWidth >= this.oDialog.$().width();

		// Assert
		assert.equal(this.oDialog.$().css("width"), this.oDialog.$().css("min-width"), "Should have minimum width when content width is smaller.");
		assert.ok(bContentGrowsToFitContainer, "Content should grow to fit the container when its width is smaller than the minimum width of the dialog.");
	});

	QUnit.test("Item texts are not truncated when width is auto", function(assert) {
		this.oDialog.open();
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		var $longTextItem = this.oDialog.$().find("#longTextItem .sapMSLITitleOnly");

		// assert
		assert.strictEqual(isTextTruncated($longTextItem), false, "Long text is not truncated when width is auto");
	});

	QUnit.test("Text is truncated when width is too small", function(assert) {
		// make the dialog very small to ensure truncation
		this.oDialog.setContentWidth("20rem");

		this.oDialog.open();
		this.clock.tick(500);

		var $longTextItem = this.oDialog.$().find("#longTextItem .sapMSLITitleOnly");

		// assert
		assert.strictEqual(isTextTruncated($longTextItem), true, "Text is truncated when width is small");
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

	QUnit.module("Dialog sizing", {
		beforeEach: function() {
			this.oDialog = new Dialog({
				title: "Header",
				content: new Text({text: "Content"})
			});
		},
		afterEach: function() {
			this.oDialog.destroy();
		}
	});

	QUnit.test("Height should be 'auto' if content fits", function (assert) {
		this.oDialog.open();
		this.clock.tick(500);

		// assert
		assert.strictEqual(this.oDialog.$('cont')[0].style.height, "auto", "Height is auto when content fits");
	});

	QUnit.test("Height should be set, when the dialog is stretched", function (assert) {
		this.oDialog.setStretch(true);
		this.oDialog.open();
		this.clock.tick(500);

		// assert
		assert.notEqual(this.oDialog.$('cont')[0].style.height, "auto", "Height is set when stretch=true");
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

	QUnit.module("TitleAlignmentMixin Test", {
		beforeEach: function() {
			this.oDialog = new Dialog({
				title: "Header",
				buttons: [ new Button() ]
			});
		},
		afterEach: function() {
			this.oDialog.destroy();
		}
	});

	QUnit.test("setTitleAlignment test", function (assert) {

		var initialTheme = sap.ui.getCore().getConfiguration().getTheme(),
			themeAlignment = sap.ui.core.theming.Parameters.get("sapMTitleAlignment"),
			themeAlignmentName = themeAlignment ? themeAlignment : 'not defined',
			haveStartClass = themeAlignment === "Start" ? true : false,
			startClass = "sapMBarTitleStart",
			setTitleAlignmentSpy = this.spy(this.oDialog, "setTitleAlignment");

		this.oDialog.open();

		// initial titleAlignment test depending on theme
		assert.equal(this.oDialog._header.hasStyleClass(startClass), haveStartClass, "'" + initialTheme + "' theme detected, the default theme alignment is '" + themeAlignmentName + "', so there is " + (haveStartClass ? '' : 'no') + " class '" + startClass + "' applied to the Header");

		// set titleAlignment to Start
		this.oDialog.setTitleAlignment("Start");
		assert.equal(this.oDialog._header.hasStyleClass(startClass), true, "titleAlignment is set to 'Start', there is class '" + startClass + "' applied to the Header");

		// set titleAlignment to Center
		this.oDialog.setTitleAlignment("Center");
		assert.equal(this.oDialog._header.hasStyleClass(startClass), false, "titleAlignment is set to 'Center', there is no class '" + startClass + "' applied to the Header");

		// set titleAlignment to Auto
		this.oDialog.setTitleAlignment("Auto");
		assert.equal(this.oDialog._header.hasStyleClass(startClass), haveStartClass, "'" + initialTheme + "' theme detected, the default theme alignment is '" + themeAlignmentName + "', so there is " + (haveStartClass ? '' : 'no') + " class '" + startClass + "' applied to the Header");

		// check how many times setTitleAlignment method is called
		assert.equal(setTitleAlignmentSpy.callCount, 3, "'setTitleAlignment' method is called total " + setTitleAlignmentSpy.callCount + " times");

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
		this.clock.restore(); // restore the timer so we can use the real setTimeout for this test

		// Arrange
		var done = assert.async();
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
		});
		var fnHasClass = function (sSelector, sClass) {
			return oDialog.$().find(sSelector).hasClass(sClass);
		};
		var fnAssertCorrectPaddingsAppliedOnBreakpoint = function (sBreakpoint) {
			var sClass = "sapUi-Std-Padding" + sBreakpoint;
			assert.ok(fnHasClass(".sapMDialogTitle .sapMIBar", sClass), "Header has correct responsive padding class applied on " + sBreakpoint + " breakpoint");
			assert.ok(fnHasClass(".sapMDialogSubHeader .sapMIBar", sClass), "Subheader has correct responsive padding class applied on " + sBreakpoint + " breakpoint");
			assert.ok(fnHasClass(".sapMDialogScrollCont", sClass), "Content section has correct responsive padding class applied on " + sBreakpoint + " breakpoint");
			assert.ok(fnHasClass(".sapMDialogFooter .sapMIBar", sClass), "Buttons have correct responsive padding class applied on " + sBreakpoint + " breakpoint");
		};
		sap.ui.getCore().applyChanges();

		oDialog.addStyleClass("sapUiResponsivePadding--header");
		oDialog.addStyleClass("sapUiResponsivePadding--subHeader");
		oDialog.addStyleClass("sapUiResponsivePadding--content");
		oDialog.addStyleClass("sapUiResponsivePadding--footer");
		sap.ui.getCore().applyChanges();

		oDialog.open();

		setTimeout(function () {
			// Act
			oDialog.setContentWidth("0%"); // set S breakpoint width

			setTimeout(function () {
				// Assert
				fnAssertCorrectPaddingsAppliedOnBreakpoint("S");

				// Act
				oDialog.setContentWidth("600px"); // set M breakpoint width

				setTimeout(function () {
					// Assert
					fnAssertCorrectPaddingsAppliedOnBreakpoint("M");

					// Act
					oDialog.setContentWidth("0%"); // set it back to S breakpoint width

					setTimeout(function () {
						// Assert
						fnAssertCorrectPaddingsAppliedOnBreakpoint("S");

						// Clean up
						oDialog.destroy();
						done();
					}, 300);
				}, 300);
			}, 300);
		}, 300);

	});

});