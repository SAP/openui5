/*!
 * ${copyright}
 */

sap.ui.define(["./shapes/ShapeFactory"], function (ShapeFactory) {
	"use strict";

	var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

	/**
	 *
	 * @param oContainer {Node} node an HTML DOM to which the overlay should be attached
	 * @return {SVGSVGElement}
	 */
	function createSVG(oContainer) {
		var oSvg = document.createElementNS(SVG_NAMESPACE, 'svg'),
			oRect = oContainer.getBoundingClientRect(),
			fWidth = oRect.width,
			fHeight = oRect.height;

		oSvg.setAttribute('viewBox', '0 0 ' + fWidth + ' ' + fHeight);

		oSvg.setAttribute('class', 'overlay');

		oContainer.appendChild(oSvg);

		return oSvg;
	}

	/**
	 *
	 * @param oContainer {Node} node an HTML DOM to which the overlay should be attached.
	 * @constructor
	 */
	function Overlay(oContainer) {
		this.oContainer = createSVG(oContainer);

		// map for the svg shapes (rect, polygon, circle)
		this.oShapes = {};

		// current shape type (string)
		this.sCurrentShapeType = '';
	}

	Overlay.prototype.setSize = function (fWidth, fHeight) {
		this.oContainer.setAttribute('viewBox', '0 0 ' + fWidth + ' ' + fHeight);
	};

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
			oShape.setPosition(sCoords);

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