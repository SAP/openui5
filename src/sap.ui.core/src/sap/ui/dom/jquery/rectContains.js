/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/base/assert"], function(jQuery, assert) {
	"use strict";

	/**
	 * Applies the jQuery function extension:
	 * @see jQuery#rectContains
	 *
	 * @namespace
	 * @alias module:sap/ui/dom/jquery/rectContains
	 * @public
	 */

	/*
	 * @private
	 */
	var fnRectContains = function rectContains(iPosX, iPosY) {
		assert(!isNaN(iPosX), "iPosX must be a number");
		assert(!isNaN(iPosY), "iPosY must be a number");

		var oRect = this.rect();

		if (oRect) {

			return iPosX >= oRect.left
				&& iPosX <= oRect.left + oRect.width
				&& iPosY >= oRect.top
				&& iPosY <= oRect.top + oRect.height;

		}
		return false;
	};

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
	 */
	jQuery.fn.rectContains = fnRectContains;

	return jQuery;

});

