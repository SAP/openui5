/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.odata.v4.SubmitMode
sap.ui.define(function() {
	"use strict";

	/**
	 * Modes to control the use of batch requests for a group ID.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.model.odata.v4.SubmitMode
	 */
	var SubmitMode = {
		/**
		 * Requests associated with the group ID are sent in a batch request via
		 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch}.
		 * @public
		 */
		API: "API",

		/**
		 * Requests associated with the group ID are sent in a batch request which is triggered
		 * automatically before rendering.
		 * @public
		 */
		Auto: "Auto",

		/**
		 * Requests associated with the group ID are sent directly without batch.
		 * @public
		 */
		Direct: "Direct"
	};

	return SubmitMode;

}, /* bExport= */ true);
