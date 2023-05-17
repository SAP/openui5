/*!
 * ${copyright}
 */

/**
 * Require boot.js asynchronous. Actually this is not possible as bundle
 * configuration so a helper is needed for now.
 * @private
 * @ui5-restricted sap.base, sap.ui.core
 */
(function() {
    "use strict";
	sap.ui.require(["sap/ui/core/boot"]);
})();