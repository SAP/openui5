/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector"
], function(
	merge,
	SessionStorageConnector
) {
	"use strict";

	/**
	 * Connector for saving data to the <code>window.SessionStorage</code>.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.TestSessionStorageConnectorWithoutVersioning
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var TestSessionStorageConnectorWithoutVersioning = merge({}, SessionStorageConnector, /** @lends sap.ui.fl.write._internal.connectors.TestSessionStorageConnectorWithoutVersioning */ {
		storage: window.sessionStorage
	});

	TestSessionStorageConnectorWithoutVersioning.loadFeatures = async function(...aArgs) {
		const oFeatures = await SessionStorageConnector.loadFeatures.apply(this, aArgs);

		return merge({}, oFeatures, {
			isVersioningEnabled: false
		});
	};

	return TestSessionStorageConnectorWithoutVersioning;
});
