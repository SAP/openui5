/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/apply/internal/connectors/Utils"
], function(
	merge,
	BaseConnector,
	ApplyUtils
) {
	"use strict";

	var ROUTES = {
		CHANGES: "/changes/",
		VARIANTS: "/variants/"
	};

	var FEATURES = {
		isProductiveSystem: true
	};

	/**
	 * Connector for communication with SAPUI5 Flexibility Personalization Service
	 *
	 * @namespace sap.ui.fl.write.connectors.PersonalizationConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @version ${version}
	 * @private
	 */
	var PersonalizationConnector = merge({}, BaseConnector, {  /** @lends sap.ui.fl.write.internal.connectors.PersonalizationConnector */


		/**
		 * Creates a change or variant via REST call.
		 *
		 * @param {object} mPropertyBag Object with parameters as properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {sap.ui.fl.Change|sap.ui.fl.Change[]} mPropertyBag.payload Data to be stored
		 * @returns {Promise} Promise resolving with the result from the request
		 * @public
		 */
		writeChanges: function (mPropertyBag) {
			var sWriteUrl = ApplyUtils.getUrl(ROUTES.CHANGES, mPropertyBag);
			// TODO: add the csrf token handling - check if its even needed in perso because of proxy
			return ApplyUtils.sendRequest(sWriteUrl, "POST", mPropertyBag.payload);
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
			var mParameters = {};

			mParameters.reference = mPropertyBag.reference;
			delete mPropertyBag.reference;

			mPropertyBag.appVersion && (mParameters.appVersion = mPropertyBag.appVersion);
			mPropertyBag.selectorIds && (mParameters.selectorIds = mPropertyBag.selectorIds);
			mPropertyBag.changeTypes && (mParameters.changeTypes = mPropertyBag.changeTypes);
			mPropertyBag.generator && (mParameters.generator = mPropertyBag.generator);

			var sResetUrl = ApplyUtils.getUrl(ROUTES.CHANGES, mPropertyBag, mParameters);

			//TODO: add the csrf token handling - currently this function is not working
			return ApplyUtils.sendRequest(sResetUrl, "DELETE");
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