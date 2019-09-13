/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/library",
	"sap/base/util/restricted/_pick"
], function(
	merge,
	BaseConnector,
	ApplyConnector,
	ApplyUtils,
	WriteUtils,
	flLibrary,
	_pick
) {
	"use strict";

	var API_VERSION = "/v1";
	var ROUTES = {
		CHANGES: "/changes/",
		SETTINGS: "/settings",
		TOKEN: "/settings"
	};

	/**
	 * Connector for saving and deleting data from SAPUI5 Flexibility KeyUser service.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.KeyUserConnector
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Connector
	 */
	var KeyUserConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.KeyUserConnector */ {

		xsrfToken: null,

		layers: [
			flLibrary.Layer.CUSTOMER
		],

		/**
		 * Resets flexibility files for a given application.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Version of the application for which the reset takes place
		 * @param {string} [mPropertyBag.generator] Generator with which the changes were created
		 * @param {string} [mPropertyBag.selectorIds] Selector IDs of controls for which the reset should filter (comma-separated list)
		 * @param {string} [mPropertyBag.changeTypes] Change types of the changes which should be reset (comma-separated list)
		 * @returns {Promise} Promise resolves as soon as the reset has completed
		 */
		reset: function (mPropertyBag) {
			var aParameters = ["reference", "appVersion", "generator"];
			var mParameters = _pick(mPropertyBag, aParameters);
			if (mPropertyBag.selectorIds) {
				mParameters.selector = mPropertyBag.selectorIds;
			}
			if (mPropertyBag.changeTypes) {
				mParameters.changeType = mPropertyBag.changeTypes;
			}
			delete mPropertyBag.reference;

			var sResetUrl = ApplyUtils.getUrl(
				API_VERSION + ROUTES.CHANGES,
				mPropertyBag,
				mParameters
			);
			var oRequestOption = WriteUtils.getRequestOptions(
				ApplyConnector,
				API_VERSION + ROUTES.SETTINGS
			);
			return WriteUtils.sendRequest(sResetUrl, "DELETE", oRequestOption);
		},

		/**
		 * Write flex data into KeyUser service; This method is called with a list of entities like changes, variants,
		 * control variants, variant changes and variant management changes.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Change[]} mPropertyBag.payload Data to be stored
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		write:function (mPropertyBag) {
			var sWriteUrl = ApplyUtils.getUrl(
				API_VERSION + ROUTES.CHANGES,
				mPropertyBag
			);
			var oRequestOption = WriteUtils.getRequestOptions(
				ApplyConnector,
				API_VERSION + ROUTES.SETTINGS,
				mPropertyBag.flexObjects,
				"application/json; charset=utf-8", "json"
			);
			return WriteUtils.sendRequest(sWriteUrl, "POST", oRequestOption);
		}
	});

	return KeyUserConnector;
}, true);
