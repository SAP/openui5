/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/api/connectors/ObjectStorageConnector"
], function(
	merge,
	ObjectStorageConnector
) {
	"use strict";

	/**
	 * Connector for saving data to the <code>window.SessionStorage</code>.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.SessionStorageConnector
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var SessionStorageConnector = merge({}, ObjectStorageConnector, /** @lends sap.ui.fl.write._internal.connectors.SessionStorageConnector */ {
		storage: window.sessionStorage
	});

	SessionStorageConnector.loadFeatures = function(...aArgs) {
		return ObjectStorageConnector.loadFeatures.apply(this, aArgs)
		.then(function(oFeatures) {
			return merge({
				isPublicLayerAvailable: true,
				isPublicFlVariantEnabled: true,
				isVariantAdaptationEnabled: true
			}, oFeatures);
		});
	};

	return SessionStorageConnector;
});
