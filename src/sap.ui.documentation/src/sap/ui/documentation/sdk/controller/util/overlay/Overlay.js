/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/Log",  "./shapes/ShapeFactory"], function (Log, ShapeFactory) {
	"use strict";

	var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

	/**
	 *
	 * @param oContainer {Node} node an HTML DOM to which the overlay should be attached
	 * @return {SVGSVGElement}
	 */
	function createSVG(oContainer) {
		var oSvg = document.createElementNS(SVG_NAMESPACE, 'svg'),
			fWidth = oContainer.getBoundingClientRect().width,
			fHeight = oContainer.getBoundingClientRect().height;

		oSvg.setAttribute('height', fWidth);
		oSvg.setAttribute('width', fHeight);

		oSvg.setAttribute('class', 'overlay');

		oContainer.appendChild(oSvg);

		return oSvg;
	}

	/**
	 *
	 * @param oContainer {Node} node an HTML DOM to which the overlay should be attached.
	 * @constructor
	 */
	function Overlay (oContainer) {
		this.oContainer = createSVG(oContainer);

		// map for the svg shapes (rect, polygon, circle)
		this.oShapes = {};

		// current shape type (string)
		this.sCurrentShapeType = '';
	}

	/**
	 * Sets shape state/position. If there is no shape of that type, creates new one and stores it in the shape map
	 * @param sShape {string} shape type (rect, polygon, circle)
	 * @param sCoords {string} shape coordinates - varies between shape types
	 */
	Overlay.prototype.setShape = function (sShape, sCoords) {
		var oShape = this.oShapes[sShape];

		if (!oShape) {
			// new type of shape
			oShape = ShapeFactory.create(sShape, sCoords);

			this.oShapes[sShape] = oShape;
			this.oContainer.appendChild(oShape.oContainer);
		} else {
			// shape already created change it's position
			oShape.setPosition(sCoords);
		}

		this.sCurrentShapeType = sShape;
	};

	/**
	 * Returns the current overlay shape to be shown
	 * @return {*}
	 */
	Overlay.prototype.getCurrentShape = function () {
		return this.oShapes[this.sCurrentShapeType];
	};

	/**
	 * Changes the opacity of the current shape to 1
	 */
	Overlay.prototype.show = function () {
		var oShape = this.getCurrentShape();

		if (oShape) {
			oShape.show();
		}
	};

	/**
	 * Changes the opacity of the current shape to 0
	 */
	Overlay.prototype.hide = function () {
		var oShape = this.getCurrentShape();

		if (oShape) {
			oShape.hide();
		}
	};

	return Overlay;
});