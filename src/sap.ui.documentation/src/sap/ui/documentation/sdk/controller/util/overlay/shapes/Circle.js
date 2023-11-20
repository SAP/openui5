/*!
 * ${copyright}
 */

sap.ui.define(["./Shape"], function (Shape) {
	"use strict";

	/**
	 *
	 * @constructor
	 */
	var Circle = Shape.extend();

	Circle.prototype.setPosition = function (sCoords) {
		var aCoords = sCoords.split(","),
			oPosition = {
				cx: aCoords[0],
				cy: aCoords[1],
				r: aCoords[2]
			};

		this.oContainer.setAttribute("cx", oPosition.cx);
		this.oContainer.setAttribute("cy", oPosition.cy);
		this.oContainer.setAttribute("r", oPosition.r);
	};

	return Circle;
});