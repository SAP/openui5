/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/layout/Splitter",
	"sap/ui/layout/SplitterLayoutData",
	"sap/m/Button",
	"sap/m/Panel",
	"sap/m/ScrollContainer",
	"sap/ui/core/library",
	"sap/ui/core/RenderManager",
	"sap/ui/core/ResizeHandler",
	"sap/ui/dom/units/Rem",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Log,
	Splitter,
	SplitterLayoutData,
	Button,
	Panel,
	ScrollContainer,
	coreLibrary,
	RenderManager,
	ResizeHandler,
	Rem,
	nextUIUpdate
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	var Orientation = coreLibrary.Orientation;

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

	function createTestSplitter() {
		this.oSplitter = new Splitter("mySplitter0", {
			contentAreas: [createExampleContent("100px"), createExampleContent("200px"), createExampleContent("300px")]
		}).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
	}

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

	QUnit.module("Absolute Area Sizes", {
		beforeEach: createTestSplitter,
		afterEach: function() {
			this.oSplitter.destroy();
		}
	});

	QUnit.test("Absolute Horizontal sizing", function (assert) {
		var done = assert.async();
		var oSplitter = this.oSplitter;
		oSplitter.setOrientation(Orientation.Horizontal);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("100px");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("200px");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("300px");
		var oDelegate = {
			onAfterRendering: function () {
				var aSizes = oSplitter._calculatedSizes;

				assert.ok(aSizes[0] === 100, "Content size #1 is correct.");
				assert.ok(aSizes[1] === 200, "Content size #2 is correct.");
				assert.ok(aSizes[2] === 300, "Content size #3 is correct.");

				oSplitter.removeDelegate(oDelegate);

				done();
			}
		};
		oSplitter.addDelegate(oDelegate);
		oSplitter.invalidate();
	});

	QUnit.test("Absolute vertical sizing", function (assert) {
		var done = assert.async();
		var oSplitter = this.oSplitter;
		oSplitter.setOrientation(Orientation.Vertical);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("100px");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("200px");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("300px");
		var oDelegate = {
			onAfterRendering: function () {
				var aSizes = oSplitter._calculatedSizes;

				assert.ok(aSizes[0] === 100, "Content size #1 is correct.");
				assert.ok(aSizes[1] === 200, "Content size #2 is correct.");
				assert.ok(aSizes[2] === 300, "Content size #3 is correct.");

				oSplitter.removeDelegate(oDelegate);

				done();
			}
		};
		oSplitter.addDelegate(oDelegate);
		oSplitter.invalidate();
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oBtn1.getLayoutData().setSize("30rem");
		oSplitter.triggerResize(true);
		var aSizes = oSplitter._calculatedSizes;

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

		nextUIUpdate.runSync()/*fake timer is used in module*/;

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

	QUnit.module("Automatic Area Sizes", {
		beforeEach: createTestSplitter,
		afterEach: function() {
			this.oSplitter.destroy();
		}
	});

	QUnit.test("Automatic horizontal sizing ", function (assert) {
		var done = assert.async();
		var oSplitter = this.oSplitter;
		oSplitter.setOrientation(Orientation.Horizontal);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("auto");
		var oDelegate = {
			onAfterRendering: function () {
				var aSizes = oSplitter._calculatedSizes;

				// Sizes should be about the same (rounding errors should be within 2px)
				assert.ok(aSizes[0] >= aSizes[1] - 2 && aSizes[0] <= aSizes[1] + 2, "Content size #1 is correct.");
				assert.ok(aSizes[1] >= aSizes[2] - 2 && aSizes[1] <= aSizes[2] + 2, "Content size #2 is correct.");
				assert.ok(aSizes[2] >= aSizes[0] - 2 && aSizes[2] <= aSizes[0] + 2, "Content size #3 is correct.");
				oSplitter.removeDelegate(oDelegate);

				done();
			}
		};
		oSplitter.addDelegate(oDelegate);
		oSplitter.invalidate();
	});

	QUnit.test("Automatic vertical sizing ", function (assert) {
		var done = assert.async();
		var oSplitter = this.oSplitter;
		oSplitter.setOrientation(Orientation.Vertical);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("auto");
		var oDelegate = {
			onAfterRendering: function () {
				var aSizes = oSplitter._calculatedSizes;
				// Sizes should be about the same (rounding errors should be within 1px)
				assert.ok(aSizes[0] >= aSizes[1] - 2 && aSizes[0] <= aSizes[1] + 2, "Content size #1 is correct.");
				assert.ok(aSizes[1] >= aSizes[2] - 2 && aSizes[1] <= aSizes[2] + 2, "Content size #2 is correct.");
				assert.ok(aSizes[2] >= aSizes[0] - 2 && aSizes[2] <= aSizes[0] + 2, "Content size #3 is correct.");
				oSplitter.removeDelegate(oDelegate);

				done();
			}
		};
		oSplitter.addDelegate(oDelegate);
		oSplitter.invalidate();
	});

	QUnit.module("% Area Sizes", {
		beforeEach: function () {
			this.oSplitter = new Splitter("splitter");
			this.oContainer = new ScrollContainer({
				content: this.oSplitter,
				width: "400px",
				height: "300px"
			});
			this.oContainer.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oContainer.destroy();
			this.oSplitter = null;
		}
	});

	QUnit.test("Content area with % size", function (assert) {
		// Arrange
		var oFirstContentItem = new Button({
			layoutData: new SplitterLayoutData({
				size: "25%"
			})
		});
		this.oSplitter.addContentArea(oFirstContentItem);
		this.oSplitter.addContentArea(new Button());

		// Act
		this.oSplitter.setWidth("400px");
		this.oSplitter._recalculateSizes();

		// Assert
		var iExpectedSize = 25 * this.oSplitter._calcAvailableContentSize() / 100;
		assert.strictEqual(this.oSplitter._calculatedSizes[0], iExpectedSize, "Content area size should be exactly 25% of the available width (bars excluded)");

		// Act
		this.oContainer.setWidth("1000px");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		iExpectedSize = 25 * this.oSplitter._calcAvailableContentSize() / 100;
		assert.strictEqual( this.oSplitter._calculatedSizes[0], iExpectedSize, "Content area size should be exactly 25% of the available width (bars excluded)");
	});

	QUnit.test("Single area with 100% size", function (assert) {
		// Arrange
		var oCont = new Button({
			text: "Content 2",
			layoutData: new SplitterLayoutData({size: "100%"})
		});
		this.oSplitter.addContentArea(oCont);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(oCont.$().parent().width(), this.oSplitter.$().width(), "Content area should take all the available width when size is 100%");
	});

	QUnit.module("Mixed Area Sizes", {
		beforeEach: createTestSplitter,
		afterEach: function() {
			this.oSplitter.destroy();
		}
	});

	QUnit.test("Mixed horizontal sizing", function (assert) {
		var done = assert.async();
		var oSplitter = this.oSplitter;
		oSplitter.setOrientation(Orientation.Horizontal);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("10px");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("10px");
		var oDelegate = {
			onAfterRendering: function () {
				var aSizes = oSplitter._calculatedSizes;

				// Fixed sizes should be exact
				assert.ok(aSizes[0] === 10, "Content size #1 is correct.");
				assert.ok(aSizes[2] === 10, "Content size #3 is correct.");

				// Auto size should be content size, minus fixed sizes, minus resize bars
				// var iBarSize = jQuery("#" + oSplitter.getId() + "-splitbar-0").width();
				// var iAutoSize = 500 - 20 - (2 * iBarSize);
				// assert.ok(aSizes[1] >= iAutoSize - 1 && aSizes[1] <= iAutoSize + 1, "Content size #2 is correct.");

				oSplitter.removeDelegate(oDelegate);

				done();
			}
		};
		oSplitter.addDelegate(oDelegate);
		oSplitter.invalidate();
	});

	QUnit.test("Mixed vertical sizing", function (assert) {
		var done = assert.async();
		var oSplitter = this.oSplitter;
		oSplitter.setOrientation(Orientation.Vertical);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("10px");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("10px");
		var oDelegate = {
			onAfterRendering: function () {
				var aSizes = oSplitter._calculatedSizes;

				// Fixed sizes should be exact
				assert.ok(aSizes[0] === 10, "Content size #1 is correct.");
				assert.ok(aSizes[2] === 10, "Content size #3 is correct.");

				// Auto size should be content size, minus fixed sizes, minus resize bars
				// var iBarSize = jQuery("#" + oSplitter.getId() + "-splitbar-0").height();
				// var iAutoSize = 500 - 20 - (2 * iBarSize);
				// assert.ok(aSizes[1] >= iAutoSize - 1 && aSizes[1] <= iAutoSize + 1, "Content size #2 is correct.");

				oSplitter.removeDelegate(oDelegate);

				done();
			}
		};
		oSplitter.addDelegate(oDelegate);
		oSplitter.invalidate();
	});

	QUnit.module("Responsiveness", {
		beforeEach: function () {
			this.oSplitter = new Splitter("splitter");
			this.oContainer = new ScrollContainer({
				content: this.oSplitter,
				width: "400px",
				height: "300px"
			});
			this.oContainer.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oContainer.destroy();
			this.oSplitter = null;
		}
	});

	QUnit.test("Sum of areas' width", function (assert) {
		// Arrange
		var iFirstContentAreaWidth, iSecondContentAreaWidth,
			aCalculatedSizes,
			iExpectedWidth = 500 - Rem.toPx(1); // 1rem is the size of the splitter bar;

		this.oSplitter.addContentArea(new Button({
			layoutData: new SplitterLayoutData({
				size: "100px"
			})
		}));
		this.oSplitter.addContentArea(new Button());

		// Act
		this.oContainer.setWidth("500px");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		aCalculatedSizes = this.oSplitter._calculatedSizes;
		iFirstContentAreaWidth = aCalculatedSizes[0];
		iSecondContentAreaWidth = aCalculatedSizes[1];

		// Assert
		assert.strictEqual(iFirstContentAreaWidth + iSecondContentAreaWidth, iExpectedWidth, "Sum of the widths of content areas should be equal to the size of the container minus the bar");
	});

	QUnit.test("Calculations should be done with 5 digit precision", function (assert) {
		// Arrange
		this.oSplitter.addContentArea(new Button());
		this.oSplitter.addContentArea(new Button());
		this.oSplitter._move.c1Size = 20.000000000000153;
		this.oSplitter._move.c2Size = 599.9999999999998;

		// Act
		this.oSplitter._resizeContents(0, -20, true);

		// Assert
		// Before that fix this code would throw and exception and the test would fail.
		assert.ok(true, "Resizing should be successful");
	});

	QUnit.test("Content area with minSize", function (assert) {
		// Arrange
		var aSizes;
		this.oSplitter.addContentArea(new Button({
			layoutData: new SplitterLayoutData({
				minSize: 200
			})
		}));
		this.oSplitter.addContentArea(new Button({
			layoutData: new SplitterLayoutData({
				minSize: 30
			})
		}));

		// Act
		this.oContainer.setWidth("300px");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		aSizes = this.oSplitter._calculatedSizes;
		assert.ok(aSizes[0] >= 200, "Content area should NOT get lower width than its 'minSize'.");
		assert.ok(aSizes[1] >= 30, "Content area should NOT get lower width than its 'minSize'.");
	});

	QUnit.test("Calculation of % when they are more than available space, but set by app developer (should have truncation)", function (assert) {
		// Arrange
		var iTotalWidth = 1000;
		this.oSplitter.setWidth(iTotalWidth + "px");
		this.oSplitter.addContentArea(new Button({
			layoutData: new SplitterLayoutData({
				size: "auto",
				minSize: 500
			})
		}));
		this.oSplitter.addContentArea(new Button({
			layoutData: new SplitterLayoutData({
				size: "60%" // results in 600px
			})
		}));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var aAreas = this.oSplitter._getContentAreas(),
			iFirstAreaWidth = aAreas[0].$().parent().width(),
			iSecondAreaWidth = aAreas[1].$().parent().width(),
			iExpectedSecondAreaWidth = Math.floor(60 * this.oSplitter._calcAvailableContentSize() / 100); // 60%

		// Assert
		assert.strictEqual(iFirstAreaWidth, 500, "Area width is set to its minSize");
		assert.strictEqual(iSecondAreaWidth, iExpectedSecondAreaWidth, "Area width is set to 60% of content size");
		assert.ok(iFirstAreaWidth + iSecondAreaWidth >= iTotalWidth, "Calculated space exceeds available width. No correction applied.");
	});

	QUnit.test("Calculation of % when they are more than available space but set by Splitter (should NOT have truncation)", function (assert) {
		// Arrange
		var iTotalWidth = 1000,
			iFirstAreaMinSize = 500;
		this.oSplitter.setWidth(iTotalWidth + "px");
		this.oSplitter.addContentArea(new Button({
			layoutData: new SplitterLayoutData({
				size: "90%",
				minSize: iFirstAreaMinSize
			})
		}));
		this.oSplitter.addContentArea(new Button());
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var $bar = this.oSplitter.$().children("#splitter-splitbar-0");

		// Act - move the bar
		this.oSplitter.onmousedown({
			target: $bar[0],
			pageX: $bar.position().left
		});
		this.oSplitter._onBarMoveEnd({
			changedTouches: false,
			pageX: 400
		}); // used to deregister event listeners added onmousedown
		this.oSplitter._resize();

		var aAreas = this.oSplitter._getContentAreas(),
			iFirstAreaWidth = aAreas[0].$().parent().width(),
			iSecondAreaWidthBeforeParentShrink = aAreas[1].$().parent().width();

		// Assert
		assert.strictEqual(iFirstAreaWidth, iFirstAreaMinSize, "Area width is set to its minSize");

		// Act - shrink the whole splitter
		this.oSplitter.setWidth("600px");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var iSecondAreaWidthAfterParentShrink = aAreas[1].$().parent().width();

		assert.ok(iSecondAreaWidthAfterParentShrink < iSecondAreaWidthBeforeParentShrink, "Second area had shrunk");
		assert.ok(iFirstAreaWidth + iSecondAreaWidthAfterParentShrink <= iTotalWidth, "Calculated space doesn't exceed available width. Correction applied.");
	});

	QUnit.module("General tests");

	QUnit.test("_getContentAreas hook", function (assert) {
		var oSplitter = new Splitter(),
			oButton = new Button();

		oSplitter.addContentArea(oButton);
		oSplitter.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;


		assert.strictEqual(oSplitter.getContentAreas().length, oSplitter._getContentAreas().length, "Should return same value as getContent()");
		assert.strictEqual(oSplitter._getContentAreas().length, 1, "Should have 1 content Area");

		oSplitter.destroy();
	});

	QUnit.test("triggerResize", function (assert) {
		var oSplitter = new Splitter();
		oSplitter.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var oResizeSpy = this.spy(oSplitter, "_resize"),
			oDelayedResizeSpy = this.spy(oSplitter, "_delayedResize");

		oSplitter.triggerResize();
		assert.ok(oDelayedResizeSpy.calledOnce, "Call delayed resize");
		assert.ok(!oResizeSpy.calledOnce, "Direct resize not called");

		oSplitter.triggerResize(true);
		assert.ok(oResizeSpy.calledOnce, "Direct resize called");

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var oEnableKeyboardSupportSpy = this.spy(oSplitter, "_enableKeyboardListeners"),
			oDisableKeyboardSupportSpy = this.spy(oSplitter, "_disableKeyboardListeners");

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var oKeyboardResizeSpy = this.spy(oSplitter, "_resizeContents");
		oKeyboardResizeSpy.withArgs(12, 5, true);

		oSplitter._onKeyboardResize("inc", 5, oEvent);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oSplitter.$().children(".sapUiLoSplitterContent").length, 0, "Has 0 content areas");

		oSplitter.destroy();
		addedItem.destroy();
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var aContentAreas = oSplitter.getContentAreas();

		var aOldContentSize = aContentAreas.map(getSize);

		oSplitter.resetContentAreasSizes();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		setTimeout(function () {
			var aNewContentSize = aContentAreas.map(getSize);
			assert.notDeepEqual(aNewContentSize, aOldContentSize, "Content Areas' sizes have changed");

			// Clean-up
			oSplitter.destroy();
			done();

		}, 200);
	});

	QUnit.test("resetContentAreasSizes when there is only 1 area with 'minSize'", function (assert) {
		// Arrange
		var done = assert.async(),
			oArea = new Button({
				layoutData: new SplitterLayoutData({
					size: "100%",
					minSize: 200
				})
			}),
			oSplitter = new Splitter({
				width: "500px",
				contentAreas: [oArea]
			});
		oSplitter.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oSplitter.triggerResize(true);
		var iOldWidth = oSplitter.$("content-0").width();

		// Act
		oSplitter.resetContentAreasSizes();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		setTimeout(function () {
			var iNewContentSize = oSplitter.$("content-0").width();
			// Assert
			assert.strictEqual(iNewContentSize, iOldWidth, "Area didn't shrink to 'minSize'");

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
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oSplitter.destroy();
			this.oSplitter = null;
		}
	});

	QUnit.test("Mousedown", function (assert) {
		// arrange
		var oSpy = this.spy(this.oSplitter, "_onBarMoveStart"),
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
		var oStub = this.stub(Splitter.prototype, "_onBarMoveStart"),
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
	});

	QUnit.test("Resize event", function (assert) {
		// Arrange
		const done = assert.async();
		const [oFirstContentArea, oSecondContentArea, oThirdContentArea] = this.oSplitter.getContentAreas();
		oFirstContentArea.getLayoutData().setSize("100.2px");
		oSecondContentArea.getLayoutData().setSize("100px");
		oThirdContentArea.getLayoutData().setSize("100px");
		this.oSplitter.triggerResize(true);

		this.oSplitter.attachResize((oEvent) => {
			// Assert

			assert.deepEqual(oEvent.getParameter("oldSizes"), [100, 100, 100], "Old sizes are integers");
			assert.deepEqual(oEvent.getParameter("newSizes"), [50, 50, 50], "New sizes are integers");
			done();
		});

		// Act
		oFirstContentArea.getLayoutData().setSize("50px");
		oSecondContentArea.getLayoutData().setSize("50.5px");
		oThirdContentArea.getLayoutData().setSize("50px");
	});

	QUnit.module("Resize Handling");

	QUnit.test("Size calculation when splitter is located in the preserve area", async function (assert) {
		// Arrange
		const oSplitter = new Splitter("myResizeSplitter");
		oSplitter.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDomRef = oSplitter.getDomRef();
		// Act
		// move the Splitter into the preserve area
		RenderManager.preserveContent(oDomRef, true /* bPreserveRoot */, true /* bPreserveNodesWithId */);
		assert.ok(RenderManager.isPreservedContent(oDomRef), "Splitter control is preserved.");

		const oSpy = this.spy(oSplitter, "_recalculateSizes");
		oSplitter.triggerResize(true);

		// Assert
		assert.strictEqual(oSpy.called, false, "Splitter has not calculated its sizes again.");

		// Clean up
		oSplitter.destroy();
	});

	QUnit.test("Size calculation when splitter is not displayed", function (assert) {
		// Arrange
		var oSplitter = new Splitter({
			contentAreas: []
		});
		oSplitter.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var oSpy = this.spy(oSplitter, "_recalculateSizes");

		// Act
		oSplitter.$().css("display", "none");
		oSplitter.triggerResize(true);

		// Assert
		assert.ok(oSpy.notCalled, "Should not calculate sizes when not displayed");

		// Clean up
		oSplitter.destroy();
	});

	QUnit.module("Resize Handling with fake timers", {
		before: function() {
			sinon.config.useFakeTimers = true;
		},
		after: function() {
			sinon.config.useFakeTimers = false;
		}
	});

	QUnit.test("Splitter with Vertical orientation with parent with height 'auto'", function (assert) {
		// Arrange
		var fnTriggerResize;
		this.stub(ResizeHandler, "register").callsFake(function (oControl, fnListener) {
			fnTriggerResize = fnListener;
		});

		var oBtn1 = new Button({layoutData: new SplitterLayoutData({size: "300px"})}),
			oBtn2 = new Button({layoutData: new SplitterLayoutData({size: "auto"})}),
			oBtn3 = new Button({layoutData: new SplitterLayoutData({size: "auto"})}),
			oResizeEventHandler = this.stub();

		var oSplitter = new Splitter({
			orientation: "Vertical",
			contentAreas: [oBtn1, oBtn2, oBtn3],
			resize: oResizeEventHandler
		});

		var oPanel = new Panel({
			height: "auto",
			content: [oSplitter]
		});

		// Act
		oPanel.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		fnTriggerResize();
		this.clock.runAll();
		fnTriggerResize();
		this.clock.runAll();
		fnTriggerResize();
		this.clock.runAll();

		// Assert
		assert.strictEqual(oResizeEventHandler.callCount, 1, "Resizing shouldn't happen infinite times.");

		// Clean up
		oPanel.destroy();
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;
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
		var oLogSpy = this.spy(Log, "warning");
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.ok(
			oLogSpy.calledWith("The set sizes and minimal sizes of the splitter contents are bigger than the available space in the UI."),
			"Warning is logged"
		);
	});

	QUnit.test("There is NO warning when there is enough space to fit the content", function (assert) {
		// arrange
		var oLogSpy = this.spy(Log, "warning");
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.notOk(
			oLogSpy.calledWith(
				"The set sizes and minimal sizes of the splitter contents are bigger than the available space in the UI. " +
				"Some of the sizes have to be reduced or sap.ui.layout.ResponsiveSplitter should be used instead"
			),
			"Warning is not logged"
		);
	});

	QUnit.module("Nested Splitters");

	QUnit.test("Styles of parent horizontal splitter shouldn't affect child vertical splitter", function (assert) {
		// arrange
		var oVerticalSplitter = new Splitter({
			orientation: Orientation.Vertical,
			contentAreas: [
				new Button()
			]
		});
		var oHorizontalSplitter = new Splitter({
			contentAreas: [
				oVerticalSplitter
			]
		});
		oHorizontalSplitter.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.strictEqual(
			getComputedStyle(oVerticalSplitter.getDomRef("content-0")).display,
			"block",
			"'display' property of nested vertical splitter should be 'block'"
		);

		// clean up
		oHorizontalSplitter.destroy();
	});

	QUnit.module("Focus", {
		beforeEach: createTestSplitter,
		afterEach: function() {
			this.oSplitter.destroy();
		}
	});

	QUnit.test("Focus DOM ref", function (assert) {
		// arrange
		const expectedFocusDomRef = this.oSplitter.getDomRef("splitbar-0");

		// assert
		assert.strictEqual(this.oSplitter.getFocusDomRef(), expectedFocusDomRef, "Focus DOM ref should be correct");
	});

	QUnit.test("Focus DOM ref when the splitter has no bars", async function (assert) {
		// arrange
		this.oSplitter.destroyContentAreas();

		await nextUIUpdate();

		const expectedFocusDomRef = this.oSplitter.getDomRef();

		// assert
		assert.strictEqual(this.oSplitter.getFocusDomRef(), expectedFocusDomRef, "Focus DOM ref should be correct");
	});
});
