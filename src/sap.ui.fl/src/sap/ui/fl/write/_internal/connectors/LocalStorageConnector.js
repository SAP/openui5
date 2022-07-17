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
	 * Connector for saving data to the <code>window.localStorage</code>.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.LocalStorageConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Connector
	 */
	var LocalStorageConnector = merge({}, ObjectStorageConnector, /** @lends sap.ui.fl.write._internal.connectors.LocalStorageConnector */ {
		storage: window.localStorage
	});

	LocalStorageConnector.loadFeatures = function() {
		return ObjectStorageConnector.loadFeatures.apply(this, arguments).then(function(oFeatures) {
			return merge({
				isPublicLayerAvailable: true,
				isPublicFlVariantEnabled: true,
				isVariantAdaptationEnabled: true,
				isCondensingEnabled: false
			}, oFeatures);
		});
	};

	return LocalStorageConnector;
});
