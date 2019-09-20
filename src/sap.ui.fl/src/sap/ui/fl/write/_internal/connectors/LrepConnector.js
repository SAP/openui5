/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/Utils",
	"sap/base/util/restricted/_pick"
], function(
	merge,
	BaseConnector,
	ApplyConnector,
	ApplyUtils,
	WriteUtils,
	FlexUtils,
	_pick
) {
	"use strict";

	var ROUTES = {
		FLEX_INFO: "/flex/info/",
		PUBLISH: "/actions/make_changes_transportable/",
		CHANGES: "/changes/",
		VARIANTS: "/variants/",
		SETTINGS: "/flex/settings"
	};

	/**
	 * Write flex data into LRep back end or update an existing an existing flex data stored in LRep back end
	 *
	 * @param {object} mPropertyBag Property bag
	 * @param {string} mPropertyBag.method POST for writing new data and PUT for update an existing data
	 * @param {object[]} [mPropertyBag.flexObjects] Objects to be written (i.e. change definitions, variant definitions etc.)
	 * @param {object} [mPropertyBag.flexObject] Object to be updated
	 * @param {string} mPropertyBag.url Configured url for the connector
	 * @param {string} [mPropertyBag.transport] The transport ID
	 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the new flex data has file type .variant or not
	 * @private
	 * @returns {Promise} Promise resolves as soon as the writing was completed
	 */
	var doWrite = function(mPropertyBag) {
		var sRoute = mPropertyBag.isLegacyVariant ? ROUTES.VARIANTS : ROUTES.CHANGES;
		var mParameters = mPropertyBag.transport ? {changelist : mPropertyBag.transport} : undefined;
		//single update --> fileName needs to be in the url
		if (mPropertyBag.flexObject) {
			mPropertyBag.fileName = mPropertyBag.flexObject.fileName;
		}
		var sWriteUrl = ApplyUtils.getUrl(sRoute, mPropertyBag, mParameters);
		delete mPropertyBag.fileName;
		var sTokenUrl = ApplyUtils.getUrl(ROUTES.SETTINGS, mPropertyBag);

		var oRequestOption = WriteUtils.getRequestOptions(
			ApplyConnector,
			sTokenUrl,
			mPropertyBag.flexObjects || mPropertyBag.flexObject,
			"application/json; charset=utf-8", "json"
		);
		return WriteUtils.sendRequest(sWriteUrl, mPropertyBag.method, oRequestOption);
	};

	/**
	 * Connector for requesting data from an LRep-based back end.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.LrepConnector
	 * @since 1.67
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Connector
	 */
	var LrepConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.LrepConnector */ {

		layers: [
			"ALL"
		],

		/**
		 * Resets flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.changelist Transport Id
		 * @param {string} [mPropertyBag.appVersion] Version of the application for which the reset takes place
		 * @param {string} [mPropertyBag.generator] Generator with which the changes were created
		 * @param {string} [mPropertyBag.selectorIds] Selector IDs of controls for which the reset should filter (comma-separated list)
		 * @param {string} [mPropertyBag.changeTypes] Change types of the changes which should be reset (comma-separated list)
		 * @returns {Promise} Promise resolves as soon as the reset has completed
		 */
		reset: function (mPropertyBag) {
			var aParameters = ["reference", "layer", "appVersion", "changelist", "generator"];
			var mParameters = _pick(mPropertyBag, aParameters);

			var sClient = FlexUtils.getUrlParameter("sap-client");
			if (sClient) {
				mParameters["sap-client"] = sClient;
			}

			if (mPropertyBag.selectorIds) {
				mParameters.selector = mPropertyBag.selectorIds;
			}
			if (mPropertyBag.changeTypes) {
				mParameters.changeType = mPropertyBag.changeTypes;
			}

			delete mPropertyBag.reference;
			var sDataUrl = ApplyUtils.getUrl(ROUTES.CHANGES, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl, "DELETE");
		},


		/**
		 * Publish flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.changelist Transport Id
		 * @param {string} [mPropertyBag.package] ABAP package (mandatory when layer is 'VENDOR')
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @returns {Promise} Promise resolves as soon as the publish has completed
		 */
		publish: function (mPropertyBag) {
			var aParameters = ["reference", "layer", "appVersion", "changelist", "package"];
			var mParameters = _pick(mPropertyBag, aParameters);

			var sClient = FlexUtils.getUrlParameter("sap-client");
			if (sClient) {
				mParameters["sap-client"] = sClient;
			}

			delete mPropertyBag.reference;
			var sDataUrl = ApplyUtils.getUrl(ROUTES.PUBLISH, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl, "POST");
		},

		/**
		 * Gets the flexibility info for a given application and layer.
		 * The flexibility info is a JSON string that has boolean properties 'isPublishEnabled' and 'isResetEnabled'
		 * that indicate if for the given application and layer a publish and reset shall be enabled, respectively
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @returns {Promise} Promise resolves as soon as flex info has been retrieved
		 */
		getFlexInfo: function (mPropertyBag) {
			var aParameters = ["layer", "appVersion"];
			var mParameters = _pick(mPropertyBag, aParameters);

			var sClient = FlexUtils.getUrlParameter("sap-client");
			if (sClient) {
				mParameters["sap-client"] = sClient;
			}

			var sDataUrl = ApplyUtils.getUrl(ROUTES.FLEX_INFO, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl);
		},

		/**
		 * Called to get the flex features.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @returns {Promise<object>} Promise resolves with an object containing the flex features
		 */
		loadFeatures: function (mPropertyBag) {
			var mParameters = {};

			var sClient = FlexUtils.getUrlParameter("sap-client");
			if (sClient) {
				mParameters["sap-client"] = sClient;
			}

			var sFeaturesUrl = ApplyUtils.getUrl(ROUTES.SETTINGS, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sFeaturesUrl);
		},

		/**
		 * Write flex data into LRep back end; This method is called with a list of entities like changes, variants,
		 * control variants, variant changes and variant management changes.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object[]} mPropertyBag.flexObjects Objects to be written (i.e. change definitions, variant definitions etc.)
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the new flex data has file type .variant or not
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		write:function (mPropertyBag) {
			mPropertyBag.method = "POST";
			return doWrite(mPropertyBag);
		},

		/**
		 * Update an existing flex data stored in LRep back end.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} mPropertyBag.flexObject Flex Object to be updated
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @returns {Promise} Resolves as soon as the writing is completed without data
		 */
		update: function (mPropertyBag) {
			if (mPropertyBag.flexObject.fileType === "variant") {
				mPropertyBag.isLegacyVariant = true;
			}
			mPropertyBag.method = "PUT";
			return doWrite(mPropertyBag);
		},

		/**
		 * Delete an existing flex data stored in LRep back end.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} mPropertyBag.flexObject Flex Object to be deleted
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise} Resolves as soon as the deletion is completed without data
		 */
		remove: function (mPropertyBag) {
			var mParameters = {
				namespace: mPropertyBag.flexObject.namespace,
				layer: mPropertyBag.flexObject.layer
			};
			if (mPropertyBag.transport) {
				mParameters.changelist = mPropertyBag.transport;
			}
			mPropertyBag.fileName = mPropertyBag.flexObject.fileName;
			var sDeleteUrl = ApplyUtils.getUrl(ROUTES.CHANGES, mPropertyBag, mParameters);
			delete mPropertyBag.fileName;
			var sTokenUrl = ApplyUtils.getUrl(ROUTES.SETTINGS, mPropertyBag);

			var oRequestOption = WriteUtils.getRequestOptions(
				ApplyConnector,
				sTokenUrl,
				undefined,
				"application/json; charset=utf-8", "json"
			);
			return WriteUtils.sendRequest(sDeleteUrl, "DELETE", oRequestOption);
		}
	});

	return LrepConnector;
}, true);
