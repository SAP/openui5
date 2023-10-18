/*!
 * ${copyright}
 */
sap.ui.define([
	"./fetch",
	"sap/ui/base/SyncPromise"
], function (fetch, SyncPromise) {
	"use strict";

	/**
	 * Header values that can be used with the "Accept" and "Content-Type" headers
	 * in the fetch call or the response object.
	 *
	 * @type {Object}
	 * @private
	 * @ui5-restricted sap.ui.core
	 *
	 */
	mixedFetch.ContentTypes = fetch.ContentTypes;

	return mixedFetch;
});