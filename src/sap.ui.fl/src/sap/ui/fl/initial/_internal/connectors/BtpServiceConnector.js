/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/Layer"
], function(
	merge,
	KeyUserConnector,
	InitialUtils,
	Layer
) {
	"use strict";

	var PREFIX = "/flex/all";
	var API_VERSION = "/v3";
	const ROOT = `${PREFIX}${API_VERSION}`;

	/**
	 * Connector for requesting all data from SAPUI5 Flexibility KeyUser service - including personalization.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.BtpServiceConnector
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage, sap.ui.fl.write._internal.Storage
	 */
	const BtpServiceConnector = merge({}, KeyUserConnector, {
		/** @lends sap.ui.fl.initial._internal.connectors.BtpServiceConnector */
		layers: [
			Layer.CUSTOMER,
			Layer.PUBLIC,
			Layer.USER
		],
		ROOT,
		ROUTES: {
			DATA: `${ROOT}/data`,
			VARIANTDATA: `${ROOT}/variantdata`,
			SETTINGS: `${ROOT}/settings`
		},

		/**
		 * @override
		 */
		loadFeatures(mPropertyBag) {
			return KeyUserConnector.loadFeatures.call(this, mPropertyBag).then(function(oFeatures) {
				// the backend supports also older versions where condensing and local reset was not enabled
				// that is why the flag can't be taken as is. Older versions just ignore the flag
				oFeatures.isCondensingEnabled = oFeatures.isCondensingEnabledOnBtp;
				delete oFeatures.isCondensingEnabledOnBtp;
				oFeatures.isLocalResetEnabled = oFeatures.isLocalResetEnabledOnBtp;
				delete oFeatures.isLocalResetEnabledOnBtp;
				return oFeatures;
			});
		},

		/**
		 * Loads a variant from the back end.
		 *
		 * @param {object} mPropertyBag - Further properties
		 * @param {string} mPropertyBag.url - Configured url for the connector
		 * @param {string} mPropertyBag.reference - Flexibility reference
		 * @param {string} mPropertyBag.variantReference - Variant references to be loaded
		 * @param {string} [mPropertyBag.version] - Version of the adaptation to be loaded
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the variant data request
		 */
		loadFlVariant(mPropertyBag) {
			const mParameters = {
				id: mPropertyBag.variantReference,
				version: mPropertyBag.version
			};
			if (this.isLanguageInfoRequired) {
				InitialUtils.addLanguageInfo(mParameters);
			}
			const sVariantDataUrl = InitialUtils.getUrl(this.ROUTES.VARIANTDATA, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sVariantDataUrl, "GET", {initialConnector: this}).then(function(oResult) {
				return oResult.response;
			});
		}
	});

	return BtpServiceConnector;
});