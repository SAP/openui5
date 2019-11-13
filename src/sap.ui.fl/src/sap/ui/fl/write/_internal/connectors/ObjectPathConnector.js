/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector"
], function(
	merge,
	BaseConnector
) {
	"use strict";

	/**
	 * Empty connector since we don't support writing to a file.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.ObjectPathConnector
	 * @since 1.73
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	return merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.ObjectPathConnector */ {
		layers: []
	});
}, true);
