/*global QUnit sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/layout/SplitPane',
	'sap/ui/layout/PaneContainer',
	'sap/ui/layout/AssociativeSplitter',
	'sap/ui/layout/SplitterLayoutData',
	'sap/m/Button',
	'sap/m/ScrollContainer'
], function(
	jQuery,
	SplitPane,
	PaneContainer,
	AssociativeSplitter,
	SplitterLayoutData,
	Button,
	ScrollContainer) {
	'use strict';

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

	QUnit.test("Finding index of associated content area", function (assert) {
		// arrange
		var oArea1 = new Button(),
			oArea2 = new Button(),
			iIndex1,
			iIndex2;

		// act
		this.oSplitter.addAssociatedContentArea(oArea1);
		iIndex1 = this.oSplitter.indexOfAssociatedContentArea(oArea1);
		iIndex2 = this.oSplitter.indexOfAssociatedContentArea(oArea2);

		// assert
		assert.strictEqual(iIndex1, 0, "Index of the first added area should be 1.");
		assert.strictEqual(iIndex2, -1, "Should return -1 for area, which is not added to the splitter.");
	});

	QUnit.test("Inserting content area at given index", function (assert) {
		// arrange
		var oArea1 = new Button(),
			oArea2 = new Button(),
			oArea3 = new Button();

		// act
		this.oSplitter.insertAssociatedContentArea(oArea1, 0);
		this.oSplitter.insertAssociatedContentArea(oArea2, 1);
		this.oSplitter.insertAssociatedContentArea(oArea3, 0);

		// assert
		assert.strictEqual(this.oSplitter.indexOfAssociatedContentArea(oArea1), 1, "Area1 should be shifted with 1 position.");
		assert.strictEqual(this.oSplitter.indexOfAssociatedContentArea(oArea2), 2, "Area2 should be shifted with 1 position.");
		assert.strictEqual(this.oSplitter.indexOfAssociatedContentArea(oArea3), 0, "Area3 should be inserted at the beginning.");

		// act
		this.oSplitter.insertAssociatedContentArea(oArea1, 0);

		// assert
		assert.strictEqual(this.oSplitter.indexOfAssociatedContentArea(oArea1), 0, "Inserting area with the same ID should move it to the new index.");
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

	QUnit.test("Mousedown", function (assert) {
		// arrange
		var oStub = sinon.stub(this.oSplitter, "_onBarMoveStart"),
			oSplitterBar = this.oSplitter.$().children("#splitter-splitbar-0")[0],
			oSplitterBarIcon = this.oSplitter.$().find("#splitter-splitbar-0-icon")[0],
			oContentArea = this.oSplitter.$().children("#splitter-content-0")[0];

		// act and assert
		this.oSplitter.onmousedown({ target: oContentArea });
		assert.strictEqual(oStub.callCount, 0, "Clicking on content area should NOT trigger _onBarMoveStart");

		oStub.resetHistory();
		this.oSplitter.onmousedown({ target: oSplitterBar });
		assert.strictEqual(oStub.callCount, 1, "Clicking on a splitter bar should trigger _onBarMoveStart");

		oStub.resetHistory();
		this.oSplitter.onmousedown({ target: oSplitterBarIcon });
		assert.strictEqual(oStub.callCount, 1, "Clicking on a splitter bar icon should trigger _onBarMoveStart");

		// cleanup
		oStub.restore();
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

	QUnit.test("Touchstart", function (assert) {
		// arrange
		var oStub = sinon.stub(AssociativeSplitter.prototype, "_onBarMoveStart"),
			oSplitterBar = this.oSplitter.$().children("#splitter-splitbar-0")[0],
			oSplitterBarIcon = this.oSplitter.$().find("#splitter-splitbar-0-icon")[0],
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
		oFakeEvent.target = oSplitterBarIcon;
		this.oSplitter.ontouchstart(oFakeEvent);
		assert.strictEqual(oStub.callCount, 1, "Touch on a splitter bar icon should trigger _onBarMoveStart");

		// cleanup
		oStub.restore();
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
			aCalculatedSizes;

		sap.ui.getCore().byId(this.oSplitter.getAssociatedContentAreas()[0]).getLayoutData().setSize("100px");
		this.oContainer.setWidth("500px");
		sap.ui.getCore().applyChanges();

		aCalculatedSizes = this.oSplitter.getCalculatedSizes();
		iFirstContentAreaWidth = aCalculatedSizes[0];
		iSecondContentAreaWidth = aCalculatedSizes[1];

		assert.strictEqual(iFirstContentAreaWidth + iSecondContentAreaWidth, 496, "Sum of the widths of content areas should be equal to the size of the container minus the splitterbar(0.25rem)");
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
