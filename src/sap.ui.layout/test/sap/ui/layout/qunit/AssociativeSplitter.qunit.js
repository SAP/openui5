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

	QUnit.module("Responsiveness", {
		beforeEach: function () {
			this.oSplitter = new AssociativeSplitter();
			this.oContainer = new ScrollContainer({content: this.oSplitter, width: "400px", height: "300px"});
			this.oSplitter.addAssociatedContentArea(new Button());
			this.oSplitter.addAssociatedContentArea(new Button());

			this.oContainer.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oContainer.destroy();
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
});
