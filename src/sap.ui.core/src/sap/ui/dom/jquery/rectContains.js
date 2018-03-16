/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/base/assert"], function(jQuery, assert) {
	"use strict";


	/*
	 * Returns whether a point described by X and Y is inside this Rectangle's boundaries.
	 *
	 * @param {int} iPosX The X coordinate
	 * @param {int} iPosY The Y coordinate
	 * @return {boolean} Whether X and Y are inside this Rectangle's boundaries
	 * @private
	 * @author SAP SE
	 * @function
	 * @exports sap/ui/dom/jquery/rectContains
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
	 * @private
	 * @name jQuery#rectContains
	 * @author SAP SE
	 * @function
	 * @deprecated since 1.48 use {@link sap/ui/dom/jquery/rectContains} instead
	 */
	jQuery.fn.rectContains = fnRectContains;

	return jQuery;

});

