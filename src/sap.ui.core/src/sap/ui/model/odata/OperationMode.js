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
		Client: "Client",

		/**
		 * With operation mode <code>Auto</code>, operations are either processed on the client or
		 * on the server. The exact behavior depends on the configured {@link sap.ui.model.odata.CountMode CountMode},
		 * on the <code>threshold</code> and on the size of the data:
		 * <ol>
		 * <li>Count Modes <code>Request</code> and <code>Both</code><br>
		 * Initially the binding will issue a <code>$count</code> request without any filters/sorters.
		 *   <ol type="a">
		 *   <li>If the count is lower or equal to the threshold, the binding will behave like in operation mode
		 *       <code>Client</code>, and a data request for all entries is issued.</li>
		 *   <li>If the count exceeds the threshold, the binding will behave like in operation mode <code>Server</code>.</li>
		 *   </ol>
		 * </li>
		 *
		 * <li>Count Modes <code>Inline</code> or <code>InlineRepeat</code><br>
		 * The initial request tries to fetch as many entries as configured with the <code>threshold</code> parameter,
		 * without specifying any filters/sorters. In addition, the query parameter <code>$inlinecount</code> is added.
		 * The binding assumes, that the threshold given by the application can be met, but it adapts its behavior
		 * depending on the response:
		 *   <ol type="a">
		 *   <li>If the response returns fewer (or just as many) entries as the threshold, the binding will behave exactly
		 *       like when using the operation mode <code>Client</code>. Initially configured filters/sorters will be
		 *       applied afterwards on the client.</li>
		 *   <li>If the <code>$inlinecount</code> is higher than the threshold, the binding will behave like in operation
		 *       mode <code>Server</code>. In this case a new data request containing the initially set filters/sorters
		 *       will be issued.</li>
		 *   </ol>
		 * It is up to the application to chose an appropriate threshold value. Ideally, it should be high enough
		 * to fetch all data in the most common scenarios (to avoid a fallback to operation mode <code>Server</code>,
		 * requiring an additional request), but it also should be low enough to ensure a fast response in case there
		 * is much more data than expected.
		 * </li>
		 * <li>Count mode <code>None</code> is not supported together with operation mode <code>Auto</code></li>
		 * </ol>
		 *
		 * @deprecated As of 1.102.0, because filtering and sorting may lead to different results
		 *   when executed on the client and on the server, and thus to inconsistent behavior. If it
		 *   is certain that the collection is completely loaded on the client, use
		 *   {@link sap.ui.model.odata.OperationMode.Client}; otherwise, use
		 *   {@link sap.ui.model.odata.OperationMode.Default} or
		 *   {@link sap.ui.model.odata.OperationMode.Server}.
		 * @public
		 */
		Auto: "Auto"
	};

	return OperationMode;

}, /* bExport= */ true);
