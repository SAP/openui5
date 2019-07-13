/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/base/assert", "sap/ui/dom/jquery/rect"], function(jQuery, assert) { // jQuery Plugin "rect"
	"use strict";

	/**
	 * This module provides the {@link jQuery#rectContains} API.
	 *
	 * @namespace
	 * @name module:sap/ui/dom/jquery/rectContains
	 * @public
	 * @since 1.58
	 */

	/**
	 * Returns whether a point described by X and Y is inside this Rectangle's boundaries.
	 *
	 * @param {int} iPosX The X coordinate
	 * @param {int} iPosY The Y coordinate
	 * @return {boolean} Whether X and Y are inside this Rectangle's boundaries
	 * @public
	 * @name jQuery#rectContains
	 * @author SAP SE
	 * @since 0.18.0
	 * @function
	 * @requires module:sap/ui/dom/jquery/rectContains
	 */
	var fnRectContains = function rectContains(iPosX, iPosY) {
		assert(!isNaN(iPosX), "iPosX must be a number");
		assert(!isNaN(iPosY), "iPosY must be a number");

		// jQuery Plugin "rect"
		var oRect = this.rect();

		if (oRect) {

			return iPosX >= oRect.left
				&& iPosX <= oRect.left + oRect.width
				&& iPosY >= oRect.top
				&& iPosY <= oRect.top + oRect.height;

		}
		return false;
	};

	jQuery.fn.rectContains = fnRectContains;

	return jQuery;

});

