/*global QUnit  */

sap.ui.define([
	"sap/ui/layout/AssociativeSplitter",
	"sap/ui/layout/SplitterLayoutData",
	"sap/m/Button",
	"sap/m/ScrollContainer",
	"sap/ui/core/Core"
], function(
	AssociativeSplitter,
	SplitterLayoutData,
	Button,
	ScrollContainer,
	oCore
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
			oCore.applyChanges();
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
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oSplitter._getContentAreas().forEach(function (oArea) {
				oArea.destroy();
			});
			this.oContainer.destroy();
			this.oSplitter = null;
		}
	});

	QUnit.test("Calculation of % when there is only 1 area", function (assert) {
		// arrange
		var oArea = new Button({
			layoutData: new SplitterLayoutData({
				size: "10%"
			})
		});
		this.oSplitter.addContentArea(oArea);
		oCore.applyChanges();

		// assert
		assert.strictEqual(oArea.$().parent().width(), this.oSplitter._calcAvailableContentSize(), "Single area sized with % should take the whole space");
	});

});
