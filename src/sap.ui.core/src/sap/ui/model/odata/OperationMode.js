/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides enumeration sap.ui.model.OperationMode
sap.ui.define(function() {
	"use strict";


	/**
	 * Different modes for executing service operations (filtering, sorting)
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.model.odata.OperationMode
	 */
	var OperationMode = {
	 /**
	  * By default, all operations are executed on the server in the OData service request (<code>Server</code> mode).
	  * Only if the collection is already expanded and all entries are available on the client, all operations are executed
	  * on the client (<code>Client</code> mode).
	  * @public
	  */
	 Default: "Default",

	 /**
	  * Operations are executed on the server in the OData service request, by appending corresponding URL parameters
	  * (<code>$filter</code>, <code>$orderby</code>).
	  * Each change in filtering or sorting triggers a new request to the server.
	  * @public
	  */
	 Server: "Server",

	 /**
	  * Operations are executed on the client. This only works if all entries are loaded on the client.
	  * The initial request fetches the complete collection, filtering and sorting does not trigger further requests.
	  * @public
	  */
	 Client: "Client"
	};

	return OperationMode;

}, /* bExport= */ true);
