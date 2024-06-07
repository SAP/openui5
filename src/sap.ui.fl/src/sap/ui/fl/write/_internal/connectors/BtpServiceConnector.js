/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/BtpServiceConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils"
], function(
	merge,
	Layer,
	KeyUserConnector,
	InitialConnector,
	InitialUtils,
	WriteUtils
) {
	"use strict";

	/**
	 * Connector for saving and deleting data from SAPUI5 Flexibility KeyUser service - including personalization.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.BtpServiceConnector
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	const BtpServiceConnector = merge({}, KeyUserConnector, /** @lends sap.ui.fl.write._internal.connectors.BtpServiceConnector */ {
		layers: [
			Layer.CUSTOMER,
			Layer.PUBLIC,
			Layer.USER
		],
		ROUTES: {
			CHANGES: `${InitialConnector.ROOT}/changes`,
			SETTINGS: `${InitialConnector.ROOT}/settings`,
			TOKEN: `${InitialConnector.ROOT}/settings`,
			VERSIONS: {
				GET: `${InitialConnector.ROOT}/versions`,
				ACTIVATE: `${InitialConnector.ROOT}/versions/activate`,
				DISCARD: `${InitialConnector.ROOT}/versions/draft`,
				PUBLISH: `${InitialConnector.ROOT}/versions/publish`
			},
			TRANSLATION: {
				UPLOAD: `${InitialConnector.ROOT}/translation/texts`,
				DOWNLOAD: `${InitialConnector.ROOT}/translation/texts`,
				GET_SOURCELANGUAGE: `${InitialConnector.ROOT}/translation/sourcelanguages`
			},
			CONTEXTS: `${InitialConnector.ROOT}/contexts`,
			SEEN_FEATURES: `${InitialConnector.ROOT}/seenFeatures`
		},

		async getSeenFeatureIds(mPropertyBag) {
			const sUrl = InitialUtils.getUrl(this.ROUTES.SEEN_FEATURES, mPropertyBag);
			const oResult = await InitialUtils.sendRequest(sUrl, "GET", {initialConnector: InitialConnector});
			return oResult.response?.seenFeatureIds;
		},

		async setSeenFeatureIds(mPropertyBag) {
			const mParameters = {
				seenFeatureIds: mPropertyBag.seenFeatureIds
			};
			const sUrl = InitialUtils.getUrl(this.ROUTES.SEEN_FEATURES, mPropertyBag);
			const oResult = await WriteUtils.sendRequest(sUrl, "PUT", {
				tokenUrl: this.ROUTES.TOKEN,
				initialConnector: InitialConnector,
				payload: JSON.stringify(mParameters),
				dataType: "json",
				contentType: "application/json; charset=utf-8"
			});
			return oResult.response?.seenFeatureIds;
		}
	});

	BtpServiceConnector.initialConnector = InitialConnector;
	return BtpServiceConnector;
});
