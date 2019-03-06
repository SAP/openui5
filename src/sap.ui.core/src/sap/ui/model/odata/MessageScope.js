/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.odata.MessageScope
sap.ui.define(function() {
	"use strict";


	/**
	 * Different scopes for retrieving messages from a service.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.model.odata.MessageScope
	 * @see sap.ui.model.ODataModel#constructor
	 */
	var MessageScope = {
		/**
		 * Retrieve messages only for the requested/changed entities.
		 * @public
		 */
		RequestedObjects: "RequestedObjects",

		/**
		 * Retrieve messages for the whole business object. If the service does
		 * not support this option it fallbacks to requested.
		 * @public
		 */
		BusinessObject: "BusinessObject"
	};

	return MessageScope;

}, /* bExport= */ true);
