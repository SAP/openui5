/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Checks whether or not the object is a browser window.
	 *
	 * @function
	 * @private
	 * @exports sap/base/util/isWindow
	 * @param {object} obj the object which is going to be checked
	 * @returns {boolean} whether or not the object is a browser window
	 */
	var fnIsWindow = function(obj) {
		// no need to check for environments without window
		if (typeof window === "undefined") {
			return false;
		}
		return obj != null && obj === obj.window;
	};
	return fnIsWindow;
});