/*global QUnit */

sap.ui.define([
	"sap/f/GridContainer",
	"sap/f/GridContainerUtils",
	"sap/ui/core/Core",
	"sap/m/Text"
],
function (
	GridContainer,
	GridContainerUtils,
	Core,
	Text
) {
	"use strict";

	var DOM_RENDER_LOCATION = document.getElementById("qunit-fixture");

	function createDiv (fTop, fLeft) {
		var oDiv = document.createElement("div");

		oDiv.appendChild(document.createTextNode("this is div"));
		oDiv.style.border = "1px solid red";
		oDiv.style.position = "absolute";
		oDiv.style.top = fTop + "px";
		oDiv.style.left = fLeft + "px";

		return oDiv;
	}

	QUnit.module("Methods");

	QUnit.test("#_isBelow", function (assert) {
		// arrange
		var oElemAbove = new Text(),
			oElemBelow = createDiv(100, 0);

		oElemAbove.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		oElemAbove.$().css({
			top: 0,
			position: "absolute"
		});
		DOM_RENDER_LOCATION.appendChild(oElemBelow);

		// Assert
		assert.ok(GridContainerUtils._isBelow(oElemAbove.getDomRef(), oElemBelow), "'ElemBelow' is below 'oElemAbove'");

		// clean up
		oElemAbove.destroy();
		DOM_RENDER_LOCATION.removeChild(oElemBelow);
	});

	QUnit.test("#_isAbove", function (assert) {
		// arrange
		var oElemAbove = new Text(),
			oElemBelow = createDiv(0, 0);

		oElemAbove.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		oElemAbove.$().css({
			top: 100,
			position: "absolute"
		});
		DOM_RENDER_LOCATION.appendChild(oElemBelow);

		// Assert
		assert.ok(GridContainerUtils._isAbove(oElemAbove.getDomRef(), oElemBelow), "'oElemAbove' is above 'ElemBelow'");

		// clean up
		oElemAbove.destroy();
		DOM_RENDER_LOCATION.removeChild(oElemBelow);
	});

	QUnit.test("#_findClosest", function (assert) {
		// (x, y) coordinates
		// (0,   0) (100,   0) (200,   0) (300,   0) (400,   0) (500,   0)
		// (0, 100) (100, 100) (200, 100) (300, 100) (400, 100) (500, 100)
		// (0, 200) (100, 200) (200, 200) (300, 200) (400, 200) (500, 200)
		//
		//
		//          (100, 500)

		// arrange
		var aItems = [];
		var oItem = new Text({text: "(100, 500)"});
		var i = 0;
		oItem.placeAt(DOM_RENDER_LOCATION);

		for (i = 0; i < 16; i++) {
			var oCurrItem = new Text({text: "Item" + i});
			oCurrItem.placeAt(DOM_RENDER_LOCATION);
			aItems.push(oCurrItem);
		}
		Core.applyChanges();

		for (i = 0; i < aItems.length; i++) {
			aItems[i].$().css({
				left: i % 6 * 100,
				top: Math.floor(i / 6) * 100,
				position: "absolute",
				border: "1px solid red"
			});
		}

		oItem.$().css({
			left: 100,
			top: 500,
			position: "absolute"
		});

		var oClosestItem = GridContainerUtils._findClosest(oItem, aItems),
			oExpectedItem = aItems[13];

		// assert
		assert.strictEqual(oClosestItem, oExpectedItem, "The correct item is found");

		// clean up
		aItems.forEach(function (oItem) {
			oItem.destroy();
		});
		oItem.destroy();
	});

	QUnit.module("Finding drop targets", {
		beforeEach: function () {
			this.oGrid1 = new GridContainer({
				items: [new Text()]
			});
			this.oGrid2 = new GridContainer({
				items: [new Text()]
			});
			this.oGrid3 = new GridContainer({
				items: [new Text()]
			});

			this.oGrid1.placeAt(DOM_RENDER_LOCATION);
			this.oGrid2.placeAt(DOM_RENDER_LOCATION);
			this.oGrid3.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid1.destroy();
			this.oGrid2.destroy();
			this.oGrid3.destroy();
		}
	});

	QUnit.test("There are no drop targets above the first grid", function (assert) {
		var aTargets = GridContainerUtils.findDropTargetsAbove(this.oGrid1, this.oGrid1.getItems()[0]);

		assert.strictEqual(aTargets.length, 0, "There are no drop targets above the first grid");
	});

	QUnit.test("There are 2 drop targets below the first grid", function (assert) {
		var aTargets = GridContainerUtils.findDropTargetsBelow(this.oGrid1, this.oGrid1.getItems()[0]);

		assert.strictEqual(aTargets.length, 2, "There are 2 drop targets below the first grid");
	});

	QUnit.test("There are no drop targets below the last grid", function (assert) {
		var aTargets = GridContainerUtils.findDropTargetsBelow(this.oGrid3, this.oGrid3.getItems()[0]);

		assert.strictEqual(aTargets.length, 0, "There are no drop targets above the first grid");
	});

	QUnit.test("Targets are sorted", function (assert) {
		var aTargets = GridContainerUtils.findDropTargetsBelow(this.oGrid1, this.oGrid1.getItems()[0]);

		assert.strictEqual(aTargets[0].grid, this.oGrid2, "There are no drop targets above the first grid");
		assert.strictEqual(aTargets[1].grid, this.oGrid3, "There are no drop targets above the first grid");
	});

});
