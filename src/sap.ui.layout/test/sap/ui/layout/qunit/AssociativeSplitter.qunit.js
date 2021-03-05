/*global QUnit  */

sap.ui.define([
	"sap/ui/layout/AssociativeSplitter",
	"sap/ui/layout/SplitterLayoutData",
	"sap/m/Button",
	"sap/m/ScrollContainer",
	"sap/ui/dom/units/Rem"
], function(
	AssociativeSplitter,
	SplitterLayoutData,
	Button,
	ScrollContainer,
	Rem
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("API", {
		beforeEach: function () {
			this.oSplitter = new AssociativeSplitter();
		},
		afterEach: function () {
			this.oSplitter._getContentAreas().forEach(function (oArea) {
				oArea.destroy();
			});
			this.oSplitter.destroy();
			this.oSplitter = null;
		}
	});

	QUnit.test("layoutData is added, after adding an associatedContentArea", function (assert) {
		var oButton = new Button();
		this.oSplitter.addAssociatedContentArea(oButton);
		assert.ok(oButton.getLayoutData(), "Adding associated content area without layoutData should directly receive such.");
	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oSplitter = new AssociativeSplitter("splitter");
			this.oSplitter.addAssociatedContentArea(new Button());
			this.oSplitter.addAssociatedContentArea(new Button());
			this.oSplitter.addAssociatedContentArea(new Button());
			this.oSplitter.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oSplitter._getContentAreas().forEach(function (oArea) {
				oArea.destroy();
			});
			this.oSplitter.destroy();
			this.oSplitter = null;
		}
	});

	QUnit.test("Double click", function (assert) {
		// arrange
		var oFirstSplitterBar = this.oSplitter.$().children("#splitter-splitbar-0")[0],
			oSecondSplitterBar = this.oSplitter.$().children("#splitter-splitbar-1")[0],
			oFirstContentArea = this.oSplitter._getContentAreas()[0],
			oSecondContentArea = this.oSplitter._getContentAreas()[1];

		// assert
		assert.strictEqual(oFirstContentArea.getLayoutData().getSize(), "auto", "Default size of splitter layout data should be auto.");

		// act
		this.oSplitter.onmousedown({ target: oFirstSplitterBar }); // used to set _oLastDOMclicked
		this.oSplitter.ondblclick({ target: this.oSplitter.$()[0] });

		// assert
		assert.strictEqual(oFirstContentArea.getLayoutData().getSize(), "0%", "Double clicking a bar should change the corresponding area size.");

		// cleanup
		this.oSplitter._onBarMoveEnd({ changedTouches: false }); // used to deregister event listeners added onmousedown

		// act
		var sExpectedSize = (100 / this.oSplitter._calcAvailableContentSize() * 100) + "%";
		oSecondContentArea.getLayoutData().setMinSize(100);
		this.oSplitter.onmousedown({ target: oSecondSplitterBar }); // used to set _oLastDOMclicked
		this.oSplitter.ondblclick({ target: this.oSplitter.$()[0] });

		// assert
		assert.strictEqual(oSecondContentArea.getLayoutData().getSize(), sExpectedSize, "Double clicking a bar should change the corresponding area size but not less than 'minSize'.");

		// cleanup
		this.oSplitter._onBarMoveEnd({ changedTouches: false }); // used to deregister event listeners added onmousedown
	});

	QUnit.module("Responsiveness", {
		beforeEach: function () {
			this.oSplitter = new AssociativeSplitter("splitter");
			this.oContainer = new ScrollContainer({content: this.oSplitter, width: "400px", height: "300px"});
			this.oContainer.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oSplitter._getContentAreas().forEach(function (oArea) {
				oArea.destroy();
			});
			this.oContainer.destroy();
			this.oSplitter = null;
		}
	});

	QUnit.test("After resize of a SplitBar", function (assert) {
		var iFirstContentAreaWidth, iSecondContentAreaWidth,
			aCalculatedSizes,
			iExpectedWidth = 500 - Rem.toPx(1); // 1rem is the size of the splitter bar;

		this.oSplitter.addAssociatedContentArea(new Button({
			layoutData: new SplitterLayoutData({
				size: "100px"
			})
		}));
		this.oSplitter.addAssociatedContentArea(new Button());
		this.oContainer.setWidth("500px");
		sap.ui.getCore().applyChanges();

		aCalculatedSizes = this.oSplitter.getCalculatedSizes();
		iFirstContentAreaWidth = aCalculatedSizes[0];
		iSecondContentAreaWidth = aCalculatedSizes[1];

		assert.strictEqual(iFirstContentAreaWidth + iSecondContentAreaWidth, iExpectedWidth, "Sum of the widths of content areas should be equal to the size of the container minus the splitterbar(0.25rem)");
	});

	QUnit.test("Calculations should be done with 5 digit precision", function (assert) {
		// setup
		this.oSplitter.addAssociatedContentArea(new Button());
		this.oSplitter.addAssociatedContentArea(new Button());
		this.oSplitter._move.c1Size = 20.000000000000153;
		this.oSplitter._move.c2Size = 599.9999999999998;

		// act
		this.oSplitter._resizeContents(0, -20, true);

		// assert
		// Before that fix this code would throw and exception and the test would fail.
		assert.ok(true, "Resizing should be successful");
	});

	QUnit.test("Content area with % width", function (assert) {
		// arrange
		var oFirstContentItem = new Button({
			layoutData: new SplitterLayoutData({
				size: "25%"
			})
		});
		this.oSplitter.addAssociatedContentArea(oFirstContentItem);
		this.oSplitter.addAssociatedContentArea(new Button());

		// act
		this.oSplitter.setWidth("400px");
		this.oSplitter._recalculateSizes();

		// assert
		var iExpectedSize = 25 * this.oSplitter._calcAvailableContentSize() / 100;
		assert.strictEqual(this.oSplitter.getCalculatedSizes()[0], iExpectedSize, "Content area size should be exactly 25% of the available width (bars excluded)");

		// act
		this.oContainer.setWidth("1000px");
		sap.ui.getCore().applyChanges();

		// assert
		iExpectedSize = 25 * this.oSplitter._calcAvailableContentSize() / 100;
		assert.strictEqual( this.oSplitter.getCalculatedSizes()[0], iExpectedSize, "Content area size should be exactly 25% of the available width (bars excluded)");
	});

	QUnit.test("Content area with minSize", function (assert) {
		// arrange
		var aSizes;
		this.oSplitter.addAssociatedContentArea(new Button({
			layoutData: new SplitterLayoutData({
				minSize: 200
			})
		}));
		this.oSplitter.addAssociatedContentArea(new Button({
			layoutData: new SplitterLayoutData({
				minSize: 30
			})
		}));

		// act
		this.oContainer.setWidth("300px");
		sap.ui.getCore().applyChanges();

		// assert
		aSizes = this.oSplitter.getCalculatedSizes();
		assert.ok(aSizes[0] >= 200, "Content area should NOT get lower width than its 'minSize'.");
		assert.ok(aSizes[1] >= 30, "Content area should NOT get lower width than its 'minSize'.");
	});

	QUnit.test("Calculation of % when they are more than available space, but set by app developer (should have truncation)", function (assert) {
		// arrange
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
		sap.ui.getCore().applyChanges();
		var aAreas = this.oSplitter._getContentAreas(),
			iFirstAreaWidth = aAreas[0].$().parent().width(),
			iSecondAreaWidth = aAreas[1].$().parent().width(),
			iExpectedSecondAreaWidth = Math.floor(60 * this.oSplitter._calcAvailableContentSize() / 100); // 60%

		// assert
		assert.strictEqual(iFirstAreaWidth, 500, "Area width is set to its minSize");
		assert.strictEqual(iSecondAreaWidth, iExpectedSecondAreaWidth, "Area width is set to 60% of content size");
		assert.ok(iFirstAreaWidth + iSecondAreaWidth >= iTotalWidth, "Calculated space exceeds available width. No correction applied.");
	});

	QUnit.test("Calculation of % when they are more than available space but set by AssociativeSplitter (should NOT have truncation)", function (assert) {
		// arrange
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
		sap.ui.getCore().applyChanges();
		var $bar = this.oSplitter.$().children("#splitter-splitbar-0");

		// act - move the bar
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

		// assert
		assert.strictEqual(iFirstAreaWidth, iFirstAreaMinSize, "Area width is set to its minSize");

		// act - shrink the whole splitter
		this.oSplitter.setWidth("600px");
		sap.ui.getCore().applyChanges();
		var iSecondAreaWidthAfterParentShrink = aAreas[1].$().parent().width();

		assert.ok(iSecondAreaWidthAfterParentShrink < iSecondAreaWidthBeforeParentShrink, "Second area had shrunk");
		assert.ok(iFirstAreaWidth + iSecondAreaWidthAfterParentShrink <= iTotalWidth, "Calculated space doesn't exceed available width. Correction applied.");
	});

	QUnit.test("Calculation of % when there is only 1 area", function (assert) {
		// arrange
		var oArea = new Button({
			layoutData: new SplitterLayoutData({
				size: "10%"
			})
		});
		this.oSplitter.addContentArea(oArea);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oArea.$().parent().width(), this.oSplitter._calcAvailableContentSize(), "Single area sized with % should take the whole space");
	});
});
