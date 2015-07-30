/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.OperationMode
sap.ui.define(function() {
	"use strict";


	/**
	* @class
	* Different modes for executing service operations (filtering, sorting)
	*
	* @static
	* @public
	* @alias sap.ui.model.odata.OperationMode
	*/
	var OperationMode = {
			/**
			 * Operations are executed on the Odata service, by appending corresponding URL parameters ($filter, $orderby).
			 * Each change in filtering or sorting is triggering a new request to the server.
			 * @public
			 */
			Server: "Server",
	
			/**
			 * Operations are executed on the client, all entries must be avilable to be able to do so.
			 * The initial request fetches the complete collection, filtering and sorting does not trigger further requests
			 * @public
			 */
			Client: "Client"
	};

	return OperationMode;

}, /* bExport= */ true);
