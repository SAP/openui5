/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.UpdateMethod
sap.ui.define(function() {
	"use strict";


	/**
	 * Different methods for update operations.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.model.odata.UpdateMethod
	 */
	var UpdateMethod = {
		/**
		 * Update requests will be send with HTTP method <code>MERGE</code>.
		 *
		 * @public
		 */
		MERGE: "MERGE",

		/**
		 * Update requests will be send with HTTP method <code>PUT</code>.
		 *
		 * @public
		 */
		PUT: "PUT",

		/**
		 * Deprecated to avoid different spellings, use {@link sap.ui.model.odata.UpdateMethod.MERGE} instead.
		 *
		 * @public
		 * @deprecated Since 1.133.0, use {@link sap.ui.model.odata.UpdateMethod.MERGE} instead
		 */
		Merge: "MERGE",

		/**
		 * Deprecated to avoid different spellings, use {@link sap.ui.model.odata.UpdateMethod.PUT} instead.
		 *
		 * @public
		 * @deprecated Since 1.133.0, use {@link sap.ui.model.odata.UpdateMethod.PUT} instead
		 */
		Put: "PUT"
	};

	return UpdateMethod;

}, /* bExport= */ true);
