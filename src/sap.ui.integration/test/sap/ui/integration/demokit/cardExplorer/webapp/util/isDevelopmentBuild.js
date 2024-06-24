/*!
 * ${copyright}
 */
sap.ui.define([
], function(
) {
	"use strict";

    /**
     * Checks if the demokit installation is sapui5untested, sapui5nightly or localhost.
     *
     * @namespace
     * @private
     * @returns {boolean} Returns <code>true</code> if the demokit installation is sapui5untested, sapui5nightly or localhost.
     */
    function isDevelopmentBuild() {
		const sOrigin = window.location.origin;
		return sOrigin.indexOf("sapui5untested") > 0
			|| sOrigin.indexOf("sapui5nightly") > 0
			|| sOrigin.indexOf("localhost") > 0;
	}

    return isDevelopmentBuild;
});
