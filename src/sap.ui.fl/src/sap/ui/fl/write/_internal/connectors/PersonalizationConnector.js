/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/library",
	"sap/base/util/restricted/_pick"
], function(
	merge,
	BaseConnector,
	ApplyPersonalizationConnector,
	ApplyUtils,
	WriteUtils,
	flLibrary,
	_pick
) {
	"use strict";

	var ROUTES = {
		CHANGES: "/changes/",
		VARIANTS: "/variants/",
		TOKEN: "/actions/getcsrftoken"
	};

	var FEATURES = {
		isProductiveSystem: true
	};

	/**
	 * Connector for communication with SAPUI5 Flexibility Personalization Service
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.PersonalizationConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @version ${version}
	 * @private
	 */
	var PersonalizationConnector = merge({}, BaseConnector, {  /** @lends sap.ui.fl.write._internal.connectors.PersonalizationConnector */

		layers: [
			flLibrary.Layer.USER
		],

		/**
		 * Creates a change or variant via REST call.
		 *
		 * @param {object} mPropertyBag Object with parameters as properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {object[]} mPropertyBag.flexObjects Data to be stored
		 * @returns {Promise} Promise resolving with the result from the request
		 * @public
		 */
		write: function (mPropertyBag) {
			var sWriteUrl = ApplyUtils.getUrl(ROUTES.CHANGES, mPropertyBag);
			mPropertyBag = WriteUtils.setTokenAndAddApplyConnector(mPropertyBag, ROUTES, ApplyPersonalizationConnector);
			mPropertyBag.flexObjects = JSON.stringify(mPropertyBag.flexObjects);
			return WriteUtils.sendRequest(sWriteUrl, "POST", mPropertyBag);
		},

		/**
		 * Resets changes via REST call; Filters by provided parameters like the application reference, its version,
		 * the generator of the changes, the change type or changes on specific controls by their selector IDs.
		 *
		 * @param {object} mPropertyBag Object with parameters as properties
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @param {string} [mPropertyBag.generator] Generator with which the changes were created
		 * @param {string[]} [mPropertyBag.selectorIds] Selector IDs of controls for which the reset should filter
		 * @param {string} [mPropertyBag.changeTypes] Change types of the changes which should be reset
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 * @public
		 */
		reset: function (mPropertyBag) {
			// Define all properties which should be added as query parameters
			var aParameters = ["reference", "appVersion", "generator"];
			var mParameters = _pick(mPropertyBag, aParameters);

			if (mPropertyBag.selectorIds) {
				mParameters.selector = mPropertyBag.selectorIds;
			}
			if (mPropertyBag.changeTypes) {
				mParameters.changeType = mPropertyBag.changeTypes;
			}

			// Delete this property because it should not be part of the url
			delete mPropertyBag.reference;
			var sResetUrl = ApplyUtils.getUrl(ROUTES.CHANGES, mPropertyBag, mParameters);
			mPropertyBag = WriteUtils.setTokenAndAddApplyConnector(mPropertyBag, ROUTES, ApplyPersonalizationConnector);
			return WriteUtils.sendRequest(sResetUrl, "DELETE", mPropertyBag);
		},


		/**
		 * Called to get the flex features.
		 *
		 * @returns {Promise<object>} Promise resolves with an object containing the flex features
		 */
		loadFeatures: function () {
			return Promise.resolve(FEATURES);
		}
	});

	return PersonalizationConnector;
}, true);
