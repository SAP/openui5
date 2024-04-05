/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/initial/_internal/connectors/BackendConnector",
	"sap/ui/fl/Layer"
], function(
	merge,
	BackendConnector,
	Layer
) {
	"use strict";

	var PREFIX = "/flex/keyuser";
	var API_VERSION = "/v2";

	/**
	 * Connector for requesting data from SAPUI5 Flexibility KeyUser service.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.KeyUserConnector
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage, sap.ui.fl.write._internal.Storage
	 */
	var KeyUserConnector = merge({}, BackendConnector, { /** @lends sap.ui.fl.initial._internal.connectors.KeyUserConnector */
		layers: [
			Layer.CUSTOMER,
			Layer.PUBLIC
		],
		API_VERSION,
		ROUTES: {
			DATA: `${PREFIX + API_VERSION}/data/`,
			SETTINGS: `${PREFIX + API_VERSION}/settings`
		},
		isLanguageInfoRequired: true,
		loadFeatures(mPropertyBag) {
			return BackendConnector.loadFeatures.call(this, mPropertyBag).then(function(oFeatures) {
				oFeatures.isContextSharingEnabled = true;
				return oFeatures;
			});
		},
		loadFlexData(mPropertyBag) {
			return BackendConnector.sendRequest.call(this, mPropertyBag).then(function(oResult) {
				oResult.contents.map(function(oContent, iIndex, oResult) {
					oResult[iIndex].changes = (oContent.changes || []).concat(oContent.compVariants);
				});
				oResult.contents[0].cacheKey = oResult.cacheKey;
				return oResult.contents;
			});
		}
	});

	return KeyUserConnector;
});