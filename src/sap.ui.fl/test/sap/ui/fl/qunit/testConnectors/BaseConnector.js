/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector"
], function(
	merge,
	BaseConnector
) {
	"use strict";

	return merge({}, BaseConnector, {
		layers: ["ALL"]
	});
});