/*!
 * ${copyright}
 */

sap.ui.define(["./Shape"], function (Shape) {
	"use strict";

	/**
	 *
	 * @constructor
	 */
	var Polygon = Shape.extend();

	Polygon.prototype.setPosition = function (sCoords) {
		this.oContainer.setAttribute("points", sCoords);
	};

	return Polygon;

});