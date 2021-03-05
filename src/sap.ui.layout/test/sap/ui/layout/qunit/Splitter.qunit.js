/*global QUnit sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/layout/Splitter",
	"sap/ui/layout/SplitterLayoutData",
	"sap/m/Button",
	"sap/m/Panel"
], function (
	Log,
	Splitter,
	SplitterLayoutData,
	Button,
	Panel
) {
	"use strict";

	function createExampleContent(sSize) {
		if (createExampleContent.called === undefined) {
			createExampleContent.called = 0;
		}
		++createExampleContent.called;


		var oLd = new SplitterLayoutData({
			resizable: true,
			size: Math.random() > 0.5 ? "auto" : 50 + Math.floor(Math.random() * 300) + "px",
			minSize: Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 100)
		});

		if (sSize !== undefined) {
			oLd.setSize(sSize);
		}

		var oContent = new Button({
			width: "100%",
			text: "Content!",
			layoutData: oLd
		});

		return oContent;
	}

	var oSplitter = new Splitter("mySplitter0", {
		contentAreas: [createExampleContent("100px"), createExampleContent("200px"), createExampleContent("300px")]
	});

	oSplitter.placeAt("qunit-fixture");
	sap.ui.getCore().applyChanges();

	QUnit.module("API", {
		beforeEach: function () {
			this.oSplitter = new Splitter();
		},
		afterEach: function () {
			this.oSplitter.destroy();
		}
	});

	QUnit.test("layoutData is added, after adding a contentArea", function (assert) {
		var oButton = new Button();
		this.oSplitter.addContentArea(oButton);
		assert.ok(oButton.getLayoutData(), "Adding content area without layoutData should directly receive such.");
	});

	QUnit.test("layoutData is added, after inserting a contentArea", function (assert) {
		var oButton = new Button();
		this.oSplitter.insertContentArea(oButton);
		assert.ok(oButton.getLayoutData(), "Adding content area without layoutData should directly receive such.");
	});

	QUnit.module("Absolute Area Sizes");

	QUnit.test("Absolute Horizontal sizing", function (assert) {
		oSplitter.setOrientation(sap.ui.core.Orientation.Horizontal);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("100px");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("200px");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("300px");
		var oDelegate = {
			onAfterRendering: function () {
				var aSizes = oSplitter.getCalculatedSizes();

				assert.ok(aSizes[0] === 100, "Content size #1 is correct.");
				assert.ok(aSizes[1] === 200, "Content size #2 is correct.");
				assert.ok(aSizes[2] === 300, "Content size #3 is correct.");

				oSplitter.removeDelegate(oDelegate);
			}
		};
		oSplitter.addDelegate(oDelegate);
		oSplitter.rerender();
	});

	QUnit.test("Absolute vertical sizing", function (assert) {
		oSplitter.setOrientation(sap.ui.core.Orientation.Vertical);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("100px");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("200px");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("300px");
		var oDelegate = {
			onAfterRendering: function () {
				var aSizes = oSplitter.getCalculatedSizes();

				assert.ok(aSizes[0] === 100, "Content size #1 is correct.");
				assert.ok(aSizes[1] === 200, "Content size #2 is correct.");
				assert.ok(aSizes[2] === 300, "Content size #3 is correct.");

				oSplitter.removeDelegate(oDelegate);
			}
		};
		oSplitter.addDelegate(oDelegate);
		oSplitter.rerender();
	});

	QUnit.test("Sizing with rems", function (assert) {

		// Arrange - Start with px size values
		var oBtn1 = new Button({
			text: "Content 2",
			width: "100%",
			layoutData: new SplitterLayoutData({size: "300px"})
		});
		var oBtn2 = new Button({
			text: "Content 2",
			width: "100%",
			layoutData: new SplitterLayoutData({size: "200px"})
		});
		var oSplitter = new Splitter({
			contentAreas: [
				oBtn1,
				oBtn2
			]
		});
		oSplitter.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oBtn1.getLayoutData().setSize("30rem");
		oSplitter.triggerResize(true);
		var aSizes = oSplitter.getCalculatedSizes();

		// Assert
		assert.equal(aSizes.length, 2, "Should have two sizes");
		// 30rem will be internally calculated to pixels => 30 * 16 = 480
		assert.equal(aSizes[0], "480", "Should change to 480");
		assert.equal(aSizes[1], "200", "Should remain unchanged");

		// cleanup
		oSplitter.destroy();
	});

	QUnit.test("Should calculate properly percentage containers", function (assert) {
		// Arrange
		var oCurContainer,
			aSizes = [],
			aWidths = [];

		// System under Test
		var oContainer1 = new Button({
				text: "Content 1",
				width: "100%",
				layoutData: new SplitterLayoutData({size: "33.33%"})
			}),
			oContainer2 = new Button({
				text: "Content 2",
				width: "100%",
				layoutData: new SplitterLayoutData({size: "33.33%"})
			}),
			oContainer3 = new Button({
				text: "Content 3",
				width: "100%",
				layoutData: new SplitterLayoutData({size: "33.33%"})
			}),

			oSplitter = new Splitter({
				width: "500px",
				contentAreas: [oContainer1, oContainer2, oContainer3]
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Act- don't use loops in unit tests- anti-pattern
		oCurContainer = oSplitter.getContentAreas()[0];
		aSizes.push(oCurContainer.getLayoutData().getSize());
		aWidths.push(oCurContainer.$().parent(".sapUiLoSplitterContent").width());

		oCurContainer = oSplitter.getContentAreas()[1];
		aSizes.push(oCurContainer.getLayoutData().getSize());
		aWidths.push(oCurContainer.$().parent(".sapUiLoSplitterContent").width());

		oCurContainer = oSplitter.getContentAreas()[2];
		aSizes.push(oCurContainer.getLayoutData().getSize());
		aWidths.push(oCurContainer.$().parent(".sapUiLoSplitterContent").width());

		// Assert
		assert.strictEqual(aSizes[0], aSizes[1], "Container sizes should be equal");
		assert.strictEqual(aSizes[1], aSizes[2], "Container sizes should be equal");
		assert.strictEqual(aSizes[2], aSizes[0], "Container sizes should be equal");

		assert.strictEqual(aWidths[0], aWidths[1], "Container widths should be equal");
		assert.strictEqual(aWidths[1], aWidths[2], "Container widths should be equal");
		assert.strictEqual(aWidths[2], aWidths[0], "Container widths should be equal");

		// Cleanup
		oContainer1 = null;
		oContainer2 = null;
		oContainer3 = null;
		oSplitter.destroy();
	});

	QUnit.module("Automatic Area Sizes");

	QUnit.test("Automatic horizontal sizing ", function (assert) {
		oSplitter.setOrientation(sap.ui.core.Orientation.Horizontal);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("auto");
		var oDelegate = {
			onAfterRendering: function () {
				var aSizes = oSplitter.getCalculatedSizes();

				// Sizes should be about the same (rounding errors should be within 2px)
				assert.ok(aSizes[0] >= aSizes[1] - 2 && aSizes[0] <= aSizes[1] + 2, "Content size #1 is correct.");
				assert.ok(aSizes[1] >= aSizes[2] - 2 && aSizes[1] <= aSizes[2] + 2, "Content size #2 is correct.");
				assert.ok(aSizes[2] >= aSizes[0] - 2 && aSizes[2] <= aSizes[0] + 2, "Content size #3 is correct.");
				oSplitter.removeDelegate(oDelegate);
			}
		};
		oSplitter.addDelegate(oDelegate);
		oSplitter.rerender();
	});

	QUnit.test("Automatic vertical sizing ", function (assert) {
		oSplitter.setOrientation(sap.ui.core.Orientation.Vertical);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("auto");
		var oDelegate = {
			onAfterRendering: function () {
				var aSizes = oSplitter.getCalculatedSizes();
				// Sizes should be about the same (rounding errors should be within 1px)
				assert.ok(aSizes[0] >= aSizes[1] - 2 && aSizes[0] <= aSizes[1] + 2, "Content size #1 is correct.");
				assert.ok(aSizes[1] >= aSizes[2] - 2 && aSizes[1] <= aSizes[2] + 2, "Content size #2 is correct.");
				assert.ok(aSizes[2] >= aSizes[0] - 2 && aSizes[2] <= aSizes[0] + 2, "Content size #3 is correct.");
				oSplitter.removeDelegate(oDelegate);
			}
		};
		oSplitter.addDelegate(oDelegate);
		oSplitter.rerender();
	});

	QUnit.test("Single area with 100% size", function (assert) {
		// Arrange
		var oCont = new Button({
			text: "Content 2",
			layoutData: new SplitterLayoutData({size: "100%"})
		});
		var oSplitter = new Splitter({
			contentAreas: [oCont]
		});
		oSplitter.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oCont.$().parent().width(), oSplitter.$().width(), "Content area should take all the available width when size is 100%");

		// Clean up
		oSplitter.destroy();
	});

	QUnit.module("Mixed Area Sizes");

	QUnit.test("Mixed horizontal sizing", function (assert) {
		oSplitter.setOrientation(sap.ui.core.Orientation.Horizontal);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("10px");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("10px");
		var oDelegate = {
			onAfterRendering: function () {
				var aSizes = oSplitter.getCalculatedSizes();

				// Fixed sizes should be exact
				assert.ok(aSizes[0] === 10, "Content size #1 is correct.");
				assert.ok(aSizes[2] === 10, "Content size #3 is correct.");

				// Auto size should be content size, minus fixed sizes, minus resize bars
				// var iBarSize = jQuery("#" + oSplitter.getId() + "-splitbar-0").width();
				// var iAutoSize = 500 - 20 - (2 * iBarSize);
				// assert.ok(aSizes[1] >= iAutoSize - 1 && aSizes[1] <= iAutoSize + 1, "Content size #2 is correct.");

				oSplitter.removeDelegate(oDelegate);
			}
		};
		oSplitter.addDelegate(oDelegate);
		oSplitter.rerender();
	});

	QUnit.test("Mixed vertical sizing", function (assert) {
		oSplitter.setOrientation(sap.ui.core.Orientation.Vertical);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("10px");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("10px");
		var oDelegate = {
			onAfterRendering: function () {
				var aSizes = oSplitter.getCalculatedSizes();

				// Fixed sizes should be exact
				assert.ok(aSizes[0] === 10, "Content size #1 is correct.");
				assert.ok(aSizes[2] === 10, "Content size #3 is correct.");

				// Auto size should be content size, minus fixed sizes, minus resize bars
				// var iBarSize = jQuery("#" + oSplitter.getId() + "-splitbar-0").height();
				// var iAutoSize = 500 - 20 - (2 * iBarSize);
				// assert.ok(aSizes[1] >= iAutoSize - 1 && aSizes[1] <= iAutoSize + 1, "Content size #2 is correct.");

				oSplitter.removeDelegate(oDelegate);
			}
		};
		oSplitter.addDelegate(oDelegate);
		oSplitter.rerender();
	});


	QUnit.module("General tests");

	QUnit.test("_getContentAreas hook", function (assert) {
		var oSplitter = new Splitter(),
			oButton = new Button();

		oSplitter.addContentArea(oButton);
		oSplitter.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();


		assert.strictEqual(oSplitter.getContentAreas().length, oSplitter._getContentAreas().length, "Should return same value as getContent()");
		assert.strictEqual(oSplitter._getContentAreas().length, 1, "Should have 1 content Area");

		oSplitter.destroy();
	});

	QUnit.test("triggerResize", function (assert) {
		var oSplitter = new Splitter();
		oSplitter.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oResizeSpy = sinon.spy(oSplitter, "_resize"),
			oDelayedResizeSpy = sinon.spy(oSplitter, "_delayedResize");

		oSplitter.triggerResize();
		assert.ok(oDelayedResizeSpy.calledOnce, "Call delayed resize");
		assert.ok(!oResizeSpy.calledOnce, "Direct resize not called");

		oSplitter.triggerResize(true);
		assert.ok(oResizeSpy.calledOnce, "Direct resize called");

		oSplitter.destroy();
	});

	QUnit.test("Live resize enabling", function (assert) {
		var oSplitter = new Splitter();
		oSplitter.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oSplitter._liveResize, true, "Live resize enabled by default");

		oSplitter.disableLiveResize();
		assert.strictEqual(oSplitter._liveResize, false, "Disable Live resize");

		oSplitter.enableLiveResize();
		assert.strictEqual(oSplitter._liveResize, true, "Enable Live resize");

		oSplitter.destroy();
	});

	QUnit.test("Keyboard support enabling", function (assert) {
		var oSplitter = new Splitter({
			contentAreas: [
				new Button(),
				new Button()
			]
		});
		oSplitter.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oEnableKeyboardSupportSpy = sinon.spy(oSplitter, "_enableKeyboardListeners"),
			oDisableKeyboardSupportSpy = sinon.spy(oSplitter, "_disableKeyboardListeners");

		oSplitter.enableKeyboardSupport();
		assert.ok(oEnableKeyboardSupportSpy.calledOnce, "Enable keyboard support");
		assert.strictEqual(oSplitter.$().find(".sapUiLoSplitterBar").attr("tabindex"), "0", "Set a proper tabindex");

		oSplitter.disableKeyboardSupport();
		assert.ok(oDisableKeyboardSupportSpy.calledOnce, "Disable keyboard support");
		assert.strictEqual(oSplitter.$().find(".sapUiLoSplitterBar").attr("tabindex"), "-1", "Set a proper tabindex");

		oSplitter.destroy();
	});

	QUnit.test("_onKeyboardResize", function (assert) {
		var oSplitter = new Splitter({
				contentAreas: [
					new Button(),
					new Button()
				]
			}),
			oEvent = {
				target: {
					id: oSplitter.getId() + "-splitbar-0"
				}
			};
		oSplitter.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oKeyboardResizeSpy = sinon.spy(oSplitter, "_resizeContents");
		oKeyboardResizeSpy.withArgs(12, 5, true);

		oSplitter._onKeyboardResize("inc", 5, oEvent);
		sap.ui.getCore().applyChanges();

		assert.ok(oKeyboardResizeSpy.withArgs(0, 5, true).calledOnce);

		oSplitter.destroy();
	});

	QUnit.module("Content areas");

	QUnit.test("addContentArea", function (assert) {
		var oSplitter = new Splitter({
				contentAreas: [
					new Button(),
					new Button()
				]
			}),
			addedItem = new Button();
		oSplitter.placeAt("qunit-fixture");
		oSplitter.addContentArea(addedItem);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oSplitter.$().children(".sapUiLoSplitterContent").length, 3, "Has 3 content areas rendered");

		oSplitter.destroy();
	});

	QUnit.test("insertContentArea", function (assert) {
		var oSplitter = new Splitter({
				contentAreas: [
					new Button(),
					new Button()
				]
			}),
			addedItem = new Button();
		oSplitter.placeAt("qunit-fixture");
		oSplitter.insertContentArea(addedItem, 1);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oSplitter.$().children(".sapUiLoSplitterContent").length, 3, "Has 3 content areas");

		oSplitter.destroy();
	});

	QUnit.test("removeContentArea", function (assert) {
		var addedItem = new Button(),
			oSplitter = new Splitter({
				contentAreas: [
					addedItem
				]
			});
		oSplitter.placeAt("qunit-fixture");
		oSplitter.removeContentArea(addedItem);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oSplitter.$().children(".sapUiLoSplitterContent").length, 0, "Has 0 content areas");

		oSplitter.destroy();
	});

	QUnit.test("resetContentAreasSizes", function (assert) {
		function getSize (oControl) {
			return { width: oControl.$().width(), height: oControl.$().height() };
		}

		var done = assert.async();

		// Arrange
		var oSplitter = new Splitter({
			contentAreas: [createExampleContent("400px"), createExampleContent()]
		});
		oSplitter.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var aContentAreas = oSplitter.getContentAreas();

		var aOldContentSize = aContentAreas.map(getSize);

		oSplitter.resetContentAreasSizes();
		sap.ui.getCore().applyChanges();

		setTimeout(function () {
			var aNewContentSize = aContentAreas.map(getSize);
			assert.notDeepEqual(aNewContentSize, aOldContentSize, "Content Areas' sizes have changed");

			// Clean-up
			oSplitter.destroy();
			done();

		}, 200);
	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oSplitter = new Splitter("splitter", {
				contentAreas: [
					new Button(),
					new Button(),
					new Button()
				]
			});
			this.oSplitter.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oSplitter.destroy();
			this.oSplitter = null;
		}
	});

	QUnit.test("Mousedown", function (assert) {
		// arrange
		var oSpy = sinon.spy(this.oSplitter, "_onBarMoveStart"),
			oSplitterBar = this.oSplitter.$().children("#splitter-splitbar-0")[0],
			oSplitterBarGrip = this.oSplitter.$().find(".sapUiLoSplitterBarGrip")[0],
			oContentArea = this.oSplitter.$().children("#splitter-content-0")[0];

		// act and assert
		this.oSplitter.onmousedown({ target: oContentArea });
		assert.strictEqual(oSpy.callCount, 0, "Clicking on content area should NOT trigger _onBarMoveStart");

		oSpy.resetHistory();
		this.oSplitter.onmousedown({ target: oSplitterBar });
		assert.strictEqual(oSpy.callCount, 1, "Clicking on a splitter bar should trigger _onBarMoveStart");

		oSpy.resetHistory();
		this.oSplitter.onmousedown({ target: oSplitterBarGrip });
		assert.strictEqual(oSpy.callCount, 1, "Clicking on a splitter bar icon should trigger _onBarMoveStart");

		// cleanup
		this.oSplitter._onBarMoveEnd({ changedTouches: false }); // used to deregister event listeners added onmousedown
	});

	QUnit.test("Touchstart", function (assert) {
		// arrange
		var oStub = sinon.stub(Splitter.prototype, "_onBarMoveStart"),
			oSplitterBar = this.oSplitter.$().children("#splitter-splitbar-0")[0],
			oSplitterBarGrip = this.oSplitter.$().find(".sapUiLoSplitterBarGrip")[0],
			oContentArea = this.oSplitter.$().children("#splitter-content-0")[0],
			oFakeEvent = { changedTouches: [ "touch"] };

		// act and assert
		oFakeEvent.target = oContentArea;
		this.oSplitter.ontouchstart(oFakeEvent);
		assert.strictEqual(oStub.callCount, 0, "Touch on content area should NOT trigger _onBarMoveStart");

		oStub.resetHistory();
		oFakeEvent.target = oSplitterBar;
		this.oSplitter.ontouchstart(oFakeEvent);
		assert.strictEqual(oStub.callCount, 1, "Touch on a splitter bar should trigger _onBarMoveStart");

		oStub.resetHistory();
		oFakeEvent.target = oSplitterBarGrip;
		this.oSplitter.ontouchstart(oFakeEvent);
		assert.strictEqual(oStub.callCount, 1, "Touch on a splitter bar icon should trigger _onBarMoveStart");

		// cleanup
		oStub.restore();
	});

	QUnit.module("Resize Handling");

	QUnit.test("Prevent size calculation while rerendering", function (assert) {
		// Check whether the resize calculation is not done when the Splitter is located in the preserve area
		var done = assert.async();
		sap.ui.require([
			'sap/ui/core/mvc/XMLView',
			'sap/ui/layout/Splitter',
			'sap/ui/core/RenderManager'],
			function (XMLView,
					  Splitter,
					  RenderManager) {

			// setup
			var sXMLViewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:layout="sap.ui.layout">'
				+ '<layout:Splitter id="myResizeSplitter">'
				+ '</layout:Splitter>'
				+ '</mvc:View>';
			var oXMLView = new XMLView({viewContent: sXMLViewContent});
			var oResizeSplitter = oXMLView.byId("myResizeSplitter");

			oXMLView.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			var oSpy = sinon.spy(oResizeSplitter, "getCalculatedSizes");

			oXMLView.attachBeforeRendering(function () {
				// check
				assert.ok(RenderManager.isPreservedContent(oXMLView.getDomRef()), "Splitter control is preserved as part of XMLView.");
				oResizeSplitter.triggerResize(true);
				assert.strictEqual(oSpy.called, false, "Splitter has not calculated its sizes again.");

				oXMLView.destroy();
				done();
			});

			oXMLView.rerender();
		});
	});

	QUnit.test("Splitter with Vertical orientation with parent with height 'auto'", function (assert) {
		// Arrange
		var oBtn1 = new Button({layoutData: new SplitterLayoutData({size: "300px"})}),
			oBtn2 = new Button({layoutData: new SplitterLayoutData({size: "auto"})}),
			oBtn3 = new Button({layoutData: new SplitterLayoutData({size: "auto"})});

		var oSplitter = new Splitter({
			orientation: "Vertical",
			contentAreas: [oBtn1, oBtn2, oBtn3]
		});

		var oPanel = new Panel({
			height: "auto",
			content: [oSplitter]
		});

		var oResizeSpy = sinon.spy(oSplitter, "_resize");
		var done = assert.async();

		// Act
		oPanel.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		setTimeout(function () {
			// Assert
			assert.strictEqual(oResizeSpy.callCount, 2, "Should not call resize infinite times.");

			// Clean up
			oPanel.destroy();
			done();
		}, 200);
	});

	QUnit.module("Bars", {
		beforeEach: function () {
			this.oSplitter = new Splitter("splitter", {
				contentAreas: [
					new Button({ layoutData: new SplitterLayoutData({size: "100px"}) }),
					new Button({ layoutData: new SplitterLayoutData({size: "100px"}) }),
					new Button({ layoutData: new SplitterLayoutData({size: "100px"}) })
				]
			});
			this.oSplitter.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oSplitter.destroy();
		}
	});

	QUnit.test("'left' position of overlay bar - Horizontal splitter", function (assert) {
		// arrange
		this.oSplitter.setOrientation("Horizontal");
		sap.ui.getCore().applyChanges();
		var $splitterBar = this.oSplitter.$().children("#splitter-splitbar-1"),
			iBarWidth = $splitterBar.outerWidth();

		// act
		this.oSplitter.onmousedown({ target: $splitterBar[0] });

		// assert
		assert.strictEqual(this.oSplitter._move.relStart, 200 + iBarWidth, "Overlay splitter bar should have 'left' position calculated correctly.");

		// cleanup
		this.oSplitter._onBarMoveEnd({ changedTouches: false }); // used to deregister event listeners added onmousedown
	});

	QUnit.test("'top' position of overlay bar - Vertical splitter", function (assert) {
		// arrange
		this.oSplitter.setOrientation("Vertical");
		sap.ui.getCore().applyChanges();
		var $splitterBar = this.oSplitter.$().children("#splitter-splitbar-1"),
			iBarHeight = $splitterBar.outerHeight();

		// act
		this.oSplitter.onmousedown({ target: $splitterBar[0] });

		// assert
		assert.strictEqual(this.oSplitter._move.relStart, 200 + iBarHeight, "Overlay splitter bar should have 'top' position calculated correctly.");

		// cleanup
		this.oSplitter._onBarMoveEnd({ changedTouches: false }); // used to deregister event listeners added onmousedown
	});

	QUnit.module("Logging", {
		beforeEach: function () {
			this.oSplitter = new Splitter();
			this.oSplitter.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oSplitter.destroy();
		}
	});

	QUnit.test("There is warning when there is not enough space to fit the content", function (assert) {
		// arrange
		var oLogSpy = sinon.spy(Log, "warning");
		this.oSplitter.setWidth("300px");
		this.oSplitter.addContentArea(new Button({
			layoutData: new SplitterLayoutData({
				minSize: 200
			})
		}));
		this.oSplitter.addContentArea(new Button({
			layoutData: new SplitterLayoutData({
				minSize: 100
			})
		}));
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(
			oLogSpy.calledWith("The set sizes and minimal sizes of the splitter contents are bigger than the available space in the UI."),
			"Warning is logged"
		);

		// clean up
		oLogSpy.restore();
	});

	QUnit.test("There is NO warning when there is enough space to fit the content", function (assert) {
		// arrange
		var oLogSpy = sinon.spy(Log, "warning");
		this.oSplitter.setWidth("300px");
		this.oSplitter.addContentArea(new Button({
			layoutData: new SplitterLayoutData({
				minSize: 200
			})
		}));
		this.oSplitter.addContentArea(new Button({
			layoutData: new SplitterLayoutData({
				minSize: 80
			})
		}));
		sap.ui.getCore().applyChanges();

		// assert
		assert.notOk(
			oLogSpy.calledWith(
				"The set sizes and minimal sizes of the splitter contents are bigger than the available space in the UI. " +
				"Some of the sizes have to be reduced or sap.ui.layout.ResponsiveSplitter should be used instead"
			),
			"Warning is not logged"
		);

		// clean up
		oLogSpy.restore();
	});

});
