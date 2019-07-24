/*global QUnit sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/layout/SplitPane',
	'sap/ui/layout/PaneContainer',
	'sap/ui/layout/Splitter',
	'sap/ui/layout/SplitterLayoutData',
	'sap/ui/commons/Button',
	'sap/m/Panel'
], function(
	jQuery,
	SplitPane,
	PaneContainer,
	Splitter,
	SplitterLayoutData,
	Button,
	Panel
	) {
	'use strict';


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
			height: "100%",
			text: "Content!",
			layoutData: oLd
		});

		return oContent;
	}


	var oSplitter = new Splitter("mySplitter0", {
		contentAreas: [createExampleContent("100px"), createExampleContent("200px"), createExampleContent("300px")]
	});


	var iResizes = 0;
	var fnResize = function (oEvent) {
		++iResizes;
	};
	oSplitter.attachResize(fnResize);
	var iRenderings = 0;
	oSplitter.addDelegate({
		onAfterRendering: function () {
			++iRenderings;
		}
	});


	oSplitter.placeAt("qunit-fixture");

	sap.ui.getCore().applyChanges();

	QUnit.module("Absolute Area Sizes");

	QUnit.test("Absolute Horizontal sizing", function (assert) {
		oSplitter.setOrientation(sap.ui.core.Orientation.Horizontal);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("100px");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("200px");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("300px");
		var oDelegate = {
			onAfterRendering: function () {
				var aAreas = oSplitter.getContentAreas();
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
				var aAreas = oSplitter.getContentAreas();
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
			height: "100%",
			layoutData: new SplitterLayoutData({size: "300px"})
		});
		var oBtn2 = new Button({
			text: "Content 2",
			width: "100%",
			height: "100%",
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
		var i, oCurContainer,
			aSizes = [],
			aWidths = [];

		// System under Test
		var oContainer1 = new Button({
				text: "Content 1",
				width: "100%",
				height: '100%',
				layoutData: new SplitterLayoutData({size: "33.33%"})
			}),
			oContainer2 = new Button({
				text: "Content 2",
				width: "100%",
				height: '100%',
				layoutData: new SplitterLayoutData({size: "33.33%"})
			}),
			oContainer3 = new Button({
				text: "Content 3",
				width: "100%",
				height: '100%',
				layoutData: new SplitterLayoutData({size: "33.33%"})
			}),

			oSplitter = new Splitter({
				height: "500px",
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
				var aAreas = oSplitter.getContentAreas();
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
				var aAreas = oSplitter.getContentAreas();
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


	QUnit.module("Mixed Area Sizes");

	QUnit.test("Mixed horizontal sizing", function (assert) {
		oSplitter.setOrientation(sap.ui.core.Orientation.Horizontal);
		oSplitter.getContentAreas()[0].getLayoutData().setSize("10px");
		oSplitter.getContentAreas()[1].getLayoutData().setSize("auto");
		oSplitter.getContentAreas()[2].getLayoutData().setSize("10px");
		var oDelegate = {
			onAfterRendering: function () {
				var aAreas = oSplitter.getContentAreas();
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
				var aAreas = oSplitter.getContentAreas();
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
	// QUnit.test("Events and Rerendering", function (assert) {
	// 	assert.ok(iResizes === 3, "Number of resize-events fired (" + iResizes + ") is correct.");
	// 	assert.ok(iRenderings === 7, "Number of rerenderings (" + iRenderings + ") is correct.");
	// });

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
		sap.ui.getCore().applyChanges();


		oSplitter.addContentArea(addedItem);
		sap.ui.getCore().applyChanges();

		assert.ok(oSplitter.getContentAreas());
		assert.strictEqual(oSplitter.getContentAreas().length, 3, "Has 3 content areas");
		assert.strictEqual(oSplitter.getContentAreas()[2], addedItem, "Added an item at the end");

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
		sap.ui.getCore().applyChanges();


		oSplitter.insertContentArea(addedItem, 1);
		sap.ui.getCore().applyChanges();

		assert.ok(oSplitter.getContentAreas());
		assert.strictEqual(oSplitter.getContentAreas().length, 3, "Has 3 content areas");
		assert.strictEqual(oSplitter.getContentAreas()[1], addedItem, "Added an item at the proper index");

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
		sap.ui.getCore().applyChanges();

		assert.ok(oSplitter.getContentAreas());
		assert.strictEqual(oSplitter.getContentAreas().length, 1, "Has 1 content areas");


		oSplitter.removeContentArea(addedItem);
		sap.ui.getCore().applyChanges();

		assert.ok(oSplitter.getContentAreas());
		assert.strictEqual(oSplitter.getContentAreas().length, 0, "Has 3 content areas");

		oSplitter.destroy();
	});

	QUnit.test("removeAllContentArea", function (assert) {
		var oSplitter = new Splitter({
			contentAreas: [
				new Button(),
				new Button(),
				new Button(),
				new Button(),
				new Button()
			]
		});
		oSplitter.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(oSplitter.getContentAreas());
		assert.strictEqual(oSplitter.getContentAreas().length, 5, "Has 5 content areas");


		oSplitter.removeAllContentArea();
		sap.ui.getCore().applyChanges();

		assert.ok(oSplitter.getContentAreas());
		assert.strictEqual(oSplitter.getContentAreas().length, 0, "Has 0 content areas");

		oSplitter.destroy();
	});

	QUnit.test("destroyContentArea", function (assert) {
		var oBtn = new Button(),
			oSplitter = new Splitter({
				contentAreas: [
					oBtn
				]
			});
		oSplitter.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(oSplitter.getContentAreas());
		assert.strictEqual(oSplitter.getContentAreas().length, 1, "Has 1 content areas");


		oSplitter.destroyContentArea();
		sap.ui.getCore().applyChanges();

		assert.ok(oSplitter.getContentAreas());
		assert.strictEqual(oSplitter.getContentAreas().length, 0, "Has 0 content areas");
		assert.ok(oBtn.bIsDestroyed, "Content inside has been destroyed");

		oSplitter.destroy();
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
			oSplitterBarIcon = this.oSplitter.$().find("#splitter-splitbar-0-icon")[0],
			oContentArea = this.oSplitter.$().children("#splitter-content-0")[0];

		// act and assert
		this.oSplitter.onmousedown({ target: oContentArea });
		assert.strictEqual(oSpy.callCount, 0, "Clicking on content area should NOT trigger _onBarMoveStart");

		oSpy.resetHistory();
		this.oSplitter.onmousedown({ target: oSplitterBar });
		assert.strictEqual(oSpy.callCount, 1, "Clicking on a splitter bar should trigger _onBarMoveStart");

		oSpy.resetHistory();
		this.oSplitter.onmousedown({ target: oSplitterBarIcon });
		assert.strictEqual(oSpy.callCount, 1, "Clicking on a splitter bar icon should trigger _onBarMoveStart");

		// cleanup
		this.oSplitter._onBarMoveEnd({ changedTouches: false }); // used to deregister event listeners added onmousedown
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

		// var done = assert.async();
		var oResizeSpy = sinon.spy(oSplitter, "_resize");
		var done = assert.async();

		// Act
		oPanel.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		setTimeout(function () {
			// Assert
			assert.strictEqual(oResizeSpy.callCount, 2, "Should not call resize infinite times.");

			// Clean up
			// oPanel.destroy();
			done();
		}, 1000);
	});
});
