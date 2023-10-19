/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.dt.
 */
sap.ui.define(function() {
	"use strict";

	/**
	 * Selection Mode of the designtime selection.
	 *
	 * @namespace
	 * @name sap.ui.dt.SelectionMode
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 */
	return {
		/**
		 * Select multiple overlays at a time.
		 * @public
		 */
		Multi: "Multi",

		/**
		 * Select one overlay at a time.
		 * @public
		 */
		Single: "Single"

	};
}, /* bExport= */ true);
