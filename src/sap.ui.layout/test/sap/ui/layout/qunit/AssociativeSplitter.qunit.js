/*global QUnit  */

sap.ui.define([
	"sap/ui/layout/AssociativeSplitter",
	"sap/m/Button",
	"sap/m/ScrollContainer",
	"sap/ui/dom/units/Rem"
], function(
	AssociativeSplitter,
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
		oSecondContentArea.getLayoutData().setMinSize(100);
		this.oSplitter.onmousedown({ target: oSecondSplitterBar }); // used to set _oLastDOMclicked
		this.oSplitter.ondblclick({ target: this.oSplitter.$()[0] });

		// assert
		assert.strictEqual(oSecondContentArea.getLayoutData().getSize(), "10%", "Double clicking a bar should change the corresponding area size but not less than 'minSize'.");

		// cleanup
		this.oSplitter._onBarMoveEnd({ changedTouches: false }); // used to deregister event listeners added onmousedown
	});

	QUnit.module("Responsiveness", {
		beforeEach: function () {
			this.oSplitter = new AssociativeSplitter("splitter");
			this.oContainer = new ScrollContainer({content: this.oSplitter, width: "400px", height: "300px"});
			this.oSplitter.addAssociatedContentArea(new Button());
			this.oSplitter.addAssociatedContentArea(new Button());

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

		sap.ui.getCore().byId(this.oSplitter.getAssociatedContentAreas()[0]).getLayoutData().setSize("100px");
		this.oContainer.setWidth("500px");
		sap.ui.getCore().applyChanges();

		aCalculatedSizes = this.oSplitter.getCalculatedSizes();
		iFirstContentAreaWidth = aCalculatedSizes[0];
		iSecondContentAreaWidth = aCalculatedSizes[1];

		assert.strictEqual(iFirstContentAreaWidth + iSecondContentAreaWidth, iExpectedWidth, "Sum of the widths of content areas should be equal to the size of the container minus the splitterbar(0.25rem)");
	});

	QUnit.test("Calculations should be done with 5 digit precision", function (assert) {
		// setup
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
		var oFirstContentItem = this.oSplitter._getContentAreas()[0],
			iSize;

		// act
		oFirstContentItem.getLayoutData().setSize("25%");
		this.oSplitter._recalculateSizes();

		// assert
		iSize = this.oSplitter.getCalculatedSizes()[0];
		assert.strictEqual(iSize, 100, "Content area size should be exactly 25% of the parent (100px)");

		// act
		this.oContainer.setWidth("1000px");
		sap.ui.getCore().applyChanges();

		// assert
		iSize = this.oSplitter.getCalculatedSizes()[0];
		assert.strictEqual(iSize, 250, "Content area size should be exactly 25% of the parent (250px)");
	});

	QUnit.test("Content area with minSize", function (assert) {
		// arrange
		var oFirstContentItem = this.oSplitter._getContentAreas()[0],
			oSecondContentItem = this.oSplitter._getContentAreas()[1],
			aSizes;

		// act
		oFirstContentItem.getLayoutData().setMinSize(200);
		oSecondContentItem.getLayoutData().setMinSize(30);

		// act
		this.oContainer.setWidth("300px");
		sap.ui.getCore().applyChanges();

		// assert
		aSizes = this.oSplitter.getCalculatedSizes();
		assert.ok(aSizes[0] >= 200, "Content area should NOT get lower width than its 'minSize'.");
		assert.ok(aSizes[1] >= 30, "Content area should NOT get lower width than its 'minSize'.");
	});
});
