/*!
 * ${copyright}
 */

sap.ui.define(["./Rect", "./Polygon", "./Circle"], function (Rect, Polygon, Circle) {
	"use strict";

	var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

	/**
	 * Return new Shape (Rect, Polygon, Circle) instance from given shape type
	 * @param sShape {string} shape type
	 * @return {Shape} (Rect, Polygon, Circle)
	 */
	function create(sShape) {
		switch (sShape) {
			case 'rect':
				return new Rect().createShape(SVG_NAMESPACE, sShape);
			case 'poly':
				return new Polygon().createShape(SVG_NAMESPACE, "polygon");
			case 'circle':
				return new Circle().createShape(SVG_NAMESPACE, sShape);
			default:
		}
	}

	return {
		create: create
	};
});