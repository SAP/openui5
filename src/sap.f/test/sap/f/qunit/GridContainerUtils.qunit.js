/*global QUnit */

sap.ui.define([
	"sap/f/GridContainerUtils",
	"sap/ui/core/Core",
	"sap/m/Text"
],
function (
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

	QUnit.test("#isBelow", function (assert) {
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
		assert.ok(GridContainerUtils.isBelow(oElemAbove, oElemBelow), "'ElemBelow' is below 'oElemAbove'");

		// clean up
		oElemAbove.destroy();
		DOM_RENDER_LOCATION.removeChild(oElemBelow);
	});

	QUnit.test("#isAbove", function (assert) {
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
		assert.ok(GridContainerUtils.isAbove(oElemAbove, oElemBelow), "'oElemAbove' is above 'ElemBelow'");

		// clean up
		oElemAbove.destroy();
		DOM_RENDER_LOCATION.removeChild(oElemBelow);
	});

	QUnit.test("#findClosest", function (assert) {
		// (x, y) coordinates
		// (0,   0) (100,   0) (200,   0) (300,   0) (400,   0) (500,   0)
		// (0, 100) (100, 100) (200, 100) (300, 100) (400, 100) (500, 100)
		// (0, 200) (100, 200) (200, 200) (300, 200) (400, 200) (500, 200)
		//
		//
		//          (100, 500)

		// arrange
		var aElems = [];

		for (var i = 0; i < 16; i++) {
			var oDiv = createDiv(Math.floor(i / 6) * 100, i % 6 * 100);
			aElems.push(oDiv);
			DOM_RENDER_LOCATION.appendChild(oDiv);
		}

		var oElem = new Text();
		oElem.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		oElem.$().css({
			top: 500,
			left: 100,
			position: "absolute"
		});

		var oClosestItem = GridContainerUtils.findClosest(oElem, aElems),
			oExpectedItem = aElems[13];

		// Assert
		assert.strictEqual(oClosestItem, oExpectedItem, "The correct item is found");

		// clean up
		aElems.forEach(function (oElem) {
			DOM_RENDER_LOCATION.removeChild(oElem);
		});
		oElem.destroy();
	});

});
