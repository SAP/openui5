/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.odata.MessageScope
sap.ui.define(function() {
	"use strict";


	/**
	 * Different scopes for retrieving messages from a service consumed via a
	 * {@link sap.ui.model.odata.v2.ODataModel}.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.model.odata.MessageScope
	 * @see sap.ui.model.ODataModel#constructor
	 */
	var MessageScope = {
		/**
		 * Retrieve messages only for the requested or changed entities.
		 * @public
		 */
		RequestedObjects: "RequestedObjects",

		/**
		 * Retrieve messages for the requested or changed entities and for all their child entities
		 * that belong to the same business object. The service needs to set the OData V2 annotation
		 * "message-scope-supported" at the <code>EntityContainer</code> to <code>true</code>. If
		 * the service does set this OData V2 annotation, the OData model falls back to
		 * <code>sap.ui.model.odata.MessageScope.RequestedObjects</code>.
		 * @public
		 */
		BusinessObject: "BusinessObject"
	};

	return MessageScope;

}, /* bExport= */ true);
